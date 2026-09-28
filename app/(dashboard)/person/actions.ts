"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { encryptToString } from "@/lib/encryption";
import { getZodiacSign } from "@/lib/zodiac";
import {
  EntityFormSchema,
  type EntityFormData,
  type EntityFormInput,
} from "@/lib/schemas/person";
import { packAddressComplement } from "@/lib/maps";

import { getAuthUser } from "@/lib/auth-session";

export type { EntityFormData, EntityFormInput };

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Ignored outside Next.js request context (e.g. tests/scripts)
  }
}

export async function createEntityAction(formData: EntityFormData) {
  "use server";
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: "Usuário não autenticado." };
  }

  const cleanFormData = {
    ...formData,
    groupId: formData.groupId && formData.groupId !== "none" ? formData.groupId : null,
    phones: formData.phones?.filter((p) => p.phone?.trim()) || [],
    emails: formData.emails?.filter((e) => e.email?.trim()) || [],
    addresses: formData.addresses?.filter((a) => a.street?.trim() || a.city?.trim() || a.cep?.trim()) || [],
    socialProfiles: formData.socialProfiles?.filter((s) => s.username?.trim()) || [],
    documents: formData.documents?.filter((d) => d.value?.trim()) || [],
    vehicles: formData.vehicles?.filter((v) => v.placa?.trim() || v.modelo?.trim() || v.marca?.trim()) || [],
    jobs: formData.jobs?.filter((j) => j.title?.trim()) || [],
    educations: formData.educations?.filter((ed) => ed.institution?.trim()) || [],
    financialAccounts: formData.financialAccounts?.filter((f) => f.identifier?.trim()) || [],
    credentials: formData.credentials?.filter((c) => c.username?.trim()) || [],
    aliases: formData.aliases?.filter((a) => a?.trim()) || [],
    siblingNames: formData.siblingNames?.filter((s) => s?.trim()) || [],
  };

  const parsed = EntityFormSchema.safeParse(cleanFormData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Dados inválidos",
    };
  }

  const d = parsed.data;

  // Auto-calculate zodiac sign from birthDate if provided
  const birthDateObj = d.birthDate ? new Date(d.birthDate) : null;
  const computedZodiac = d.birthDate ? getZodiacSign(d.birthDate) : d.zodiacSign || null;

  try {
    const entity = await prisma.entity.create({
      data: {
        userId: user.id,
        fullName: d.fullName,
        aliases: d.aliases,
        photo: d.photo || null,
        cpf: d.cpf || null,
        rg: d.rg || null,
        gender: d.gender || null,
        birthDate: birthDateObj,
        zodiacSign: computedZodiac,
        currentJob: d.currentJob || null,
        notes: d.notes || null,
        groupId: d.groupId || null,
        fatherId: d.fatherId || null,
        fatherName: d.fatherName || null,
        motherId: d.motherId || null,
        motherName: d.motherName || null,
        isBurner: d.isBurner ?? false,
        expiresAt: d.isBurner && d.expiresAt ? new Date(d.expiresAt) : null,

        // Sub-arrays
        phones: {
          create: d.phones.map((p) => ({
            phone: p.phone,
            label: p.label || "Principal",
            isWhatsapp: p.isWhatsapp ?? true,
            isTelegram: p.isTelegram ?? false,
          })),
        },
        emails: {
          create: d.emails.map((e) => ({
            email: e.email,
            label: e.label || "Principal",
          })),
        },
        addresses: {
          create: d.addresses.map((a) => ({
            label: a.label || "Principal",
            cep: a.cep || null,
            street: a.street || null,
            number: a.number || null,
            complement: packAddressComplement(a.complement, a.mapsUrl),
            neighborhood: a.neighborhood || null,
            city: a.city || null,
            state: a.state || null,
            country: a.country || "Brasil",
          })),
        },
        socialProfiles: {
          create: d.socialProfiles.map((s) => ({
            platform: s.platform.toLowerCase(),
            username: s.username,
            url: s.url || null,
          })),
        },
        documents: {
          create: d.documents.map((doc) => ({
            type: doc.type,
            value: doc.value,
          })),
        },
        vehicles: {
          create: d.vehicles.map((v) => ({
            placa: v.placa || null,
            renavam: v.renavam || null,
            chassi: v.chassi || null,
            motor: v.motor || null,
            marca: v.marca || null,
            modelo: v.modelo || null,
            ano: v.ano || null,
            cor: v.cor || null,
          })),
        },
        jobs: {
          create: d.jobs.map((j) => ({
            title: j.title,
            company: j.company || null,
            cnpj: j.cnpj || null,
            companyTradeName: j.companyTradeName || null,
            companyLegalNature: j.companyLegalNature || null,
            companySize: j.companySize || null,
            companyCapital: j.companyCapital ? String(j.companyCapital) : null,
            companyAddress: j.companyAddress || null,
            companyPhone: j.companyPhone || null,
            companyEmail: j.companyEmail || null,
            companyActivity: j.companyActivity || null,
            isCurrent: j.isCurrent,
          })),
        },
        educations: {
          create: d.educations.map((ed) => ({
            institution: ed.institution,
            course: ed.course || null,
            degree: ed.degree || null,
            startYear: ed.startYear || null,
            endYear: ed.endYear || null,
            isCurrent: ed.isCurrent,
          })),
        },
        financialAccounts: {
          create: d.financialAccounts.map((f) => ({
            type: f.type,
            institution: f.institution || null,
            identifier: encryptToString(f.identifier),
            metadata: f.metadata || undefined,
          })),
        },
        credentials: {
          create: d.credentials.map((c) => ({
            platform: c.platform,
            username: c.username,
            passwordHash: encryptToString(c.passwordHash),
            notes: c.notes || null,
          })),
        },
        siblingNames: {
          create: d.siblingNames
            .filter((n) => n.trim().length > 0)
            .map((name) => ({ name: name.trim() })),
        },
        siblings: {
          connect: d.siblingIds.map((id) => ({ id })),
        },
      },
    });

    // Activity Log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "ADD",
        entityType: "ENTITY",
        entityId: entity.id,
        entityName: entity.fullName,
      },
    }).catch(() => null);

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "CREATE_ENTITY",
        entityType: "ENTITY",
        entityId: entity.id,
        entityName: entity.fullName,
        details: { fields: Object.keys(d) },
      },
    }).catch(() => null);

    safeRevalidatePath("/tree");
    safeRevalidatePath("/dashboard");
    safeRevalidatePath("/groups");

    return { success: true, id: entity.id, entityId: entity.id };
  } catch (error) {
    console.error("Erro ao criar entidade:", error);
    return {
      success: false,
      error: "Falha ao salvar a pessoa no banco de dados.",
    };
  }
}

