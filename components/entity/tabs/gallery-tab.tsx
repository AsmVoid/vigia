"use client";

import * as React from "react";
import {
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  Trash2,
  Maximize2,
  Minimize2,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Plus,
  Filter,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
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
  createMediaAction,
  deleteMediaAction,
  reorderMediaAction,
} from "@/app/(dashboard)/entity/actions";
import { cn } from "@/lib/utils";

export interface MediaItemData {
  id: string;
  entityId: string;
  filename: string;
  originalName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  type: "IMAGE" | "VIDEO" | "DOCUMENT";
  sortOrder: number;
  createdAt: string | Date;
}

interface GalleryTabProps {
  entityId: string;
  initialMedia: MediaItemData[];
}

export function GalleryTab({ entityId, initialMedia }: GalleryTabProps) {
  const shouldReduceMotion = useReducedMotion();
  const [items, setItems] = React.useState<MediaItemData[]>(initialMedia || []);
  const [filter, setFilter] = React.useState<"ALL" | "IMAGE" | "VIDEO">("ALL");
  const [uploading, setUploading] = React.useState(false);
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<MediaItemData | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  // Estados de controle interativo do Lightbox
  const [zoom, setZoom] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);
  const [playbackRate, setPlaybackRate] = React.useState(1);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Reset zoom e rotação ao trocar de item no lightbox
  React.useEffect(() => {
    setZoom(1);
    setRotation(0);
    setPlaybackRate(1);
  }, [lightboxIndex]);

  // Atualizar velocidade de reprodução do vídeo
  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate, lightboxIndex]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(3.5, Number((prev + 0.25).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.5, Number((prev - 0.25).toFixed(2))));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Atalhos de teclado no lightbox
  React.useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxIndex(null);
      } else if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) =>
          prev !== null ? (prev > 0 ? prev - 1 : (items.length - 1)) : null
        );
      } else if (e.key === "ArrowRight") {
        setLightboxIndex((prev) =>
          prev !== null ? (prev < items.length - 1 ? prev + 1 : 0) : null
        );
      } else if (e.key === "+" || e.key === "=") {
        setZoom((prev) => Math.min(3.5, Number((prev + 0.25).toFixed(2))));
      } else if (e.key === "-" || e.key === "_") {
        setZoom((prev) => Math.max(0.5, Number((prev - 0.25).toFixed(2))));
      } else if (e.key === "0") {
        setZoom(1);
        setRotation(0);
      } else if (e.key === "r" || e.key === "R") {
        setRotation((prev) => (prev + 90) % 360);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, items.length]);

  // Sync with initial media updates
  React.useEffect(() => {
    setItems(initialMedia || []);
  }, [initialMedia]);

  // Filtered items
  const filteredItems = React.useMemo(() => {
    if (filter === "ALL") return items;
    return items.filter((item) => item.type === filter);
  }, [items, filter]);

  const handleUploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVideo = file.type.startsWith("video/");
      const maxMb = isVideo ? 200 : 50;

      if (file.size > maxMb * 1024 * 1024) {
        toast.error(
          `${isVideo ? "Vídeo" : "Imagem"} "${file.name}" excede o limite de ${maxMb}MB.`
        );
        continue;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          throw new Error(errData.error || "Falha no upload");
        }

        const data = await uploadRes.json();

        const actionRes = await createMediaAction(entityId, {
          filename: data.url,
          originalName: file.name,
          mimeType: file.type,
          fileSize: file.size,
          type: isVideo ? "VIDEO" : "IMAGE",
        });

        if (actionRes.success && actionRes.media) {
          setItems((prev) => [
            ...prev,
            {
              ...actionRes.media!,
              createdAt: new Date(actionRes.media!.createdAt).toISOString(),
            },
          ]);
          successCount++;
        } else {
          toast.error(actionRes.error || "Erro ao vincular mídia à pessoa.");
        }
      } catch (err: any) {
        console.error("Erro ao enviar arquivo:", err);
        toast.error(err.message || "Erro no upload do arquivo.");
      }
    }

    setUploading(false);
    if (successCount > 0) {
      toast.success(`${successCount} arquivo(s) adicionado(s) à galeria!`);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  const handleDeleteMedia = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      const res = await deleteMediaAction(deleteTarget.id);
      if (res.success) {
        setItems((prev) => prev.filter((item) => item.id !== deleteTarget.id));
        toast.success("Mídia excluída com sucesso.");
        setDeleteTarget(null);
        if (lightboxIndex !== null) setLightboxIndex(null);
      } else {
        toast.error(res.error || "Falha ao excluir mídia.");
      }
    } catch {
      toast.error("Erro inesperado ao excluir.");
    } finally {
      setDeleting(false);
    }
  };

  // Keyboard navigation for Lightbox
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) =>
          prev !== null ? (prev > 0 ? prev - 1 : filteredItems.length - 1) : null
        );
      }
      if (e.key === "ArrowRight") {
        setLightboxIndex((prev) =>
          prev !== null ? (prev < filteredItems.length - 1 ? prev + 1 : 0) : null
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, filteredItems.length]);

  const currentLightboxItem =
    lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  return (
    <div className="space-y-6">
      {/* Top Header & Controls */}
      <div className="glass rounded-3xl p-5 border-border/50 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-ig-gradient text-white shadow-sm">
              <ImageIcon className="size-4" />
            </span>
            Galeria Investigativa ({items.length})
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Acervo visual de inteligência, fotos de vigilância, prints e vídeos de alvos.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-2xl bg-muted/40 border border-border/50 text-xs font-mono">
            <button
              type="button"
              onClick={() => setFilter("ALL")}
              className={cn(
                "px-3 py-1 rounded-xl transition-all",
                filter === "ALL"
                  ? "bg-ig-gradient text-white font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Todos ({items.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("IMAGE")}
              className={cn(
                "px-3 py-1 rounded-xl transition-all",
                filter === "IMAGE"
                  ? "bg-ig-gradient text-white font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Fotos ({items.filter((i) => i.type === "IMAGE").length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("VIDEO")}
              className={cn(
                "px-3 py-1 rounded-xl transition-all",
                filter === "VIDEO"
                  ? "bg-ig-gradient text-white font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Vídeos ({items.filter((i) => i.type === "VIDEO").length})
            </button>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="rounded-2xl bg-ig-gradient hover:opacity-90 text-white shadow-md glow-ig-sm text-xs font-semibold h-9 gap-1.5 shrink-0"
          >
            {uploading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Plus className="size-3.5" />
            )}
            <span>Adicionar</span>
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => handleUploadFiles(e.target.files)}
          />
        </div>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-3xl p-6 transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer group",
          uploading
            ? "border-primary bg-primary/10"
            : "border-border/60 hover:border-primary/60 hover:bg-muted/20 glass"
        )}
      >
        <div className="p-3 rounded-2xl bg-muted/50 border border-border/50 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all mb-2">
          {uploading ? (
            <Loader2 className="size-6 animate-spin text-primary" />
          ) : (
            <Upload className="size-6" />
          )}
        </div>
        <p className="text-xs font-bold text-foreground">
          {uploading
            ? "Processando arquivos e otimizando..."
            : "Arraste e solte fotos ou vídeos aqui, ou clique para selecionar"}
        </p>
        <p className="text-[11px] text-muted-foreground font-mono mt-1">
          Suporta fotos (JPG, PNG, WEBP até 50MB) e vídeos (MP4, WEBM, MOV até 200MB)
        </p>
      </div>

      {/* Pinterest-style Masonry Grid */}
      {filteredItems.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center text-muted-foreground border-border/40 space-y-2">
          <ImageIcon className="size-10 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-sm font-bold text-foreground">Nenhuma mídia encontrada</p>
          <p className="text-xs max-w-sm mx-auto">
            Faça upload de fotos ou vídeos para começar a documentar os registros visuais desta pessoa.
          </p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          <AnimatePresence>
            {filteredItems.map((item, index) => {
              const isVideo = item.type === "VIDEO";

              return (
                <motion.div
                  key={item.id}
                  layoutId={`gallery-item-${item.id}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="break-inside-avoid relative group rounded-3xl overflow-hidden glass border border-border/60 hover:border-primary/60 hover:glow-ig-sm transition-all duration-300 shadow-sm bg-card/40"
                >
                  {isVideo ? (
                    <video
                      src={item.filename}
                      className="w-full object-cover rounded-3xl max-h-[360px]"
                      controls={false}
                    />
                  ) : (
                    <img
                      src={item.filename}
                      alt={item.originalName || "Mídia do dossiê"}
                      loading="lazy"
                      className="w-full object-cover rounded-3xl transition-transform duration-500 group-hover:scale-105"
                    />
                  )}

                  {/* Type badge */}
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <span className="px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-mono text-white flex items-center gap-1 border border-white/10">
                      {isVideo ? (
                        <>
                          <VideoIcon className="size-2.5" />
                          <span>Vídeo</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="size-2.5" />
                          <span>Foto</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Hover Overlay Controls */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-4 flex flex-col justify-between rounded-3xl">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(item)}
                        className="size-8 rounded-xl bg-black/50 hover:bg-destructive text-white hover:text-white backdrop-blur-md"
                        title="Excluir Mídia"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="truncate pr-2">
                        <p className="text-xs font-bold text-white truncate">
                          {item.originalName || "Sem título"}
                        </p>
                        <p className="text-[10px] text-white/70 font-mono">
                          {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>

                      <Button
                        type="button"
                        size="icon"
                        onClick={() => setLightboxIndex(index)}
                        className="size-8 rounded-xl bg-ig-gradient text-white shadow-md glow-ig-sm shrink-0"
                        title="Expandir em tela cheia"
                      >
                        <Maximize2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Lightbox Fullscreen Modal */}
      <AnimatePresence>
        {currentLightboxItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-6"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between text-white z-10">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-white/70 px-2.5 py-1 rounded-lg bg-white/10 border border-white/10">
                  {lightboxIndex! + 1} de {filteredItems.length}
                </span>
                <span className="text-sm font-bold truncate max-w-sm sm:max-w-md">
                  {currentLightboxItem.originalName || "Visualização de Mídia"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={currentLightboxItem.filename}
                  download={currentLightboxItem.originalName || "download"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Baixar original"
                >
                  <Download className="size-4" />
                </a>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setLightboxIndex(null)}
                  className="size-9 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                  title="Fechar (Esc)"
                >
                  <X className="size-5" />
                </Button>
              </div>
            </div>

            {/* Central Media Viewer com Zoom, Pan e Rotação */}
            <div
              className="relative flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden select-none"
              onWheel={(e) => {
                if (e.deltaY < 0) {
                  setZoom((prev) => Math.min(3.5, Number((prev + 0.15).toFixed(2))));
                } else {
                  setZoom((prev) => Math.max(0.5, Number((prev - 0.15).toFixed(2))));
                }
              }}
            >
              {/* Prev Button */}
              {filteredItems.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setLightboxIndex((prev) =>
                      prev !== null ? (prev > 0 ? prev - 1 : filteredItems.length - 1) : null
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 size-12 rounded-2xl bg-white/10 hover:bg-white/25 text-white backdrop-blur-md z-20 cursor-pointer"
                  title="Anterior (←)"
                >
                  <ChevronLeft className="size-6" />
                </Button>
              )}

              {/* Media Element com Arraste (drag), Zoom e Rotação */}
              <motion.div
                drag={zoom > 1}
                dragConstraints={{
                  left: -350 * (zoom - 1),
                  right: 350 * (zoom - 1),
                  top: -250 * (zoom - 1),
                  bottom: 250 * (zoom - 1),
                }}
                dragElastic={0.08}
                animate={{
                  scale: zoom,
                  rotate: rotation,
                }}
                transition={{ type: "spring", stiffness: 320, damping: 25 }}
                className={cn(
                  "max-w-5xl max-h-[72vh] flex items-center justify-center select-none",
                  zoom > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-default"
                )}
                onDoubleClick={() => {
                  setZoom((prev) => (prev > 1 ? 1 : 2));
                }}
              >
                {currentLightboxItem.type === "VIDEO" ? (
                  <video
                    ref={videoRef}
                    src={currentLightboxItem.filename}
                    controls
                    autoPlay
                    className="max-h-[70vh] max-w-full rounded-2xl shadow-2xl pointer-events-auto"
                  />
                ) : (
                  <img
                    src={currentLightboxItem.filename}
                    alt={currentLightboxItem.originalName || "Visualização ampliada"}
                    className="max-h-[70vh] max-w-full object-contain rounded-2xl shadow-2xl select-none pointer-events-none"
                    draggable={false}
                  />
                )}
              </motion.div>

              {/* Next Button */}
              {filteredItems.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setLightboxIndex((prev) =>
                      prev !== null ? (prev < filteredItems.length - 1 ? prev + 1 : 0) : null
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 size-12 rounded-2xl bg-white/10 hover:bg-white/25 text-white backdrop-blur-md z-20 cursor-pointer"
                  title="Próxima (→)"
                >
                  <ChevronRight className="size-6" />
                </Button>
              )}
            </div>

            {/* Barra Flutuante de Ferramentas e Interatividade */}
            <div className="flex flex-col items-center gap-2 z-20">
              <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-black/70 border border-white/20 backdrop-blur-xl shadow-2xl text-white">
                {/* Zoom Out */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomOut}
                  className="size-8 rounded-xl hover:bg-white/15 text-white"
                  title="Diminuir zoom (-)"
                >
                  <ZoomOut className="size-4" />
                </Button>

                {/* Reset / Percentual */}
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="px-2.5 py-1 text-xs font-mono font-bold hover:bg-white/15 rounded-lg transition-colors text-white"
                  title="Clique para resetar (100%)"
                >
                  {Math.round(zoom * 100)}%
                </button>

                {/* Zoom In */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomIn}
                  className="size-8 rounded-xl hover:bg-white/15 text-white"
                  title="Aumentar zoom (+)"
                >
                  <ZoomIn className="size-4" />
                </Button>

                <div className="w-px h-4 bg-white/20 my-auto mx-0.5" />

                {/* Rotacionar */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleRotate}
                  className="size-8 rounded-xl hover:bg-white/15 text-white"
                  title="Girar 90° (R)"
                >
                  <RotateCw className="size-4" />
                </Button>

                {/* Reset Geral */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleResetZoom}
                  className="size-8 rounded-xl hover:bg-white/15 text-white"
                  title="Resetar visualização (0)"
                >
                  <RotateCcw className="size-4" />
                </Button>

                {/* Velocidade de Reprodução do Vídeo */}
                {currentLightboxItem.type === "VIDEO" && (
                  <>
                    <div className="w-px h-4 bg-white/20 my-auto mx-0.5" />
                    <div className="flex items-center gap-1 text-[11px] font-mono px-1">
                      {[0.5, 1, 1.5, 2].map((speed) => (
                        <button
                          key={speed}
                          type="button"
                          onClick={() => setPlaybackRate(speed)}
                          className={cn(
                            "px-2 py-0.5 rounded-lg font-bold transition-all",
                            playbackRate === speed
                              ? "bg-primary text-white shadow-sm"
                              : "text-white/70 hover:bg-white/15 hover:text-white"
                          )}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <div className="w-px h-4 bg-white/20 my-auto mx-0.5" />

                {/* Tela Cheia */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleFullscreen}
                  className="size-8 rounded-xl hover:bg-white/15 text-white"
                  title="Alternar Tela Cheia"
                >
                  {isFullscreen ? (
                    <Minimize2 className="size-4" />
                  ) : (
                    <Maximize2 className="size-4" />
                  )}
                </Button>
              </div>

              {/* Informações detalhadas do arquivo */}
              <div className="text-center text-xs font-mono text-white/60 pb-1">
                <span>{currentLightboxItem.mimeType || "Arquivo"}</span>
                {currentLightboxItem.fileSize && (
                  <span> • {(currentLightboxItem.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                )}
                <span> • {new Date(currentLightboxItem.createdAt).toLocaleString("pt-BR")}</span>
                <span className="hidden sm:inline"> • Scroll ou duplo clique para ampliar • Arraste com zoom</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Media AlertDialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="glass rounded-3xl border-border/60 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold">
              Excluir este arquivo da galeria?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Esta ação removerá o arquivo de mídia permanentemente do dossiê.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel disabled={deleting} className="rounded-2xl text-xs">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteMedia();
              }}
              disabled={deleting}
              className="rounded-2xl bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-semibold gap-1.5"
            >
              {deleting ? (
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
    </div>
  );
}
