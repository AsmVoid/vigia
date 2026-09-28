"use client";

import * as React from "react";
import { Database, Inbox } from "lucide-react";

interface ZeroStateProps {
  message?: string;
  submessage?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export function ZeroState({
  message = "Sem dados disponíveis",
  submessage = "Nenhum registro encontrado no banco",
  icon: Icon = Inbox,
}: ZeroStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center rounded-2xl bg-muted/20 border border-dashed border-border/60">
      <div className="size-10 rounded-xl bg-muted/40 flex items-center justify-center text-muted-foreground mb-3">
        <Icon className="size-5 text-muted-foreground/80" />
      </div>
      <p className="text-xs font-semibold text-foreground/80">{message}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[200px]">{submessage}</p>
    </div>
  );
}
