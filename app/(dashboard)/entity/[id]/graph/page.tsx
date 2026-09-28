import * as React from "react";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { ArrowLeft, GitFork, User } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { EntityGraph } from "@/components/entity/graph/entity-graph";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session?.user) return { title: "Grafo Genealógico — V.I.G.I.A" };

  const entity = await prisma.entity.findFirst({
    where: { id, userId: session.user.id },
    select: { fullName: true },
  });

  return {
    title: entity
      ? `Grafo: ${entity.fullName} — V.I.G.I.A`
      : "Grafo Genealógico — V.I.G.I.A",
    description: "Grafo genealógico e sociométrico interativo com zoom, pan e auto-layout.",
  };
}

export default async function EntityGraphPage({
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

  const commonSelect = {
    id: true,
    fullName: true,
    photo: true,
    gender: true,
    currentJob: true,
    cpf: true,
    rg: true,
    birthDate: true,
    zodiacSign: true,
    notes: true,
    group: { select: { name: true, color: true } },
    phones: {
      select: { phone: true, isWhatsapp: true, isTelegram: true, label: true },
      take: 2,
    },
    addresses: {
      select: { city: true, state: true, street: true, neighborhood: true },
      take: 1,
    },
    jobs: {
      select: { title: true, company: true, isCurrent: true },
      take: 1,
    },
  };

  const rawEntity = await prisma.entity.findFirst({
    where: { id, userId },
    include: {
      group: true,
      phones: { orderBy: { createdAt: "asc" } },
      emails: { orderBy: { createdAt: "asc" } },
      addresses: { orderBy: { createdAt: "asc" } },
      jobs: { orderBy: { isCurrent: "desc" } },
      vehicles: { orderBy: { createdAt: "asc" } },
      documents: { orderBy: { type: "asc" } },
      father: { select: commonSelect },
      mother: { select: commonSelect },
      childrenAsFather: { select: commonSelect },
      childrenAsMother: { select: commonSelect },
      siblings: { select: commonSelect },
      siblingOf: { select: commonSelect },
      siblingNames: true,
      relationships: {
        include: {
          relatedEntity: { select: commonSelect },
        },
      },
      relatedIn: {
        include: {
          entity: { select: commonSelect },
        },
      },
    },
  });

  if (!rawEntity) {
    notFound();
  }

  const entity = JSON.parse(
    JSON.stringify(rawEntity, (key, value) => {
      if (typeof value === "bigint") return value.toString();
      return value;
    })
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-4">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
            className="text-foreground hover:text-primary font-medium transition-colors truncate max-w-[220px]"
          >
            {entity.fullName}
          </Link>
          <span>/</span>
          <span className="text-muted-foreground font-mono flex items-center gap-1">
            <GitFork className="size-3 text-primary" />
            Grafo Genealógico
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/entity/${entity.id}`}
            className="px-3 py-1.5 rounded-xl glass border border-border/50 hover:border-primary text-xs font-semibold flex items-center gap-1.5 transition-all text-foreground"
          >
            <User className="size-3.5" />
            <span>Voltar ao Dossiê</span>
          </Link>
        </div>
      </div>

      {/* Main Graph Canvas */}
      <EntityGraph entity={entity} height="calc(100vh - 175px)" />
    </div>
  );
}
