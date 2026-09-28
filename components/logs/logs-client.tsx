"use client";

import * as React from "react";
import {
  FileText,
  Shield,
  Download,
  Search,
  Filter,
  Calendar,
  Activity,
  PlusCircle,
  RefreshCw,
  Trash2,
  Lock,
  Zap,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export interface ActivityLogItem {
  id: string;
  action: "ADD" | "UPDATE" | "DELETE" | string;
  entityType: string;
  entityId?: string | null;
  entityName?: string | null;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  entityName?: string | null;
  details?: any;
  ipAddress?: string | null;
  userId?: string | null;
  user?: {
    displayName: string;
    username: string;
  } | null;
  createdAt: string;
}

interface LogsClientProps {
  initialActivityLogs: ActivityLogItem[];
  initialAuditLogs: AuditLogItem[];
}

export function LogsClient({
  initialActivityLogs,
  initialAuditLogs,
}: LogsClientProps) {
  const [activeTab, setActiveTab] = React.useState<"activity" | "audit">("activity");
  const [search, setSearch] = React.useState("");
  const [actionFilter, setActionFilter] = React.useState("ALL");
  const [periodFilter, setPeriodFilter] = React.useState("ALL");

  // Filter helper for dates
  const isWithinPeriod = (dateStr: string) => {
    if (periodFilter === "ALL") return true;
    const date = new Date(dateStr).getTime();
    const now = Date.now();
    const oneDay = 24 * 3600 * 1000;

    if (periodFilter === "TODAY") return now - date < oneDay;
    if (periodFilter === "7D") return now - date < 7 * oneDay;
    if (periodFilter === "30D") return now - date < 30 * oneDay;
    return true;
  };

  // Filtered Activity Logs
  const filteredActivities = React.useMemo(() => {
    return initialActivityLogs.filter((log) => {
      if (actionFilter !== "ALL" && log.action !== actionFilter) return false;
      if (!isWithinPeriod(log.createdAt)) return false;
      if (search) {
        const query = search.toLowerCase();
        const matchesName = log.entityName?.toLowerCase().includes(query);
        const matchesType = log.entityType?.toLowerCase().includes(query);
        const matchesAction = log.action?.toLowerCase().includes(query);
        if (!matchesName && !matchesType && !matchesAction) return false;
      }
      return true;
    });
  }, [initialActivityLogs, actionFilter, periodFilter, search]);

  // Filtered Audit Logs
  const filteredAudits = React.useMemo(() => {
    return initialAuditLogs.filter((log) => {
      if (actionFilter !== "ALL" && !log.action.includes(actionFilter)) return false;
      if (!isWithinPeriod(log.createdAt)) return false;
      if (search) {
        const query = search.toLowerCase();
        const matchesAction = log.action.toLowerCase().includes(query);
        const matchesTarget = log.entityName?.toLowerCase().includes(query);
        const matchesUser = log.user?.displayName?.toLowerCase().includes(query);
        const matchesIp = log.ipAddress?.toLowerCase().includes(query);
        if (!matchesAction && !matchesTarget && !matchesUser && !matchesIp) return false;
      }
      return true;
    });
  }, [initialAuditLogs, actionFilter, periodFilter, search]);

  // Export to CSV
  const handleExportCsv = () => {
    const isActivity = activeTab === "activity";
    let csvContent = "\uFEFF"; // UTF-8 BOM for Excel

    if (isActivity) {
      csvContent += "Data/Hora,Acao,Tipo de Entidade,ID da Entidade,Nome da Entidade\n";
      filteredActivities.forEach((l) => {
        const row = [
          `"${new Date(l.createdAt).toLocaleString("pt-BR")}"`,
          `"${l.action}"`,
          `"${l.entityType}"`,
          `"${l.entityId || ""}"`,
          `"${l.entityName || ""}"`,
        ].join(",");
        csvContent += row + "\n";
      });
    } else {
      csvContent += "Data/Hora,Acao,Tipo,ID,Alvo/Entidade,IP,Usuario,Detalhes\n";
      filteredAudits.forEach((l) => {
        const detailsStr = l.details ? JSON.stringify(l.details).replace(/"/g, '""') : "";
        const row = [
          `"${new Date(l.createdAt).toLocaleString("pt-BR")}"`,
          `"${l.action}"`,
          `"${l.entityType || ""}"`,
          `"${l.entityId || ""}"`,
          `"${l.entityName || ""}"`,
          `"${l.ipAddress || ""}"`,
          `"${l.user?.displayName || ""}"`,
          `"${detailsStr}"`,
        ].join(",");
        csvContent += row + "\n";
      });
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `VIGIA-${isActivity ? "Atividades" : "Auditoria"}-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Logs exportados com sucesso em CSV!");
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "ADD":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
            <PlusCircle className="size-3" />
            CRIAÇÃO
          </span>
        );
      case "UPDATE":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1 w-fit">
            <RefreshCw className="size-3" />
            EDIÇÃO
          </span>
        );
      case "DELETE":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1 w-fit">
            <Trash2 className="size-3" />
            EXCLUSÃO
          </span>
        );
      case "OSINT_ENRICHMENT":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center gap-1 w-fit">
            <Zap className="size-3" />
            OSINT
          </span>
        );
      case "BURNER_AUTO_DELETE":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1 w-fit">
            <Flame className="size-3" />
            BURNER
          </span>
        );
      case "REVEAL_FINANCIAL_ACCOUNT":
      case "REVEAL_CREDENTIAL":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1 w-fit">
            <Lock className="size-3" />
            REVELAÇÃO
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border/50 w-fit">
            {action}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-ig-gradient text-white shadow-md glow-ig-sm">
              <FileText className="size-5" />
            </span>
            Logs & Auditoria de Inteligência
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            Rastreabilidade completa de ações investigativas, alterações de alvos e eventos de segurança.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleExportCsv}
          className="rounded-2xl bg-ig-gradient hover:opacity-90 text-white shadow-md glow-ig-sm text-xs font-semibold h-10 px-4 gap-2"
        >
          <Download className="size-3.5" />
          <span>Exportar CSV</span>
        </Button>
      </div>

      {/* Tabs & Filter Bar */}
      <Tabs
        value={activeTab}
        onValueChange={(val: any) => setActiveTab(val)}
        className="w-full space-y-4 flex flex-col"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="glass rounded-2xl p-1.5 border border-border/50 shadow-sm inline-flex">
            <TabsList className="bg-transparent p-0 gap-1.5 flex items-center h-auto">
              <TabsTrigger
                value="activity"
                className="rounded-xl text-xs font-semibold data-[state=active]:bg-ig-gradient data-[state=active]:text-white data-[state=active]:shadow-md gap-2 px-4 h-9 inline-flex items-center transition-all cursor-pointer"
              >
                <Activity className="size-3.5" />
                <span>Atividades ({filteredActivities.length})</span>
              </TabsTrigger>

              <TabsTrigger
                value="audit"
                className="rounded-xl text-xs font-semibold data-[state=active]:bg-ig-gradient data-[state=active]:text-white data-[state=active]:shadow-md gap-2 px-4 h-9 inline-flex items-center transition-all cursor-pointer"
              >
                <Shield className="size-3.5" />
                <span>Auditoria & Segurança ({filteredAudits.length})</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <div className="relative w-48 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar por alvo ou ação..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-9 pr-3 rounded-xl bg-card/60 border-border/50 text-xs"
              />
            </div>

            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="h-9 px-3 rounded-xl bg-card/60 border border-border/50 text-xs text-foreground font-mono focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="ALL">Todo Período</option>
              <option value="TODAY">Hoje (24h)</option>
              <option value="7D">Últimos 7 dias</option>
              <option value="30D">Últimos 30 dias</option>
            </select>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="h-9 px-3 rounded-xl bg-card/60 border border-border/50 text-xs text-foreground font-mono focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="ALL">Todas Ações</option>
              <option value="ADD">Criação (ADD)</option>
              <option value="UPDATE">Edição (UPDATE)</option>
              <option value="DELETE">Exclusão (DELETE)</option>
              <option value="OSINT">OSINT</option>
              <option value="BURNER">Burner</option>
              <option value="REVEAL">Revelação</option>
            </select>
          </div>
        </div>

        {/* Tab 1: Activity Logs Table */}
        <TabsContent value="activity" className="m-0 focus-visible:outline-none">
          <div className="rounded-3xl glass border border-border/50 shadow-md overflow-hidden bg-card/40">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-muted/30 border-b border-border/40 text-[11px] text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Data & Hora</th>
                    <th className="py-3.5 px-4 font-semibold">Ação</th>
                    <th className="py-3.5 px-4 font-semibold">Entidade / Alvo</th>
                    <th className="py-3.5 px-4 font-semibold">Tipo</th>
                    <th className="py-3.5 px-4 font-semibold">ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredActivities.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground italic">
                        Nenhum registro de atividade encontrado com os filtros atuais.
                      </td>
                    </tr>
                  ) : (
                    filteredActivities.map((l) => (
                      <tr key={l.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                          {new Date(l.createdAt).toLocaleString("pt-BR")}
                        </td>
                        <td className="py-3 px-4">{getActionBadge(l.action)}</td>
                        <td className="py-3 px-4 font-semibold text-foreground">
                          {l.entityName || "—"}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{l.entityType}</td>
                        <td className="py-3 px-4 text-[10px] text-muted-foreground/80 font-mono truncate max-w-[120px]">
                          {l.entityId || "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Audit Logs Table */}
        <TabsContent value="audit" className="m-0 focus-visible:outline-none">
          <div className="rounded-3xl glass border border-border/50 shadow-md overflow-hidden bg-card/40">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-muted/30 border-b border-border/40 text-[11px] text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Data & Hora</th>
                    <th className="py-3.5 px-4 font-semibold">Ação do Sistema</th>
                    <th className="py-3.5 px-4 font-semibold">Alvo / Referência</th>
                    <th className="py-3.5 px-4 font-semibold">IP / Origem</th>
                    <th className="py-3.5 px-4 font-semibold">Investigador</th>
                    <th className="py-3.5 px-4 font-semibold">Metadados & Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredAudits.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground italic">
                        Nenhum registro de auditoria encontrado com os filtros atuais.
                      </td>
                    </tr>
                  ) : (
                    filteredAudits.map((l) => (
                      <tr key={l.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                          {new Date(l.createdAt).toLocaleString("pt-BR")}
                        </td>
                        <td className="py-3 px-4">{getActionBadge(l.action)}</td>
                        <td className="py-3 px-4 font-semibold text-foreground">
                          {l.entityName || l.entityType || "Sistema"}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{l.ipAddress || "127.0.0.1"}</td>
                        <td className="py-3 px-4 text-foreground font-medium">
                          {l.user?.displayName || "Investigador"}
                        </td>
                        <td className="py-3 px-4 text-[10px] text-muted-foreground truncate max-w-[260px]">
                          {l.details ? JSON.stringify(l.details) : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
