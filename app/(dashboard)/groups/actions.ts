"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-session";

const GroupSchema = z.object({
  name: z.string().trim().min(1, "O nome do grupo é obrigatório").max(100, "Máximo de 100 caracteres"),
  description: z.string().trim().max(500, "Máximo de 500 caracteres").optional().nullable(),
  color: z.string().trim().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Cor hexadecimal inválida").default("#833ab4"),
  icon: z.string().trim().default("folder"),
});

export type GroupFormData = z.infer<typeof GroupSchema>;

export async function createGroupAction(data: GroupFormData) {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: "Usuário não autenticado." };
  }

  const parsed = GroupSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Dados inválidos",
    };
  }

  try {
    const group = await prisma.group.create({
      data: {
        userId: user.id,
        name: parsed.data.name,
        description: parsed.data.description || null,
        color: parsed.data.color,
        icon: parsed.data.icon,
      },
    });

    // Register activity log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "ADD",
        entityType: "GROUP",
        entityId: group.id,
        entityName: group.name,
      },
    }).catch(() => null);

    revalidatePath("/groups");
    revalidatePath("/tree");
    revalidatePath("/dashboard");

    return { success: true, group };
  } catch (error) {
    console.error("Erro ao criar grupo:", error);
    return { success: false, error: "Falha ao criar o grupo no banco de dados." };
  }
}

export async function updateGroupAction(id: string, data: GroupFormData) {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: "Usuário não autenticado." };
  }

  if (!id) return { success: false, error: "ID do grupo não informado." };

  const parsed = GroupSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Dados inválidos",
    };
  }

  try {
    const existing = await prisma.group.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return { success: false, error: "Grupo não encontrado ou sem permissão." };
    }

    const group = await prisma.group.update({
      where: { id },
      data: {
        name: parsed.data.name,
        description: parsed.data.description || null,
        color: parsed.data.color,
        icon: parsed.data.icon,
      },
    });

    // Register activity log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "UPDATE",
        entityType: "GROUP",
        entityId: group.id,
        entityName: group.name,
      },
    }).catch(() => null);

    revalidatePath("/groups");
    revalidatePath("/tree");
    revalidatePath("/dashboard");

    return { success: true, group };
  } catch (error) {
    console.error("Erro ao atualizar grupo:", error);
    return { success: false, error: "Falha ao atualizar o grupo." };
  }
}

export async function deleteGroupAction(id: string) {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: "Usuário não autenticado." };
  }

  if (!id) return { success: false, error: "ID do grupo não informado." };

  try {
    const existing = await prisma.group.findFirst({
      where: { id, userId: user.id },
      select: { id: true, name: true },
    });

    if (!existing) {
      return { success: false, error: "Grupo não encontrado ou sem permissão." };
    }

    // Entities in this group will have groupId set to null due to onDelete: SetNull
    await prisma.group.delete({
      where: { id: existing.id },
    });

    // Register activity log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "DELETE",
        entityType: "GROUP",
        entityId: id,
        entityName: existing.name || "Grupo",
      },
    }).catch(() => null);

    revalidatePath("/groups");
    revalidatePath("/tree");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir grupo:", error);
    return { success: false, error: "Falha ao excluir o grupo." };
  }
}
