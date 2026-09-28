import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export interface BurnerCleanupResult {
  success: boolean;
  count: number;
  deletedNames: string[];
  error?: string;
}

/**
 * Executa a rotina de exclusão física permanente (Hard Delete) de entidades com prazo Burner expirado.
 * Remove do banco de dados relacional e limpa arquivos de mídia locais associados.
 */
export async function executeBurnerCleanup(userId?: string): Promise<BurnerCleanupResult> {
  const now = new Date();

  // 1. Localiza alvos temporários com data de expiração atingida
  const expiredEntities = await prisma.entity.findMany({
    where: {
      isBurner: true,
      expiresAt: {
        lte: now,
      },
      ...(userId ? { userId } : {}),
    },
    include: {
      media: true,
    },
  });

  if (expiredEntities.length === 0) {
    return { success: true, count: 0, deletedNames: [] };
  }

  const deletedNames: string[] = [];

  for (const entity of expiredEntities) {
    // 2. Limpar arquivos de fotos / uploads locais
    if (entity.photo && entity.photo.startsWith("/uploads/people/")) {
      try {
        const filePath = path.join(process.cwd(), "public", entity.photo);
        await fs.unlink(filePath).catch(() => null);
      } catch {
        // Ignored
      }
    }

    for (const m of entity.media) {
      if (m.filename && m.filename.startsWith("/uploads/people/")) {
        try {
          const filePath = path.join(process.cwd(), "public", m.filename);
          await fs.unlink(filePath).catch(() => null);
        } catch {
          // Ignored
        }
      }
    }

    // 3. Exclusão física em cascata no banco de dados
    await prisma.entity.delete({
      where: { id: entity.id },
    });

    deletedNames.push(entity.fullName);

    // 4. Registros de Auditoria e Atividade
    await prisma.activityLog.create({
      data: {
        userId: entity.userId,
        action: "DELETE",
        entityType: "Entity",
        entityId: entity.id,
        entityName: `[BURNER EXCLUSÃO] ${entity.fullName}`,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: entity.userId,
        action: "BURNER_AUTO_DELETE",
        entityType: "Entity",
        entityId: entity.id,
        entityName: entity.fullName,
        details: {
          reason: "EXPIRATION_REACHED",
          expiresAt: entity.expiresAt,
          deletedAt: now.toISOString(),
        },
      },
    });
  }

  return {
    success: true,
    count: deletedNames.length,
    deletedNames,
  };
}
