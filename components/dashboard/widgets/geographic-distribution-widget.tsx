"use client";

import * as React from "react";
import { WidgetCard } from "@/components/dashboard/widgets/widget-card";
import { ZeroState } from "@/components/dashboard/widgets/zero-state";
import { MapPin, Building, Map as MapIcon, Compass } from "lucide-react";
import { CountUp } from "@/components/dashboard/widgets/count-up";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export interface GeographicDistributionItem {
  state: string | null;
  city: string | null;
  neighborhood: string | null;
  count: number;
}

interface GeographicDistributionWidgetProps {
  data: GeographicDistributionItem[];
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}

type GeoFilter = "state" | "city" | "country";

const TIER_COLORS = ["#e1306c", "#833ab4", "#405de6", "#fcaf45"];

export function GeographicDistributionWidget({
  data,
  dragHandleProps,
}: GeographicDistributionWidgetProps) {
  // Default filter: "city" as requested in R4
  const [filter, setFilter] = React.useState<GeoFilter>("city");
  const [hoveredTier, setHoveredTier] = React.useState<number | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // Aggregate Data based on selected filter
  const aggregatedData = React.useMemo(() => {
    if (!data || !data.length) return [];

    const map = new Map<string, number>();

    data.forEach((item) => {
      let key = "";
      if (filter === "country") {
        key = "Brasil";
      } else if (filter === "state") {
        key = item.state ? item.state.toUpperCase() : "Outros / Indefinido";
      } else {
        key = item.city
          ? `${item.city}${item.state ? ` (${item.state})` : ""}`
          : "Outros / Indefinido";
      }

      const current = map.get(key) || 0;
      map.set(key, current + Number(item.count || 0));
    });

    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4); // Top 4 for Cache Tiers concentric rings
  }, [data, filter]);

  // Overall Stats
  const stats = React.useMemo(() => {
    if (!data || !data.length) {
      return { targets: 0, addresses: 0, states: 0, cities: 0 };
    }

    const uniqueStates = new Set(
      data.map((d) => d.state?.trim().toUpperCase()).filter(Boolean)
    );
    const uniqueCities = new Set(
      data.map((d) => d.city?.trim().toLowerCase()).filter(Boolean)
    );
    const totalAddresses = data.reduce(
      (acc, curr) => acc + Number(curr.count || 0),
      0
    );

    return {
      targets: totalAddresses,
      addresses: totalAddresses,
      states: uniqueStates.size,
      cities: uniqueCities.size,
    };
  }, [data]);

  const totalCount = aggregatedData.reduce((acc, curr) => acc + curr.count, 0);

  // Concentric Rings Geometry
  const ringRadii = [46, 37, 28, 19];
  const strokeWidth = 5.5;
  const svgCenter = 55;

  return (
    <WidgetCard
      id="geographic_distribution"
      title="Distribuição Geográfica"
      description="Localidades e densidade das entidades monitoradas"
      badge="CACHE TIERS"
      dragHandleProps={dragHandleProps}
      headerAction={
        <div className="flex items-center p-0.5 rounded-xl bg-muted/40 border border-border/40 text-[11px] font-mono">
          <button
            type="button"
            onClick={() => setFilter("city")}
            className={cn(
              "px-2 py-0.5 rounded-lg transition-all",
              filter === "city"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Cidade
          </button>
          <button
            type="button"
            onClick={() => setFilter("state")}
            className={cn(
              "px-2 py-0.5 rounded-lg transition-all",
              filter === "state"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Estado
          </button>
          <button
            type="button"
            onClick={() => setFilter("country")}
            className={cn(
              "px-2 py-0.5 rounded-lg transition-all",
              filter === "country"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            País
          </button>
        </div>
      }
    >
      {totalCount === 0 ? (
        <ZeroState
          icon={MapPin}
          message="Nenhum endereço registrado"
          submessage="Cadastre endereços nas entidades para visualizar a dispersão geográfica"
        />
      ) : (
        <div className="flex flex-col justify-between h-full pt-1 space-y-2.5">
          {/* Top Row: Concentric Rings + 2x2 Stats Grid */}
          <div className="grid grid-cols-12 gap-3 items-center">
            {/* Left: Concentric Radial Arcs (Cache Tiers style) */}
            <div className="col-span-5 flex items-center justify-center relative">
              <svg
                width={110}
                height={110}
                className="rotate-[-90deg] transform overflow-visible"
              >
                {aggregatedData.map((item, idx) => {
                  const r = ringRadii[idx] || 19;
                  const circumference = 2 * Math.PI * r;
                  const pct = totalCount > 0 ? item.count / totalCount : 0;
                  const arc = pct * circumference;
                  const color = TIER_COLORS[idx % TIER_COLORS.length];
                  const isHovered = hoveredTier === idx;

                  return (
                    <g key={item.name}>
                      {/* Background track circle */}
                      <circle
                        cx={svgCenter}
                        cy={svgCenter}
                        r={r}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        className="text-muted/15"
                      />
                      {/* Tier Arc */}
                      <motion.circle
                        cx={svgCenter}
                        cy={svgCenter}
                        r={r}
                        fill="transparent"
                        stroke={color}
                        strokeWidth={isHovered ? strokeWidth + 2 : strokeWidth}
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{
                          strokeDashoffset: circumference - arc,
                        }}
                        transition={{
                          duration: shouldReduceMotion ? 0 : 0.9 + idx * 0.1,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        strokeLinecap="round"
                        className="cursor-pointer transition-all duration-200"
                        onMouseEnter={() => setHoveredTier(idx)}
                        onMouseLeave={() => setHoveredTier(null)}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Center Icon */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Compass className="size-4 text-primary animate-pulse" />
              </div>
            </div>

            {/* Right: 2x2 Stats Grid (Alvos, Endereços, Estados, Cidades) */}
            <div className="col-span-7 grid grid-cols-2 gap-2">
              <div className="p-2 rounded-xl glass border border-border/40">
                <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                  <MapPin className="size-2.5 text-pink-400" />
                  Alvos
                </span>
                <span className="font-mono text-base font-bold text-foreground block">
                  <CountUp value={stats.targets} />
                </span>
              </div>

              <div className="p-2 rounded-xl glass border border-border/40">
                <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                  <Building className="size-2.5 text-purple-400" />
                  Endereços
                </span>
                <span className="font-mono text-base font-bold text-foreground block">
                  <CountUp value={stats.addresses} />
                </span>
              </div>

              <div className="p-2 rounded-xl glass border border-border/40">
                <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                  <MapIcon className="size-2.5 text-blue-400" />
                  Estados
                </span>
                <span className="font-mono text-base font-bold text-foreground block">
                  <CountUp value={stats.states} />
                </span>
              </div>

              <div className="p-2 rounded-xl glass border border-border/40">
                <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                  <Compass className="size-2.5 text-amber-400" />
                  Cidades
                </span>
                <span className="font-mono text-base font-bold text-foreground block">
                  <CountUp value={stats.cities} />
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Legend: Top Localities with Count and % */}
          <div className="space-y-1.5 pt-1 border-t border-border/30">
            {aggregatedData.map((item, idx) => {
              const pct =
                totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;
              const color = TIER_COLORS[idx % TIER_COLORS.length];
              const isHovered = hoveredTier === idx;

              return (
                <div
                  key={item.name}
                  onMouseEnter={() => setHoveredTier(idx)}
                  onMouseLeave={() => setHoveredTier(null)}
                  className={cn(
                    "flex items-center justify-between text-xs px-1.5 py-0.5 rounded-lg transition-colors cursor-default",
                    isHovered ? "bg-muted/50 font-medium" : "text-muted-foreground"
                  )}
                >
                  <span className="flex items-center gap-1.5 truncate max-w-[65%]">
                    <span
                      className="size-2 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-foreground truncate">{item.name}</span>
                  </span>
                  <span className="font-mono text-[11px] shrink-0">
                    <span className="text-foreground font-bold">{item.count}</span>{" "}
                    alvos ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </WidgetCard>
  );
}
