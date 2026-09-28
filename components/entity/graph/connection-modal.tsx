"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { IgAvatar } from "@/components/shared/ig-avatar";
import {
  ROLE_PRESETS,
  CATEGORY_CONFIGS,
  inferCategoryFromRole,
  mapRoleToPrismaType,
  type GraphCategory,
} from "./graph-types";
import {
  createOrUpdateRelationshipAction,
  searchEntitiesForGraphAction,
} from "@/app/(dashboard)/entity/graph-actions";
import {
  Heart,
  Users,
  Briefcase,
  ShieldAlert,
  ArrowRightLeft,
  Search,
  Sparkles,
  Link as LinkIcon,
  Check,
} from "lucide-react";
import { toast } from "sonner";

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceEntity: { id: string; fullName: string; photo?: string | null } | null;
  targetEntity?: { id: string; fullName: string; photo?: string | null } | null;
  availableNodes?: Array<{ id: string; fullName: string; photo?: string | null }>;
  onConnectionCreated?: (createdRel: any) => void;
}

export function ConnectionModal({
  isOpen,
  onClose,
  sourceEntity,
  targetEntity: initialTarget,
  availableNodes = [],
  onConnectionCreated,
}: ConnectionModalProps) {
  const [selectedTarget, setSelectedTarget] = React.useState<{
    id: string;
    fullName: string;
    photo?: string | null;
    currentJob?: string | null;
  } | null>(initialTarget || null);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  const [selectedCategory, setSelectedCategory] = React.useState<GraphCategory | "ALL">("ALL");
  const [selectedRole, setSelectedRole] = React.useState("Amigo(a)");
  const [customRole, setCustomRole] = React.useState("");
  const [isCustom, setIsCustom] = React.useState(false);
  const [notes, setNotes] = React.useState("");
  const [bidirectional, setBidirectional] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Sync initialTarget
  React.useEffect(() => {
    if (initialTarget) {
      setSelectedTarget(initialTarget);
    } else {
      setSelectedTarget(null);
    }
  }, [initialTarget, isOpen]);

  // Search entities when typing in autocomplete
  React.useEffect(() => {
    if (!searchQuery.trim() || selectedTarget) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const exclude = [sourceEntity?.id].filter(Boolean) as string[];
        const results = await searchEntitiesForGraphAction(searchQuery, exclude);
        setSearchResults(results);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedTarget, sourceEntity]);

  if (!isOpen) return null;

  const currentRole = isCustom ? customRole.trim() : selectedRole;
  const currentCategory = inferCategoryFromRole(currentRole);

  const filteredPresets = selectedCategory === "ALL"
    ? ROLE_PRESETS
    : ROLE_PRESETS.filter((p) => p.category === selectedCategory);

  const handleSelectPreset = (preset: typeof ROLE_PRESETS[0]) => {
    setSelectedRole(preset.label);
    setIsCustom(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sourceEntity?.id) {
      toast.error("Entidade de origem não definida.");
      return;
    }

    if (!selectedTarget?.id) {
      toast.error("Selecione a pessoa que deseja conectar.");
      return;
    }

    if (!currentRole) {
      toast.error("Especifique o papel do vínculo (ex: Amigo, Esposa, etc.).");
      return;
    }

    setIsSubmitting(true);
    const prismaType = mapRoleToPrismaType(currentRole, currentCategory);

    try {
      const res = await createOrUpdateRelationshipAction({
        entityId: sourceEntity.id,
        relatedEntityId: selectedTarget.id,
        type: prismaType,
        label: currentRole,
        notes: notes.trim() || undefined,
        bidirectional,
      });

      if (!res.success) {
        toast.error(res.error || "Erro ao criar conexão.");
        setIsSubmitting(false);
        return;
      }

      toast.success(
        `Vínculo de "${currentRole}" criado com sucesso entre ${sourceEntity.fullName} e ${selectedTarget.fullName}!`
      );

      if (onConnectionCreated) {
        onConnectionCreated({
          relationshipId: res.relationshipId,
          source: sourceEntity.id,
          target: selectedTarget.id,
          label: currentRole,
          category: currentCategory,
          notes: notes.trim(),
          bidirectional,
          targetEntity: selectedTarget,
        });
      }

      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error("Erro inesperado ao conectar entidades.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-card/95 backdrop-blur-xl border border-border/70 shadow-2xl z-50">
        <DialogHeader className="p-6 pb-4 border-b border-border/50 bg-muted/20">
          <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
            <LinkIcon className="size-4 text-primary" />
            <span>Criar Nova Conexão no Grafo</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Defina papéis, tipo de vínculo, direção e anotações investigativas entre as duas entidades.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* 1. Connection Entities Card (From -> To) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-muted/30 border border-border/60">
            {/* Origem */}
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-card border border-border/40 shadow-xs">
              <IgAvatar
                src={sourceEntity?.photo}
                alt={sourceEntity?.fullName || "Origem"}
                fallback="OR"
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Origem
                </span>
                <p className="font-semibold text-xs text-foreground truncate">
                  {sourceEntity?.fullName || "Selecione"}
                </p>
              </div>
            </div>

            {/* Destino */}
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-card border border-border/40 shadow-xs">
              <IgAvatar
                src={selectedTarget?.photo}
                alt={selectedTarget?.fullName || "Destino"}
                fallback="DS"
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Conectar a
                </span>
                <p className="font-semibold text-xs text-foreground truncate">
                  {selectedTarget?.fullName || "Selecione abaixo..."}
                </p>
              </div>
              {selectedTarget && !initialTarget && (
                <button
                  type="button"
                  onClick={() => setSelectedTarget(null)}
                  className="text-[10px] text-muted-foreground hover:text-destructive underline shrink-0"
                >
                  Alterar
                </button>
              )}
            </div>
          </div>

          {/* If Target not selected, show Search Autocomplete */}
          {!selectedTarget && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Buscar pessoa para conectar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Digite nome, cargo ou CPF..."
                  className="pl-9 h-9 text-xs rounded-xl glass border-border/60"
                  autoFocus
                />
              </div>

              {/* Autocomplete Results List */}
              {searchResults.length > 0 && (
                <div className="max-h-40 overflow-y-auto p-1 rounded-xl bg-card border border-border/60 shadow-lg space-y-1">
                  {searchResults.map((ent) => (
                    <div
                      key={ent.id}
                      onClick={() => {
                        setSelectedTarget(ent);
                        setSearchQuery("");
                      }}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/80 cursor-pointer text-xs transition-colors"
                    >
                      <IgAvatar src={ent.photo} alt={ent.fullName} fallback="ID" size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">{ent.fullName}</p>
                        {ent.currentJob && (
                          <p className="text-[10px] text-muted-foreground truncate">{ent.currentJob}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick suggestions from existing nodes */}
              {availableNodes.length > 1 && !searchQuery && (
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] text-muted-foreground font-medium block">
                    Ou selecione um nó já visível no grafo:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {availableNodes
                      .filter((n) => n.id !== sourceEntity?.id)
                      .map((node) => (
                        <button
                          key={node.id}
                          type="button"
                          onClick={() => setSelectedTarget(node)}
                          className="px-2 py-1 rounded-lg text-xs bg-muted/60 hover:bg-muted border border-border/50 text-foreground font-medium truncate max-w-[150px]"
                        >
                          {node.fullName}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. Category Filters & Presets */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Papel / Função da Relação</Label>
              <button
                type="button"
                onClick={() => setIsCustom(!isCustom)}
                className="text-[11px] font-semibold text-primary hover:underline"
              >
                {isCustom ? "Usar papéis pré-definidos" : "Digitar papel customizado"}
              </button>
            </div>

            {isCustom ? (
              <div className="space-y-1">
                <Input
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder="Ex: Padrinho, Motorista, Laranja, Inquilino..."
                  className="h-9 text-xs rounded-xl glass border-border/60"
                  autoFocus
                />
                <span className="text-[10px] text-muted-foreground">
                  Categoria identificada:{" "}
                  <strong className="text-foreground">{CATEGORY_CONFIGS[currentCategory].name}</strong>
                </span>
              </div>
            ) : (
              <>
                {/* Category Pills */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("ALL")}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                      selectedCategory === "ALL"
                        ? "bg-foreground text-background border-foreground"
                        : "bg-muted/40 text-muted-foreground border-border/50 hover:bg-muted"
                    }`}
                  >
                    Todos
                  </button>
                  {(Object.keys(CATEGORY_CONFIGS) as GraphCategory[]).map((cat) => {
                    const cfg = CATEGORY_CONFIGS[cat];
                    const active = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                          active
                            ? `${cfg.badgeBg} ${cfg.badgeText} ${cfg.badgeBorder} ring-1 ring-primary/40`
                            : "bg-muted/40 text-muted-foreground border-border/50 hover:bg-muted"
                        }`}
                      >
                        {cfg.name}
                      </button>
                    );
                  })}
                </div>

                {/* Role Presets Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-40 overflow-y-auto p-1 rounded-xl bg-muted/20 border border-border/40">
                  {filteredPresets.map((preset) => {
                    const active = selectedRole === preset.label && !isCustom;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`px-2 py-1.5 rounded-xl text-left text-xs font-medium border transition-all flex items-center justify-between ${
                          active
                            ? "bg-primary/15 border-primary text-primary font-bold shadow-xs"
                            : "bg-card/70 border-border/50 text-foreground hover:bg-card hover:border-border"
                        }`}
                      >
                        <span className="truncate">{preset.label}</span>
                        {active && <Check className="size-3 text-primary shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* 3. Bidirectional Switch */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border/50">
            <div className="space-y-0.5">
              <Label className="text-xs font-semibold cursor-pointer">
                Conexão Bidirecional
              </Label>
              <p className="text-[10px] text-muted-foreground">
                Se ativado, cria o vínculo recíproco entre ambas as entidades no banco.
              </p>
            </div>
            <Switch
              checked={bidirectional}
              onCheckedChange={setBidirectional}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          {/* 4. Notes & Intelligence */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Observações do Vínculo (Opcional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Frequentam o mesmo local; sócios na empresa X; advogou no inquérito..."
              rows={2}
              className="text-xs rounded-xl glass border-border/60 resize-none"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-9 rounded-xl glass border-border/60 text-xs font-semibold"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !selectedTarget || !currentRole}
              className="h-9 rounded-xl bg-ig-gradient hover:opacity-90 text-white font-semibold text-xs shadow-md glow-ig-sm border-0"
            >
              {isSubmitting ? "Conectando..." : "Criar Conexão"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
