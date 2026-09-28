"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import {
  FileText,
  CheckSquare,
  MapPin,
  Link2,
  Code,
  Lock,
  Unlock,
  Image as ImageIcon,
  Plus,
  Trash2,
  MoreVertical,
  Loader2,
  ExternalLink,
  Save,
  Check,
  Calendar,
  Sparkles,
  RefreshCw,
  Search,
  Upload,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Pencil,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  createNoteWidgetAction,
  updateNoteWidgetAction,
  deleteNoteWidgetAction,
  updateNoteLayoutsAction,
  fetchLinkPreviewAction,
  geocodeQueryAction,
} from "@/app/(dashboard)/entity/actions";
import { cn } from "@/lib/utils";

async function sha256(text: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Dynamic mini Leaflet map for the MAP widget
const DynamicMiniMap = dynamic(
  () => import("@/components/entity/map/leaflet-map"),
  {
    ssr: false,
    loading: () => (
      <div className="h-44 w-full rounded-xl glass border border-border/50 flex items-center justify-center text-xs text-muted-foreground gap-2">
        <Loader2 className="size-4 animate-spin text-primary" />
        <span>Carregando mini mapa...</span>
      </div>
    ),
  }
);

export type NoteType =
  | "TEXT"
  | "CHECKLIST"
  | "MAP"
  | "LINK_PREVIEW"
  | "CODE_BLOCK"
  | "VAULT"
  | "IMAGE";

export interface NoteWidgetData {
  id: string;
  entityId: string;
  type: NoteType;
  title?: string | null;
  content: any;
  layout?: any;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface NotesCanvasTabProps {
  entityId: string;
  initialNotes: NoteWidgetData[];
}

export function NotesCanvasTab({ entityId, initialNotes }: NotesCanvasTabProps) {
  const [notes, setNotes] = React.useState<NoteWidgetData[]>(initialNotes || []);
  const [creatingType, setCreatingType] = React.useState<NoteType | null>(null);
  const [vaultCreateOpen, setVaultCreateOpen] = React.useState(false);
  const [vaultCreatePass, setVaultCreatePass] = React.useState("");
  const [vaultCreatePassConfirm, setVaultCreatePassConfirm] = React.useState("");
  const [isCreatingVault, setIsCreatingVault] = React.useState(false);

  // Estados do Modal de Criação de Ponto Geográfico
  const [mapDialogOpen, setMapDialogOpen] = React.useState(false);
  const [mapFormTitle, setMapFormTitle] = React.useState("Ponto Geográfico de Interesse");
  const [mapFormAddress, setMapFormAddress] = React.useState("");
  const [mapFormLat, setMapFormLat] = React.useState<string>("-23.561684");
  const [mapFormLng, setMapFormLng] = React.useState<string>("-46.655981");
  const [mapFormNote, setMapFormNote] = React.useState("");
  const [mapFormMapsUrl, setMapFormMapsUrl] = React.useState("");
  const [isGeocoding, setIsGeocoding] = React.useState(false);
  const [isCreatingMapWidget, setIsCreatingMapWidget] = React.useState(false);

  // Image Dialog State
  const [imageDialogOpen, setImageDialogOpen] = React.useState(false);
  const [imageFormTitle, setImageFormTitle] = React.useState("Evidência Fotográfica");
  const [imageFormUrl, setImageFormUrl] = React.useState("");
  const [imageFormCaption, setImageFormCaption] = React.useState("");
  const [isImageUploading, setIsImageUploading] = React.useState(false);
  const [isCreatingImageWidget, setIsCreatingImageWidget] = React.useState(false);
  const imageFileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleImageUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setImageFormUrl(data.url);
        toast.success("Foto enviada com sucesso!");
      } else {
        toast.error(data.error || "Falha no upload da foto.");
      }
    } catch {
      toast.error("Erro interno ao enviar foto.");
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleConfirmCreateImageWidget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFormUrl.trim()) {
      toast.error("Faça upload de uma foto ou informe uma URL válida.");
      return;
    }
    setIsCreatingImageWidget(true);
    const title = imageFormTitle.trim() || "Evidência Fotográfica";
    const initialContent = {
      url: imageFormUrl.trim(),
      caption: imageFormCaption.trim() || "Foto registrada durante monitoramento de campo.",
    };

    try {
      const res = await createNoteWidgetAction(
        entityId,
        "IMAGE",
        title,
        initialContent,
        { order: notes.length }
      );
      if (res.success && res.note) {
        setNotes((prev) => [
          ...prev,
          {
            ...res.note!,
            createdAt: new Date(res.note!.createdAt).toISOString(),
            updatedAt: new Date(res.note!.updatedAt).toISOString(),
          },
        ]);
        toast.success(`Widget de foto "${title}" adicionado ao canvas!`);
        setImageDialogOpen(false);
        setImageFormTitle("Evidência Fotográfica");
        setImageFormUrl("");
        setImageFormCaption("");
      } else {
        toast.error(res.error || "Falha ao criar widget de foto.");
      }
    } catch {
      toast.error("Erro interno ao criar widget de imagem.");
    } finally {
      setIsCreatingImageWidget(false);
    }
  };

  const handleGeocodeSearch = async () => {
    if (!mapFormAddress.trim()) {
      toast.error("Informe um endereço ou local para buscar.");
      return;
    }
    setIsGeocoding(true);
    try {
      const res = await geocodeQueryAction(mapFormAddress.trim());
      if (res.success && res.latitude !== undefined && res.longitude !== undefined) {
        setMapFormLat(String(res.latitude));
        setMapFormLng(String(res.longitude));
        toast.success("Coordenadas encontradas via OpenStreetMap!");
      } else {
        toast.error(res.error || "Endereço não localizado no mapa. Ajuste as coordenadas manualmente.");
      }
    } catch {
      toast.error("Falha ao comunicar com o serviço de geocodificação.");
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleConfirmCreateMapWidget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapFormAddress.trim()) {
      toast.error("Informe o local ou endereço do ponto de interesse.");
      return;
    }

    const lat = parseFloat(mapFormLat);
    const lng = parseFloat(mapFormLng);

    if (isNaN(lat) || isNaN(lng)) {
      toast.error("Coordenadas inválidas. Informe valores numéricos para Latitude e Longitude.");
      return;
    }

    setIsCreatingMapWidget(true);
    const title = mapFormTitle.trim() || "Ponto Geográfico de Interesse";
    const initialContent = {
      label: mapFormAddress.trim(),
      latitude: lat,
      longitude: lng,
      mapsUrl: mapFormMapsUrl.trim() || null,
      note: mapFormNote.trim() || null,
    };

    try {
      const res = await createNoteWidgetAction(
        entityId,
        "MAP",
        title,
        initialContent,
        { order: notes.length }
      );

      if (res.success && res.note) {
        setNotes((prev) => [
          ...prev,
          {
            ...res.note!,
            createdAt: new Date(res.note!.createdAt).toISOString(),
            updatedAt: new Date(res.note!.updatedAt).toISOString(),
          },
        ]);
        toast.success(`Ponto de interesse "${title}" criado com sucesso!`);
        setMapDialogOpen(false);
        // Reset
        setMapFormTitle("Ponto Geográfico de Interesse");
        setMapFormAddress("");
        setMapFormLat("-23.561684");
        setMapFormLng("-46.655981");
        setMapFormNote("");
        setMapFormMapsUrl("");
      } else {
        toast.error(res.error || "Falha ao criar ponto de interesse.");
      }
    } catch {
      toast.error("Erro interno ao criar widget de mapa.");
    } finally {
      setIsCreatingMapWidget(false);
    }
  };

  React.useEffect(() => {
    setNotes(initialNotes || []);
  }, [initialNotes]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = notes.findIndex((n) => n.id === active.id);
      const newIndex = notes.findIndex((n) => n.id === over.id);
      const reordered = arrayMove(notes, oldIndex, newIndex);
      setNotes(reordered);

      // Persist layout ordering in Note.layout JsonB
      const layouts = reordered.map((note, index) => ({
        id: note.id,
        layout: { ...(typeof note.layout === "object" ? note.layout : {}), order: index },
      }));

      await updateNoteLayoutsAction(entityId, layouts);
    }
  };

  const handleAddWidget = async (type: NoteType) => {
    if (type === "MAP") {
      setMapDialogOpen(true);
      return;
    }
    if (type === "IMAGE") {
      setImageDialogOpen(true);
      return;
    }

    setCreatingType(type);
    let initialContent: any = {};
    let initialTitle = "";

    switch (type) {
      case "TEXT":
        initialTitle = "Anotação de Investigação";
        initialContent = { text: "Digite suas anotações investigativas aqui..." };
        break;
      case "CHECKLIST":
        initialTitle = "Checklist de Verificação";
        initialContent = {
          items: [
            { id: "1", text: "Verificar antecedentes criminais", done: false },
            { id: "2", text: "Cruzar vínculos societários na Receita", done: false },
            { id: "3", text: "Auditar contas em redes sociais", done: true },
          ],
        };
        break;
      case "LINK_PREVIEW":
        initialTitle = "Fonte / Notícia de Interesse";
        initialContent = {
          url: "https://github.com",
          title: "GitHub: Let's build from here",
          description: "Plataforma de desenvolvimento colaborativo.",
          domain: "github.com",
        };
        break;
      case "CODE_BLOCK":
        initialTitle = "Payload / Dump de Dados";
        initialContent = {
          code: '{\n  "ip": "189.120.45.12",\n  "asn": "AS27699",\n  "status": "active"\n}',
          language: "json",
        };
        break;
      case "VAULT":
        initialTitle = "Cofre Seguro (Senha Local)";
        initialContent = {
          secret: "Palavra-chave operacional: OPERACAO_CONDOR_2026",
          passwordHash: "1234",
        };
        break;
    }

    try {
      const res = await createNoteWidgetAction(
        entityId,
        type,
        initialTitle,
        initialContent,
        { order: notes.length }
      );

      if (res.success && res.note) {
        setNotes((prev) => [
          ...prev,
          {
            ...res.note!,
            createdAt: new Date(res.note!.createdAt).toISOString(),
            updatedAt: new Date(res.note!.updatedAt).toISOString(),
          },
        ]);
        toast.success(`Widget "${initialTitle}" adicionado ao canvas!`);
      } else {
        toast.error(res.error || "Falha ao criar widget.");
      }
    } catch {
      toast.error("Erro inesperado ao criar widget.");
    } finally {
      setCreatingType(null);
    }
  };

  const handleConfirmCreateVault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (vaultCreatePass.length < 4) {
      toast.error("A senha do cofre deve ter no mínimo 4 caracteres.");
      return;
    }
    if (vaultCreatePass !== vaultCreatePassConfirm) {
      toast.error("A confirmação de senha não coincide.");
      return;
    }

    setIsCreatingVault(true);
    try {
      const passwordHash = await sha256(vaultCreatePass);
      const res = await createNoteWidgetAction(
        entityId,
        "VAULT",
        "Cofre Seguro (Senha Local)",
        { secret: "", passwordHash },
        { order: notes.length }
      );
      if (res.success && res.note) {
        setNotes((prev) => [
          ...prev,
          {
            ...res.note!,
            createdAt: new Date(res.note!.createdAt).toISOString(),
            updatedAt: new Date(res.note!.updatedAt).toISOString(),
          },
        ]);
        toast.success("Cofre seguro criado com senha definida!");
        setVaultCreateOpen(false);
        setVaultCreatePass("");
        setVaultCreatePassConfirm("");
      } else {
        toast.error(res.error || "Falha ao criar cofre.");
      }
    } catch {
      toast.error("Erro inesperado ao criar cofre.");
    } finally {
      setIsCreatingVault(false);
    }
  };

  const handleDeleteWidget = async (id: string) => {
    try {
      const res = await deleteNoteWidgetAction(id);
      if (res.success) {
        setNotes((prev) => prev.filter((n) => n.id !== id));
        toast.success("Widget removido.");
      } else {
        toast.error(res.error || "Erro ao excluir.");
      }
    } catch {
      toast.error("Erro ao remover widget.");
    }
  };

  const handleUpdateWidget = async (
    id: string,
    data: { title?: string; content?: any }
  ) => {
    try {
      const res = await updateNoteWidgetAction(id, data);
      if (res.success) {
        setNotes((prev) =>
          prev.map((n) =>
            n.id === id
              ? {
                  ...n,
                  ...(data.title !== undefined ? { title: data.title } : {}),
                  ...(data.content !== undefined ? { content: data.content } : {}),
                }
              : n
          )
        );
        toast.success("Widget atualizado!");
      } else {
        toast.error(res.error || "Erro ao atualizar.");
      }
    } catch {
      toast.error("Erro ao atualizar widget.");
    }
  };

  return (
    <div className="space-y-6 relative pb-16">
      {/* Top Banner */}
      <div className="glass rounded-3xl p-5 border-border/50 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-ig-gradient text-white shadow-sm">
              <Sparkles className="size-4" />
            </span>
            Canvas Investigativo de Notas ({notes.length} widgets)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quadro dinâmico de inteligência com blocos arrastáveis, checklist com progresso, mapas e cofre.
          </p>
        </div>

        {/* Add Widget Dropdown Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              disabled={!!creatingType}
              className="rounded-2xl bg-ig-gradient hover:opacity-90 text-white shadow-md glow-ig-sm text-xs font-semibold h-9 gap-1.5 shrink-0"
            >
              {creatingType ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Plus className="size-3.5" />
              )}
              <span>+ Novo Widget</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="glass rounded-2xl border-border/60 p-1.5 w-56 backdrop-blur-xl shadow-xl z-50"
          >
            <DropdownMenuLabel className="text-[11px] font-mono text-muted-foreground uppercase px-2 py-1">
              Tipos de Widgets
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => handleAddWidget("TEXT")}
              className="text-xs rounded-xl cursor-pointer gap-2 py-2"
            >
              <FileText className="size-3.5 text-primary" />
              <span>Texto / Markdown</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAddWidget("CHECKLIST")}
              className="text-xs rounded-xl cursor-pointer gap-2 py-2"
            >
              <CheckSquare className="size-3.5 text-emerald-400" />
              <span>Checklist com Progresso</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAddWidget("MAP")}
              className="text-xs rounded-xl cursor-pointer gap-2 py-2"
            >
              <MapPin className="size-3.5 text-pink-400" />
              <span>Mini Mapa Leaflet</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAddWidget("LINK_PREVIEW")}
              className="text-xs rounded-xl cursor-pointer gap-2 py-2"
            >
              <Link2 className="size-3.5 text-sky-400" />
              <span>Link Preview (OpenGraph)</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAddWidget("CODE_BLOCK")}
              className="text-xs rounded-xl cursor-pointer gap-2 py-2"
            >
              <Code className="size-3.5 text-amber-400" />
              <span>Bloco de Código / JSON</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAddWidget("IMAGE")}
              className="text-xs rounded-xl cursor-pointer gap-2 py-2"
            >
              <ImageIcon className="size-3.5 text-violet-400" />
              <span>Imagem com Legenda</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/40" />
            <DropdownMenuItem
              onClick={() => {
                setVaultCreatePass("");
                setVaultCreatePassConfirm("");
                setVaultCreateOpen(true);
              }}
              className="text-xs rounded-xl cursor-pointer gap-2 py-2 text-rose-400 font-semibold"
            >
              <Lock className="size-3.5" />
              <span>Cofre com Senha Local</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Widgets Canvas Grid */}
      {notes.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center text-muted-foreground border-border/40 space-y-3">
          <FileText className="size-10 mx-auto text-muted-foreground/40" />
          <p className="text-sm font-bold text-foreground">Canvas Vazio</p>
          <p className="text-xs max-w-sm mx-auto">
            Clique no botão "+ Novo Widget" para adicionar anotações em texto, listas de verificação,
            mini mapas ou notas seguras em cofre.
          </p>
        </div>
      ) : (
        <DndContext
          id="notes-canvas-dnd-context"
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={notes.map((n) => n.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {notes.map((note) => (
                  <SortableWidgetCard
                    key={note.id}
                    note={note}
                    onDelete={handleDeleteWidget}
                    onUpdate={handleUpdateWidget}
                  />
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Dialog Definir Senha ao Criar Cofre */}
      <Dialog open={vaultCreateOpen} onOpenChange={setVaultCreateOpen}>
        <DialogContent className="glass rounded-3xl border-border/60 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <Lock className="size-4 text-rose-400" />
              Definir Senha do Cofre
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Para sua segurança, defina uma senha mestra (mínimo 4 caracteres) para desbloquear este cofre.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleConfirmCreateVault} className="space-y-3 pt-2">
            <Input
              type="password"
              placeholder="Digite a senha..."
              value={vaultCreatePass}
              onChange={(e) => setVaultCreatePass(e.target.value)}
              className="h-9 rounded-xl glass text-xs"
              autoFocus
              required
            />
            <Input
              type="password"
              placeholder="Confirme a senha..."
              value={vaultCreatePassConfirm}
              onChange={(e) => setVaultCreatePassConfirm(e.target.value)}
              className="h-9 rounded-xl glass text-xs"
              required
            />
            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setVaultCreateOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isCreatingVault}
                className="rounded-xl bg-ig-gradient text-white text-xs font-semibold"
              >
                {isCreatingVault ? "Criando..." : "Criar Cofre"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Ponto Geográfico de Interesse */}
      <Dialog open={mapDialogOpen} onOpenChange={setMapDialogOpen}>
        <DialogContent className="glass rounded-3xl border-border/60 max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-ig-gradient text-white shadow-sm">
                <MapPin className="size-4" />
              </span>
              Novo Ponto Geográfico de Interesse
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Defina a localização e adicione observações sobre o local antes de fixar o mapa no canvas.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleConfirmCreateMapWidget} className="space-y-3.5 pt-2">
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-muted-foreground">
                Título do Ponto de Interesse
              </label>
              <Input
                placeholder="Ex: Local de Encontro Suspeito, Galpão Central..."
                value={mapFormTitle}
                onChange={(e) => setMapFormTitle(e.target.value)}
                className="h-9 rounded-xl glass text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-muted-foreground">
                Endereço ou Local
              </label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Rua, número, bairro, cidade ou CEP..."
                  value={mapFormAddress}
                  onChange={(e) => setMapFormAddress(e.target.value)}
                  className="h-9 rounded-xl glass text-xs flex-1"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGeocodeSearch}
                  disabled={isGeocoding || !mapFormAddress.trim()}
                  className="h-9 rounded-xl glass text-xs font-semibold gap-1.5 shrink-0"
                  title="Localizar coordenadas automaticamente via OpenStreetMap"
                >
                  {isGeocoding ? (
                    <Loader2 className="size-3.5 animate-spin text-primary" />
                  ) : (
                    <Search className="size-3.5 text-primary" />
                  )}
                  <span>Buscar</span>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-muted-foreground">Latitude</label>
                <Input
                  placeholder="-23.561684"
                  value={mapFormLat}
                  onChange={(e) => setMapFormLat(e.target.value)}
                  className="h-8 rounded-xl glass text-xs font-mono"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-muted-foreground">Longitude</label>
                <Input
                  placeholder="-46.655981"
                  value={mapFormLng}
                  onChange={(e) => setMapFormLng(e.target.value)}
                  className="h-8 rounded-xl glass text-xs font-mono"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-muted-foreground flex items-center justify-between">
                <span>Link Direto Google Maps (Opcional)</span>
                <span className="text-[10px] text-muted-foreground">Tipo 2</span>
              </label>
              <Input
                placeholder="https://maps.app.goo.gl/... (caso queira fixar o link direto)"
                value={mapFormMapsUrl}
                onChange={(e) => setMapFormMapsUrl(e.target.value)}
                className="h-8 rounded-xl glass text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-muted-foreground">
                Breve Nota / Observações sobre o Lugar
              </label>
              <Textarea
                placeholder="Observações, rotina, características do local ou alertas investigativos..."
                value={mapFormNote}
                onChange={(e) => setMapFormNote(e.target.value)}
                className="text-xs rounded-xl glass min-h-[75px]"
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setMapDialogOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isCreatingMapWidget}
                className="rounded-xl bg-ig-gradient text-white text-xs font-semibold"
              >
                {isCreatingMapWidget ? "Adicionando..." : "Criar Ponto no Mapa"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Dialog: Criar Widget de Imagem / Evidência Fotográfica */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="glass rounded-3xl border-border/60 max-w-lg p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-ig-gradient text-white shadow-sm">
                <ImageIcon className="size-4" />
              </span>
              Nova Evidência Fotográfica
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Faça upload de uma foto da investigação ou forneça a URL, junto com sua descrição antes de fixar no canvas.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmCreateImageWidget} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-muted-foreground">
                Título do Widget
              </label>
              <Input
                placeholder="Ex: Evidência Fotográfica, Flagrante, Veículo..."
                value={imageFormTitle}
                onChange={(e) => setImageFormTitle(e.target.value)}
                className="h-9 rounded-xl glass text-xs"
                required
              />
            </div>

            {/* Upload Area */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono text-muted-foreground">
                Arquivo de Foto (Upload do Computador)
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <input
                  type="file"
                  ref={imageFileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUploadFile}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isImageUploading}
                  onClick={() => imageFileInputRef.current?.click()}
                  className="h-9 px-3 rounded-xl glass border-border/70 text-xs font-semibold gap-2 w-full sm:w-auto shrink-0"
                >
                  {isImageUploading ? (
                    <Loader2 className="size-3.5 animate-spin text-primary" />
                  ) : (
                    <Upload className="size-3.5 text-primary" />
                  )}
                  <span>{isImageUploading ? "Enviando foto..." : "Selecionar Foto"}</span>
                </Button>

                <span className="text-[10px] text-muted-foreground font-mono">ou insira URL direta abaixo</span>
              </div>

              <Input
                placeholder="URL direta ou caminho /uploads/people/..."
                value={imageFormUrl}
                onChange={(e) => setImageFormUrl(e.target.value)}
                className="h-8 rounded-xl glass text-xs font-mono"
              />
            </div>

            {/* Preview da foto se existir */}
            {imageFormUrl && (
              <div className="relative rounded-2xl overflow-hidden border border-border/50 bg-black/30 h-44 flex items-center justify-center">
                <img
                  src={imageFormUrl}
                  alt="Preview da evidência"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-muted-foreground">
                Descrição / Legenda da Evidência
              </label>
              <Textarea
                placeholder="Descreva a evidência fotográfica, local registrado, data ou contexto pericial..."
                value={imageFormCaption}
                onChange={(e) => setImageFormCaption(e.target.value)}
                className="text-xs rounded-xl glass min-h-[75px]"
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setImageDialogOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isCreatingImageWidget || isImageUploading || !imageFormUrl.trim()}
                className="rounded-xl bg-ig-gradient text-white text-xs font-semibold"
              >
                {isCreatingImageWidget ? "Adicionando..." : "Criar Widget de Foto"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Subcomponent: Sortable Card Wrapper
function SortableWidgetCard({
  note,
  onDelete,
  onUpdate,
}: {
  note: NoteWidgetData;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: { title?: string; content?: any }) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: note.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative rounded-3xl p-5 glass border border-border/60 hover:border-primary/40 transition-all duration-200 shadow-sm flex flex-col justify-between space-y-3 bg-card/40",
        isDragging && "opacity-50 z-50 ring-2 ring-primary scale-[1.02]"
      )}
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between border-b border-border/30 pb-2.5">
        <div
          {...attributes}
          {...listeners}
          className="flex items-center gap-2 cursor-grab active:cursor-grabbing select-none truncate pr-2 flex-1"
        >
          <WidgetIcon type={note.type} />
          <span className="font-bold text-xs text-foreground truncate">
            {note.title || "Sem título"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
            <Calendar className="size-2.5" />
            {new Date(note.createdAt).toLocaleDateString("pt-BR")}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onDelete(note.id)}
            className="size-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="Remover widget"
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      </div>

      {/* Widget Dynamic Content */}
      <div className="flex-1 text-xs">
        <WidgetContentRenderer note={note} onUpdate={onUpdate} />
      </div>
    </motion.div>
  );
}

