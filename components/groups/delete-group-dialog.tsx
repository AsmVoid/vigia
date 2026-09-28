"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { deleteGroupAction } from "@/app/(dashboard)/groups/actions";
import { GroupItem } from "@/components/groups/group-dialog";

interface DeleteGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: GroupItem | null;
  onSuccess?: () => void;
}

export function DeleteGroupDialog({
  open,
  onOpenChange,
  group,
  onSuccess,
}: DeleteGroupDialogProps) {
  const [loading, setLoading] = React.useState(false);

  if (!group) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await deleteGroupAction(group.id);
      if (res.success) {
        toast.success(`Grupo "${group.name}" excluído.`);
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(res.error || "Erro ao excluir grupo.");
      }
    } catch {
      toast.error("Erro inesperado ao excluir grupo.");
    } finally {
      setLoading(false);
    }
  };

  const entityCount = group._count?.entities || 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="glass border-border/80 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-bold text-destructive">
            Excluir Grupo?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground space-y-2">
            <span>
              Tem certeza de que deseja excluir o grupo{" "}
              <strong className="text-foreground font-semibold">"{group.name}"</strong>?
            </span>
            {entityCount > 0 && (
              <span className="block p-2 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-[11px] font-medium mt-2">
                ⚠️ Este grupo possui {entityCount} pessoa(s) associada(s). Elas NÃO serão excluídas, mas ficarão desvinculadas (sem grupo).
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2 sm:gap-0 pt-3">
          <AlertDialogCancel
            disabled={loading}
            className="rounded-xl text-xs glass border-border"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={loading}
            className="rounded-xl text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md"
          >
            {loading ? "Excluindo..." : "Confirmar Exclusão"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
