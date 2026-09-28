"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { decryptFromString } from "@/lib/encryption";
import { NoteType, MediaType } from "@/generated/prisma/client";
import { getAuthUser } from "@/lib/auth-session";

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Ignored outside Next.js request context
  }
}

// 1. Atualizar notas rápidas (edição inline no perfil)
export async function updateInlineNotesAction(entityId: string, notes: string) {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "Usuário não autenticado." };
  if (!entityId) return { success: false, error: "ID inválido." };

  try {
    const existing = await prisma.entity.findFirst({
      where: { id: entityId, userId: user.id },
    });
    if (!existing) return { success: false, error: "Entidade não encontrada ou acesso negado." };

    await prisma.entity.update({
      where: { id: entityId },
      data: { notes: notes || null },
    });

    safeRevalidatePath(`/entity/${entityId}`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar notas inline:", error);
    return { success: false, error: "Falha ao salvar anotação." };
  }
}

// 2. Revelar identificador de conta financeira (sob demanda)
export async function revealFinancialAccountAction(accountId: string) {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "Usuário não autenticado." };
  if (!accountId) return { success: false, error: "ID da conta inválido." };

  try {
    const account = await prisma.financialAccount.findUnique({
      where: { id: accountId },
      select: {
        identifier: true,
        entityId: true,
        metadata: true,
        entity: { select: { userId: true } },
      },
    });

    if (!account || account.entity.userId !== user.id) {
      return { success: false, error: "Conta não encontrada ou acesso negado." };
    }

    const decrypted = decryptFromString(account.identifier);

    // Audit log da revelação de dado sensível
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "REVEAL_FINANCIAL_ACCOUNT",
        entityType: "FINANCIAL_ACCOUNT",
        entityId: account.entityId,
        details: { accountId },
      },
    }).catch(() => null);

    return {
      success: true,
      identifier: decrypted,
      metadata: (account.metadata as Record<string, any>) || null,
    };
  } catch (error) {
    console.error("Erro ao revelar conta financeira:", error);
    return { success: false, error: "Falha ao decodificar chave financeira." };
  }
}

// 3. Revelar credencial / senha (sob demanda)
export async function revealCredentialAction(credentialId: string) {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "Usuário não autenticado." };
  if (!credentialId) return { success: false, error: "ID da credencial inválido." };

  try {
    const credential = await prisma.credential.findUnique({
      where: { id: credentialId },
      select: {
        passwordHash: true,
        entityId: true,
        platform: true,
        entity: { select: { userId: true } },
      },
    });

    if (!credential || credential.entity.userId !== user.id) {
      return { success: false, error: "Credencial não encontrada ou acesso negado." };
    }

    const decrypted = decryptFromString(credential.passwordHash);

    // Audit log da revelação de senha
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "REVEAL_CREDENTIAL",
        entityType: "CREDENTIAL",
        entityId: credential.entityId,
        details: { credentialId, platform: credential.platform },
      },
    }).catch(() => null);

    return { success: true, password: decrypted };
  } catch (error) {
    console.error("Erro ao revelar credencial:", error);
    return { success: false, error: "Falha ao decodificar senha." };
  }
}