function WidgetIcon({ type }: { type: NoteType }) {
  switch (type) {
    case "TEXT":
      return <FileText className="size-3.5 text-primary shrink-0" />;
    case "CHECKLIST":
      return <CheckSquare className="size-3.5 text-emerald-400 shrink-0" />;
    case "MAP":
      return <MapPin className="size-3.5 text-pink-400 shrink-0" />;
    case "LINK_PREVIEW":
      return <Link2 className="size-3.5 text-sky-400 shrink-0" />;
    case "CODE_BLOCK":
      return <Code className="size-3.5 text-amber-400 shrink-0" />;
    case "IMAGE":
      return <ImageIcon className="size-3.5 text-violet-400 shrink-0" />;
    case "VAULT":
      return <Lock className="size-3.5 text-rose-400 shrink-0" />;
  }
}

interface WidgetProps {
  note: NoteWidgetData;
  onUpdate: (id: string, data: { title?: string; content?: any }) => void;
}

// 1. TEXT
function TextWidget({ note, onUpdate }: WidgetProps) {
  const content = note.content || {};
  const [editing, setEditing] = React.useState(false);
  const [text, setText] = React.useState(content.text || "");

  const handleSave = () => {
    onUpdate(note.id, { content: { ...content, text } });
    setEditing(false);
  };

  return editing ? (
    <div className="space-y-2">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="text-xs rounded-xl glass min-h-[90px]"
      />
      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setEditing(false)}
          className="h-7 text-[11px] rounded-lg"
        >
          Cancelar
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          className="h-7 text-[11px] rounded-lg bg-ig-gradient text-white"
        >
          Salvar
        </Button>
      </div>
    </div>
  ) : (
    <div
      onClick={() => setEditing(true)}
      className="cursor-pointer hover:bg-muted/20 p-2 rounded-xl transition-colors font-sans text-xs leading-relaxed text-foreground whitespace-pre-wrap"
      title="Clique para editar"
    >
      {content.text || "Clique para escrever..."}
    </div>
  );
}

