"use client";

import * as React from "react";
import { WidgetCard } from "@/components/dashboard/widgets/widget-card";
import { Timer, ShieldCheck, Zap } from "lucide-react";

interface SessionTimeWidgetProps {
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}

export function SessionTimeWidget({ dragHandleProps }: SessionTimeWidgetProps) {
  const [seconds, setSeconds] = React.useState<number>(0);
  const [startTime, setStartTime] = React.useState<string>("");

  React.useEffect(() => {
    const start = new Date();
    setStartTime(
      start.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );

    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatElapsed = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <WidgetCard
      id="session_time"
      title="Tempo de Sessão"
      description="Cronômetro do operador atual"
      badge="ATIVO"
      dragHandleProps={dragHandleProps}
    >
      <div className="flex flex-col justify-between space-y-4">
        <div>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-wider text-emerald-400 drop-shadow-sm flex items-center gap-3">
            <span>{formatElapsed(seconds)}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 font-medium">
            Iniciada hoje às <span className="text-foreground font-mono">{startTime || "--:--"}</span>
          </p>
        </div>

        <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-emerald-500 font-semibold">SESSÃO SEGURA</span>
          </div>
          <span className="text-muted-foreground text-[11px]">ARGON2ID + TOTP</span>
        </div>
      </div>
    </WidgetCard>
  );
}