// 4. Geocode de endereço sob demanda via Nominatim OpenStreetMap
export async function geocodeAddressAction(addressId: string) {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "Usuário não autenticado." };
  if (!addressId) return { success: false, error: "ID do endereço inválido." };

  try {
    const address = await prisma.address.findFirst({
      where: { id: addressId, entity: { userId: user.id } },
    });

    if (!address) return { success: false, error: "Endereço não encontrado ou acesso negado." };

    // Se já tiver coordenadas válidas salvas em cache, retorna direto
    if (address.latitude !== null && address.longitude !== null) {
      return {
        success: true,
        latitude: address.latitude,
        longitude: address.longitude,
      };
    }

    // Monta query para o Nominatim
    const queryParts = [
      address.street,
      address.number,
      address.neighborhood,
      address.city,
      address.state,
      address.cep,
      address.country || "Brasil",
    ].filter(Boolean);

    const query = queryParts.join(", ");
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&limit=1`;

    const res = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "VIGIA-OSINT/1.0 (self-hosted investigator console; contact@vigia.local)",
        "Accept": "application/json",
      },
    });

    if (!res.ok) {
      console.warn(`[Nominatim Geocode] HTTP ${res.status}: ${res.statusText}`);
      return {
        success: false,
        error: "Serviço de geolocalização indisponível no momento. Tente novamente mais tarde.",
      };
    }

    const data = await res.json();

    if (!data || data.length === 0) {
      // Tenta busca mais flexível apenas com Cidade, Estado e País
      const fallbackQuery = [address.city, address.state, address.country || "Brasil"]
        .filter(Boolean)
        .join(", ");

      const fallbackRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          fallbackQuery
        )}&limit=1`,
        {
          headers: {
            "User-Agent": "VIGIA-OSINT/1.0 (self-hosted investigator console; contact@vigia.local)",
            "Accept": "application/json",
          },
        }
      );

      if (!fallbackRes.ok) {
        return {
          success: false,
          error: "Não foi possível localizar as coordenadas no mapa.",
        };
      }

      const fallbackData = await fallbackRes.json();
      if (!fallbackData || fallbackData.length === 0) {
        return {
          success: false,
          error: "Não foi possível localizar as coordenadas para este endereço.",
        };
      }

      const lat = parseFloat(fallbackData[0].lat);
      const lon = parseFloat(fallbackData[0].lon);

      // Salva no banco (cache)
      await prisma.address.update({
        where: { id: addressId },
        data: { latitude: lat, longitude: lon },
      });

      safeRevalidatePath(`/entity/${address.entityId}`);
      return { success: true, latitude: lat, longitude: lon };
    }

    const lat = parseFloat(data[0].lat);
    const lon = parseFloat(data[0].lon);

    // Salva no banco (cache)
    await prisma.address.update({
      where: { id: addressId },
      data: { latitude: lat, longitude: lon },
    });

    safeRevalidatePath(`/entity/${address.entityId}`);
    return { success: true, latitude: lat, longitude: lon };
  } catch (error) {
    console.error("Erro no geocoding Nominatim:", error);
    return {
      success: false,
      error: "Falha na comunicação com o serviço de mapas.",
    };
  }
}