export async function updateEntityAction(id: string, formData: EntityFormData) {
  "use server";
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: "Usuário não autenticado." };
  }

  if (!id) return { success: false, error: "ID da entidade não fornecido." };

  const existing = await prisma.entity.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return { success: false, error: "Entidade não encontrada ou acesso negado." };
  }

  const cleanFormData = {
    ...formData,
    groupId: formData.groupId && formData.groupId !== "none" ? formData.groupId : null,
    phones: formData.phones?.filter((p) => p.phone?.trim()) || [],
    emails: formData.emails?.filter((e) => e.email?.trim()) || [],
    addresses: formData.addresses?.filter((a) => a.street?.trim() || a.city?.trim() || a.cep?.trim()) || [],
    socialProfiles: formData.socialProfiles?.filter((s) => s.username?.trim()) || [],
    documents: formData.documents?.filter((d) => d.value?.trim()) || [],
    vehicles: formData.vehicles?.filter((v) => v.placa?.trim() || v.modelo?.trim() || v.marca?.trim()) || [],
    jobs: formData.jobs?.filter((j) => j.title?.trim()) || [],
    educations: formData.educations?.filter((ed) => ed.institution?.trim()) || [],
    financialAccounts: formData.financialAccounts?.filter((f) => f.identifier?.trim()) || [],
    credentials: formData.credentials?.filter((c) => c.username?.trim()) || [],
    aliases: formData.aliases?.filter((a) => a?.trim()) || [],
    siblingNames: formData.siblingNames?.filter((s) => s?.trim()) || [],
  };

  const parsed = EntityFormSchema.safeParse(cleanFormData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Dados inválidos",
    };
  }

  const d = parsed.data;
  const birthDateObj = d.birthDate ? new Date(d.birthDate) : null;
  const computedZodiac = d.birthDate ? getZodiacSign(d.birthDate) : d.zodiacSign || null;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Delete existing relations
      await tx.phone.deleteMany({ where: { entityId: id } });
      await tx.email.deleteMany({ where: { entityId: id } });
      await tx.address.deleteMany({ where: { entityId: id } });
      await tx.socialProfile.deleteMany({ where: { entityId: id } });
      await tx.document.deleteMany({ where: { entityId: id } });
      await tx.vehicle.deleteMany({ where: { entityId: id } });
      await tx.job.deleteMany({ where: { entityId: id } });
      await tx.education.deleteMany({ where: { entityId: id } });
      await tx.financialAccount.deleteMany({ where: { entityId: id } });
      await tx.credential.deleteMany({ where: { entityId: id } });
      await tx.siblingName.deleteMany({ where: { entityId: id } });

      // 2. Update entity and re-create child relations
      await tx.entity.update({
        where: { id },
        data: {
          fullName: d.fullName,
          aliases: d.aliases,
          photo: d.photo || null,
          cpf: d.cpf || null,
          rg: d.rg || null,
          gender: d.gender || null,
          birthDate: birthDateObj,
          zodiacSign: computedZodiac,
          currentJob: d.currentJob || null,
          notes: d.notes || null,
          groupId: d.groupId || null,
          fatherId: d.fatherId || null,
          fatherName: d.fatherName || null,
          motherId: d.motherId || null,
          motherName: d.motherName || null,
          isBurner: d.isBurner ?? false,
          expiresAt: d.isBurner && d.expiresAt ? new Date(d.expiresAt) : null,

          phones: {
            create: d.phones.map((p) => ({
              phone: p.phone,
              label: p.label || "Principal",
              isWhatsapp: p.isWhatsapp ?? true,
              isTelegram: p.isTelegram ?? false,
            })),
          },
          emails: {
            create: d.emails.map((e) => ({
              email: e.email,
              label: e.label || "Principal",
            })),
          },
          addresses: {
            create: d.addresses.map((a) => ({
              label: a.label || "Principal",
              cep: a.cep || null,
              street: a.street || null,
              number: a.number || null,
              complement: packAddressComplement(a.complement, a.mapsUrl),
              neighborhood: a.neighborhood || null,
              city: a.city || null,
              state: a.state || null,
              country: a.country || "Brasil",
            })),
          },
          socialProfiles: {
            create: d.socialProfiles.map((s) => ({
              platform: s.platform.toLowerCase(),
              username: s.username,
              url: s.url || null,
            })),
          },
          documents: {
            create: d.documents.map((doc) => ({
              type: doc.type,
              value: doc.value,
            })),
          },
          vehicles: {
            create: d.vehicles.map((v) => ({
              placa: v.placa || null,
              renavam: v.renavam || null,
              chassi: v.chassi || null,
              motor: v.motor || null,
              marca: v.marca || null,
              modelo: v.modelo || null,
              ano: v.ano || null,
              cor: v.cor || null,
            })),
          },
          jobs: {
            create: d.jobs.map((j) => ({
              title: j.title,
              company: j.company || null,
              cnpj: j.cnpj || null,
              companyTradeName: j.companyTradeName || null,
              companyLegalNature: j.companyLegalNature || null,
              companySize: j.companySize || null,
              companyCapital: j.companyCapital ? String(j.companyCapital) : null,
              companyAddress: j.companyAddress || null,
              companyPhone: j.companyPhone || null,
              companyEmail: j.companyEmail || null,
              companyActivity: j.companyActivity || null,
              isCurrent: j.isCurrent,
            })),
          },
          educations: {
            create: d.educations.map((ed) => ({
              institution: ed.institution,
              course: ed.course || null,
              degree: ed.degree || null,
              startYear: ed.startYear || null,
              endYear: ed.endYear || null,
              isCurrent: ed.isCurrent,
            })),
          },
          financialAccounts: {
            create: d.financialAccounts.map((f) => ({
              type: f.type,
              institution: f.institution || null,
              identifier: encryptToString(f.identifier),
              metadata: f.metadata || undefined,
            })),
          },
          credentials: {
            create: d.credentials.map((c) => ({
              platform: c.platform,
              username: c.username,
              passwordHash: encryptToString(c.passwordHash),
              notes: c.notes || null,
            })),
          },
          siblingNames: {
            create: d.siblingNames
              .filter((n) => n.trim().length > 0)
              .map((name) => ({ name: name.trim() })),
          },
          siblings: {
            set: d.siblingIds.map((sid) => ({ id: sid })),
          },
        },
      });

      // Activity Log
      await tx.activityLog.create({
        data: {
          userId: user.id,
          action: "UPDATE",
          entityType: "ENTITY",
          entityId: id,
          entityName: d.fullName,
        },
      }).catch(() => null);

      // Audit Log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "UPDATE_ENTITY",
          entityType: "ENTITY",
          entityId: id,
          entityName: d.fullName,
          details: { updatedFields: Object.keys(d) },
        },
      }).catch(() => null);
    });

    safeRevalidatePath("/tree");
    safeRevalidatePath("/dashboard");
    safeRevalidatePath(`/entity/${id}`);

    return { success: true, id };
  } catch (error) {
    console.error("Erro ao atualizar entidade:", error);
    return {
      success: false,
      error: "Falha ao salvar as alterações no banco de dados.",
    };
  }
}

