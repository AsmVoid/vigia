"use client";

import * as React from "react";
import { WidgetCard } from "@/components/dashboard/widgets/widget-card";
import { ZeroState } from "@/components/dashboard/widgets/zero-state";
import { PieChart as PieChartIcon } from "lucide-react";
import { CountUp } from "@/components/dashboard/widgets/count-up";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export interface GenderDistributionItem {
  gender: string;
  count: number;
  percentage?: number;
}

interface GenderDistributionWidgetProps {
  data: GenderDistributionItem[];
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}

const GENDER_CONFIG: Record<
  string,
  { label: string; color: string; glow: string }
> = {
  MALE: {
    label: "Masculino",
    color: "#405de6",
    glow: "rgba(64, 93, 230, 0.4)",
  },
  FEMALE: {
    label: "Feminino",
    color: "#e1306c",
    glow: "rgba(225, 48, 108, 0.4)",
  },
  OTHER: {
    label: "Outro",
    color: "#fcaf45",
    glow: "rgba(252, 175, 69, 0.4)",
  },
};

export function GenderDistributionWidget({
  data,
  dragHandleProps,
}: GenderDistributionWidgetProps) {
  const [mounted, setMounted] = React.useState(false);
  const [hoveredSegment, setHoveredSegment] = React.useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const counts = React.useMemo(() => {
    let male = 0;
    let female = 0;
    let other = 0;

    data.forEach((item) => {
      const g = (item.gender || "").toUpperCase();
      const val = Number(item.count || 0);
      if (g === "MALE") male += val;
      else if (g === "FEMALE") female += val;
      else other += val;
    });

    return { MALE: male, FEMALE: female, OTHER: other };
  }, [data]);

  const totalCount = counts.MALE + counts.FEMALE + counts.OTHER;

  // Arc Gauge Geometry (Semi-Circle 180°)
  // Radius = 85, Center = (110, 100), Arc goes from 180° to 0° (left to right)
  const radius = 80;
  const strokeWidth = 14;
  const arcLength = Math.PI * radius; // ~251.32

  const segments = React.useMemo(() => {
    if (totalCount === 0) return [];

    const order: Array<keyof typeof counts> = ["MALE", "FEMALE", "OTHER"];
    let accumulatedOffset = 0;

    return order
      .map((key) => {
        const count = counts[key];
        const pct = (count / totalCount) * 100;
        const length = (pct / 100) * arcLength;
        const offset = accumulatedOffset;
        accumulatedOffset += length;

        return {
          key,
          config: GENDER_CONFIG[key],
          count,
          percentage: Math.round(pct),
          length,
          offset,
        };
      })
      .filter((s) => s.count > 0);
  }, [counts, totalCount, arcLength]);

  // Determine majority synthesis phrase
  const majority = React.useMemo(() => {
    if (totalCount === 0 || segments.length === 0) return null;
    const sorted = [...segments].sort((a, b) => b.count - a.count);
    if (sorted.length > 1 && sorted[0].count === sorted[1].count) {
      return { label: "Equilíbrio", percentage: sorted[0].percentage, color: "#833ab4" };
    }
    return {
      label: sorted[0].config.label,
      percentage: sorted[0].percentage,
      color: sorted[0].config.color,
    };
  }, [segments, totalCount]);

  return (
    <WidgetCard
      id="gender_distribution"
      title="Distribuição por Gênero"
      description="Proporção de perfis catalogados"
      badge="RELIABILITY GAUGE"
      dragHandleProps={dragHandleProps}
    >
      {!mounted || totalCount === 0 ? (
        <ZeroState
          icon={PieChartIcon}
          message="Nenhum gênero catalogado"
          submessage="Informações de gênero aparecerão aqui após inclusão nos dossiês"
        />
      ) : (
        <div className="flex flex-col justify-between h-full pt-1">
          {/* Semi-circular Gauge (Reliability Score style) */}
          <div className="relative w-full flex flex-col items-center justify-center">
            <svg
              viewBox="0 0 220 120"
              className="w-full max-w-[210px] overflow-visible"
            >
              {/* Background Track Arc */}
              <path
                d="M 30 105 A 80 80 0 0 1 190 105"
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                className="text-muted/20"
              />

              {/* Segmented Colored Arcs */}
              {segments.map((seg) => {
                const isHovered = hoveredSegment === seg.key;
                return (
                  <motion.path
                    key={seg.key}
                    d="M 30 105 A 80 80 0 0 1 190 105"
                    fill="none"
                    stroke={seg.config.color}
                    strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                    strokeDasharray={`${seg.length} ${arcLength}`}
                    strokeDashoffset={-seg.offset}
                    initial={{
                      strokeDasharray: `0 ${arcLength}`,
                    }}
                    animate={{
                      strokeDasharray: `${seg.length} ${arcLength}`,
                    }}
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.9,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    strokeLinecap="round"
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredSegment(seg.key)}
                    onMouseLeave={() => setHoveredSegment(null)}
                    style={{
                      filter: isHovered
                        ? `drop-shadow(0 0 8px ${seg.config.glow})`
                        : undefined,
                    }}
                  />
                );
              })}
            </svg>

            {/* Center Total Metrics inside Semi-circle */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-center pointer-events-none">
              <span className="font-mono text-3xl font-extrabold tracking-tight text-foreground block leading-tight">
                <CountUp value={totalCount} />
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                {totalCount === 1 ? "perfil total" : "perfis totais"}
              </span>
            </div>
          </div>

          {/* Synthesis Phrase */}
          {majority && (
            <div className="text-center pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass border border-border/40 text-xs font-mono">
                <span
                  className="size-2 rounded-full shrink-0 animate-pulse"
                  style={{ backgroundColor: majority.color }}
                />
                <span className="font-semibold text-foreground">
                  Maioria: {majority.label} — {majority.percentage}%
                </span>
              </div>
            </div>
          )}

          {/* Segmented Scale Bar with Thresholds (0 / 33 / 66 / 100%) */}
          <div className="pt-2.5 pb-1 space-y-1.5">
            {/* Scale Bar */}
            <div className="relative h-2 w-full rounded-full bg-muted/40 p-0.5 border border-border/30 flex overflow-hidden">
              <div
                className="h-full rounded-full bg-ig-gradient transition-all duration-700"
                style={{
                  width: `${majority ? Math.max(majority.percentage, 5) : 0}%`,
                }}
              />
            </div>

            {/* Threshold Ticks */}
            <div className="flex justify-between items-center px-0.5 text-[9px] font-mono text-muted-foreground">
              <span className="relative">
                <span className="block w-0.5 h-1 bg-border mx-auto mb-0.5" />
                0%
              </span>
              <span className="relative">
                <span className="block w-0.5 h-1 bg-border mx-auto mb-0.5" />
                33%
              </span>
              <span className="relative">
                <span className="block w-0.5 h-1 bg-border mx-auto mb-0.5" />
                66%
              </span>
              <span className="relative">
                <span className="block w-0.5 h-1 bg-border mx-auto mb-0.5" />
                100%
              </span>
            </div>
          </div>

          {/* Legend Items Footer */}
          <div className="flex items-center justify-around pt-1 border-t border-border/30 text-[11px] font-mono">
            {segments.map((seg) => (
              <div
                key={seg.key}
                onMouseEnter={() => setHoveredSegment(seg.key)}
                onMouseLeave={() => setHoveredSegment(null)}
                className={cn(
                  "flex items-center gap-1.5 px-1.5 py-0.5 rounded-lg transition-colors cursor-default",
                  hoveredSegment === seg.key && "bg-muted/50"
                )}
              >
                <span
                  className="size-2 rounded-full shrink-0"
                  style={{ backgroundColor: seg.config.color }}
                />
                <span className="text-muted-foreground">{seg.config.label}:</span>
                <span className="font-bold text-foreground">
                  {seg.count} ({seg.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </WidgetCard>
  );
}
