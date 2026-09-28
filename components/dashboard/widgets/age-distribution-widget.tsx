"use client";

import * as React from "react";
import { WidgetCard } from "@/components/dashboard/widgets/widget-card";
import { ZeroState } from "@/components/dashboard/widgets/zero-state";
import { Users, Sparkles, User, ShieldCheck } from "lucide-react";
import { CountUp } from "@/components/dashboard/widgets/count-up";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export interface AgeDistributionItem {
  age_group: string;
  count: number;
}

interface AgeDistributionWidgetProps {
  data: AgeDistributionItem[];
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}

interface AgeRingConfig {
  key: string;
  label: string;
  range: string;
  color: string;
  glowColor: string;
  icon: React.ElementType;
}

const RINGS_CONFIG: AgeRingConfig[] = [
  {
    key: "young",
    label: "Jovens",
    range: "0-19 anos",
    color: "#405de6",
    glowColor: "rgba(64, 93, 230, 0.35)",
    icon: Sparkles,
  },
  {
    key: "adult",
    label: "Adultos",
    range: "20-59 anos",
    color: "#833ab4",
    glowColor: "rgba(131, 58, 180, 0.35)",
    icon: User,
  },
  {
    key: "elderly",
    label: "Idosos",
    range: "60+ anos",
    color: "#e1306c",
    glowColor: "rgba(225, 48, 108, 0.35)",
    icon: ShieldCheck,
  },
];

export function AgeDistributionWidget({
  data,
  dragHandleProps,
}: AgeDistributionWidgetProps) {
  const [mounted, setMounted] = React.useState(false);
  const [hoveredRing, setHoveredRing] = React.useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const countsMap = React.useMemo(() => {
    const map: Record<string, number> = {
      young: 0,
      adult: 0,
      elderly: 0,
      unknown: 0,
    };
    data.forEach((item) => {
      const k = item.age_group.toLowerCase();
      if (k in map) {
        map[k] += Number(item.count || 0);
      } else {
        map.unknown += Number(item.count || 0);
      }
    });
    return map;
  }, [data]);

  const totalCount = Object.values(countsMap).reduce((a, b) => a + b, 0);

  // SVG Radial Ring Geometry
  const size = 68;
  const strokeWidth = 6.5;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  return (
    <WidgetCard
      id="age_distribution"
      title="Distribuição por Idade"
      description="Faixas etárias dos indivíduos catalogados"
      badge="RIDE SUMMARY"
      dragHandleProps={dragHandleProps}
    >
      {!mounted || totalCount === 0 ? (
        <ZeroState
          icon={Users}
          message="Nenhuma idade cadastrada"
          submessage="Cadastre datas de nascimento nos dossiês para gerar métricas demográficas"
        />
      ) : (
        <div className="flex flex-col justify-between h-full pt-1 space-y-3">
          {/* Top Hero Section: Total Count-Up + Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl font-extrabold tracking-tight text-foreground">
                  <CountUp value={totalCount} />
                </span>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {totalCount === 1 ? "pessoa catalogada" : "pessoas catalogadas"}
                </span>
              </div>
              <span className="text-[11px] font-mono font-medium text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                100% dos registros
              </span>
            </div>

            {/* Horizontal IG Gradient Segmented Progress Bar */}
            <div className="h-2.5 w-full rounded-full bg-muted/40 p-0.5 border border-border/30 flex gap-0.5 overflow-hidden">
              {RINGS_CONFIG.map((ring) => {
                const count = countsMap[ring.key] || 0;
                const pct = totalCount > 0 ? (count / totalCount) * 100 : 0;
                if (pct <= 0) return null;
                return (
                  <motion.div
                    key={ring.key}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.8,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    style={{ backgroundColor: ring.color }}
                    className="h-full rounded-full transition-opacity duration-200"
                    title={`${ring.label}: ${count} (${Math.round(pct)}%)`}
                  />
                );
              })}
              {countsMap.unknown > 0 && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(countsMap.unknown / totalCount) * 100}%`,
                  }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.8 }}
                  className="h-full rounded-full bg-muted-foreground/40"
                  title={`Desconhecido: ${countsMap.unknown}`}
                />
              )}
            </div>
          </div>

          {/* 3 Radial Rings (EvilCharts Ride Summary style) */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            {RINGS_CONFIG.map((ring) => {
              const count = countsMap[ring.key] || 0;
              const percentage =
                totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
              const offset =
                circumference - (percentage / 100) * circumference;
              const Icon = ring.icon;
              const isHovered = hoveredRing === ring.key;

              return (
                <div
                  key={ring.key}
                  onMouseEnter={() => setHoveredRing(ring.key)}
                  onMouseLeave={() => setHoveredRing(null)}
                  className={cn(
                    "flex flex-col items-center justify-center p-2.5 rounded-2xl glass border border-border/40 transition-all duration-300 relative group cursor-default",
                    isHovered
                      ? "-translate-y-1 shadow-lg"
                      : "hover:border-border/80"
                  )}
                  style={{
                    boxShadow: isHovered
                      ? `0 8px 24px -4px ${ring.glowColor}`
                      : undefined,
                  }}
                >
                  {/* Radial Ring SVG */}
                  <div className="relative size-[68px] flex items-center justify-center">
                    <svg
                      width={size}
                      height={size}
                      className="rotate-[-90deg] transform"
                    >
                      {/* Background track circle */}
                      <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        className="text-muted/20"
                      />
                      {/* Active progress arc with smooth motion */}
                      <motion.circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="transparent"
                        stroke={ring.color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{
                          duration: shouldReduceMotion ? 0 : 1,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        strokeLinecap="round"
                      />
                    </svg>

                    {/* Center Icon and % */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <Icon
                        className="size-3.5 mb-0.5 transition-transform duration-200 group-hover:scale-110"
                        style={{ color: ring.color }}
                      />
                      <span className="font-mono text-[11px] font-bold text-foreground">
                        {percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Ring Details */}
                  <div className="mt-2 text-center w-full">
                    <span className="block text-xs font-semibold text-foreground truncate">
                      {ring.label}
                    </span>
                    <span className="block text-[10px] font-mono text-muted-foreground">
                      <CountUp value={count} /> {count === 1 ? "pessoa" : "pessoas"}
                    </span>
                  </div>

                  {/* Inline Tooltip Pill on Hover */}
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-lg glass border border-border shadow-lg text-[9px] font-mono text-foreground whitespace-nowrap z-30 pointer-events-none"
                    >
                      {ring.range} • {count} ({percentage}%)
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </WidgetCard>
  );
}
