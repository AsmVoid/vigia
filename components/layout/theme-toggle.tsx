"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="size-9 rounded-xl border border-border/40 glass text-muted-foreground">
        <Moon className="size-4" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  const handleToggle = () => {
    const next = isDark ? "light" : "dark";
    setTheme(next);
    if (typeof document !== "undefined") {
      document.cookie = `vigia-theme=${next}; path=/; max-age=31536000; SameSite=Lax`;
    }
  };

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            className="relative size-9 rounded-xl border border-border/40 glass text-foreground transition-all hover:glow-ig-sm hover:border-primary/40 active:scale-95"
            aria-label="Alternar tema OLED"
          >
            {isDark ? (
              <Sun className="size-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="size-4 text-indigo-500 transition-transform duration-300 rotate-0 hover:-rotate-12" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs font-mono glass border-border">
          {isDark ? "Modo WHITE OLED" : "Modo BLACK OLED"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