// 4.1 Geocode sob demanda por consulta de texto ou endereço livre
export async function geocodeQueryAction(query: string) {
  if (!query || !query.trim()) {
    return { success: false, error: "Endereço ou termo de busca vazio." };
  }

  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query.trim()
    )}&limit=1`;

    const res = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "VIGIA-OSINT/1.0 (self-hosted investigator console; contact@vigia.local)",
        "Accept": "application/json",
      },
    });

    if (!res.ok) {
      return { success: false, error: "Serviço de geocodificação indisponível no momento." };
    }

    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      return {
        success: true,
        latitude: lat,
        longitude: lon,
        displayName: data[0].display_name as string,
      };
    }

    return {
      success: false,
      error: "Nenhuma coordenada encontrada para este local. Você pode preencher manualmente.",
    };
  } catch (err: any) {
    return { success: false, error: err?.message || "Erro ao consultar geolocalização." };
  }
}

// 5. Mídia / Galeria Actions
export async function createMediaAction(
  entityId: string,
  data: {
    filename: string;
    originalName?: string;
    mimeType?: string;
    fileSize?: number;
    type?: MediaType;
  }
) {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "Usuário não autenticado." };
  if (!entityId || !data.filename) {
    return { success: false, error: "Dados da mídia incompletos." };
  }

  try {
    const entity = await prisma.entity.findFirst({
      where: { id: entityId, userId: user.id },
      select: { id: true },
    });
    if (!entity) return { success: false, error: "Entidade não encontrada ou acesso negado." };

    const highestSort = await prisma.media.findFirst({
      where: { entityId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const nextOrder = (highestSort?.sortOrder ?? -1) + 1;

    const media = await prisma.media.create({
      data: {
        entityId,
        filename: data.filename,
        originalName: data.originalName || null,
        mimeType: data.mimeType || null,
        fileSize: data.fileSize || null,
        type: data.type || "IMAGE",
        sortOrder: nextOrder,
      },
    });

    // Log de atividade
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "ADD",
        entityType: "MEDIA",
        entityId,
        entityName: data.originalName || "Arquivo de Mídia",
      },
    }).catch(() => null);

    safeRevalidatePath(`/entity/${entityId}`);
    return { success: true, media };
  } catch (error) {
    console.error("Erro ao registrar mídia:", error);
    return { success: false, error: "Falha ao salvar a mídia no banco." };
  }
}

export async function deleteMediaAction(mediaId: string) {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "Usuário não autenticado." };
  if (!mediaId) return { success: false, error: "ID de mídia inválido." };

  try {
    const media = await prisma.media.findFirst({
      where: { id: mediaId, entity: { userId: user.id } },
      select: { entityId: true, originalName: true },
    });

    if (!media) return { success: false, error: "Mídia não encontrada ou acesso negado." };

    await prisma.media.delete({
      where: { id: mediaId },
    });

    safeRevalidatePath(`/entity/${media.entityId}`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir mídia:", error);
    return { success: false, error: "Falha ao excluir mídia." };
  }
}

export async function reorderMediaAction(entityId: string, mediaIds: string[]) {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "Usuário não autenticado." };
  if (!entityId || !mediaIds?.length) return { success: false };

  try {
    const entity = await prisma.entity.findFirst({
      where: { id: entityId, userId: user.id },
      select: { id: true },
    });
    if (!entity) return { success: false, error: "Entidade não encontrada ou acesso negado." };

    await prisma.$transaction(
      mediaIds.map((id, index) =>
        prisma.media.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );

    safeRevalidatePath(`/entity/${entityId}`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao reordenar mídias:", error);
    return { success: false, error: "Falha ao atualizar ordenação." };
  }
}

// 6. Notas / Widgets do Canvas Actions
export async function createNoteWidgetAction(
  entityId: string,
  type: NoteType,
  title?: string,
  content?: any,
  layout?: any
) {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "Usuário não autenticado." };
  if (!entityId || !type) {
    return { success: false, error: "Parâmetros de widget inválidos." };
  }

  try {
    const entity = await prisma.entity.findFirst({
      where: { id: entityId, userId: user.id },
      select: { id: true },
    });
    if (!entity) return { success: false, error: "Entidade não encontrada ou acesso negado." };

    const safeContent = content !== undefined ? JSON.parse(JSON.stringify(content)) : {};
    const safeLayout = layout !== undefined ? JSON.parse(JSON.stringify(layout)) : { w: 1, h: 1 };

    const note = await prisma.note.create({
      data: {
        entityId,
        type,
        title: title || null,
        content: safeContent,
        layout: safeLayout,
      },
    });

    safeRevalidatePath(`/entity/${entityId}`);
    return {
      success: true,
      note: {
        ...note,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
      },
    };
  } catch (error: any) {
    console.error("Erro ao criar widget de nota:", error);
    return { success: false, error: error?.message || "Falha ao criar o widget." };
  }
}

export async function updateNoteWidgetAction(
  noteId: string,
  data: {
    title?: string;
    content?: any;
    layout?: any;
  }
) {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "Usuário não autenticado." };
  if (!noteId) return { success: false, error: "ID de widget inválido." };

  try {
    const existing = await prisma.note.findFirst({
      where: { id: noteId, entity: { userId: user.id } },
      select: { id: true, entityId: true },
    });
    if (!existing) return { success: false, error: "Widget não encontrado ou acesso negado." };

    const updated = await prisma.note.update({
      where: { id: noteId },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.content !== undefined ? { content: JSON.parse(JSON.stringify(data.content)) } : {}),
        ...(data.layout !== undefined ? { layout: JSON.parse(JSON.stringify(data.layout)) } : {}),
      },
      select: { entityId: true },
    });

    safeRevalidatePath(`/entity/${updated.entityId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao atualizar widget:", error);
    return { success: false, error: error?.message || "Falha ao salvar alterações do widget." };
  }
}

