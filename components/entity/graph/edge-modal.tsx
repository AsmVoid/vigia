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
import { Label } from "@/components/ui/label";
import {
  ROLE_PRESETS,
  CATEGORY_CONFIGS,
  inferCategoryFromRole,
  mapRoleToPrismaType,
} from "./graph-types";
import {
  updateRelationshipAction,
  deleteRelationshipAction,
} from "@/app/(dashboard)/entity/graph-actions";
import {
  Trash2,
  Save,
  Link as LinkIcon,
  Heart,
  Users,
  Briefcase,
  ShieldAlert,
  Calendar,
  FileText,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface EdgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  edgeData: {
    id: string;
    relationshipId?: string;
    source: string;
    target: string;
    sourceName?: string;
    targetName?: string;
    label?: string;
    notes?: string | null;
    category?: string;
    isSystemFamily?: boolean; // Se for pai/mãe fixo do schema, não pode ser deletado via tabela Relationship
  } | null;
  onEdgeUpdated?: (updatedEdge: any) => void;
  onEdgeDeleted?: (edgeId: string) => void;
}

export function EdgeModal({
  isOpen,
  onClose,
  edgeData,
  onEdgeUpdated,
  onEdgeDeleted,
}: EdgeModalProps) {
  const [role, setRole] = React.useState(edgeData?.label || "");
  const [notes, setNotes] = React.useState(edgeData?.notes || "");
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  React.useEffect(() => {
    if (edgeData) {
      setRole(edgeData.label || "");
      setNotes(edgeData.notes || "");
      setConfirmDelete(false);
    }
  }, [edgeData, isOpen]);

  if (!isOpen || !edgeData) return null;

  const currentCategory = inferCategoryFromRole(role);
  const config = CATEGORY_CONFIGS[currentCategory] || CATEGORY_CONFIGS.SOCIAL;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!role.trim()) {
      toast.error("O papel da relação não pode estar vazio.");
      return;
    }

    if (!edgeData.relationshipId) {
      // É uma relação em memória ou genealógica padrão
      onEdgeUpdated?.({
        ...edgeData,
        label: role.trim(),
        notes: notes.trim() || null,
        category: currentCategory,
      });
      toast.success("Relação atualizada no grafo!");
      onClose();
      return;
    }

    setIsUpdating(true);
    const prismaType = mapRoleToPrismaType(role, currentCategory);

    try {
      const res = await updateRelationshipAction(edgeData.relationshipId, {
        label: role.trim(),
        notes: notes.trim() || undefined,
        type: prismaType,
      });

      if (!res.success) {
        toast.error(res.error || "Erro ao atualizar relação.");
        setIsUpdating(false);
        return;
      }

      toast.success("Vínculo atualizado com sucesso!");
      onEdgeUpdated?.({
        ...edgeData,
        label: role.trim(),
        notes: notes.trim() || null,
        category: currentCategory,
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error("Falha ao salvar alterações.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!edgeData.relationshipId) {
      // Deleta nó/aresta local
      onEdgeDeleted?.(edgeData.id);
      toast.success("Conexão removida do grafo!");
      onClose();
      return;
    }

    setIsDeleting(true);
    try {
      const res = await deleteRelationshipAction(edgeData.relationshipId);
      if (!res.success) {
        toast.error(res.error || "Erro ao excluir relação.");
        setIsDeleting(false);
        return;
      }

      toast.success("Vínculo excluído permanentemente!");
      onEdgeDeleted?.(edgeData.id);
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error("Falha ao excluir conexão.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-card/95 backdrop-blur-xl border border-border/70 shadow-2xl z-50">
        <DialogHeader className="p-6 pb-4 border-b border-border/50 bg-muted/20">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <LinkIcon className="size-4 text-primary" />
              <span>Gerenciar Vínculo</span>
            </DialogTitle>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${config.badgeBg} ${config.badgeText} ${config.badgeBorder}`}
            >
              {config.name}
            </span>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Conexão entre{" "}
            <strong className="text-foreground">{edgeData.sourceName || "Origem"}</strong> e{" "}
            <strong className="text-foreground">{edgeData.targetName || "Destino"}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleUpdate} className="p-6 space-y-4">
          {/* Role input & quick suggestions */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Papel / Título da Relação</Label>
            <Input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Ex: Esposa, Sócio, Comparsa, Amigo..."
              className="h-9 text-xs rounded-xl glass border-border/60"
            />

            {/* Quick Presets Pills */}
            <div className="flex flex-wrap gap-1 pt-1 max-h-24 overflow-y-auto">
              {ROLE_PRESETS.slice(0, 10).map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setRole(p.label)}
                  className={`text-[10px] px-2 py-0.5 rounded-lg border transition-colors ${
                    role === p.label
                      ? "bg-primary/20 border-primary text-primary font-bold"
                      : "bg-muted/40 border-border/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes input */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Notas & Detalhes da Conexão</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações investigativas sobre este vínculo..."
              rows={3}
              className="text-xs rounded-xl glass border-border/60 resize-none"
            />
          </div>

          {/* Delete Danger Zone */}
          {confirmDelete ? (
            <div className="p-3 rounded-xl bg-destructive/15 border border-destructive/30 space-y-2">
              <div className="flex items-center gap-2 text-destructive text-xs font-bold">
                <AlertCircle className="size-4" />
                <span>Confirmar exclusão deste vínculo?</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Esta ação removerá a conexão entre as duas entidades no banco de dados.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="h-8 rounded-lg text-xs font-bold gap-1"
                >
                  <Trash2 className="size-3" />
                  {isDeleting ? "Excluindo..." : "Sim, Excluir Vínculo"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmDelete(false)}
                  className="h-8 rounded-lg text-xs font-semibold"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="text-xs font-semibold text-destructive hover:underline flex items-center gap-1"
              >
                <Trash2 className="size-3" />
                <span>Excluir Conexão</span>
              </button>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-9 rounded-xl glass border-border/60 text-xs font-semibold"
            >
              Fechar
            </Button>
            <Button
              type="submit"
              disabled={isUpdating}
              className="h-9 rounded-xl bg-ig-gradient hover:opacity-90 text-white font-semibold text-xs shadow-md glow-ig-sm border-0 gap-1.5"
            >
              <Save className="size-3.5" />
              <span>{isUpdating ? "Salvando..." : "Salvar Alterações"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
