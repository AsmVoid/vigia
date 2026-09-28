"use client";

import * as React from "react";
import Link from "next/link";
import { WidgetCard } from "@/components/dashboard/widgets/widget-card";
import { UserCheck, ArrowUpRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/dashboard/widgets/count-up";

interface TotalPeopleWidgetProps {
  total: number;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}

export function TotalPeopleWidget({
  total,
  dragHandleProps,
}: TotalPeopleWidgetProps) {
  return (
    <WidgetCard
      id="total_people"
      title="Total de Pessoas"
      description="Indivíduos e alvos catalogados"
      badge="ENTIDADES"
      dragHandleProps={dragHandleProps}
      headerAction={
        <Button variant="ghost" size="icon" asChild className="size-7 rounded-lg text-muted-foreground hover:text-foreground">
          <Link href="/tree" title="Ver árvore de dados">
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
            {total === 1 ? "1 perfil cadastrado" : `${total} perfis no dossiê`}
          </p>
        </div>

        <div className="size-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary glow-ig-sm shrink-0">
          <UserCheck className="size-7" />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
        <span className="flex items-center gap-1">
          <Shield className="size-3 text-emerald-400" />
          Base Atualizada
        </span>
        <Link href="/entity/new" className="text-primary hover:underline font-sans font-medium">
          + Cadastrar Pessoa
        </Link>
      </div>
    </WidgetCard>
  );
}
