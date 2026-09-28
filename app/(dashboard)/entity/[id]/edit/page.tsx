import * as React from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ArrowLeft, UserCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { decryptFromString } from "@/lib/encryption";
import { PersonForm } from "@/components/person/person-form";
import { type EntityFormData } from "@/lib/schemas/person";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session?.user) return { title: "Editar Entidade — V.I.G.I.A" };

  const entity = await prisma.entity.findFirst({
    where: { id, userId: session.user.id },
    select: { fullName: true },
  });

  return {
    title: entity
      ? `Editar: ${entity.fullName} — V.I.G.I.A`
      : "Editar Entidade — V.I.G.I.A",
    description: "Edição e enriquecimento de dados cadastrais e inteligência OSINT.",
  };
}

export default async function EditPersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session?.user) {
    redirect("/login");
  }
  const userId = session.user.id;

  // Single query with all relations included scoped to user
  const [entity, groups, availableEntities] = await Promise.all([
    prisma.entity.findFirst({
      where: { id, userId },
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
        siblings: {
          select: { id: true },
        },
      },
    }),
    prisma.group.findMany({
      where: { userId },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        color: true,
      },
    }),
    prisma.entity.findMany({
      where: { userId, id: { not: id } },
      orderBy: { fullName: "asc" },
      select: {
        id: true,
        fullName: true,
        photo: true,
        gender: true,
      },
    }),
  ]);

  if (!entity) {
    notFound();
  }

  // Format entity data for PersonForm
  const initialData: EntityFormData = {
    fullName: entity.fullName,
    aliases: entity.aliases || [],
    photo: entity.photo || "",
    cpf: entity.cpf || "",
    rg: entity.rg || "",
    gender: (entity.gender as "MALE" | "FEMALE" | "OTHER" | null) || null,
    birthDate: entity.birthDate
      ? entity.birthDate.toISOString().split("T")[0]
      : "",
    zodiacSign: entity.zodiacSign || "",
    currentJob: entity.currentJob || "",
    notes: entity.notes || "",
    groupId: entity.groupId || "",

    phones: entity.phones.map((p) => ({
      id: p.id,
      phone: p.phone,
      label: p.label || "Principal",
      isWhatsapp: p.isWhatsapp,
      isTelegram: (p as any).isTelegram ?? false,
    })),

    emails: entity.emails.map((e) => ({
      id: e.id,
      email: e.email,
      label: e.label || "Principal",
    })),

    addresses: entity.addresses.map((a) => ({
      id: a.id,
      label: a.label || "Residencial",
      cep: a.cep || "",
      street: a.street || "",
      number: a.number || "",
      complement: a.complement || "",
      neighborhood: a.neighborhood || "",
      city: a.city || "",
      state: a.state || "",
      country: a.country || "Brasil",
    })),

    socialProfiles: entity.socialProfiles.map((s) => ({
      id: s.id,
      platform: s.platform,
      username: s.username,
      url: s.url || "",
    })),

    documents: entity.documents.map((d) => ({
      id: d.id,
      type: d.type as any,
      value: d.value,
    })),

    vehicles: entity.vehicles.map((v) => ({
      id: v.id,
      placa: v.placa || "",
      renavam: v.renavam || "",
      chassi: v.chassi || "",
      motor: v.motor || "",
      marca: v.marca || "",
      modelo: v.modelo || "",
      ano: v.ano || null,
      cor: v.cor || "",
    })),

    jobs: entity.jobs.map((j) => ({
      id: j.id,
      title: j.title,
      company: j.company || "",
      cnpj: j.cnpj || "",
      companyTradeName: j.companyTradeName || "",
      companyLegalNature: j.companyLegalNature || "",
      companySize: j.companySize || "",
      companyCapital: j.companyCapital ? String(j.companyCapital) : "",
      companyAddress: j.companyAddress || "",
      companyPhone: j.companyPhone || "",
      companyEmail: j.companyEmail || "",
      companyActivity: j.companyActivity || "",
      isCurrent: j.isCurrent,
    })),

    educations: entity.educations.map((e) => ({
      id: e.id,
      institution: e.institution,
      course: e.course || "",
      degree: e.degree || "",
      startYear: e.startYear || null,
      endYear: e.endYear || null,
      isCurrent: e.isCurrent,
    })),

    financialAccounts: entity.financialAccounts.map((f) => ({
      id: f.id,
      type: f.type as any,
      institution: f.institution || "",
      identifier: decryptFromString(f.identifier),
      metadata: (f.metadata as Record<string, any>) || null,
    })),

    credentials: entity.credentials.map((c) => ({
      id: c.id,
      platform: c.platform,
      username: c.username,
      passwordHash: decryptFromString(c.passwordHash),
      notes: c.notes || "",
    })),

    fatherId: entity.fatherId || "",
    fatherName: entity.fatherName || "",
    motherId: entity.motherId || "",
    motherName: entity.motherName || "",
    siblingIds: entity.siblings.map((s) => s.id),
    siblingNames: entity.siblingNames.map((sn) => sn.name),
    isBurner: entity.isBurner ?? false,
    expiresAt: entity.expiresAt ? entity.expiresAt.toISOString().slice(0, 16) : "",
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Breadcrumbs & Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
          <Link
            href="/tree"
            className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Árvore de Dados
          </Link>
          <span>/</span>
          <Link
            href={`/entity/${entity.id}`}
            className="hover:text-foreground transition-colors max-w-[160px] truncate"
          >
            {entity.fullName}
          </Link>
          <span>/</span>
          <span className="text-foreground">Editar</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
          <span className="p-2 rounded-2xl bg-ig-gradient text-white shadow-md glow-ig-sm">
            <UserCheck className="size-5" />
          </span>
          Editar Entidade: {entity.fullName}
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Atualize os dados biográficos, relações, contatos e dados sensíveis criptografados da pessoa.
        </p>
      </div>

      {/* Form Card */}
      <div className="glass rounded-3xl p-4 sm:p-8 border-border/50 shadow-sm">
        <PersonForm
          initialData={initialData}
          entityId={id}
          groups={groups}
          availableEntities={availableEntities}
        />
      </div>
    </div>
  );
}
