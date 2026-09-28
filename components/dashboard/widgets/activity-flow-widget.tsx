"use client";

import * as React from "react";
import { WidgetCard } from "@/components/dashboard/widgets/widget-card";
import { ZeroState } from "@/components/dashboard/widgets/zero-state";
import { Activity, TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export interface ActivityFlowItem {
  date: string;
  positive: number;
  negative: number;
}

interface ActivityFlowWidgetProps {
  data: ActivityFlowItem[];
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}

export function ActivityFlowWidget({
  data,
  dragHandleProps,
}: ActivityFlowWidgetProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const formattedData = React.useMemo(() => {
    return data.map((item) => {
      const d = new Date(item.date);
      const label = !isNaN(d.getTime())
        ? d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
        : String(item.date);

      return {
        date: label,
        positive: Number(item.positive || 0),
        negative: Number(item.negative || 0),
        total: Number(item.positive || 0) + Number(item.negative || 0),
      };
    });
  }, [data]);

  const totalActions = formattedData.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <WidgetCard
      id="activity_flow"
      title="Fluxo de Dados (30 dias)"
      description="Atividades e modificações no banco de inteligência"
      badge="TIMELINE"
      dragHandleProps={dragHandleProps}
    >
      {!mounted || totalActions === 0 ? (
        <ZeroState
          icon={Activity}
          message="Nenhuma atividade recente"
          submessage="Inserções e atualizações de dados alimentarão este fluxo nos últimos 30 dias"
        />
      ) : (
        <div className="h-[220px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={formattedData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="igFlowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c13584" stopOpacity={0.65} />
                  <stop offset="95%" stopColor="#405de6" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="igNegativeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fd1d1d" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#fd1d1d" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-border/40"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                isAnimationActive={false}
                wrapperStyle={{ pointerEvents: "none", outline: "none", zIndex: 50 }}
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0].payload;
                  return (
                    <div className="rounded-xl glass border border-border/80 p-2.5 shadow-xl text-xs font-mono">
                      <p className="font-semibold text-foreground">{item.date}</p>
                      <p className="text-emerald-400 mt-1">
                        + {item.positive} adições/atualizações
                      </p>
                      {item.negative > 0 && (
                        <p className="text-destructive mt-0.5">
                          - {item.negative} exclusões
                        </p>
                      )}
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="positive"
                stroke="#c13584"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#igFlowGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </WidgetCard>
  );
}