// 2. CHECKLIST (Progresso %)
function ChecklistWidget({ note, onUpdate }: WidgetProps) {
  const content = note.content || {};
  const items: Array<{ id: string; text: string; done: boolean }> =
    content.items || [];
  const [newItemText, setNewItemText] = React.useState("");

  const total = items.length;
  const completed = items.filter((i) => i.done).length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const toggleItem = (itemId: string) => {
    const updated = items.map((i) =>
      i.id === itemId ? { ...i, done: !i.done } : i
    );
    onUpdate(note.id, { content: { ...content, items: updated } });
  };

  const addItem = () => {
    if (!newItemText.trim()) return;
    const newItem = {
      id: Date.now().toString(),
      text: newItemText.trim(),
      done: false,
    };
    onUpdate(note.id, {
      content: { ...content, items: [...items, newItem] },
    });
    setNewItemText("");
  };

  const removeItem = (itemId: string) => {
    const updated = items.filter((i) => i.id !== itemId);
    onUpdate(note.id, { content: { ...content, items: updated } });
  };

  return (
    <div className="space-y-3 font-mono">
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">Progresso</span>
          <span className="font-bold text-foreground">
            {completed}/{total} ({progress}%)
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-1.5 rounded-xl hover:bg-muted/30 transition-colors text-xs"
          >
            <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => toggleItem(item.id)}
                className="rounded border-border/70 text-primary focus:ring-0 size-3.5"
              />
              <span
                className={cn(
                  "truncate",
                  item.done
                    ? "line-through text-muted-foreground"
                    : "text-foreground font-medium"
                )}
              >
                {item.text}
              </span>
            </label>
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="text-muted-foreground hover:text-destructive text-[10px] ml-1 shrink-0 cursor-pointer"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Add item */}
      <div className="flex items-center gap-1.5 pt-1">
        <Input
          placeholder="Nova tarefa..."
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addItem();
            }
          }}
          className="h-7 text-xs rounded-xl glass border-border/50"
        />
        <Button
          type="button"
          size="sm"
          onClick={addItem}
          className="h-7 px-2.5 text-[11px] rounded-xl bg-ig-gradient text-white shrink-0"
        >
          Adicionar
        </Button>
      </div>
    </div>
  );
}

