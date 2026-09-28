"use client";

import * as React from "react";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface WidgetCardProps {
  id: string;
  title: string;
  description?: string;
  badge?: string;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export function WidgetCard({
  id,
  title,
  description,
  badge,
  dragHandleProps,
  children,
  className,
  headerAction,
}: WidgetCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between h-full w-full rounded-3xl p-5 sm:p-6 glass border border-border/50",
        "transition-all duration-300 ease-out hover:-translate-y-1 hover:glow-ig-sm hover:border-primary/50 shadow-sm",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4 select-none">
        <div className="flex items-center gap-2 min-w-0">
          {dragHandleProps && (
            <button
              {...dragHandleProps}
              className="touch-none text-muted-foreground/50 hover:text-foreground cursor-grab active:cursor-grabbing p-1 -ml-2 rounded-lg hover:bg-muted/40 transition-colors"
              aria-label="Arrastar widget"
              title="Arrastar para reordenar"
            >
              <GripVertical className="size-4" />
            </button>
          )}
          <div className="min-w-0">
            <h2 className="text-sm font-semibold tracking-tight text-foreground truncate flex items-center gap-2">
              {title}
              {badge && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-primary/10 text-primary border border-primary/20">
                  {badge}
                </span>
              )}
            </h2>
            {description && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>

        {headerAction && (
          <div className="shrink-0 flex items-center gap-1.5">
            {headerAction}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 flex flex-col justify-center">
        {children}
      </div>
    </div>
  );
}
