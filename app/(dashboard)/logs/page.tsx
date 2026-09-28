import * as React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LogsClient } from "@/components/logs/logs-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Logs & Auditoria — V.I.G.I.A",
  description: "Histórico completo de auditoria e atividades da plataforma de inteligência.",
};

export default async function LogsPage() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session?.user) {
    redirect("/login");
  }
  const userId = session.user.id;

  const [activityLogs, auditLogs] = await Promise.all([
    prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { displayName: true, username: true },
        },
      },
      take: 200,
    }),
  ]);

  const serializedActivities = activityLogs.map((l) => ({
    ...l,
    createdAt: l.createdAt.toISOString(),
  }));

  const serializedAudits = auditLogs.map((l) => ({
    ...l,
    createdAt: l.createdAt.toISOString(),
  }));

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <LogsClient
        initialActivityLogs={serializedActivities}
        initialAuditLogs={serializedAudits}
      />
    </div>
  );
}
