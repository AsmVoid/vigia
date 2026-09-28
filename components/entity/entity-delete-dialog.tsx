"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteEntityAction } from "@/app/(dashboard)/person/actions";

interface EntityDeleteDialogProps {
  entityId: string;
  entityName: string;
  variant?: "icon" | "button";
}

export function EntityDeleteDialog({
  entityId,
  entityName,
  variant = "button",
}: EntityDeleteDialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await deleteEntityAction(entityId);
      if (res.success) {
        toast.success(`Entidade "${entityName}" excluída com sucesso.`);
        setOpen(false);
        router.push("/tree");
        router.refresh();
      } else {
        toast.error(res.error || "Falha ao excluir entidade.");
      }
    } catch {
      toast.error("Erro inesperado ao excluir.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {variant === "icon" ? (
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="Excluir Entidade"
          >
            <Trash2 className="size-4" />
          </Button>
        ) : (
          <Button
            variant="outline"
            className="rounded-2xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/60 text-xs font-semibold h-10 gap-1.5"
          >
            <Trash2 className="size-4" />
            <span>Excluir</span>
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="glass rounded-3xl border-border/60 max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-bold">
            Excluir Pessoa: {entityName}?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground">
            Tem certeza de que deseja excluir permanentemente o dossiê desta pessoa?
            Todos os dados vinculados (telefones, endereços, redes, documentos, etc.) serão
            removidos do banco de dados. Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 gap-2">
          <AlertDialogCancel
            disabled={loading}
            className="rounded-2xl border-border/50 text-xs"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={loading}
            className="rounded-2xl bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-semibold gap-1.5"
          >
            {loading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Excluindo...</span>
              </>
            ) : (
              <>
                <Trash2 className="size-3.5" />
                <span>Sim, Excluir</span>
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
