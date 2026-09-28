"use client";

import * as React from "react";
import { WidgetCard } from "@/components/dashboard/widgets/widget-card";
import { Clock, Radio, Activity, Cpu } from "lucide-react";

interface TimeWidgetProps {
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}

export function TimeWidget({ dragHandleProps }: TimeWidgetProps) {
  const [time, setTime] = React.useState<string>("");
  const [dateStr, setDateStr] = React.useState<string>("");
  const [timezone, setTimezone] = React.useState<string>("");

  React.useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
      setDateStr(
        now.toLocaleDateString("pt-BR", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
      setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo");
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <WidgetCard
      id="system_time"
      title="Hora do Sistema"
      description="Sincronização UTC / Localhost"
      badge="SYNC"
      dragHandleProps={dragHandleProps}
    >
      <div className="flex flex-col justify-between space-y-4">
        <div>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-wider text-ig-gradient drop-shadow-sm">
            {time || "--:--:--"}
          </div>
          <p className="text-xs text-muted-foreground capitalize mt-1.5 font-medium">
            {dateStr || "Carregando data..."}
          </p>
        </div>

        <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 text-emerald-500 font-semibold">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span>SISTEMA OPERACIONAL</span>
          </div>
          <span className="text-muted-foreground text-[11px] truncate max-w-[140px]">
            {timezone}
          </span>
        </div>
      </div>
    </WidgetCard>
  );
}
