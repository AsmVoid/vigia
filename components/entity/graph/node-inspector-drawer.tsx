"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { IgAvatar } from "@/components/shared/ig-avatar";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Car,
  FileText,
  ExternalLink,
  Plus,
  GitFork,
  MessageCircle,
  Share2,
  Calendar,
  Sparkles,
  ShieldAlert,
  Hash,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { fetchEntityDetailsForGraphAction } from "@/app/(dashboard)/entity/graph-actions";
import { toast } from "sonner";

interface NodeInspectorDrawerProps {
  entityId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenConnectModal?: (sourceEntityId: string) => void;
  onFocusNode?: (nodeId: string) => void;
  connectedNodes?: Array<{
    id: string;
    edgeId?: string;
    fullName: string;
    role: string;
    category?: string;
  }>;
}

export function NodeInspectorDrawer({
  entityId,
  isOpen,
  onClose,
  onOpenConnectModal,
  onFocusNode,
  connectedNodes = [],
}: NodeInspectorDrawerProps) {
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<any>(null);

  React.useEffect(() => {
    if (!entityId || !isOpen) {
      setData(null);
      return;
    }

    let isMounted = true;
    setLoading(true);

    fetchEntityDetailsForGraphAction(entityId)
      .then((res) => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Erro ao carregar detalhes da entidade:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [entityId, isOpen]);

  if (!isOpen) return null;

  const initials = data?.fullName
    ? data.fullName
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "ID";

  // Calculate age if birthDate exists
  let calculatedAge: number | null = null;
  if (data?.birthDate) {
    const bDate = new Date(data.birthDate);
    const diff = Date.now() - bDate.getTime();
    calculatedAge = Math.abs(new Date(diff).getUTCFullYear() - 1970);
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md md:max-w-lg p-0 flex flex-col bg-card/95 backdrop-blur-xl border-l border-border/60 shadow-2xl z-50 overflow-hidden"
      >
        {/* Top Header Card */}
        <div className="p-6 border-b border-border/50 relative overflow-hidden bg-gradient-to-b from-primary/10 via-transparent to-transparent">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <IgAvatar
                src={data?.photo}
                alt={data?.fullName || "Entidade"}
                fallback={initials}
                size="lg"
                showStoryRing={true}
                className="ring-4 ring-primary/20 shadow-xl"
              />
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <SheetTitle className="text-lg font-bold text-foreground truncate">
                  {loading ? "Carregando inteligência..." : data?.fullName || "Entidade"}
                </SheetTitle>
              </div>

              {data?.aliases && data.aliases.length > 0 && (
                <p className="text-xs text-muted-foreground truncate">
                  Vulgo: <span className="text-foreground font-medium">{data.aliases.join(", ")}</span>
                </p>
              )}

              {data?.currentJob && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 font-medium truncate">
                  <Briefcase className="size-3 text-amber-500 shrink-0" />
                  <span>{data.currentJob}</span>
                </p>
              )}

              {data?.group && (
                <span
                  className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-xs"
                  style={{
                    backgroundColor: `${data.group.color || "#833ab4"}20`,
                    color: data.group.color || "#833ab4",
                    borderColor: `${data.group.color || "#833ab4"}40`,
                  }}
                >
                  {data.group.name}
                </span>
              )}
            </div>
          </div>

          {/* Quick Actions Row */}
          <div className="flex items-center gap-2 pt-4">
            {entityId && (
              <Button
                asChild
                size="sm"
                className="flex-1 h-8 rounded-xl bg-ig-gradient hover:opacity-90 text-white font-semibold text-xs shadow-md glow-ig-sm border-0"
              >
                <Link href={`/entity/${entityId}`}>
                  <ExternalLink className="size-3.5 mr-1" />
                  <span>Abrir Dossiê</span>
                </Link>
              </Button>
            )}

            {entityId && onOpenConnectModal && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenConnectModal(entityId)}
                className="h-8 rounded-xl glass border-border/60 hover:border-primary text-xs font-semibold gap-1"
              >
                <Plus className="size-3.5 text-primary" />
                <span>Conectar</span>
              </Button>
            )}

            {entityId && onFocusNode && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onFocusNode(entityId)}
                className="h-8 rounded-xl glass border-border/60 hover:border-primary text-xs font-semibold gap-1"
              >
                <GitFork className="size-3.5 text-primary" />
                <span>Centralizar</span>
              </Button>
            )}
          </div>
        </div>

        {/* Scrollable Body Information */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-20 bg-muted/50 rounded-xl" />
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-28 bg-muted/50 rounded-xl" />
            </div>
          ) : data ? (
            <>
              {/* 1. Dados Pessoais & Documentos */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <User className="size-3.5 text-primary" />
                  Identificação & Registros
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
                    <span className="text-[10px] text-muted-foreground block">CPF</span>
                    <span className="font-mono font-semibold text-foreground">
                      {data.cpf || "Não registrado"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
                    <span className="text-[10px] text-muted-foreground block">RG</span>
                    <span className="font-mono font-semibold text-foreground">
                      {data.rg || "Não registrado"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
                    <span className="text-[10px] text-muted-foreground block">Nascimento / Idade</span>
                    <span className="font-semibold text-foreground">
                      {data.birthDate
                        ? `${new Date(data.birthDate).toLocaleDateString("pt-BR")} ${
                            calculatedAge ? `(${calculatedAge} anos)` : ""
                          }`
                        : "Não informado"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
                    <span className="text-[10px] text-muted-foreground block">Signo / Gênero</span>
                    <span className="font-semibold text-foreground">
                      {[data.zodiacSign, data.gender].filter(Boolean).join(" · ") || "Não informado"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Contatos & Redes */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Phone className="size-3.5 text-green-500" />
                  Canais de Comunicação
                </h4>
                <div className="space-y-1.5">
                  {data.phones && data.phones.length > 0 ? (
                    data.phones.map((p: any) => {
                      const digits = p.phone.replace(/\D/g, "");
                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/40 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Phone className="size-3.5 text-muted-foreground" />
                            <span className="font-mono font-semibold">{p.phone}</span>
                            <span className="text-[10px] text-muted-foreground">({p.label})</span>
                          </div>
                          {p.isWhatsapp && (
                            <a
                              href={`https://wa.me/55${digits}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-0.5 rounded-md bg-green-500/15 text-green-500 hover:bg-green-500/25 text-[10px] font-bold flex items-center gap-1 transition-colors"
                            >
                              <MessageCircle className="size-3" />
                              WhatsApp
                            </a>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Nenhum telefone registrado.</p>
                  )}

                  {data.emails && data.emails.length > 0 && (
                    <div className="pt-1 space-y-1">
                      {data.emails.map((e: any) => (
                        <div
                          key={e.id}
                          className="flex items-center gap-2 p-2 rounded-xl bg-muted/30 border border-border/40 text-xs"
                        >
                          <Mail className="size-3.5 text-muted-foreground" />
                          <span className="font-mono truncate">{e.email}</span>
                          <span className="text-[10px] text-muted-foreground">({e.label})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Endereços & Localização */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-rose-500" />
                  Localização Conhecida
                </h4>
                {data.addresses && data.addresses.length > 0 ? (
                  <div className="space-y-1.5">
                    {data.addresses.map((a: any) => {
                      const fullAddr = [a.street, a.number, a.neighborhood, a.city, a.state]
                        .filter(Boolean)
                        .join(", ");
                      return (
                        <div
                          key={a.id}
                          className="p-2.5 rounded-xl bg-muted/30 border border-border/40 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-foreground">{a.label || "Endereço"}</span>
                            {a.city && (
                              <span className="font-mono text-[10px] text-muted-foreground">
                                {a.city}/{a.state}
                              </span>
                            )}
                          </div>
                          <p className="text-muted-foreground text-[11px]">{fullAddr}</p>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              fullAddr
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline font-medium pt-0.5"
                          >
                            <ExternalLink className="size-2.5" />
                            Visualizar no Google Maps
                          </a>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">Nenhum endereço registrado.</p>
                )}
              </div>

              {/* 4. Veículos */}
              {data.vehicles && data.vehicles.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Car className="size-3.5 text-blue-500" />
                    Veículos Vinculados
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {data.vehicles.map((v: any) => (
                      <div
                        key={v.id}
                        className="p-2.5 rounded-xl bg-muted/30 border border-border/40 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-foreground">
                            {v.placa || "Sem Placa"}
                          </span>
                          {v.ano && <span className="text-[10px] text-muted-foreground">{v.ano}</span>}
                        </div>
                        <p className="text-muted-foreground text-[11px] truncate">
                          {[v.marca, v.modelo, v.cor].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Vínculos Conectados no Grafo */}
              {connectedNodes.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <GitFork className="size-3.5 text-purple-500" />
                    Conexões Ativas no Grafo ({connectedNodes.length})
                  </h4>
                  <div className="space-y-1.5">
                    {connectedNodes.map((cn, idx) => (
                      <div
                        key={cn.edgeId || `${cn.id}_${cn.role}_${idx}`}
                        onClick={() => onFocusNode?.(cn.id)}
                        className="flex items-center justify-between p-2 rounded-xl bg-muted/40 hover:bg-muted/80 border border-border/50 text-xs cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-semibold text-foreground truncate">{cn.fullName}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 shrink-0">
                            {cn.role}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          Focar <ExternalLink className="size-2.5" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. Observações & Notas */}
              {data.notes && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <FileText className="size-3.5 text-amber-500" />
                    Notas de Inteligência
                  </h4>
                  <div className="p-3 rounded-xl bg-muted/30 border border-border/40 text-xs text-foreground/90 whitespace-pre-wrap font-sans leading-relaxed">
                    {data.notes}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground text-xs">
              Não foi possível carregar os dados desta entidade.
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