// 3. MAP (Mini Leaflet)
function MapWidget({ note, onUpdate }: WidgetProps) {
  const content = note.content || {};
  const lat = content.latitude || -23.561684;
  const lng = content.longitude || -46.655981;
  const label = content.label || "Localização";
  const placeNote = content.note || "";
  const directMapsUrl = (content.mapsUrl as string | undefined)?.trim() || "";
  const [editingDetails, setEditingDetails] = React.useState(false);
  const [noteText, setNoteText] = React.useState(placeNote);
  const [mapsUrlText, setMapsUrlText] = React.useState(directMapsUrl);

  const googleMapsQueryUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  const targetMapsUrl = directMapsUrl || googleMapsQueryUrl;

  const handleSaveDetails = () => {
    onUpdate(note.id, {
      content: {
        ...content,
        note: noteText.trim() || null,
        mapsUrl: mapsUrlText.trim() || null,
      },
    });
    setEditingDetails(false);
  };

  return (
    <div className="space-y-2">
      <DynamicMiniMap
        latitude={lat}
        longitude={lng}
        label={label}
        zoom={14}
        height="160px"
        mapsUrl={targetMapsUrl}
      />

      <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
        <span className="truncate pr-2 font-medium text-foreground" title={label}>
          {label}
        </span>
        <span className="shrink-0 font-mono">
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </span>
      </div>

      {/* Redirecionamento Google Maps */}
      <div className="flex items-center gap-1.5 pt-0.5">
        <a
          href={targetMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 h-8 px-3 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/30 hover:border-primary/50 text-xs font-semibold flex items-center justify-center gap-2 transition-all text-foreground group cursor-pointer shadow-xs"
          title="Abrir este local diretamente no Google Maps (rotas, satélite e Street View)"
        >
          <MapPin className="size-3.5 text-primary group-hover:scale-110 transition-transform shrink-0" />
          <span className="truncate">Ver no Google Maps</span>
          <ExternalLink className="size-3 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 ml-auto" />
        </a>

        {directMapsUrl && (
          <a
            href={googleMapsQueryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-8 px-2.5 rounded-xl glass border border-border/50 hover:border-border text-[11px] font-mono flex items-center gap-1 text-muted-foreground hover:text-foreground transition-all shrink-0"
            title="Abrir busca por coordenadas GPS no Google Maps"
          >
            <span>GPS</span>
            <ExternalLink className="size-2.5 opacity-60" />
          </a>
        )}
      </div>

      {/* Breve Nota / Observações sobre o lugar e Link Direto */}
      {editingDetails ? (
        <div className="space-y-2 pt-1 border-t border-border/30">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-muted-foreground flex items-center justify-between">
              <span>Link Direto Google Maps (Opcional)</span>
              <span className="text-[9px]">Tipo 2</span>
            </label>
            <Input
              value={mapsUrlText}
              onChange={(e) => setMapsUrlText(e.target.value)}
              placeholder="https://maps.app.goo.gl/..."
              className="text-xs h-7 rounded-lg glass font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-muted-foreground">
              Observações do Local
            </label>
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Adicione notas sobre este ponto de interesse..."
              className="text-xs rounded-xl glass min-h-[60px]"
            />
          </div>
          <div className="flex justify-end gap-1.5">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setNoteText(placeNote);
                setMapsUrlText(directMapsUrl);
                setEditingDetails(false);
              }}
              className="h-6 text-[10px] rounded-lg"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleSaveDetails}
              className="h-6 text-[10px] rounded-lg bg-ig-gradient text-white font-semibold"
            >
              Salvar
            </Button>
          </div>
        </div>
      ) : placeNote ? (
        <div
          onClick={() => {
            setNoteText(placeNote);
            setMapsUrlText(directMapsUrl);
            setEditingDetails(true);
          }}
          className="p-2.5 rounded-xl bg-muted/40 border border-border/50 text-xs text-foreground cursor-pointer hover:border-primary/50 transition-colors"
          title="Clique para editar observações e link do local"
        >
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
              Observações do Local:
            </p>
            <span className="text-[10px] text-muted-foreground hover:text-primary">Editar</span>
          </div>
          <p className="whitespace-pre-wrap leading-relaxed">{placeNote}</p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setNoteText("");
            setMapsUrlText(directMapsUrl);
            setEditingDetails(true);
          }}
          className="text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 font-mono pt-0.5 cursor-pointer"
        >
          <Plus className="size-3" />
          <span>Adicionar nota ou link direto...</span>
        </button>
      )}
    </div>
  );
}

