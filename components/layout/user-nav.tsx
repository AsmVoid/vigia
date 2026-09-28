"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IgAvatar } from "@/components/shared/ig-avatar";
import { Button } from "@/components/ui/button";
import { LogOut, Shield, User, Settings, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";

export function UserNav() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [loggingOut, setLoggingOut] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const user = session?.user;
  const displayName =
    (user as any)?.displayName ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "Investigador";

  const userInitials =
    displayName
      .split(" ")
      .map((n: string) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "OP";

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await signOut();
      toast.success("Sessão encerrada com sucesso.");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Erro ao encerrar sessão.");
    } finally {
      setLoggingOut(false);
    }
  };

  if (!mounted || isPending) {
    return (
      <div className="h-9 w-9 lg:w-32 rounded-xl border border-border/40 glass flex items-center gap-2 px-1.5">
        <Skeleton className="size-6 rounded-full" />
        <div className="hidden lg:flex flex-col gap-1 flex-1">
          <Skeleton className="h-2.5 w-14 rounded" />
          <Skeleton className="h-2 w-10 rounded" />
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 rounded-xl px-2 gap-2 border border-border/40 glass hover:border-primary/40 hover:glow-ig-sm transition-all"
        >
          <IgAvatar
            src={user?.image}
            alt={displayName}
            fallback={userInitials}
            size="xs"
            className="shrink-0"
          />
          <div className="hidden lg:flex flex-col items-start text-left text-xs">
            <span className="font-semibold leading-none truncate max-w-[120px] text-foreground">
              {displayName}
            </span>
            <span className="text-[10px] text-primary/80 font-mono mt-0.5 flex items-center gap-1">
              <Shield className="size-2.5" />
              Investigador
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-56 glass border-border/60 rounded-2xl p-1.5 shadow-2xl backdrop-blur-2xl"
        align="end"
        forceMount
      >
        <DropdownMenuLabel className="font-normal p-2">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none text-foreground">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground font-mono truncate">
              {user?.email || "operador@vigia.local"}
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-ig-gradient text-white">
                <Sparkles className="size-2.5" />
                V.I.G.I.A Agent
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/40" />

        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => router.push("/settings")}
            className="rounded-xl cursor-pointer text-xs focus:bg-primary/10 focus:text-foreground"
          >
            <Settings className="mr-2 size-4 text-muted-foreground" />
            <span>Configurações</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-border/40" />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={loggingOut}
          className="rounded-xl cursor-pointer text-xs text-destructive focus:bg-destructive/10 focus:text-destructive font-medium"
        >
          <LogOut className="mr-2 size-4" />
          <span>{loggingOut ? "Saindo..." : "Encerrar Sessão"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
