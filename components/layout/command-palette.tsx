"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  FolderTree,
  Users,
  UserPlus,
  FolderPlus,
  FileText,
  Settings,
  Sun,
  Moon,
  LogOut,
  AlertTriangle,
  User,
  Search,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { searchEntitiesQuickAction } from "@/app/(dashboard)/entity/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IgAvatar } from "@/components/shared/ig-avatar";
import { toast } from "sonner";

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [entities, setEntities] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Listen to Cmd+K / Ctrl+K
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Search entities with debounce
  React.useEffect(() => {
    if (!query || query.trim().length < 1) {
      setEntities([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchEntitiesQuickAction(query);
        setEntities(results);
      } catch (err) {
        console.error("Falha ao buscar entidades:", err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  const handlePanic = async () => {
    setOpen(false);
    toast.error("Protocolo de Emergência: Destruindo sessão...");
    try {
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }
      await authClient.signOut();
    } catch {
      // Ignored
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <>
      {/* Botão de Atalho Visual no Header */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass border border-border/50 hover:border-primary/50 text-xs text-muted-foreground transition-all group"
      >
        <Search className="size-3.5 group-hover:text-primary transition-colors" />
        <span className="hidden sm:inline font-mono">Buscar investigações...</span>
        <span className="inline sm:hidden font-mono">Buscar</span>
        <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground border border-border/60">
          ⌘K
        </kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="V.I.G.I.A Command Palette"
        description="Navegue pelo sistema, execute ações rápidas e investigue alvos."
        className="rounded-3xl glass border border-border/60 shadow-2xl overflow-hidden max-w-xl"
      >
        <CommandInput
          placeholder="Digite um comando, nome ou CPF..."
          value={query}
          onValueChange={setQuery}
          className="font-mono text-xs"
        />

        <CommandList className="max-h-[350px] p-2 font-mono">
          <CommandEmpty className="py-6 text-center text-xs text-muted-foreground">
            {loading ? "Pesquisando banco de dados..." : "Nenhum resultado encontrado."}
          </CommandEmpty>

          {/* Entidades Encontradas */}
          {entities.length > 0 && (
            <CommandGroup heading="Pessoas / Alvos">
              {entities.map((e) => {
                const initials = e.fullName
                  .split(" ")
                  .map((n: string) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                return (
                  <CommandItem
                    key={e.id}
                    value={`${e.fullName} ${e.cpf || ""}`}
                    onSelect={() => runCommand(() => router.push(`/entity/${e.id}`))}
                    className="flex items-center justify-between gap-2 p-2 my-1 rounded-xl cursor-pointer hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <IgAvatar
                        src={e.photo}
                        alt={e.fullName}
                        fallback={initials}
                        size="xs"
                        className="shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-bold text-foreground text-xs block truncate">
                          {e.fullName}
                        </span>
                        {e.cpf && (
                          <span className="text-[10px] text-muted-foreground block truncate">
                            CPF: {e.cpf}
                          </span>
                        )}
                      </div>
                    </div>

                    {e.group && (
                      <span
                        className="px-2 py-0.5 rounded-full text-[9px] font-bold border shrink-0"
                        style={{
                          backgroundColor: `${e.group.color}20`,
                          color: e.group.color,
                          borderColor: `${e.group.color}40`,
                        }}
                      >
                        {e.group.name}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {entities.length > 0 && <CommandSeparator className="my-1.5" />}

          {/* Ações Rápidas */}
          <CommandGroup heading="Ações Rápidas">
            <CommandItem
              value="nova pessoa cadastrar alvo"
              onSelect={() => runCommand(() => router.push("/person/new"))}
              className="flex items-center gap-2 p-2 my-1 rounded-xl cursor-pointer"
            >
              <UserPlus className="size-4 text-primary" />
              <span>Nova Pessoa / Alvo</span>
            </CommandItem>

            <CommandItem
              value="novo grupo investigar"
              onSelect={() => runCommand(() => router.push("/groups"))}
              className="flex items-center gap-2 p-2 my-1 rounded-xl cursor-pointer"
            >
              <FolderPlus className="size-4 text-purple-400" />
              <span>Novo Grupo de Investigação</span>
            </CommandItem>

            <CommandItem
              value="alternar tema dark light oled"
              onSelect={() =>
                runCommand(() => setTheme(theme === "dark" ? "light" : "dark"))
              }
              className="flex items-center gap-2 p-2 my-1 rounded-xl cursor-pointer"
            >
              {theme === "dark" ? (
                <Sun className="size-4 text-amber-400" />
              ) : (
                <Moon className="size-4 text-blue-400" />
              )}
              <span>Alternar Tema (BLACK OLED ↔ WHITE OLED)</span>
            </CommandItem>

            <CommandItem
              value="panico destruir sessao emergencia fechar"
              onSelect={handlePanic}
              className="flex items-center gap-2 p-2 my-1 rounded-xl cursor-pointer text-destructive focus:text-destructive"
            >
              <AlertTriangle className="size-4 text-destructive" />
              <span>Botão de Pânico (Destruir Sessão Imediatamente)</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator className="my-1.5" />

          {/* Navegação */}
          <CommandGroup heading="Navegação">
            <CommandItem
              value="painel dashboard metricas"
              onSelect={() => runCommand(() => router.push("/dashboard"))}
              className="flex items-center gap-2 p-2 my-1 rounded-xl cursor-pointer"
            >
              <LayoutDashboard className="size-4 text-muted-foreground" />
              <span>Painel de Controle</span>
            </CommandItem>

            <CommandItem
              value="arvore de dados tree pessoas cards"
              onSelect={() => runCommand(() => router.push("/tree"))}
              className="flex items-center gap-2 p-2 my-1 rounded-xl cursor-pointer"
            >
              <FolderTree className="size-4 text-muted-foreground" />
              <span>Árvore de Dados</span>
            </CommandItem>

            <CommandItem
              value="grupos gerenciamento crud"
              onSelect={() => runCommand(() => router.push("/groups"))}
              className="flex items-center gap-2 p-2 my-1 rounded-xl cursor-pointer"
            >
              <Users className="size-4 text-muted-foreground" />
              <span>Grupos</span>
            </CommandItem>

            <CommandItem
              value="logs auditoria atividades csv"
              onSelect={() => runCommand(() => router.push("/logs"))}
              className="flex items-center gap-2 p-2 my-1 rounded-xl cursor-pointer"
            >
              <FileText className="size-4 text-muted-foreground" />
              <span>Logs & Auditoria</span>
            </CommandItem>

            <CommandItem
              value="configuracoes seguranca 2fa perfil"
              onSelect={() => runCommand(() => router.push("/settings"))}
              className="flex items-center gap-2 p-2 my-1 rounded-xl cursor-pointer"
            >
              <Settings className="size-4 text-muted-foreground" />
              <span>Configurações</span>
            </CommandItem>

            <CommandItem
              value="logout sair encerrar sessao"
              onSelect={() =>
                runCommand(async () => {
                  await authClient.signOut();
                  router.push("/login");
                })
              }
              className="flex items-center gap-2 p-2 my-1 rounded-xl cursor-pointer"
            >
              <LogOut className="size-4 text-muted-foreground" />
              <span>Encerrar Sessão</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
