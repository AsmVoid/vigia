import { Queue, Worker, Job, QueueEvents } from "bullmq";
import Redis from "ioredis";
import { prisma } from "@/lib/prisma";
import { fetchCnpjData } from "@/lib/osint/brasilapi-cnpj";
import { checkEmailBreaches } from "@/lib/osint/hibp";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

let connection: Redis | null = null;
let osintQueue: Queue | null = null;
let osintWorker: Worker | null = null;

function getRedisConnection(): Redis {
  if (!connection) {
    connection = new Redis(REDIS_URL, {
      maxRetriesPerRequest: null,
      lazyConnect: true,
      enableOfflineQueue: false,
      connectTimeout: 2000,
    });

    connection.on("error", (err) => {
      // Log connection warnings without crashing the app
      console.warn("[BullMQ/Redis] Conexão indisponível, fallback direto ativo:", err.message);
    });
  }
  return connection;
}

/**
 * Processador central de enriquecimento OSINT.
 */
export async function processEntityEnrichment(entityId: string) {
  const entity = await prisma.entity.findUnique({
    where: { id: entityId },
    include: {
      jobs: true,
      addresses: true,
      emails: true,
    },
  });

  if (!entity) {
    throw new Error(`Entidade não encontrada para enriquecimento: ${entityId}`);
  }

  let jobsEnriched = 0;
  let addressesEnriched = 0;
  let emailsChecked = 0;
  const enrichmentDetails: Record<string, any> = {};

  // 1. Enriquecer Empregos com CNPJ (BrasilAPI)
  for (const job of entity.jobs) {
    if (job.cnpj) {
      const cnpjInfo = await fetchCnpjData(job.cnpj);
      if (cnpjInfo) {
        await prisma.job.update({
          where: { id: job.id },
          data: {
            companyTradeName: cnpjInfo.nome_fantasia || cnpjInfo.razao_social,
            companyLegalNature: cnpjInfo.natureza_juridica,
            companySize: cnpjInfo.porte,
            companyCapital: cnpjInfo.capital_social ? cnpjInfo.capital_social : undefined,
            companyAddress: [
              cnpjInfo.logradouro,
              cnpjInfo.numero,
              cnpjInfo.bairro,
              cnpjInfo.municipio,
              cnpjInfo.uf,
            ]
              .filter(Boolean)
              .join(", "),
            companyPhone: cnpjInfo.ddd_telefone_1,
            companyEmail: cnpjInfo.email,
            companyActivity: cnpjInfo.cnae_fiscal_descricao,
          },
        });
        jobsEnriched++;
        enrichmentDetails[`cnpj_${job.cnpj}`] = {
          razao_social: cnpjInfo.razao_social,
          capital_social: cnpjInfo.capital_social,
          porte: cnpjInfo.porte,
        };
      }
    }
  }

  // 2. Enriquecer Endereços com Coordenadas se faltarem (Nominatim / ViaCEP)
  for (const addr of entity.addresses) {
    if (addr.cep && (!addr.latitude || !addr.longitude)) {
      try {
        const cleanCep = addr.cep.replace(/\D/g, "");
        const query = addr.street
          ? `${addr.street}, ${addr.city || ""}, ${addr.state || ""}, Brasil`
          : `${cleanCep}, Brasil`;

        const nomRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
          {
            headers: {
              "User-Agent": "VIGIA-OSINT/1.0 (self-hosted investigator console; contact@vigia.local)",
              "Accept": "application/json",
            },
          }
        );

        if (nomRes.ok) {
          const results = await nomRes.json();
          if (Array.isArray(results) && results.length > 0) {
            const lat = parseFloat(results[0].lat);
            const lon = parseFloat(results[0].lon);
            if (!isNaN(lat) && !isNaN(lon)) {
              await prisma.address.update({
                where: { id: addr.id },
                data: { latitude: lat, longitude: lon },
              });
              addressesEnriched++;
              enrichmentDetails[`address_${addr.id}`] = { lat, lon };
            }
          }
        }
      } catch (err) {
        console.warn("[OSINT Geocode] Falha no geocode do endereço:", err);
      }
    }
  }

  // 3. Verificar vazamentos HIBP (apenas contagem / alerta de segurança)
  const breachSummaries = [];
  for (const em of entity.emails) {
    const breachInfo = await checkEmailBreaches(em.email);
    emailsChecked++;
    if (breachInfo.breached) {
      breachSummaries.push(breachInfo);
    }
  }
  if (breachSummaries.length > 0) {
    enrichmentDetails.breaches = breachSummaries;
  }

  // 4. Gravar Logs de Auditoria e Atividade
  await prisma.activityLog.create({
    data: {
      userId: entity.userId,
      action: "UPDATE",
      entityType: "Entity",
      entityId: entity.id,
      entityName: entity.fullName,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: entity.userId,
      action: "OSINT_ENRICHMENT",
      entityType: "Entity",
      entityId: entity.id,
      entityName: entity.fullName,
      details: {
        jobsEnriched,
        addressesEnriched,
        emailsChecked,
        enrichmentDetails,
        enrichedAt: new Date().toISOString(),
      },
    },
  });

  return {
    success: true,
    jobsEnriched,
    addressesEnriched,
    emailsChecked,
    details: enrichmentDetails,
  };
}

/**
 * Adiciona à fila BullMQ de enriquecimento ou executa via fallback direto.
 */
export async function enqueueOsintEnrichment(entityId: string) {
  try {
    const redis = getRedisConnection();
    await redis.connect();

    if (!osintQueue) {
      osintQueue = new Queue("osint-enrichment", { connection: redis });
    }

    if (!osintWorker) {
      osintWorker = new Worker(
        "osint-enrichment",
        async (job: Job) => {
          return processEntityEnrichment(job.data.entityId);
        },
        { connection: redis }
      );
    }

    const job = await osintQueue.add(
      "enrich-entity",
      { entityId },
      { removeOnComplete: true, removeOnFail: 50 }
    );

    const queueEvents = new QueueEvents("osint-enrichment", { connection: redis });
    try {
      const result = await job.waitUntilFinished(queueEvents, 10000);
      return result;
    } finally {
      await queueEvents.close();
    }
  } catch (err) {
    // Fallback gracioso: executa de forma direta e síncrona
    console.warn("[BullMQ] Redis offline ou timeout. Executando processador OSINT direto...");
    return processEntityEnrichment(entityId);
  }
}
