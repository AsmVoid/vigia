"use client";

import * as React from "react";
import Link from "next/link";
import {
  User,
  Briefcase,
  Calendar,
  Sparkles,
  Edit,
  Save,
  Loader2,
  Users,
  Shield,
  ExternalLink,
  Flame,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IgAvatar } from "@/components/shared/ig-avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SocialIcon, formatSocialUrl } from "@/components/shared/social-icons";
import { EntityDeleteDialog } from "@/components/entity/entity-delete-dialog";
import { updateInlineNotesAction } from "@/app/(dashboard)/entity/actions";
import { cn } from "@/lib/utils";
import { getZodiacBadge, getZodiacSign } from "@/lib/zodiac";
import { ZodiacIcon } from "@/components/shared/zodiac-icon";
import { GenderIcon } from "@/components/shared/gender-icon";
import { motion, useReducedMotion } from "motion/react";

export interface CommonPersonItem {
  id?: string;
  name: string;
  photo?: string | null;
  role: string;
  isRegistered: boolean;
}

export interface PersonProfileProps {
  entity: {
    id: string;
    fullName: string;
    photo?: string | null;
    gender?: string | null;
    birthDate?: string | Date | null;
    zodiacSign?: string | null;
    currentJob?: string | null;
    notes?: string | null;
    isBurner?: boolean;
    expiresAt?: string | Date | null;
    group?: {
      id: string;
      name: string;
      color: string;
      icon?: string | null;
    } | null;
    socialProfiles: Array<{
      id: string;
      platform: string;
      username: string;
      url?: string | null;
    }>;
  };
  completeness: number;
  commonPeople: CommonPersonItem[];
}

const GENDER_LABEL: Record<string, string> = {
  MALE: "Masculino",
  FEMALE: "Feminino",
  OTHER: "Outro",
};

