"use client";

import * as React from "react";
import Link from "next/link";
import { WidgetCard } from "@/components/dashboard/widgets/widget-card";
import { Layers, ArrowUpRight, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/dashboard/widgets/count-up";

interface TotalGroupsWidgetProps {
  total: number;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}

export function TotalGroupsWidget({
  total,
  dragHandleProps,
}: TotalGroupsWidgetProps) {
  return (
    <WidgetCard
      id="total_groups"
      title="Total de Grupos"
      description="Organizações, famílias e células"
      badge="ORGANIZAÇÕES"
      dragHandleProps={dragHandleProps}
      headerAction={
        <Button variant="ghost" size="icon" asChild className="size-7 rounded-lg text-muted-foreground hover:text-foreground">
          <Link href="/groups" title="Ver grupos">
            <ArrowUpRight className="size-4" />
          </Link>
        </Button>
      }
    >
      <div className="flex items-baseline justify-between mt-1">
        <div>
          <span className="text-4xl sm:text-5xl font-extrabold font-mono tracking-tight text-foreground">
            <CountUp value={total} />
          </span>
          <p className="text-xs text-muted-foreground mt-1">
            {total === 1 ? "1 grupo catalogado" : `${total} grupos organizados`}
          </p>
        </div>

        <div className="size-14 rounded-2xl bg-accent/20 border border-accent/40 flex items-center justify-center text-primary glow-ig-sm shrink-0">
          <Layers className="size-7" />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
        <span>Clusters Ativos</span>
        <Link href="/groups" className="text-primary hover:underline font-sans font-medium">
          Gerenciar Grupos
        </Link>
      </div>
    </WidgetCard>
  );
}
