"use client";

import * as React from "react";
import Link from "next/link";
import { IgAvatar } from "@/components/shared/ig-avatar";
import { Button } from "@/components/ui/button";
import { SocialIcon, formatSocialUrl } from "@/components/shared/social-icons";
import { Calendar, Briefcase, ArrowRight, Shield, Edit, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { getZodiacBadge, getZodiacSign } from "@/lib/zodiac";
import { ZodiacIcon } from "@/components/shared/zodiac-icon";
import { GenderIcon } from "@/components/shared/gender-icon";
import { motion, useReducedMotion } from "motion/react";

export interface PersonCardData {
  id: string;
  fullName: string;
  photo: string | null;
  gender: string | null;
  birthDate: string | Date | null;
  zodiacSign?: string | null;
  currentJob: string | null;
  dataCompleteness: number;
  isBurner?: boolean;
  expiresAt?: string | Date | null;
  hasTelegram?: boolean;
  socialProfiles: Array<{
    id: string;
    platform: string;
    username: string;
    url?: string | null;
  }>;
}

interface PersonCardProps {
  person: PersonCardData;
}

const GENDER_LABEL: Record<string, string> = {
  MALE: "Masculino",
  FEMALE: "Feminino",
  OTHER: "Outro",
};

export function PersonCard({ person }: PersonCardProps) {
  const shouldReduceMotion = useReducedMotion();

  // Calculate age from birthDate
  const age = React.useMemo(() => {
    if (!person.birthDate) return null;
    const birth = new Date(person.birthDate);
    if (isNaN(birth.getTime())) return null;
    const diff = Date.now() - birth.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }, [person.birthDate]);

  // Format birthDate to DD/MM/AAAA
  const formattedBirth = React.useMemo(() => {
    if (!person.birthDate) return null;
    const birth = new Date(person.birthDate);
    if (isNaN(birth.getTime())) return null;
    return birth.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, [person.birthDate]);

  const zodiac = React.useMemo(() => {
    return getZodiacBadge(
      person.zodiacSign || (person.birthDate ? getZodiacSign(person.birthDate) : null)
    );
  }, [person.zodiacSign, person.birthDate]);

  const initials =
    person.fullName
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "ID";

  const genderDisplay = person.gender ? GENDER_LABEL[person.gender] || person.gender : null;
  const socials = React.useMemo(() => {
    const list = [...(person.socialProfiles || [])];
    const hasTg = list.some(
      (s) => s.platform.toLowerCase() === "telegram" || s.platform.toLowerCase() === "tg"
    );
    if (person.hasTelegram && !hasTg) {
      list.push({
        id: `tg-${person.id}`,
        platform: "telegram",
        username: "Telegram",
        url: null,
      });
    }
    return list;
  }, [person.socialProfiles, person.hasTelegram, person.id]);

  return (
    <motion.div
      whileHover={
        shouldReduceMotion
          ? undefined
          : { y: -4, transition: { type: "spring", stiffness: 400, damping: 25 } }
      }
      className="group relative flex flex-col justify-between rounded-3xl p-5 glass border border-border/50 hover:glow-ig-sm hover:border-primary/40 transition-all duration-300 shadow-sm bg-card/40"
    >
      <div>
        {/* Top Header: Avatar + Name + Demographics */}
        <div className="flex items-start gap-3.5">
          <IgAvatar
            src={person.photo}
            alt={person.fullName}
            fallback={initials}
            size="md"
            className="group-hover:scale-105 transition-transform"
          />

          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-base text-foreground leading-tight truncate group-hover:text-primary transition-colors">
              {person.fullName}
            </h3>

            {person.currentJob && (
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5 font-medium">
                <Briefcase className="size-3 text-primary/70 shrink-0" />
                {person.currentJob}
              </p>
            )}

            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap text-[11px] font-mono text-muted-foreground">
              {person.isBurner && (
                <span
                  className="px-1.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold flex items-center gap-1 text-[10px]"
                  title="Alvo temporário com autodestruição"
                >
                  <Flame className="size-3 text-amber-400" />
                  BURNER
                </span>
              )}

              {age !== null && (
                <span className="px-1.5 py-0.5 rounded-md bg-muted/50 border border-border/50 text-foreground font-semibold">
                  {age} anos
                </span>
              )}

              {zodiac && (
                <span
                  className="px-1.5 py-0.5 rounded-md bg-muted/50 border border-border/50 text-foreground flex items-center gap-1 cursor-default"
                  title={`${zodiac.name} (${zodiac.dateRange})`}
                >
                  <span>{zodiac.name}</span>
                  <ZodiacIcon sign={zodiac.name} className="size-3.5" />
                </span>
              )}

              {genderDisplay && (
                <span className="px-1.5 py-0.5 rounded-md bg-muted/50 border border-border/50 flex items-center gap-1">
                  <span>{genderDisplay}</span>
                  <GenderIcon gender={person.gender} className="size-3" useBrandColor />
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Birth Date */}
        {formattedBirth && (
          <div className="mt-3.5 flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <Calendar className="size-3.5 text-primary/80" />
            <span>
              Nasc: <strong className="text-foreground font-semibold">{formattedBirth}</strong>
            </span>
          </div>
        )}

        {/* Data Completeness Progress Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-muted-foreground flex items-center gap-1">
              <Shield className="size-3 text-primary" />
              Dados Preenchidos
            </span>
            <span className="font-bold text-foreground">{person.dataCompleteness}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden">
            <div
              className="h-full rounded-full bg-ig-gradient transition-all duration-500"
              style={{ width: `${Math.max(5, person.dataCompleteness)}%` }}
            />
          </div>
        </div>

        {/* Social Icons Row */}
        <div className="mt-4 pt-3 border-t border-border/40">
          <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider block mb-1.5">
            Redes Monitoradas ({socials.length})
          </span>

          {socials.length === 0 ? (
            <span className="text-[11px] text-muted-foreground/70 italic font-mono">
              Nenhuma rede vinculada
            </span>
          ) : (
            <div
              className={cn(
                "flex items-center gap-2 py-1",
                socials.length > 6
                  ? "overflow-x-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 pb-1"
                  : "flex-wrap"
              )}
            >
              {socials.map((s) => {
                const targetUrl = formatSocialUrl(s.platform, s.username, s.url);
                return (
                  <a
                    key={s.id}
                    href={targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`${s.platform}: ${s.username}`}
                    onClick={(e) => e.stopPropagation()}
                    className="size-7 rounded-xl glass border border-border/60 flex items-center justify-center text-foreground hover:text-primary hover:border-primary/50 hover:scale-110 transition-all shrink-0 cursor-pointer"
                  >
                    <SocialIcon platform={s.platform} className="size-3.5" useBrandColor />
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Action: VER DADOS Button & Edit Button */}
      <div className="mt-5 pt-3 flex items-center gap-2">
        <motion.div
          whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
          className="flex-1"
        >
          <Button
            asChild
            className="relative overflow-hidden w-full h-9 rounded-2xl bg-ig-gradient hover:opacity-95 text-white font-semibold text-xs shadow-md glow-ig-sm transition-all before:absolute before:inset-0 before:-translate-x-full hover:before:translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-transform before:duration-700 no-underline hover:no-underline"
          >
            <Link href={`/entity/${person.id}`} className="no-underline hover:no-underline flex items-center justify-center">
              <span className="no-underline">VER DADOS</span>
              <ArrowRight className="ml-1.5 size-3.5" />
            </Link>
          </Button>
        </motion.div>
        <Button
          asChild
          variant="outline"
          size="icon"
          className="size-9 rounded-2xl glass border-border/50 hover:border-primary/50 text-muted-foreground hover:text-foreground shrink-0"
          title="Editar Dados"
        >
          <Link href={`/entity/${person.id}/edit`}>
            <Edit className="size-3.5" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
