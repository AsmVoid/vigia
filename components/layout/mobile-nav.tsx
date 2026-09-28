"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Eye, Radio, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NAV_ITEMS } from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden size-9 rounded-xl border border-border/40 glass text-foreground"
          aria-label="Abrir menu de navegação"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-72 p-0 glass border-r border-border/50 flex flex-col backdrop-blur-2xl"
      >
        <SheetHeader className="h-16 px-4 border-b border-border/40 flex flex-row items-center justify-between text-left space-y-0">
          <SheetTitle asChild>
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 group"
            >
              <div className="size-10 rounded-full bg-ig-gradient p-0.5 shadow-md flex items-center justify-center">
                <div className="size-full bg-background rounded-full flex items-center justify-center">
                  <Eye className="size-5 text-primary" />
                </div>
              </div>
              <div className="flex flex-col">
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
            </Link>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-ig-gradient text-white font-semibold shadow-lg glow-ig-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="size-5 shrink-0" />
                <span className="truncate flex-1">{item.title}</span>
                {item.badge && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-primary/15 text-primary border border-primary/20"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground font-mono">
          <div className="flex items-center gap-2">
            <Shield className="size-3.5 text-primary" />
            <span>v1.0.0</span>
          </div>
          <span className="text-[10px] text-muted-foreground">OLED READY</span>
        </div>
      </SheetContent>
    </Sheet>
  );
}