// 4. LINK_PREVIEW (OpenGraph)
function LinkPreviewWidget({ note, onUpdate }: WidgetProps) {
  const content = note.content || {};
  const [fetching, setFetching] = React.useState(false);
  const [urlInput, setUrlInput] = React.useState(content.url || "");

  const handleRefreshOg = async () => {
    if (!urlInput.trim()) return;
    setFetching(true);
    try {
      const res = await fetchLinkPreviewAction(urlInput.trim());
      if (res.data) {
        onUpdate(note.id, {
          title: (res.data.title || note.title) ?? undefined,
          content: res.data,
        });
        toast.success("Preview OpenGraph atualizado!");
      }
    } catch {
      toast.error("Falha ao buscar preview.");
    } finally {
      setFetching(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Input
          placeholder="https://..."
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleRefreshOg();
            }
          }}
          className="h-7 text-xs rounded-xl glass border-border/50 font-mono"
        />
        <Button
          type="button"
          size="sm"
          disabled={fetching}
          onClick={handleRefreshOg}
          className="h-7 px-2.5 text-[11px] rounded-xl glass border-border/50 text-foreground shrink-0"
          title="Buscar preview"
        >
          {fetching ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <RefreshCw className="size-3" />
          )}
        </Button>
      </div>

      {content.url && (
        <a
          href={content.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-3 rounded-2xl bg-muted/20 border border-border/40 hover:border-primary/50 transition-all group overflow-hidden"
        >
          {content.image && (
            <img
              src={content.image}
              alt="Preview"
              className="w-full h-24 object-cover rounded-xl mb-2"
            />
          )}
          <p className="font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate">
            {content.title || content.url}
          </p>
          {content.description && (
            <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 font-sans">
              {content.description}
            </p>
          )}
          <span className="text-[10px] text-muted-foreground font-mono mt-1.5 flex items-center gap-1">
            <ExternalLink className="size-2.5" />
            {content.domain || content.url}
          </span>
        </a>
      )}
    </div>
  );
}

