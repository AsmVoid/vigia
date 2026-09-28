import * as React from "react";
import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";

export const metadata = {
  title: "Painel de Controle — V.I.G.I.A",
  description: "Console OSINT para monitoramento de entidades, grupos e inteligência de fontes abertas.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
