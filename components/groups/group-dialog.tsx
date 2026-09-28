"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createGroupAction, updateGroupAction, GroupFormData } from "@/app/(dashboard)/groups/actions";
import { Folder, Users, Shield, Building2, Network, Briefcase, Tag, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GroupItem {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  _count?: {
    entities: number;
  };
}

interface GroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupToEdit?: GroupItem | null;
  onSuccess?: () => void;
}

const PRESET_COLORS = [
  "#405de6", // blue
  "#5851db", // purple-blue
  "#833ab4", // purple
  "#c13584", // magenta
  "#e1306c", // rose
  "#fd1d1d", // red
  "#f56040", // orange
  "#fcaf45", // amber
  "#10b981", // emerald
];

export const GROUP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  folder: Folder,
  users: Users,
  shield: Shield,
  building: Building2,
  network: Network,
  briefcase: Briefcase,
  tag: Tag,
};

export function GroupDialog({
  open,
  onOpenChange,
  groupToEdit,
  onSuccess,
}: GroupDialogProps) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [color, setColor] = React.useState("#833ab4");
  const [icon, setIcon] = React.useState("folder");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (groupToEdit) {
      setName(groupToEdit.name);
      setDescription(groupToEdit.description || "");
      setColor(groupToEdit.color || "#833ab4");
      setIcon(groupToEdit.icon || "folder");
    } else {
      setName("");
      setDescription("");
      setColor("#833ab4");
      setIcon("folder");
    }
  }, [groupToEdit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("O nome do grupo é obrigatório.");
      return;
    }

    setLoading(true);
    const payload: GroupFormData = {
      name: name.trim(),
      description: description.trim() || null,
      color,
      icon,
    };

    try {
      if (groupToEdit) {
        const res = await updateGroupAction(groupToEdit.id, payload);
        if (res.success) {
          toast.success("Grupo atualizado com sucesso!");
          onOpenChange(false);
          onSuccess?.();
        } else {
          toast.error(res.error || "Erro ao atualizar grupo.");
        }
      } else {
        const res = await createGroupAction(payload);
        if (res.success) {
          toast.success("Grupo criado com sucesso!");
          onOpenChange(false);
          onSuccess?.();
        } else {
          toast.error(res.error || "Erro ao criar grupo.");
        }
      }
    } catch {
      toast.error("Erro inesperado ao salvar grupo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] glass border-border/80 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <span
                className="size-4 rounded-full inline-block shrink-0 shadow-xs"
                style={{ backgroundColor: color }}
              />
              {groupToEdit ? "Editar Grupo" : "Criar Novo Grupo"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Agrupe alvos e entidades por família, organização, célula ou operação.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Nome */}
            <div className="space-y-1.5">
              <Label htmlFor="group-name" className="text-xs">Nome do Grupo *</Label>
              <Input
                id="group-name"
                placeholder="Ex: Família Silva / Operação Alpha"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl glass border-border/60 text-sm"
                required
              />
            </div>

            {/* Descrição */}
            <div className="space-y-1.5">
              <Label htmlFor="group-desc" className="text-xs">Descrição / Contexto</Label>
              <Textarea
                id="group-desc"
                placeholder="Notas sobre a relação ou escopo deste grupo..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="rounded-xl glass border-border/60 text-sm resize-none"
              />
            </div>

            {/* Cor de Identificação */}
            <div className="space-y-1.5">
              <Label className="text-xs">Cor do Grupo</Label>
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      "size-7 rounded-full transition-transform hover:scale-110 relative",
                      color === c && "ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110"
                    )}
                    style={{ backgroundColor: c }}
                    aria-label={`Selecionar cor ${c}`}
                  />
                ))}
                <div className="relative ml-2 flex items-center">
                  <Input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-24 h-7 text-xs font-mono rounded-lg px-2"
                  />
                </div>
              </div>
            </div>

            {/* Ícone */}
            <div className="space-y-1.5">
              <Label className="text-xs">Ícone do Grupo</Label>
              <div className="flex items-center gap-2 flex-wrap">
                {Object.entries(GROUP_ICONS).map(([key, IconComp]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setIcon(key)}
                    className={cn(
                      "size-9 rounded-xl border border-border/50 glass flex items-center justify-center transition-all",
                      icon === key
                        ? "bg-primary text-white border-primary glow-ig-sm scale-105"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    )}
                    aria-label={key}
                  >
                    <IconComp className="size-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-xl text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-xl text-xs bg-ig-gradient hover:opacity-90 text-white shadow-md glow-ig-sm"
            >
              {loading ? "Salvando..." : groupToEdit ? "Salvar Alterações" : "Criar Grupo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
