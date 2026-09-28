"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * Atualiza os dados de perfil (displayName e photo) do usuário autenticado.
 */
export async function updateProfileAction(data: {
  displayName: string;
  photo?: string | null;
}) {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  if (!session?.user) {
    return { success: false, error: "Usuário não autenticado." };
  }

  const cleanName = data.displayName?.trim();
  if (!cleanName || cleanName.length < 2) {
    return { success: false, error: "Nome de exibição deve ter pelo menos 2 caracteres." };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        displayName: cleanName,
        name: cleanName,
        photo: data.photo || null,
        image: data.photo || null,
      },
    });

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    console.error("Erro ao atualizar perfil:", err);
    return { success: false, error: "Falha ao salvar dados de perfil." };
  }
}

/**
 * Exporta o backup consolidado do banco de dados em formato JSON.
 */
export async function exportDatabaseBackupAction() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  if (!session?.user) {
    return { success: false, error: "Acesso negado. Sessão inválida." };
  }

  try {
    const [groups, entities, relationships, activityLogs, auditLogs] =
      await Promise.all([
        prisma.group.findMany({
          where: { userId: session.user.id },
          orderBy: { name: "asc" },
        }),
        prisma.entity.findMany({
          where: { userId: session.user.id },
          include: {
            phones: true,
            emails: true,
            addresses: true,
            socialProfiles: true,
            documents: true,
            vehicles: true,
            jobs: true,
            educations: true,
            financialAccounts: true,
            credentials: true,
            siblingNames: true,
          },
          orderBy: { fullName: "asc" },
        }),
        prisma.relationship.findMany({
          where: { entity: { userId: session.user.id } },
        }),
        prisma.activityLog.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: "desc" },
          take: 500,
        }),
        prisma.auditLog.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: "desc" },
          take: 500,
        }),
      ]);

    // Grava log da exportação de inteligência
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "BACKUP_EXPORT_JSON",
        entityType: "DATABASE",
        details: {
          totalGroups: groups.length,
          totalEntities: entities.length,
          totalRelationships: relationships.length,
          exportedAt: new Date().toISOString(),
        },
      },
    });

    const backupPayload = {
      platform: "V.I.G.I.A — OSINT & Intelligence System",
      version: "1.0",
      exportedAt: new Date().toISOString(),
      exportedBy: {
        id: session.user.id,
        email: session.user.email,
        displayName: (session.user as any).displayName || session.user.name,
      },
      stats: {
        groupsCount: groups.length,
        entitiesCount: entities.length,
        relationshipsCount: relationships.length,
      },
      data: {
        groups,
        entities,
        relationships,
        recentActivityLogs: activityLogs,
        recentAuditLogs: auditLogs,
      },
    };

    return {
      success: true,
      backupJson: JSON.stringify(backupPayload, null, 2),
      filename: `VIGIA-Backup-Completo-${new Date().toISOString().slice(0, 10)}.json`,
    };
  } catch (err: any) {
    console.error("Erro ao gerar backup da base:", err);
    return { success: false, error: "Falha ao gerar arquivo de backup." };
  }
}
