import "dotenv/config";
import { PrismaClient, RelationshipType } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed do banco de dados V.I.G.I.A...");

  const adminUser =
    (await prisma.user.findFirst({
      where: { email: "admin@vigia.local" },
    })) || (await prisma.user.findFirst());

  if (!adminUser) {
    console.error("❌ Nenhum usuário encontrado para associar o seed. Crie um usuário primeiro.");
    return;
  }
  const userId = adminUser.id;

  // Clean existing sample entities and groups if needed
  const existingGroup = await prisma.group.findFirst({
    where: { name: "Família Exemplo", userId },
  });

  if (existingGroup) {
    console.log("ℹ️ Limpando registros anteriores da 'Família Exemplo'...");
    await prisma.entity.deleteMany({
      where: {
        userId,
        OR: [
          { groupId: existingGroup.id },
          {
            fullName: {
              in: [
                "Carlos Eduardo Albuquerque",
                "Helena Vasconcelos Albuquerque",
                "Roberto Albuquerque",
                "Lucas Vasconcelos Albuquerque",
                "Alvo Burner Ativo",
                "Alvo Burner Expirado",
              ],
            },
          },
        ],
      },
    });
    await prisma.group.delete({ where: { id: existingGroup.id } });
  }

  // 1. Criar Grupo "Família Exemplo"
  const group = await prisma.group.create({
    data: {
      userId,
      name: "Família Exemplo",
      description: "Núcleo familiar de referência para inteligência e testes de grafo genealógico.",
      color: "#833ab4",
      icon: "users",
      sortOrder: 1,
    },
  });
  console.log(`✅ Grupo criado: ${group.name} (${group.id})`);

  // 2. Criar Pessoa 1: Avô / Idoso (Roberto Albuquerque - 74 anos, Idoso, Masculino)
  const grandfather = await prisma.entity.create({
    data: {
      userId,
      groupId: group.id,
      fullName: "Roberto Albuquerque",
      aliases: ["Seu Roberto", "Comendador"],
      photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&fit=crop&q=80",
      cpf: "345.678.901-22",
      gender: "MALE",
      birthDate: new Date("1952-11-03T00:00:00.000Z"),
      zodiacSign: "Escorpião",
      currentJob: "Empresário Aposentado & Pecuarista",
      notes: "Patriarca com registros de imóveis no interior de SP e MG.",
      status: "CLOSED",
      phones: {
        create: [
          { phone: "+55 19 99123-4567", label: "Celular Rural", isWhatsapp: true },
        ],
      },
      addresses: {
        create: [
          {
            label: "Sítio / Fazenda",
            street: "Rodovia Dom Pedro I",
            number: "Km 124",
            neighborhood: "Zona Rural",
            city: "Campinas",
            state: "SP",
            cep: "13000-000",
            country: "Brasil",
          },
          {
            label: "Residencial",
            street: "Rua Barão de Jaguara",
            number: "980",
            neighborhood: "Centro",
            city: "Campinas",
            state: "SP",
            cep: "13015-001",
            country: "Brasil",
          },
        ],
      },
      socialProfiles: {
        create: [
          { platform: "facebook", username: "roberto.albuquerque.agro", url: "https://facebook.com/roberto.albuquerque.agro" },
          { platform: "whatsapp", username: "5519991234567" },
        ],
      },
    },
  });
  console.log(`✅ Avô criado: ${grandfather.fullName}`);

  // 3. Criar Pessoa 2: Pai (Carlos Eduardo Albuquerque - 48 anos, Adulto, Masculino)
  // Vinculado ao pai (Roberto) com Job contendo CNPJ para teste do Enriquecedor OSINT
  const father = await prisma.entity.create({
    data: {
      userId,
      groupId: group.id,
      fullName: "Carlos Eduardo Albuquerque",
      aliases: ["Cadu", "Albuquerque"],
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&fit=crop&q=80",
      cpf: "123.456.789-00",
      rg: "12.345.678-9",
      gender: "MALE",
      birthDate: new Date("1978-04-12T00:00:00.000Z"),
      zodiacSign: "Áries",
      currentJob: "Diretor de Tecnologia & Cibersegurança",
      notes: "Alvo primário investigado em conexões societárias.",
      status: "INVESTIGATING",
      fatherId: grandfather.id,
      fatherName: grandfather.fullName,
      phones: {
        create: [
          { phone: "+55 11 98765-4321", label: "Pessoal / WhatsApp", isWhatsapp: true },
          { phone: "+55 11 3214-5678", label: "Comercial", isWhatsapp: false },
        ],
      },
      emails: {
        create: [
          { email: "carlos.albuquerque@corp.example.com", label: "Corporativo" },
          { email: "cadu.albuquerque@gmail.com", label: "Pessoal" },
        ],
      },
      addresses: {
        create: [
          {
            label: "Residencial",
            street: "Avenida Paulista",
            number: "1842",
            complement: "Apto 142",
            neighborhood: "Bela Vista",
            city: "São Paulo",
            state: "SP",
            cep: "01310-200",
            country: "Brasil",
            latitude: -23.5614,
            longitude: -46.6559,
          },
        ],
      },
      jobs: {
        create: [
          {
            title: "Diretor de Tecnologia & Cibersegurança",
            company: "Banco do Brasil S.A.",
            cnpj: "00.000.000/0001-91",
            isCurrent: true,
          },
        ],
      },
      socialProfiles: {
        create: [
          { platform: "instagram", username: "cadu.albuquerque", url: "https://instagram.com/cadu.albuquerque" },
          { platform: "linkedin", username: "carlos-albuquerque-tech", url: "https://linkedin.com/in/carlos-albuquerque-tech" },
          { platform: "github", username: "cadualbuquerque", url: "https://github.com/cadualbuquerque" },
          { platform: "x", username: "cadu_sec", url: "https://x.com/cadu_sec" },
        ],
      },
      documents: {
        create: [
          { type: "CNH", value: "01234567890" },
          { type: "PASSAPORTE", value: "BR123456" },
        ],
      },
    },
  });
  console.log(`✅ Pai criado: ${father.fullName} (Filho de ${grandfather.fullName}) com CNPJ`);

  // 4. Criar Pessoa 3: Mãe (Helena Vasconcelos Albuquerque - 44 anos, Adulto, Feminino)
  const mother = await prisma.entity.create({
    data: {
      userId,
      groupId: group.id,
      fullName: "Helena Vasconcelos Albuquerque",
      aliases: ["Lena", "Dra. Helena"],
      photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&fit=crop&q=80",
      cpf: "234.567.890-11",
      rg: "23.456.789-0",
      gender: "FEMALE",
      birthDate: new Date("1982-08-25T00:00:00.000Z"),
      zodiacSign: "Virgem",
      currentJob: "Advogada Empresarial & Sócia Administradora",
      notes: "Representante legal em holding patrimonial.",
      status: "INVESTIGATING",
      phones: {
        create: [
          { phone: "+55 11 99876-5432", label: "WhatsApp Pessoal", isWhatsapp: true },
        ],
      },
      emails: {
        create: [
          { email: "helena@vasconcelosadv.example.com", label: "Escritório" },
        ],
      },
      addresses: {
        create: [
          {
            label: "Residencial",
            street: "Avenida Paulista",
            number: "1842",
            complement: "Apto 142",
            neighborhood: "Bela Vista",
            city: "São Paulo",
            state: "SP",
            cep: "01310-200",
            country: "Brasil",
            latitude: -23.5614,
            longitude: -46.6559,
          },
          {
            label: "Comercial",
            street: "Rua Funchal",
            number: "418",
            complement: "Conjunto 92",
            neighborhood: "Vila Olímpia",
            city: "São Paulo",
            state: "SP",
            cep: "04551-060",
            country: "Brasil",
          },
        ],
      },
      socialProfiles: {
        create: [
          { platform: "instagram", username: "helena.vasconcelos", url: "https://instagram.com/helena.vasconcelos" },
          { platform: "linkedin", username: "helena-vasconcelos-adv", url: "https://linkedin.com/in/helena-vasconcelos-adv" },
          { platform: "threads", username: "helena.vasconcelos", url: "https://threads.net/@helena.vasconcelos" },
        ],
      },
    },
  });
  console.log(`✅ Mãe criada: ${mother.fullName}`);

  // 5. Criar Pessoa 4: Filho (Lucas Vasconcelos Albuquerque - 18 anos, Jovem)
  const son = await prisma.entity.create({
    data: {
      userId,
      groupId: group.id,
      fullName: "Lucas Vasconcelos Albuquerque",
      aliases: ["Lukinha", "GhostBR"],
      photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&fit=crop&q=80",
      cpf: "456.789.012-33",
      gender: "MALE",
      birthDate: new Date("2008-03-15T00:00:00.000Z"),
      zodiacSign: "Peixes",
      currentJob: "Estudante & Desenvolvedor Indie",
      notes: "Filho do casal investigado. Foco em comunidades de jogos e streaming.",
      status: "INVESTIGATING",
      fatherId: father.id,
      motherId: mother.id,
      fatherName: father.fullName,
      motherName: mother.fullName,
      phones: {
        create: [
          { phone: "+55 11 97654-3210", label: "Celular", isWhatsapp: true },
        ],
      },
      emails: {
        create: [
          { email: "lucas.albuquerque@edu.example.com", label: "Estudantil" },
        ],
      },
      addresses: {
        create: [
          {
            label: "Residencial",
            street: "Avenida Paulista",
            number: "1842",
            complement: "Apto 142",
            neighborhood: "Bela Vista",
            city: "São Paulo",
            state: "SP",
            cep: "01310-200",
            country: "Brasil",
          },
        ],
      },
      socialProfiles: {
        create: [
          { platform: "instagram", username: "lucas.v.albuquerque", url: "https://instagram.com/lucas.v.albuquerque" },
          { platform: "discord", username: "GhostBR#1337" },
          { platform: "tiktok", username: "@lucas_indiedev", url: "https://tiktok.com/@lucas_indiedev" },
          { platform: "steam", username: "ghost_albuquerque" },
          { platform: "spotify", username: "lucas_soundtrack" },
          { platform: "youtube", username: "LucasDevBR", url: "https://youtube.com/@LucasDevBR" },
          { platform: "roblox", username: "GhostHunterSP" },
        ],
      },
    },
  });
  console.log(`✅ Filho criado com filiação pai/mãe: ${son.fullName}`);

  // 6. Criar Relacionamentos (Tabela Relationship)
  // Carlos ↔ Helena (Cônjuges)
  await prisma.relationship.create({
    data: {
      entityId: father.id,
      relatedEntityId: mother.id,
      type: RelationshipType.SPOUSE,
      label: "Esposa / Cônjuge",
      notes: "Casamento sob comunhão parcial de bens.",
    },
  });

  // Helena → Carlos (Sócia Administradora)
  await prisma.relationship.create({
    data: {
      entityId: mother.id,
      relatedEntityId: father.id,
      type: RelationshipType.BUSINESS_PARTNER,
      label: "Sócia / Advogada",
      notes: "Representação em processos de blindagem patrimonial.",
    },
  });

  // Roberto ↔ Carlos (Pai)
  await prisma.relationship.create({
    data: {
      entityId: grandfather.id,
      relatedEntityId: father.id,
      type: RelationshipType.FATHER,
      label: "Pai",
      notes: "Patriarca da família Albuquerque.",
    },
  });
  console.log("✅ Relacionamentos familiares e profissionais vinculados na tabela Relationship.");

  // 7. Criar Entidades de Teste Burner (Modo Temporário)
  // Alvo ativo (expira em 24h)
  const burnerActive = await prisma.entity.create({
    data: {
      userId,
      groupId: group.id,
      fullName: "Alvo Burner Ativo",
      aliases: ["Operação Temporária"],
      gender: "OTHER",
      isBurner: true,
      expiresAt: new Date(Date.now() + 86400000), // +24 horas
      notes: "Alvo com autodestruição programada em 24 horas.",
      status: "INVESTIGATING",
    },
  });

  // Alvo expirado (expirou há 2 horas - para testar o trigger manual de limpeza em /settings)
  const burnerExpired = await prisma.entity.create({
    data: {
      userId,
      groupId: group.id,
      fullName: "Alvo Burner Expirado",
      aliases: ["Operação Encerrada"],
      gender: "OTHER",
      isBurner: true,
      expiresAt: new Date(Date.now() - 7200000), // -2 horas
      notes: "Alvo cujo prazo expirou. Deve ser destruído no trigger manual ou cron diário.",
      status: "CLOSED",
    },
  });
  console.log(`✅ Entidades de teste Burner criadas: ${burnerActive.fullName} (Ativo) e ${burnerExpired.fullName} (Expirado).`);

  // 8. Criar registros de atividades nos últimos 30 dias para popular v_activity_flow
  const now = new Date();
  const activitiesData = [
    { action: "ADD" as const, entityType: "GROUP", entityName: group.name, createdAt: new Date(now.getTime() - 15 * 86400000) },
    { action: "ADD" as const, entityType: "ENTITY", entityName: father.fullName, createdAt: new Date(now.getTime() - 14 * 86400000) },
    { action: "ADD" as const, entityType: "ENTITY", entityName: mother.fullName, createdAt: new Date(now.getTime() - 10 * 86400000) },
    { action: "UPDATE" as const, entityType: "ENTITY", entityName: father.fullName, createdAt: new Date(now.getTime() - 7 * 86400000) },
    { action: "ADD" as const, entityType: "ENTITY", entityName: grandfather.fullName, createdAt: new Date(now.getTime() - 5 * 86400000) },
    { action: "ADD" as const, entityType: "ENTITY", entityName: son.fullName, createdAt: new Date(now.getTime() - 2 * 86400000) },
    { action: "UPDATE" as const, entityType: "ENTITY", entityName: son.fullName, createdAt: new Date(now.getTime() - 1 * 86400000) },
    { action: "ADD" as const, entityType: "ENTITY", entityName: burnerActive.fullName, createdAt: new Date(now.getTime() - 3600000) },
  ];

  for (const act of activitiesData) {
    await prisma.activityLog.create({
      data: {
        ...act,
        userId,
      },
    });
  }
  console.log(`✅ ${activitiesData.length} registros de ActivityLog gerados para os últimos 30 dias.`);

  console.log("🎉 Seed do V.I.G.I.A concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro durante a execução do seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