// 5. CODE_BLOCK
function CodeBlockWidget({ note, onUpdate }: WidgetProps) {
  const content = note.content || {};
  const [editing, setEditing] = React.useState(false);
  const [code, setCode] = React.useState(content.code || "");

  const handleSave = () => {
    onUpdate(note.id, { content: { ...content, code } });
    setEditing(false);
  };

  return editing ? (
    <div className="space-y-2 font-mono">
      <Textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="text-xs rounded-xl glass min-h-[110px] font-mono"
      />
      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setEditing(false)}
          className="h-7 text-[11px] rounded-lg"
        >
          Cancelar
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          className="h-7 text-[11px] rounded-lg bg-ig-gradient text-white"
        >
          Salvar
        </Button>
      </div>
    </div>
  ) : (
    <pre
      onClick={() => setEditing(true)}
      className="p-3 rounded-2xl bg-black/60 border border-border/50 text-foreground font-mono text-[11px] overflow-x-auto whitespace-pre-wrap cursor-pointer hover:border-primary/50 transition-colors"
      title="Clique para editar código"
    >
      {content.code || "// Insira código ou JSON aqui"}
    </pre>
  );
}

// 6. IMAGE
function ImageWidget({ note, onUpdate }: WidgetProps) {
  const content = note.content || {};
  const [url, setUrl] = React.useState(content.url || "");
  const [caption, setCaption] = React.useState(content.caption || "");
  const [editing, setEditing] = React.useState(!content.url);
  const [imgError, setImgError] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [zoom, setZoom] = React.useState(1);
  const editFileInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && lightboxOpen) {
        setLightboxOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen]);

  const handleSave = () => {
    onUpdate(note.id, { content: { url, caption } });
    setEditing(false);
    setImgError(false);
  };

  const handleEditUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setUrl(data.url);
        setImgError(false);
        toast.success("Foto atualizada!");
      } else {
        toast.error(data.error || "Falha no upload.");
      }
    } catch {
      toast.error("Erro interno ao enviar foto.");
    } finally {
      setUploading(false);
    }
  };

  return editing ? (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={editFileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleEditUpload}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={uploading}
          onClick={() => editFileInputRef.current?.click()}
          className="h-7 text-xs rounded-xl glass border-border/70 gap-1.5 shrink-0"
        >
          {uploading ? (
            <Loader2 className="size-3 animate-spin text-primary" />
          ) : (
            <Upload className="size-3 text-primary" />
          )}
          <span>Substituir Foto</span>
        </Button>
        <span className="text-[10px] text-muted-foreground font-mono truncate">ou URL abaixo:</span>
      </div>

      <Input
        placeholder="URL da imagem (/uploads/people/... ou https://)"
        value={url}
        onChange={(e) => {
          setUrl(e.target.value);
          setImgError(false);
        }}
        className="h-7 text-xs rounded-xl glass font-mono"
      />
      <Input
        placeholder="Legenda / descrição da foto..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="h-7 text-xs rounded-xl glass"
      />
      <div className="flex justify-end gap-2">
        {content.url && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setEditing(false)}
            className="h-7 text-[11px]"
          >
            Cancelar
          </Button>
        )}
        <Button
          size="sm"
          onClick={handleSave}
          disabled={uploading || !url.trim()}
          className="h-7 text-[11px] bg-ig-gradient text-white"
        >
          Salvar Imagem
        </Button>
      </div>
    </div>
  ) : (
    <div className="space-y-2">
      {imgError || !content.url ? (
        <div
          onClick={() => setEditing(true)}
          className="w-full min-h-[160px] rounded-2xl glass border border-destructive/30 bg-destructive/5 flex flex-col items-center justify-center p-3 text-center gap-1.5 cursor-pointer hover:border-primary/50 transition-colors"
        >
          <ImageIcon className="size-6 text-muted-foreground/60" />
          <span className="text-[11px] font-medium text-foreground">Foto não encontrada</span>
          <span className="text-[10px] text-muted-foreground truncate max-w-[220px] font-mono">
            {content.url || "Sem URL informada"}
          </span>
          <span className="text-[10px] text-primary underline mt-1">Clique para fazer upload</span>
        </div>
      ) : (
        <div className="relative group/img rounded-2xl overflow-hidden border border-border/40 bg-black/60 flex items-center justify-center">
          <img
            src={content.url}
            alt={content.caption || "Imagem da evidência"}
            onError={() => setImgError(true)}
            onClick={() => {
              setZoom(1);
              setLightboxOpen(true);
            }}
            className="w-full h-auto max-h-[380px] object-contain cursor-zoom-in transition-transform duration-300 group-hover/img:scale-[1.01]"
          />

          {/* Botões de Ação Overlay */}
          <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover/img:opacity-100 transition-opacity z-10">
            <Button
              type="button"
              size="icon"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                setZoom(1);
                setLightboxOpen(true);
              }}
              className="size-7 rounded-xl bg-black/70 hover:bg-black text-white border border-white/20 shadow-md backdrop-blur-md"
              title="Visualizar foto inteira em tela cheia"
            >
              <Maximize2 className="size-3.5" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                setEditing(true);
              }}
              className="size-7 rounded-xl bg-black/70 hover:bg-black text-white border border-white/20 shadow-md backdrop-blur-md"
              title="Editar / Substituir foto"
            >
              <Pencil className="size-3.5" />
            </Button>
          </div>

          <div
            onClick={() => {
              setZoom(1);
              setLightboxOpen(true);
            }}
            className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-[10px] text-white/90 border border-white/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center gap-1 cursor-pointer"
          >
            <Maximize2 className="size-3" />
            <span>Ver foto inteira</span>
          </div>
        </div>
      )}

      {content.caption && (
        <p className="text-[11px] text-muted-foreground font-sans text-center italic leading-relaxed px-1">
          {content.caption}
        </p>
      )}

      {/* Lightbox / Modal Tela Cheia da Imagem */}
      {lightboxOpen && content.url && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Header da Barra do Lightbox */}
          <div
            className="absolute top-4 inset-x-4 max-w-4xl mx-auto flex items-center justify-between text-white z-20 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <ImageIcon className="size-4 text-primary" />
              <span className="text-xs font-semibold truncate max-w-xs sm:max-w-md">
                {note.title || "Evidência Fotográfica"}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/20 rounded-2xl p-1 shadow-lg">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))))}
                className="size-8 rounded-xl text-white hover:bg-white/20"
                title="Diminuir Zoom"
              >
                <ZoomOut className="size-4" />
              </Button>
              <button
                type="button"
                onClick={() => setZoom(1)}
                className="text-[11px] font-mono px-2 py-1 text-white/80 hover:text-white"
                title="Resetar Zoom"
              >
                {Math.round(zoom * 100)}%
              </button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setZoom((z) => Math.min(3, Number((z + 0.25).toFixed(2))))}
                className="size-8 rounded-xl text-white hover:bg-white/20"
                title="Aumentar Zoom"
              >
                <ZoomIn className="size-4" />
              </Button>
              <a
                href={content.url}
                target="_blank"
                rel="noreferrer"
                className="size-8 rounded-xl flex items-center justify-center text-white hover:bg-white/20"
                title="Abrir imagem original"
              >
                <ExternalLink className="size-4" />
              </a>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setLightboxOpen(false)}
                className="size-8 rounded-xl text-white hover:bg-red-500/30 hover:text-red-300"
                title="Fechar (ESC)"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          {/* Imagem Centralizada com Zoom */}
          <div
            className="flex-1 w-full flex items-center justify-center overflow-auto p-4 cursor-default"
            onClick={(e) => {
              if (e.target === e.currentTarget) setLightboxOpen(false);
            }}
          >
            <img
              src={content.url}
              alt={content.caption || "Imagem em tamanho real"}
              style={{ transform: `scale(${zoom})`, transition: "transform 0.15s ease-out" }}
              className="max-w-[90vw] max-h-[80vh] object-contain rounded-xl shadow-2xl select-none"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Legenda Inferior */}
          {content.caption && (
            <div
              className="relative z-20 max-w-xl mx-auto px-4 py-2 rounded-2xl bg-black/70 backdrop-blur-md border border-white/20 text-center text-xs text-white/90 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {content.caption}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 7. VAULT (Exige senha local para revelar, resetar ou destruir)
function VaultWidget({ note, onUpdate }: WidgetProps) {
  const content = note.content || {};
  const [unlocked, setUnlocked] = React.useState(false);
  const [passwordInput, setPasswordInput] = React.useState("");
  const [error, setError] = React.useState(false);
  const [editingSecret, setEditingSecret] = React.useState(false);
  const [secretText, setSecretText] = React.useState(content.secret || "");

  const [definePassOpen, setDefinePassOpen] = React.useState(false);
  const [defPass, setDefPass] = React.useState("");
  const [defPassConfirm, setDefPassConfirm] = React.useState("");

  const [resetPassOpen, setResetPassOpen] = React.useState(false);
  const [currentPass, setCurrentPass] = React.useState("");
  const [newPass, setNewPass] = React.useState("");
  const [newPassConfirm, setNewPassConfirm] = React.useState("");

  const [destroyOpen, setDestroyOpen] = React.useState(false);

  const hasPassword = !!content.passwordHash;

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    const inputHash = await sha256(passwordInput);
    const isMatch = inputHash === content.passwordHash || passwordInput === content.passwordHash;
    if (isMatch) {
      setUnlocked(true);
      setError(false);
      setPasswordInput("");
      toast.success("Cofre desbloqueado!");
    } else {
      setError(true);
      toast.error("Senha incorreta.");
    }
  };

  const handleDefinePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (defPass.length < 4) {
      toast.error("A senha deve ter pelo menos 4 caracteres.");
      return;
    }
    if (defPass !== defPassConfirm) {
      toast.error("As senhas não coincidem.");
      return;
    }
    const hash = await sha256(defPass);
    onUpdate(note.id, { content: { ...content, passwordHash: hash } });
    setDefinePassOpen(false);
    setDefPass("");
    setDefPassConfirm("");
    toast.success("Senha do cofre configurada com sucesso!");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const curHash = await sha256(currentPass);
    const isCurMatch = curHash === content.passwordHash || currentPass === content.passwordHash;
    if (!isCurMatch) {
      toast.error("Senha atual incorreta.");
      return;
    }
    if (newPass.length < 4) {
      toast.error("A nova senha deve ter pelo menos 4 caracteres.");
      return;
    }
    if (newPass !== newPassConfirm) {
      toast.error("A nova senha e confirmação não coincidem.");
      return;
    }
    const newHash = await sha256(newPass);
    onUpdate(note.id, { content: { ...content, passwordHash: newHash } });
    setResetPassOpen(false);
    setCurrentPass("");
    setNewPass("");
    setNewPassConfirm("");
    toast.success("Senha do cofre redefinida com sucesso!");
  };

  const handleDestroyVault = () => {
    onUpdate(note.id, { content: { secret: "", passwordHash: "" } });
    setUnlocked(false);
    setDestroyOpen(false);
    setEditingSecret(false);
    setSecretText("");
    toast.success("Cofre destruído! Conteúdo apagado e senha resetada.");
  };

  const handleSaveSecret = () => {
    onUpdate(note.id, { content: { ...content, secret: secretText } });
    setEditingSecret(false);
    toast.success("Segredo do cofre atualizado!");
  };

  if (!hasPassword) {
    return (
      <div className="p-4 rounded-2xl bg-muted/20 border border-border/40 space-y-3 text-center">
        <Lock className="size-6 text-rose-400/80 mx-auto" />
        <p className="text-xs text-muted-foreground font-mono">
          Este cofre está vazio e não possui senha definida.
        </p>
        <Button
          type="button"
          size="sm"
          onClick={() => setDefinePassOpen(true)}
          className="h-8 rounded-xl bg-ig-gradient text-white text-xs font-semibold"
        >
          Definir Senha do Cofre
        </Button>

        {/* Dialog Definir Senha */}
        <Dialog open={definePassOpen} onOpenChange={setDefinePassOpen}>
          <DialogContent className="glass rounded-3xl border-border/60 max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold flex items-center gap-2">
                <Lock className="size-4 text-rose-400" />
                Definir Senha do Cofre
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Crie uma senha de proteção local para este cofre.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleDefinePassword} className="space-y-3 pt-2">
              <Input
                type="password"
                placeholder="Nova senha (mín. 4 caracteres)..."
                value={defPass}
                onChange={(e) => setDefPass(e.target.value)}
                className="h-9 rounded-xl glass text-xs"
                autoFocus
                required
              />
              <Input
                type="password"
                placeholder="Confirmar senha..."
                value={defPassConfirm}
                onChange={(e) => setDefPassConfirm(e.target.value)}
                className="h-9 rounded-xl glass text-xs"
                required
              />
              <DialogFooter className="gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setDefinePassOpen(false)}
                  className="rounded-xl text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="rounded-xl bg-ig-gradient text-white text-xs font-semibold"
                >
                  Salvar Senha
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return unlocked ? (
    <div className="space-y-3 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 font-mono text-xs">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-rose-400 font-bold flex items-center gap-1.5">
          <Unlock className="size-3.5" />
          Cofre Aberto
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setResetPassOpen(true)}
            className="h-6 px-2 text-[10px] rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Redefinir senha
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setDestroyOpen(true)}
            className="h-6 px-2 text-[10px] rounded-lg text-destructive hover:bg-destructive/10 cursor-pointer"
          >
            Destruir cofre
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setUnlocked(false)}
            className="h-6 px-2 text-[10px] rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Bloquear
          </Button>
        </div>
      </div>

      {editingSecret ? (
        <div className="space-y-2">
          <Textarea
            value={secretText}
            onChange={(e) => setSecretText(e.target.value)}
            className="text-xs rounded-xl glass min-h-[80px]"
          />
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditingSecret(false)}
              className="h-7 text-[11px]"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleSaveSecret}
              className="h-7 text-[11px] bg-ig-gradient text-white"
            >
              Salvar
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setEditingSecret(true)}
          className="p-2.5 rounded-xl bg-background/50 border border-border/40 font-mono text-xs font-semibold text-foreground whitespace-pre-wrap cursor-pointer"
          title="Clique para editar segredo"
        >
          {content.secret || "Nenhum segredo guardado (clique para adicionar)."}
        </div>
      )}

      {/* Dialog Redefinir Senha */}
      <Dialog open={resetPassOpen} onOpenChange={setResetPassOpen}>
        <DialogContent className="glass rounded-3xl border-border/60 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <RefreshCw className="size-4 text-primary" />
              Redefinir Senha do Cofre
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Informe a senha atual e defina a nova senha.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-3 pt-2">
            <Input
              type="password"
              placeholder="Senha atual..."
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              className="h-9 rounded-xl glass text-xs"
              required
            />
            <Input
              type="password"
              placeholder="Nova senha (min. 4 caracteres)..."
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className="h-9 rounded-xl glass text-xs"
              required
            />
            <Input
              type="password"
              placeholder="Confirmar nova senha..."
              value={newPassConfirm}
              onChange={(e) => setNewPassConfirm(e.target.value)}
              className="h-9 rounded-xl glass text-xs"
              required
            />
            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setResetPassOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                className="rounded-xl bg-ig-gradient text-white text-xs font-semibold"
              >
                Salvar Nova Senha
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* AlertDialog Destruir Cofre */}
      <AlertDialog open={destroyOpen} onOpenChange={setDestroyOpen}>
        <AlertDialogContent className="glass rounded-3xl border-border/60 max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold text-destructive flex items-center gap-2">
              <Trash2 className="size-4" />
              Destruir este cofre?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Esta ação apagará permanentemente o conteúdo secreto e resetará a senha para vazio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-2">
            <AlertDialogCancel className="rounded-xl text-xs">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDestroyVault}
              className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-semibold"
            >
              Destruir Cofre
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  ) : (
    <form
      onSubmit={handleUnlock}
      className="p-4 rounded-2xl bg-muted/20 border border-border/40 space-y-2 text-center"
    >
      <Lock className="size-6 text-rose-400/80 mx-auto" />
      <p className="text-[11px] text-muted-foreground">
        Conteúdo seguro. Digite a senha do cofre para desbloquear.
      </p>
      <div className="flex items-center gap-2 max-w-xs mx-auto pt-1">
        <Input
          type="password"
          placeholder="Senha do cofre..."
          value={passwordInput}
          onChange={(e) => {
            setPasswordInput(e.target.value);
            setError(false);
          }}
          className={cn(
            "h-8 text-xs rounded-xl glass font-mono",
            error && "border-destructive focus-visible:ring-destructive"
          )}
        />
        <Button
          type="submit"
          size="sm"
          className="h-8 rounded-xl bg-ig-gradient text-white text-xs font-semibold shrink-0"
        >
          Destrancar
        </Button>
      </div>
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setDestroyOpen(true)}
          className="text-[10px] text-muted-foreground hover:text-destructive transition-colors underline cursor-pointer"
        >
          Esqueceu a senha? Destruir cofre
        </button>
      </div>

      {/* AlertDialog Destruir Cofre se esquecida */}
      <AlertDialog open={destroyOpen} onOpenChange={setDestroyOpen}>
        <AlertDialogContent className="glass rounded-3xl border-border/60 max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold text-destructive flex items-center gap-2">
              <Trash2 className="size-4" />
              Destruir este cofre?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Se você esqueceu a senha, o cofre precisará ser destruído. Todo o conteúdo secreto será apagado e a senha resetada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-2">
            <AlertDialogCancel className="rounded-xl text-xs">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDestroyVault}
              className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-semibold"
            >
              Destruir e Resetar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}

// Widget Content Renderer Router
function WidgetContentRenderer({ note, onUpdate }: WidgetProps) {
  switch (note.type) {
    case "TEXT":
      return <TextWidget note={note} onUpdate={onUpdate} />;
    case "CHECKLIST":
      return <ChecklistWidget note={note} onUpdate={onUpdate} />;
    case "MAP":
      return <MapWidget note={note} onUpdate={onUpdate} />;
    case "LINK_PREVIEW":
      return <LinkPreviewWidget note={note} onUpdate={onUpdate} />;
    case "CODE_BLOCK":
      return <CodeBlockWidget note={note} onUpdate={onUpdate} />;
    case "IMAGE":
      return <ImageWidget note={note} onUpdate={onUpdate} />;
    case "VAULT":
      return <VaultWidget note={note} onUpdate={onUpdate} />;
    default:
      return null;
  }
}
