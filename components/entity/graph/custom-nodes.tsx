"use client";

import * as React from "react";
import { Handle, Position } from "@xyflow/react";
import { IgAvatar } from "@/components/shared/ig-avatar";
import {
  ArrowUpRight,
  Briefcase,
  Heart,
  Users,
  ShieldAlert,
  MapPin,
  Phone,
  Search,
  Plus,
  FileText,
  AlertTriangle,
  Info,
} from "lucide-react";
import {
  CATEGORY_CONFIGS,
  inferCategoryFromRole,
  type GraphCategory,
} from "./graph-types";

export interface CentralNodeData {
  id: string;
  fullName: string;
  aliases?: string[];
  photo?: string | null;
  gender?: string | null;
  job?: string | null;
  company?: string | null;
  groupName?: string | null;
  groupColor?: string | null;
  cpf?: string | null;
  city?: string | null;
  state?: string | null;
  primaryPhone?: string | null;
  hasWhatsapp?: boolean;
  riskScore?: number;
  connectionsCount?: number;
  onInspectNode?: (id: string) => void;
  onConnectNode?: (id: string) => void;
  [key: string]: unknown;
}

export function CentralEntityNode({ data }: { data: CentralNodeData }) {
  const initials = data.fullName
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const maskedCpf = data.cpf
    ? data.cpf.replace(/(\d{3})\.(\d{3})\.(\d{3})-(\d{2})/, "***.$2.$3-**")
    : null;

  return (
    <div className="relative group min-w-[270px] max-w-[310px] p-4 rounded-3xl glass border-2 border-primary/70 shadow-2xl glow-ig-sm text-center bg-card/95 transition-all duration-200 hover:shadow-primary/20">
      {/* Handles (All 4 Sides) */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="!size-3 !bg-primary !border-2 !border-background hover:!scale-125 !transition-transform"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!size-3 !bg-primary !border-2 !border-background hover:!scale-125 !transition-transform"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        className="!size-3 !bg-primary !border-2 !border-background hover:!scale-125 !transition-transform"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!size-3 !bg-primary !border-2 !border-background hover:!scale-125 !transition-transform"
      />

      {/* Ambient background glow */}
      <div className="absolute -top-10 -left-10 size-36 rounded-full bg-ig-gradient opacity-20 blur-2xl pointer-events-none" />

      {/* Quick Action Overlay Buttons on Hover */}
      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        {data.onInspectNode && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              data.onInspectNode?.(data.id);
            }}
            className="size-6 rounded-lg bg-card/90 hover:bg-primary/20 border border-border/80 flex items-center justify-center text-foreground hover:text-primary transition-colors shadow-sm"
            title="Abrir ficha rápida"
          >
            <Info className="size-3" />
          </button>
        )}
        {data.onConnectNode && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              data.onConnectNode?.(data.id);
            }}
            className="size-6 rounded-lg bg-card/90 hover:bg-primary/20 border border-border/80 flex items-center justify-center text-foreground hover:text-primary transition-colors shadow-sm"
            title="Conectar a outra pessoa"
          >
            <Plus className="size-3" />
          </button>
        )}
      </div>

      <div className="flex flex-col items-center gap-2.5 relative">
        {/* Avatar with Target Badge */}
        <div className="relative">
          <IgAvatar
            src={data.photo}
            alt={data.fullName}
            fallback={initials}
            size="lg"
            className="ring-4 ring-primary/30 shadow-xl"
          />
          <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-ig-gradient text-white shadow-md uppercase tracking-wider">
            ALVO
          </span>
        </div>

        {/* Identity Details */}
        <div className="space-y-1 w-full">
          <h3 className="font-bold text-sm text-foreground truncate px-1" title={data.fullName}>
            {data.fullName}
          </h3>

          {/* Job & Company */}
          {(data.job || data.company) && (
            <p className="text-[11px] font-medium text-muted-foreground truncate flex items-center justify-center gap-1">
              <Briefcase className="size-3 shrink-0 text-muted-foreground/80" />
              <span>
                {data.job}
                {data.company ? ` · ${data.company}` : ""}
              </span>
            </p>
          )}

          {/* Location & CPF */}
          <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground/90 font-mono">
            {(data.city || data.state) && (
              <span className="flex items-center gap-0.5 truncate">
                <MapPin className="size-2.5 text-rose-500 shrink-0" />
                {[data.city, data.state].filter(Boolean).join(" - ")}
              </span>
            )}
            {maskedCpf && (
              <span className="opacity-80">CPF: {maskedCpf}</span>
            )}
          </div>

          {/* Group & Risk badges row */}
          <div className="flex items-center justify-center flex-wrap gap-1.5 pt-1">
            {data.groupName && (
              <span
                className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-xs"
                style={{
                  backgroundColor: `${data.groupColor || "#833ab4"}25`,
                  color: data.groupColor || "#833ab4",
                  borderColor: `${data.groupColor || "#833ab4"}50`,
                }}
              >
                {data.groupName}
              </span>
            )}

            {typeof data.riskScore === "number" && data.riskScore > 0 && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-500 border border-red-500/30">
                <AlertTriangle className="size-2.5" />
                Risco {data.riskScore}
              </span>
            )}

            {typeof data.connectionsCount === "number" && data.connectionsCount > 0 && (
              <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded-full bg-muted/80 text-muted-foreground border border-border/60">
                {data.connectionsCount} {data.connectionsCount === 1 ? "vínculo" : "vínculos"}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export interface RelatedNodeData {
  id?: string;
  fullName: string;
  aliases?: string[];
  photo?: string | null;
  gender?: string | null;
  role: string;
  category?: GraphCategory;
  isRegistered: boolean;
  job?: string | null;
  company?: string | null;
  cpf?: string | null;
  city?: string | null;
  state?: string | null;
  primaryPhone?: string | null;
  hasWhatsapp?: boolean;
  groupName?: string | null;
  groupColor?: string | null;
  riskScore?: number;
  relationshipId?: string;
  relNotes?: string | null;
  onInspectNode?: (id: string) => void;
  onConnectNode?: (id: string) => void;
  onOpenDossier?: (id: string) => void;
  [key: string]: unknown;
}

export function RelatedEntityNode({ data }: { data: RelatedNodeData }) {
  const initials = data.fullName
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const category = data.category || inferCategoryFromRole(data.role);
  const config = CATEGORY_CONFIGS[category] || CATEGORY_CONFIGS.SOCIAL;

  const getRoleIcon = () => {
    switch (category) {
      case "ROMANCE":
        return <Heart className="size-3 text-rose-500 fill-rose-500/30 shrink-0" />;
      case "FAMILY":
        return <Users className="size-3 text-pink-500 shrink-0" />;
      case "PROFESSIONAL":
        return <Briefcase className="size-3 text-amber-500 shrink-0" />;
      case "INVESTIGATIVE":
        return <ShieldAlert className="size-3 text-red-500 shrink-0" />;
      case "SOCIAL":
      default:
        return <Users className="size-3 text-purple-500 shrink-0" />;
    }
  };

  const maskedCpf = data.cpf
    ? data.cpf.replace(/(\d{3})\.(\d{3})\.(\d{3})-(\d{2})/, "***.$2.$3-**")
    : null;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (data.isRegistered && data.id && data.onInspectNode) {
          data.onInspectNode(data.id);
        }
      }}
      className={`relative group min-w-[230px] max-w-[270px] p-3 rounded-2xl glass border shadow-lg transition-all duration-200 bg-card/90 ${
        data.isRegistered
          ? "cursor-pointer hover:scale-[1.02] hover:shadow-xl active:scale-[0.99]"
          : "cursor-default opacity-90"
      }`}
      style={{
        borderColor: `${config.color}50`,
        boxShadow: `0 4px 14px ${config.glowColor}`,
      }}
    >
      {/* Handles (All 4 Sides) */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="!size-2.5 !bg-border hover:!bg-primary hover:!scale-125 !transition-transform"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!size-2.5 !bg-border hover:!bg-primary hover:!scale-125 !transition-transform"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!size-2.5 !bg-border hover:!bg-primary hover:!scale-125 !transition-transform"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!size-2.5 !bg-border hover:!bg-primary hover:!scale-125 !transition-transform"
      />

      {/* Node Header Row */}
      <div className="flex items-start gap-2.5">
        <div className="relative shrink-0">
          <IgAvatar
            src={data.photo}
            alt={data.fullName}
            fallback={initials || "ID"}
            size="sm"
            showStoryRing={data.isRegistered}
            className="ring-2 ring-border/50"
          />
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          {/* Role badge + Navigation Action */}
          <div className="flex items-center justify-between gap-1">
            <span
              className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold border flex items-center gap-1 shrink-0 ${config.badgeBg} ${config.badgeText} ${config.badgeBorder}`}
            >
              {getRoleIcon()}
              <span className="truncate max-w-[120px]">{data.role}</span>
            </span>

            {/* Quick Action Icons */}
            <div className="flex items-center gap-0.5">
              {data.isRegistered && data.id && data.onOpenDossier && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    data.onOpenDossier?.(data.id!);
                  }}
                  className="size-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                  title="Abrir dossiê completo"
                >
                  <ArrowUpRight className="size-3" />
                </button>
              )}
            </div>
          </div>

          {/* Full Name */}
          <p
            className="font-semibold text-xs text-foreground truncate"
            title={data.fullName}
          >
            {data.fullName}
          </p>

          {/* Professional or Location Info */}
          {(data.job || data.company) && (
            <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1 font-medium">
              <Briefcase className="size-2.5 shrink-0" />
              <span>
                {data.job}
                {data.company ? ` · ${data.company}` : ""}
              </span>
            </p>
          )}

          {/* Location & CPF */}
          {(data.city || data.state || maskedCpf) && (
            <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground/80 font-mono truncate">
              {(data.city || data.state) && (
                <span className="flex items-center gap-0.5 truncate">
                  <MapPin className="size-2 shrink-0 text-rose-500" />
                  {[data.city, data.state].filter(Boolean).join("-")}
                </span>
              )}
              {maskedCpf && <span>CPF: {maskedCpf}</span>}
            </div>
          )}

          {/* Group Pill if available */}
          {data.groupName && (
            <div className="pt-0.5">
              <span
                className="inline-block text-[9px] font-semibold px-1.5 py-0.2 rounded border truncate max-w-full"
                style={{
                  backgroundColor: `${data.groupColor || "#833ab4"}15`,
                  color: data.groupColor || "#833ab4",
                  borderColor: `${data.groupColor || "#833ab4"}35`,
                }}
              >
                {data.groupName}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Hover Floating Actions Bar */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1 bg-card/95 border border-border/80 px-2 py-0.5 rounded-full shadow-lg z-20">
        {data.isRegistered && data.id && data.onInspectNode && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              data.onInspectNode?.(data.id!);
            }}
            className="text-[9px] font-semibold text-muted-foreground hover:text-foreground flex items-center gap-0.5 px-1 py-0.5 rounded hover:bg-muted"
            title="Inspecionar ficha rápida"
          >
            <Search className="size-2.5" />
            <span>Ficha</span>
          </button>
        )}

        {data.isRegistered && data.id && data.onConnectNode && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              data.onConnectNode?.(data.id!);
            }}
            className="text-[9px] font-semibold text-primary hover:text-primary/80 flex items-center gap-0.5 px-1 py-0.5 rounded hover:bg-muted"
            title="Conectar a outra pessoa"
          >
            <Plus className="size-2.5" />
            <span>Conectar</span>
          </button>
        )}
      </div>
    </div>
  );
}
