"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { RelationshipType } from "@/generated/prisma/enums";
import { getAuthUser } from "@/lib/auth-session";

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Ignored in non-request contexts
  }
}

export interface CreateRelationshipParams {
  entityId: string;
  relatedEntityId: string;
  type: RelationshipType;
  label: string;
  notes?: string;
  bidirectional?: boolean;
}

async function resolveEntityId(rawId: string, userId: string): Promise<string> {
  if (!rawId) throw new Error("ID inválido");

  if (rawId.startsWith("free_")) {
    const cleanName = rawId.replace(/^free_/, "").replace(/_/g, " ").trim();
    let found = await prisma.entity.findFirst({
      where: { fullName: { equals: cleanName, mode: "insensitive" }, userId },
      select: { id: true },
    });
    if (!found) {
      found = await prisma.entity.create({
        data: {
          userId,
          fullName: cleanName,
          status: "INVESTIGATING",
        },
        select: { id: true },
      });
    }
    return found.id;
  }

  const existing = await prisma.entity.findFirst({
    where: { id: rawId, userId },
    select: { id: true },
  });
  if (existing) return existing.id;

  const created = await prisma.entity.create({
    data: {
      userId,
      fullName: rawId,
      status: "INVESTIGATING",
    },
    select: { id: true },
  });
  return created.id;
}

export async function createOrUpdateRelationshipAction(params: CreateRelationshipParams) {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: "Usuário não autenticado." };
  }

  const { entityId, relatedEntityId, type, label, notes, bidirectional } = params;

  if (!entityId || !relatedEntityId) {
    return { success: false, error: "Identificadores das entidades são obrigatórios." };
  }

  try {
    const realEntityId = await resolveEntityId(entityId, user.id);
    const realRelatedEntityId = await resolveEntityId(relatedEntityId, user.id);

    if (realEntityId === realRelatedEntityId) {
      return { success: false, error: "Não é possível conectar uma entidade a ela mesma." };
    }

    // 1. Verificar se já existe conexão direta A -> B
    const existing = await prisma.relationship.findFirst({
      where: {
        entityId: realEntityId,
        relatedEntityId: realRelatedEntityId,
      },
    });

    let relationship;
    if (existing) {
      // Atualizar existente
      relationship = await prisma.relationship.update({
        where: { id: existing.id },
        data: {
          type,
          label: label.trim(),
          notes: notes?.trim() || null,
        },
        include: {
          relatedEntity: {
            select: { id: true, fullName: true, photo: true, currentJob: true },
          },
        },
      });
    } else {
      // Criar nova
      relationship = await prisma.relationship.create({
        data: {
          entityId: realEntityId,
          relatedEntityId: realRelatedEntityId,
          type,
          label: label.trim(),
          notes: notes?.trim() || null,
        },
        include: {
          relatedEntity: {
            select: { id: true, fullName: true, photo: true, currentJob: true },
          },
        },
      });
    }

    // 2. Se for bidirecional, criar/atualizar B -> A
    if (bidirectional) {
      const existingReverse = await prisma.relationship.findFirst({
        where: {
          entityId: realRelatedEntityId,
          relatedEntityId: realEntityId,
        },
      });

      if (existingReverse) {
        await prisma.relationship.update({
          where: { id: existingReverse.id },
          data: {
            type,
            label: label.trim(),
            notes: notes?.trim() || null,
          },
        });
      } else {
        await prisma.relationship.create({
          data: {
            entityId: realRelatedEntityId,
            relatedEntityId: realEntityId,
            type,
            label: label.trim(),
            notes: notes?.trim() || null,
          },
        });
      }
    }

    // Log de auditoria
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "ADD",
        entityType: "RELATIONSHIP",
        entityId: realEntityId,
        entityName: `Vínculo com ${relationship.relatedEntity?.fullName || "Entidade"} (${label})`,
      },
    }).catch(() => null);

    safeRevalidate(`/entity/${realEntityId}`);
    safeRevalidate(`/entity/${realRelatedEntityId}`);
    safeRevalidate(`/entity/${realEntityId}/graph`);
    safeRevalidate(`/entity/${realRelatedEntityId}/graph`);
    safeRevalidate("/tree");

    return {
      success: true,
      relationshipId: relationship.id,
      relationship,
    };
  } catch (error: any) {
    console.error("Erro ao criar/atualizar relacionamento:", error);
    return {
      success: false,
      error: error.message || "Falha ao salvar conexão no banco de dados.",
    };
  }
}

export async function updateRelationshipAction(
  relationshipId: string,
  data: { type?: RelationshipType; label?: string; notes?: string }
) {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: "Usuário não autenticado." };
  }

  if (!relationshipId) {
    return { success: false, error: "ID da relação não fornecido." };
  }

  try {
    const existing = await prisma.relationship.findUnique({
      where: { id: relationshipId },
      include: { entity: { select: { userId: true } } },
    });

    if (!existing || existing.entity.userId !== user.id) {
      return { success: false, error: "Relacionamento não encontrado ou sem permissão." };
    }

    const updated = await prisma.relationship.update({
      where: { id: relationshipId },
      data: {
        ...(data.type ? { type: data.type } : {}),
        ...(data.label !== undefined ? { label: data.label.trim() } : {}),
        ...(data.notes !== undefined ? { notes: data.notes.trim() || null } : {}),
      },
    });

    safeRevalidate(`/entity/${updated.entityId}`);
    safeRevalidate(`/entity/${updated.relatedEntityId}`);
    safeRevalidate(`/entity/${updated.entityId}/graph`);
    safeRevalidate(`/entity/${updated.relatedEntityId}/graph`);

    return { success: true, relationship: updated };
  } catch (error: any) {
    console.error("Erro ao atualizar relacionamento:", error);
    return { success: false, error: error.message || "Falha ao atualizar relacionamento." };
  }
}

