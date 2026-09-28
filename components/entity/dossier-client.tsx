"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  Sparkles,
  GitFork,
  Zap,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PersonProfile, CommonPersonItem } from "@/components/entity/person-profile";
import { InformationTab } from "@/components/entity/tabs/information-tab";
import { GalleryTab, MediaItemData } from "@/components/entity/tabs/gallery-tab";
import { NotesCanvasTab, NoteWidgetData } from "@/components/entity/tabs/notes-canvas-tab";
import { EntityGraph } from "@/components/entity/graph/entity-graph";
import { enrichEntityAction } from "@/app/(dashboard)/entity/actions";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface DossierClientProps {
  entity: any;
  completeness: number;
  commonPeople: CommonPersonItem[];
  media: MediaItemData[];
  notes: NoteWidgetData[];
}

export function DossierClient({
  entity,
  completeness,
  commonPeople,
  media,
  notes,
}: DossierClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<"info" | "gallery" | "notes" | "graph">("info");
  const [isEnriching, setIsEnriching] = React.useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleEnrich = async () => {
    setIsEnriching(true);
    toast.info("Iniciando enriquecimento OSINT (BrasilAPI / ViaCEP / HIBP)...");
    try {
      const res = await enrichEntityAction(entity.id);
      if (res.success) {
        toast.success(
          `Enriquecimento concluído! ${res.jobsEnriched || 0} vínculos CNPJ e ${res.addressesEnriched || 0} endereços atualizados.`
        );
        router.refresh();
      } else {
        toast.error(res.error || "Falha no enriquecimento OSINT.");
      }
    } catch {
      toast.error("Erro ao conectar aos serviços de inteligência OSINT.");
    } finally {
      setIsEnriching(false);
    }
  };

  const tabsConfig = [
    { id: "info", label: "Informações", icon: FileText },
    { id: "gallery", label: `Galeria (${media.length})`, icon: ImageIcon },
    { id: "notes", label: `NOTAS (${notes.length})`, icon: Sparkles },
    { id: "graph", label: "Grafo", icon: GitFork },
  ] as const;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Link
            href="/tree"
            className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Árvore de Dados
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate max-w-[220px]">
            {entity.fullName}
          </span>
          <span>/</span>
          <span className="text-muted-foreground font-mono">Dossiê OSINT</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isEnriching}
            onClick={handleEnrich}
            className="h-8 rounded-xl glass border-border/60 hover:border-primary text-xs font-semibold gap-1.5 shadow-sm text-foreground active:scale-95 transition-all"
            title="Consultar BrasilAPI (CNPJ) e validar dados abertos"
          >
            {isEnriching ? (
              <Loader2 className="size-3.5 animate-spin text-primary" />
            ) : (
              <Zap className="size-3.5 text-amber-400" />
            )}
            <span>{isEnriching ? "Enriquecendo..." : "Enriquecer OSINT"}</span>
          </Button>

          <Link
            href={`/entity/${entity.id}/graph`}
            className="h-8 px-3 rounded-xl glass border border-border/60 hover:border-primary text-xs font-semibold flex items-center gap-1.5 transition-all text-foreground active:scale-95"
            title="Visualizar Grafo em tela dedicada"
          >
            <GitFork className="size-3.5 text-primary" />
            <span>Grafo ↗</span>
          </Link>
        </div>
      </div>

      {/* Main Split-View Grid: ESQUERDA (~35%) | DIREITA (~65%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna ESQUERDA: person-profile (~35%) */}
        <motion.aside
          initial={shouldReduceMotion ? false : { opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="lg:col-span-4 xl:col-span-4 space-y-6"
        >
          <PersonProfile
            entity={entity}
            completeness={completeness}
            commonPeople={commonPeople}
          />
        </motion.aside>

        {/* Coluna DIREITA: info-view (~65%) */}
        <motion.main
          initial={shouldReduceMotion ? false : { opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
          className="lg:col-span-8 xl:col-span-8 space-y-6 min-w-0"
        >
          <div className="w-full space-y-6 flex flex-col">
            {/* Animated Tab Bar with layoutId pill */}
            <div className="glass rounded-2xl p-1.5 border border-border/50 shadow-sm inline-flex w-fit max-w-full">
              <div className="bg-transparent p-0 gap-1.5 flex flex-wrap items-center h-auto w-auto">
                {tabsConfig.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const Icon = tab.icon;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "relative rounded-xl text-xs font-semibold gap-2 px-4 h-9 inline-flex items-center justify-center transition-all cursor-pointer select-none",
                        isActive
                          ? "text-foreground font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="dossier-tab-pill"
                          className="absolute inset-0 bg-background dark:bg-card/90 rounded-xl shadow-xs border border-border/80"
                          transition={{
                            type: "spring",
                            stiffness: 350,
                            damping: 28,
                          }}
                        >
                          <div className="absolute bottom-0 left-2.5 right-2.5 h-[2.5px] bg-ig-gradient rounded-full" />
                        </motion.div>
                      )}
                      <Icon className="size-3.5 relative z-10" />
                      <span className="relative z-10">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Smooth Tab Content Switch with AnimatePresence */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{
                  opacity: 0,
                  y: shouldReduceMotion ? 0 : 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: shouldReduceMotion ? 0 : -8,
                }}
                transition={{
                  duration: 0.18,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {activeTab === "info" && <InformationTab entity={entity} />}
                {activeTab === "gallery" && (
                  <GalleryTab entityId={entity.id} initialMedia={media} />
                )}
                {activeTab === "notes" && (
                  <NotesCanvasTab entityId={entity.id} initialNotes={notes} />
                )}
                {activeTab === "graph" && (
                  <EntityGraph entity={entity} height="650px" />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.main>
      </div>
    </div>
  );
}
