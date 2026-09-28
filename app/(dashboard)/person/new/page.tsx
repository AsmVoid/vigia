import * as React from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ArrowLeft, UserPlus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PersonForm } from "@/components/person/person-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Nova Pessoa — V.I.G.I.A",
  description: "Cadastrar nova entidade e dossiê de pessoa física na plataforma V.I.G.I.A.",
};

export default async function NewPersonPage() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session?.user) {
    redirect("/login");
  }
  const userId = session.user.id;

  const [groups, availableEntities] = await Promise.all([
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
      where: { userId },
      orderBy: { fullName: "asc" },
      select: {
        id: true,
        fullName: true,
        photo: true,
        gender: true,
      },
    }),
  ]);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb & Header */}
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
          <span className="text-foreground">Nova Pessoa</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
          <span className="p-2 rounded-2xl bg-ig-gradient text-white shadow-md glow-ig-sm">
            <UserPlus className="size-5" />
          </span>
          Cadastrar Nova Pessoa
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Preencha os dados cadastrais, contatos, documentos e inteligência OSINT da entidade.
        </p>
      </div>

      {/* Form Card */}
      <div className="glass rounded-3xl p-4 sm:p-8 border-border/50 shadow-sm">
        <PersonForm groups={groups} availableEntities={availableEntities} />
      </div>
    </div>
  );
}