export async function deleteRelationshipAction(relationshipId: string) {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: "Usuário não autenticado." };
  }

  if (!relationshipId) {
    return { success: false, error: "ID do relacionamento inválido." };
  }

  try {
    const rel = await prisma.relationship.findUnique({
      where: { id: relationshipId },
      include: { entity: { select: { userId: true } } },
    });

    if (!rel || rel.entity.userId !== user.id) {
      return { success: false, error: "Relacionamento não encontrado ou sem permissão." };
    }

    await prisma.relationship.delete({
      where: { id: relationshipId },
    });

    // Log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "DELETE",
        entityType: "RELATIONSHIP",
        entityId: rel.entityId,
        entityName: `Removido vínculo: ${rel.label || "Vínculo"}`,
      },
    }).catch(() => null);

    safeRevalidate(`/entity/${rel.entityId}`);
    safeRevalidate(`/entity/${rel.relatedEntityId}`);
    safeRevalidate(`/entity/${rel.entityId}/graph`);
    safeRevalidate(`/entity/${rel.relatedEntityId}/graph`);

    return { success: true };
  } catch (error: any) {
    console.error("Erro ao deletar relacionamento:", error);
    return { success: false, error: error.message || "Falha ao excluir conexão." };
  }
}

export async function searchEntitiesForGraphAction(query: string, excludeIds: string[] = []) {
  const user = await getAuthUser();
  if (!user) return [];

  const clean = (query || "").trim();
  if (clean.length < 1) return [];

  const digits = clean.replace(/\D/g, "");

  try {
    const entities = await prisma.entity.findMany({
      where: {
        userId: user.id,
        AND: [
          excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {},
          {
            OR: [
              { fullName: { contains: clean, mode: "insensitive" } },
              { aliases: { has: clean } },
              { currentJob: { contains: clean, mode: "insensitive" } },
              ...(digits.length >= 3 ? [{ cpf: { contains: digits } }] : []),
            ],
          },
        ],
      },
      select: {
        id: true,
        fullName: true,
        photo: true,
        cpf: true,
        currentJob: true,
        gender: true,
        group: {
          select: { name: true, color: true },
        },
        addresses: {
          select: { city: true, state: true },
          take: 1,
        },
        phones: {
          select: { phone: true, isWhatsapp: true },
          take: 1,
        },
      },
      take: 10,
      orderBy: { fullName: "asc" },
    });

    return entities;
  } catch (error) {
    console.error("Erro ao buscar entidades para grafo:", error);
    return [];
  }
}

export async function fetchEntityDetailsForGraphAction(entityId: string) {
  const user = await getAuthUser();
  if (!user || !entityId) return null;

  try {
    const entity = await prisma.entity.findFirst({
      where: { id: entityId, userId: user.id },
      include: {
        group: { select: { id: true, name: true, color: true, icon: true } },
        phones: { orderBy: { createdAt: "asc" } },
        emails: { orderBy: { createdAt: "asc" } },
        addresses: { orderBy: { createdAt: "asc" } },
        jobs: { orderBy: { isCurrent: "desc" } },
        vehicles: { orderBy: { createdAt: "asc" } },
        documents: { orderBy: { type: "asc" } },
        socialProfiles: { orderBy: { platform: "asc" } },
        father: { select: { id: true, fullName: true, photo: true } },
        mother: { select: { id: true, fullName: true, photo: true } },
        childrenAsFather: { select: { id: true, fullName: true, photo: true } },
        childrenAsMother: { select: { id: true, fullName: true, photo: true } },
        siblings: { select: { id: true, fullName: true, photo: true } },
        relationships: {
          include: {
            relatedEntity: {
              select: { id: true, fullName: true, photo: true, currentJob: true },
            },
          },
        },
        relatedIn: {
          include: {
            entity: {
              select: { id: true, fullName: true, photo: true, currentJob: true },
            },
          },
        },
      },
    });

    if (!entity) return null;

    // Converte tipos complexos (Date, Decimal) para JSON serializável
    return JSON.parse(JSON.stringify(entity));
  } catch (error) {
    console.error("Erro ao buscar detalhes da entidade para o grafo:", error);
    return null;
  }
}

export async function fetchSecondDegreeConnectionsAction(entityId: string) {
  const user = await getAuthUser();
  if (!user || !entityId) return { success: false, nodes: [], edges: [] };

  try {
    const entity = await prisma.entity.findFirst({
      where: { id: entityId, userId: user.id },
      include: {
        father: { select: { id: true, fullName: true, photo: true, currentJob: true } },
        mother: { select: { id: true, fullName: true, photo: true, currentJob: true } },
        childrenAsFather: { select: { id: true, fullName: true, photo: true, currentJob: true } },
        childrenAsMother: { select: { id: true, fullName: true, photo: true, currentJob: true } },
        siblings: { select: { id: true, fullName: true, photo: true, currentJob: true } },
        relationships: {
          include: {
            relatedEntity: { select: { id: true, fullName: true, photo: true, currentJob: true } },
          },
        },
        relatedIn: {
          include: {
            entity: { select: { id: true, fullName: true, photo: true, currentJob: true } },
          },
        },
      },
    });

    if (!entity) return { success: false, nodes: [], edges: [] };

    return {
      success: true,
      data: JSON.parse(JSON.stringify(entity)),
    };
  } catch (error: any) {
    console.error("Erro ao buscar conexões de segundo grau:", error);
    return { success: false, error: error.message };
  }
}