export async function deleteEntityAction(id: string) {
  "use server";
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: "Usuário não autenticado." };
  }

  if (!id) return { success: false, error: "ID da entidade não informado." };

  try {
    const existing = await prisma.entity.findFirst({
      where: { id, userId: user.id },
      select: { fullName: true },
    });

    if (!existing) {
      return { success: false, error: "Entidade não encontrada ou acesso negado." };
    }

    await prisma.entity.delete({
      where: { id },
    });

    // Activity Log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "DELETE",
        entityType: "ENTITY",
        entityId: id,
        entityName: existing.fullName || "Entidade",
      },
    }).catch(() => null);

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "DELETE_ENTITY",
        entityType: "ENTITY",
        entityId: id,
        entityName: existing.fullName || "Entidade",
      },
    }).catch(() => null);

    safeRevalidatePath("/tree");
    safeRevalidatePath("/dashboard");
    safeRevalidatePath("/groups");

    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir entidade:", error);
    return { success: false, error: "Falha ao excluir a entidade." };
  }
}

// 4. Consulta Rápida de CNPJ (BrasilAPI)
export async function fetchCnpjQuickAction(cnpj: string) {
  if (!cnpj) return { success: false, error: "CNPJ não informado." };
  try {
    const { fetchCnpjData } = await import("@/lib/osint/brasilapi-cnpj");
    const data = await fetchCnpjData(cnpj);
    if (!data) {
      return { success: false, error: "CNPJ não encontrado ou indisponível na BrasilAPI." };
    }
    return {
      success: true,
      data: {
        company: data.nome_fantasia || data.razao_social,
        companyTradeName: data.razao_social,
        companyCapital: data.capital_social ? String(data.capital_social) : null,
        companyLegalNature: data.natureza_juridica,
        companySize: data.porte,
        companyAddress: [
          data.logradouro,
          data.numero,
          data.bairro,
          data.municipio,
          data.uf,
        ]
          .filter(Boolean)
          .join(", "),
        companyPhone: data.ddd_telefone_1,
        companyEmail: data.email,
        companyActivity: data.cnae_fiscal_descricao,
      },
    };
  } catch (error: any) {
    console.error("Erro na busca rápida de CNPJ:", error);
    return { success: false, error: error.message || "Falha ao consultar CNPJ." };
  }
}