export function PersonProfile({
  entity,
  completeness,
  commonPeople,
}: PersonProfileProps) {
  const shouldReduceMotion = useReducedMotion();
  // Inline notes state
  const [notes, setNotes] = React.useState(entity.notes || "");
  const [savingNotes, setSavingNotes] = React.useState(false);
  const [notesModified, setNotesModified] = React.useState(false);

  // Age calculation
  const age = React.useMemo(() => {
    if (!entity.birthDate) return null;
    const birth = new Date(entity.birthDate);
    if (isNaN(birth.getTime())) return null;
    const diff = Date.now() - birth.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }, [entity.birthDate]);

  const initials = entity.fullName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "ID";

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      const res = await updateInlineNotesAction(entity.id, notes);
      if (res.success) {
        toast.success("Observações salvas!");
        setNotesModified(false);
      } else {
        toast.error(res.error || "Falha ao salvar observações.");
      }
    } catch {
      toast.error("Erro inesperado ao salvar anotações.");
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* 1. Main Profile Glass Card */}
      <div className="glass rounded-3xl p-6 border-border/50 shadow-sm relative overflow-hidden flex flex-col items-center text-center space-y-4">
        {/* Glow ambient background element */}
        <div className="absolute -top-16 -left-16 size-48 rounded-full bg-ig-gradient opacity-10 blur-3xl pointer-events-none" />

        {/* Big Avatar with circular IG story gradient ring */}
        <div className="relative group">
          <IgAvatar
            src={entity.photo}
            alt={entity.fullName}
            fallback={initials}
            size="2xl"
            avatarClassName="border-background shadow-xl glow-ig-sm group-hover:scale-105 transition-all duration-300"
            fallbackClassName="text-3xl font-bold"
          />
        </div>

        {/* Name & Job */}
        <div className="space-y-1 w-full">
          <h1 className="text-xl font-bold tracking-tight text-foreground break-words">
            {entity.fullName}
          </h1>

          {entity.currentJob && (
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5 font-medium">
              <Briefcase className="size-3.5 text-primary shrink-0" />
              <span className="truncate max-w-[220px]">{entity.currentJob}</span>
            </p>
          )}

          {/* Group badge */}
          {entity.group && (
            <div className="pt-1.5 flex justify-center">
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold border inline-flex items-center gap-1.5"
                style={{
                  backgroundColor: `${entity.group.color}15`,
                  borderColor: `${entity.group.color}40`,
                  color: entity.group.color,
                }}
              >
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: entity.group.color }}
                />
                {entity.group.name}
              </span>
            </div>
          )}
        </div>

        {/* Demographics Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-muted-foreground pt-1">
          {entity.isBurner && (
            <span
              className="px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold flex items-center gap-1 shadow-sm"
              title={entity.expiresAt ? `Expira em: ${new Date(entity.expiresAt).toLocaleString("pt-BR")}` : "Alvo Temporário"}
            >
              <Flame className="size-3.5 text-amber-400" />
              <span>BURNER</span>
              {entity.expiresAt && (
                <span className="text-[10px] font-normal opacity-85">
                  ({new Date(entity.expiresAt).toLocaleDateString("pt-BR")})
                </span>
              )}
            </span>
          )}
          {age !== null && (
            <span className="px-2.5 py-1 rounded-xl bg-muted/50 border border-border/50 text-foreground font-semibold">
              {age} anos
            </span>
          )}
          {(() => {
            const zInfo = getZodiacBadge(
              entity.zodiacSign || (entity.birthDate ? getZodiacSign(entity.birthDate) : null)
            );
            if (!zInfo) return null;
            return (
              <span
                className="px-2.5 py-1 rounded-xl bg-muted/50 border border-border/50 text-foreground flex items-center gap-1.5 cursor-default font-medium"
                title={`${zInfo.name} (${zInfo.dateRange})`}
              >
                <span>{zInfo.name}</span>
                <ZodiacIcon sign={zInfo.name} className="size-4" />
              </span>
            );
          })()}
          {entity.gender && (
            <span className="px-2.5 py-1 rounded-xl bg-muted/50 border border-border/50 flex items-center gap-1.5 font-medium">
              <span>{GENDER_LABEL[entity.gender] || entity.gender}</span>
              <GenderIcon gender={entity.gender} className="size-3.5" useBrandColor />
            </span>
          )}
        </div>

        {/* Completeness Bar */}
        <div className="w-full pt-2 space-y-1.5 text-left">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
              <Shield className="size-3 text-primary" />
              Completude de Dados
            </span>
            <span className="font-bold text-foreground text-xs">
              {completeness}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden">
            <div
              className="h-full rounded-full bg-ig-gradient transition-all duration-500"
              style={{ width: `${Math.max(5, completeness)}%` }}
            />
          </div>
        </div>

        {/* Action Buttons: Edit & Delete */}
        <div className="w-full pt-2 flex items-center gap-2">
          <Button
            asChild
            className="flex-1 rounded-2xl bg-ig-gradient hover:opacity-90 text-white shadow-md glow-ig-sm text-xs font-semibold h-10 gap-1.5 active:scale-[0.98] transition-all"
          >
            <Link href={`/entity/${entity.id}/edit`}>
              <Edit className="size-3.5" />
              <span>Editar Dossiê</span>
            </Link>
          </Button>
          <EntityDeleteDialog
            entityId={entity.id}
            entityName={entity.fullName}
            variant="button"
          />
        </div>
      </div>

      {/* 2. Redes Sociais Card */}
      <div className="glass rounded-3xl p-5 border-border/50 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono flex items-center gap-1.5">
            <SocialIcon platform="instagram" className="size-3.5 text-primary" />
            Redes Monitoradas ({entity.socialProfiles.length})
          </h2>
        </div>

        {entity.socialProfiles.length === 0 ? (
          <p className="text-xs text-muted-foreground italic font-mono">
            Nenhuma rede social vinculada.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {entity.socialProfiles.map((s) => {
              const targetUrl = formatSocialUrl(s.platform, s.username, s.url);
              const isWebsite = s.platform.toLowerCase() === "website" || s.platform.toLowerCase() === "site";
              const displayLabel = isWebsite
                ? (s.url || s.username || "website").replace(/^https?:\/\//i, "").replace(/\/$/, "")
                : (s.username.startsWith("@") ? s.username : `@${s.username}`);

              return (
                <a
                  key={s.id}
                  href={targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 rounded-2xl bg-muted/30 border border-border/40 hover:border-primary/50 hover:bg-muted/50 transition-all group"
                  title={`${isWebsite ? "Website" : `@${s.username} no ${s.platform}`}: ${targetUrl}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <SocialIcon
                      platform={s.platform}
                      className="size-4 shrink-0 group-hover:scale-110 transition-transform"
                      useBrandColor
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-mono font-medium truncate text-foreground">
                        {displayLabel}
                      </p>
                      <p className="text-[10px] uppercase font-mono text-muted-foreground">
                        {s.platform}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="size-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-1" />
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Pessoas em Comum (NOVO) */}
      <div className="glass rounded-3xl p-5 border-border/50 shadow-sm space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono flex items-center gap-1.5">
          <Users className="size-3.5 text-primary" />
          Pessoas em Comum ({commonPeople.length})
        </h2>

        {commonPeople.length === 0 ? (
          <p className="text-xs text-muted-foreground italic font-mono">
            Nenhum vínculo familiar ou relação cadastrada.
          </p>
        ) : (
          <TooltipProvider delayDuration={150}>
            <div className="flex flex-wrap gap-2.5 pt-1">
              {commonPeople.map((person, idx) => {
                const personInitials = person.name
                  .split(" ")
                  .filter(Boolean)
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase() || "ID";

                if (person.isRegistered && person.id) {
                  return (
                    <Tooltip key={person.id || idx}>
                      <TooltipTrigger asChild>
                        <Link
                          href={`/entity/${person.id}`}
                          className="relative group focus:outline-none"
                        >
                          <IgAvatar
                            src={person.photo}
                            alt={person.name}
                            fallback={personInitials}
                            size="sm"
                            className="group-hover:scale-110"
                          />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent className="glass border-border/60 text-xs font-sans">
                        <p className="font-bold text-foreground">{person.name}</p>
                        <p className="text-[10px] text-primary font-mono">{person.role}</p>
                        <p className="text-[9px] text-muted-foreground italic">Clique para abrir dossiê</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                // Nome livre (não cadastrado)
                return (
                  <Tooltip key={idx}>
                    <TooltipTrigger asChild>
                      <div className="relative group cursor-default">
                        <IgAvatar
                          fallback={personInitials}
                          size="sm"
                          showStoryRing={false}
                          className="border-2 border-dashed border-border/60 opacity-85 group-hover:border-primary/70"
                          fallbackClassName="bg-muted text-muted-foreground font-mono"
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="glass border-border/60 text-xs font-sans">
                      <p className="font-bold text-foreground">{person.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {person.role} (Não Cadastrado)
                      </p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </TooltipProvider>
        )}
      </div>

      {/* 4. Observações Rápidas (Edição Inline) */}
      <div className="glass rounded-3xl p-5 border-border/50 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono flex items-center gap-1.5">
            <Edit className="size-3.5 text-primary" />
            Observações Rápidas
          </h2>
          {notesModified && (
            <span className="text-[10px] text-amber-400 font-mono">
              Não salvo
            </span>
          )}
        </div>

        <Textarea
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setNotesModified(true);
          }}
          placeholder="Anotações investigativas rápidas, pistas, modus operandi..."
          className="min-h-[110px] text-xs rounded-2xl glass border-border/60 focus-visible:ring-primary/50 resize-y"
        />

        <div className="flex justify-end pt-1">
          <Button
            type="button"
            size="sm"
            onClick={handleSaveNotes}
            disabled={savingNotes || !notesModified}
            className="rounded-xl bg-ig-gradient hover:opacity-90 text-white text-xs font-semibold h-8 gap-1.5 px-3"
          >
            {savingNotes ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Save className="size-3.5" />
                <span>Salvar Nota</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
