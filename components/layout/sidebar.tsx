"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderTree,
  Users,
  UserPlus,
  ScrollText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Eye,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, useReducedMotion } from "motion/react";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    title: "Painel",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Árvore de Dados",
    href: "/tree",
    icon: FolderTree,
  },
  {
    title: "Grupos",
    href: "/groups",
    icon: Users,
  },
  {
    title: "Nova Pessoa",
    href: "/person/new",
    icon: UserPlus,
    badge: "+",
  },
  {
    title: "Logs",
    href: "/logs",
    icon: ScrollText,
  },
  {
    title: "Configurações",
    href: "/settings",
    icon: Settings,
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
}

export function Sidebar({ collapsed, onToggleCollapse, className }: SidebarProps) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  return (
    <TooltipProvider delayDuration={100}>
      <aside
        className={cn(
          "relative hidden md:flex flex-col h-screen border-r border-border/50 glass z-30 transition-all duration-300 ease-in-out select-none",
          collapsed ? "w-20" : "w-64",
          className
        )}
      >
        {/* Top Logo / Brand */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border/40">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 transition-all duration-200 group",
              collapsed && "justify-center w-full"
            )}
          >
            <div className="relative size-10 rounded-full bg-ig-gradient p-0.5 shadow-md group-hover:scale-105 transition-transform flex items-center justify-center shrink-0">
              <div className="size-full bg-background rounded-full flex items-center justify-center">
                <Eye className="size-5 text-primary group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            {!collapsed && (
              <div className="flex flex-col overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold tracking-wider text-base text-ig-gradient">
                    V.I.G.I.A
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-md font-mono font-bold bg-primary/15 text-primary border border-primary/30">
                    OSINT
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono tracking-tight flex items-center gap-1">
                  <Radio className="size-2.5 text-emerald-500 animate-pulse" />
                  Self-Hosted Core
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.href ||
                  pathname.startsWith(item.href + "/") ||
                  (item.href === "/tree" && pathname.startsWith("/entity/"));

            const LinkContent = (
              <Link
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "text-white font-semibold"
                    : "text-muted-foreground hover:bg-accent/40 hover:text-foreground",
                  collapsed && "justify-center px-2.5"
                )}
              >
                {/* Active Indicator with Spring layoutId */}
                {isActive && (
                  <motion.div
                    key={`sidebar-pill-${item.href}`}
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 bg-ig-gradient rounded-2xl shadow-lg glow-ig-sm -z-10"
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 28,
                    }}
                  />
                )}

                <motion.div
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.88 }}
                  className="flex items-center justify-center shrink-0"
                >
                  <item.icon
                    className={cn(
                      "size-5 transition-transform duration-200 group-hover:scale-110",
                      isActive
                        ? "text-white"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                </motion.div>

                {!collapsed && (
                  <span className="truncate flex-1">{item.title}</span>
                )}

                {!collapsed && item.badge && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold",
                      isActive
                        ? "bg-white/25 text-white"
                        : "bg-primary/15 text-primary border border-primary/20"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{LinkContent}</TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="font-sans text-xs glass border-border font-medium"
                  >
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.href}>{LinkContent}</div>;
          })}
        </div>

        {/* Collapse Toggle Footer */}
        <div className="p-3 border-t border-border/40 flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono px-2">
              <Shield className="size-3.5 text-primary" />
              <span>v1.0.0</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className={cn(
              "size-9 rounded-xl border border-border/40 glass text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all",
              collapsed && "w-full"
            )}
            aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
