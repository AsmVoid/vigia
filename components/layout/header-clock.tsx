"use client";

import * as React from "react";
import { Clock, Timer, ShieldCheck } from "lucide-react";

export function HeaderClock() {
  const [time, setTime] = React.useState<string>("");
  const [sessionSeconds, setSessionSeconds] = React.useState<number>(0);

  React.useEffect(() => {
    // Initial time
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
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    // Session stopwatch
    const interval = setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatSession = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-2 sm:gap-4 font-mono text-xs">
      {/* Realtime Clock */}
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl glass border border-border/50 text-foreground/90">
        <Clock className="size-3.5 text-primary animate-pulse" />
        <span className="font-semibold tracking-wider">{time || "--:--:--"}</span>
        <span className="text-[10px] uppercase text-muted-foreground font-sans tracking-wide">BRT</span>
      </div>

      {/* Session Stopwatch */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass border border-border/50 text-foreground/90">
        <Timer className="size-3.5 text-emerald-500" />
        <span className="text-muted-foreground text-[11px] font-sans hidden md:inline">Sessão:</span>
        <span className="font-semibold tracking-wider text-emerald-400">{formatSession(sessionSeconds)}</span>
        <div className="relative flex size-2 ml-0.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
        </div>
      </div>
    </div>
  );
}