export async function deleteNoteWidgetAction(noteId: string) {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "Usuário não autenticado." };
  if (!noteId) return { success: false, error: "ID inválido." };

  try {
    const note = await prisma.note.findFirst({
      where: { id: noteId, entity: { userId: user.id } },
      select: { entityId: true },
    });

    if (!note) return { success: false, error: "Widget não encontrado ou acesso negado." };

    await prisma.note.delete({
      where: { id: noteId },
    });

    safeRevalidatePath(`/entity/${note.entityId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao excluir widget:", error);
    return { success: false, error: error?.message || "Falha ao remover widget." };
  }
}

export async function updateNoteLayoutsAction(
  entityId: string,
  layouts: Array<{ id: string; layout: any }>
) {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "Usuário não autenticado." };
  if (!entityId || !layouts?.length) return { success: false };

  try {
    const entity = await prisma.entity.findFirst({
      where: { id: entityId, userId: user.id },
      select: { id: true },
    });
    if (!entity) return { success: false, error: "Entidade não encontrada ou acesso negado." };

    await prisma.$transaction(
      layouts.map((item) =>
        prisma.note.update({
          where: { id: item.id },
          data: { layout: JSON.parse(JSON.stringify(item.layout)) },
        })
      )
    );

    return { success: true };
  } catch (error: any) {
    console.error("Erro ao salvar posições dos widgets:", error);
    return { success: false, error: error?.message || "Falha ao persistir layout dos widgets." };
  }
}

// 7. OpenGraph link preview server-side fetcher
export async function fetchLinkPreviewAction(url: string) {
  if (!url) return { success: false, error: "URL inválida." };

  try {
    const targetUrl = url.startsWith("http://") || url.startsWith("https://")
      ? url
      : `https://${url}`;

    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const html = await res.text();

    // Extração simples de tags OpenGraph via regex
    const titleMatch =
      html.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i) ||
      html.match(/<title>(.*?)<\/title>/i);
    const descMatch =
      html.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i) ||
      html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
    const imageMatch = html.match(
      /<meta\s+property=["']og:image["']\s+content=["'](.*?)["']/i
    );

    const title = titleMatch ? titleMatch[1].trim() : new URL(targetUrl).hostname;
    const description = descMatch ? descMatch[1].trim() : "";
    let image = imageMatch ? imageMatch[1].trim() : "";

    if (image && image.startsWith("/")) {
      image = new URL(image, targetUrl).toString();
    }

    return {
      success: true,
      data: {
        url: targetUrl,
        domain: new URL(targetUrl).hostname,
        title,
        description,
        image,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar OpenGraph do link:", error);
    return {
      success: false,
      data: {
        url,
        domain: url.replace(/^https?:\/\//, "").split("/")[0],
        title: url,
        description: "Não foi possível carregar o preview desta página.",
        image: "",
      },
    };
  }
}

// 10. Enriquecimento OSINT Automatizado via BullMQ + Conectores Limpos
export async function enrichEntityAction(entityId: string) {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "Usuário não autenticado." };
  if (!entityId) return { success: false, error: "ID da entidade inválido." };

  try {
    const entity = await prisma.entity.findFirst({
      where: { id: entityId, userId: user.id },
      select: { id: true },
    });
    if (!entity) return { success: false, error: "Entidade não encontrada ou acesso negado." };

    const { enqueueOsintEnrichment } = await import("@/lib/queue/osint-queue");
    const result = await enqueueOsintEnrichment(entityId);
    safeRevalidatePath(`/entity/${entityId}`);
    safeRevalidatePath("/tree");
    safeRevalidatePath("/dashboard");
    return {
      success: true,
      jobsEnriched: result.jobsEnriched,
      addressesEnriched: result.addressesEnriched,
      emailsChecked: result.emailsChecked,
      details: result.details,
    };
  } catch (error: any) {
    console.error("Erro ao executar enriquecimento OSINT:", error);
    return {
      success: false,
      error: error.message || "Falha no enriquecimento OSINT.",
    };
  }
}

// 11. Busca Rápida de Entidades para a Command Palette (Cmd+K)
export async function searchEntitiesQuickAction(query: string) {
  const user = await getAuthUser();
  if (!user) return [];
  if (!query || query.trim().length < 1) return [];

  const clean = query.trim();
  const digits = clean.replace(/\D/g, "");

  try {
    const entities = await prisma.entity.findMany({
      where: {
        userId: user.id,
        OR: [
          { fullName: { contains: clean, mode: "insensitive" } },
          { aliases: { has: clean } },
          ...(digits.length >= 3 ? [{ cpf: { contains: digits } }] : []),
        ],
      },
      select: {
        id: true,
        fullName: true,
        cpf: true,
        photo: true,
        currentJob: true,
        group: { select: { name: true, color: true } },
      },
      take: 8,
      orderBy: { fullName: "asc" },
    });

    return entities;
  } catch (error) {
    console.error("Erro ao buscar entidades para Command Palette:", error);
    return [];
  }
}

// 12. Trigger Manual do Burner Mode Cleanup
export async function triggerBurnerCleanupAction() {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "Usuário não autenticado.", count: 0, deletedNames: [] };

  try {
    const { executeBurnerCleanup } = await import("@/lib/burner/cleanup");
    const result = await executeBurnerCleanup(user.id);
    safeRevalidatePath("/tree");
    safeRevalidatePath("/dashboard");
    safeRevalidatePath("/logs");
    return result;
  } catch (error: any) {
    console.error("Erro ao executar limpeza de burners:", error);
    return {
      success: false,
      error: error.message || "Falha na limpeza de burners.",
      count: 0,
      deletedNames: [],
    };
  }
}



