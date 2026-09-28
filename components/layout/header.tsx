"use client";

import * as React from "react";
import { MobileNav } from "@/components/layout/mobile-nav";
import { HeaderClock } from "@/components/layout/header-clock";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserNav } from "@/components/layout/user-nav";
import { CommandPalette } from "@/components/layout/command-palette";
import { ShieldAlert, Terminal } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-20 h-16 w-full border-b border-border/50 glass px-4 sm:px-6 flex items-center justify-between gap-4 backdrop-blur-xl transition-colors">
      <div className="flex items-center gap-3">
        <MobileNav />
        <div className="hidden xl:flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <Terminal className="size-3.5 text-primary" />
          <span>V.I.G.I.A OSINT CONSOLE</span>
          <span className="text-border">/</span>
          <span className="text-emerald-500 font-semibold">ONLINE</span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Command Palette (Cmd+K) Trigger */}
        <CommandPalette />

        <div className="h-6 w-px bg-border/60 hidden sm:block" />

        {/* Real-time System Clock & Session Stopwatch */}
        <HeaderClock />

        <div className="h-6 w-px bg-border/60 hidden sm:block" />

        {/* OLED Theme Switcher (BLACK OLED ↔ WHITE OLED) */}
        <ThemeToggle />

        {/* User Avatar with Dropdown */}
        <UserNav />
      </div>
    </header>
  );
}
