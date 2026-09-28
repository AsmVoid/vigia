import * as React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "@/components/settings/settings-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Configurações do Sistema — V.I.G.I.A",
  description: "Gerenciamento de perfil, credenciais, segurança 2FA e opções do sistema.",
};

export default async function SettingsPage() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  if (!session?.user) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      photo: true,
      twoFactorEnabled: true,
    },
  });

  const userData = {
    id: dbUser?.id || session.user.id,
    email: dbUser?.email || session.user.email,
    username: dbUser?.username || (session.user as any).username || "agente",
    displayName: dbUser?.displayName || session.user.name || "Agente",
    photo: dbUser?.photo || session.user.image || null,
    twoFactorEnabled: Boolean(dbUser?.twoFactorEnabled),
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <SettingsClient user={userData} />
    </div>
  );
}
