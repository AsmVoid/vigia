"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  UserPlus,
  FolderPlus,
  Edit2,
  Folder,
  Users,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { PersonCard, PersonCardData } from "@/components/tree/person-card";
import { GroupDialog, GroupItem, GROUP_ICONS } from "@/components/groups/group-dialog";
import { ZeroState } from "@/components/dashboard/widgets/zero-state";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "motion/react";

export interface TreeGroupData {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  entities: PersonCardData[];
}

interface TreeClientProps {
  groups: TreeGroupData[];
  unassignedEntities?: PersonCardData[];
}

export function TreeClient({ groups, unassignedEntities = [] }: TreeClientProps) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [search, setSearch] = React.useState("");
  const [groupDialogOpen, setGroupDialogOpen] = React.useState(false);
  const [editingGroup, setEditingGroup] = React.useState<GroupItem | null>(null);

  // Por padrão, todas as pastas da Árvore de Dados iniciam FECHADAS (colapsadas)
  const [openAccordionValues, setOpenAccordionValues] = React.useState<string[]>([]);

  // Filter entities by name
  const filteredGroups = React.useMemo(() => {
    if (!search.trim()) return groups;
    const q = search.toLowerCase();
    return groups
      .map((group) => {
        const matches = group.entities.filter((entity) =>
          entity.fullName.toLowerCase().includes(q)
        );
        return { ...group, entities: matches };
      })
      .filter((group) => group.entities.length > 0);
  }, [groups, search]);

  const filteredUnassigned = React.useMemo(() => {
    if (!search.trim()) return unassignedEntities;
    const q = search.toLowerCase();
    return unassignedEntities.filter((e) =>
      e.fullName.toLowerCase().includes(q)
    );
  }, [unassignedEntities, search]);

  const totalPeople = React.useMemo(() => {
    const fromGroups = groups.reduce((acc, g) => acc + g.entities.length, 0);
    return fromGroups + unassignedEntities.length;
  }, [groups, unassignedEntities]);

  const handleOpenCreateGroup = () => {
    setEditingGroup(null);
    setGroupDialogOpen(true);
  };

  const handleOpenEditGroup = (e: React.MouseEvent, group: TreeGroupData) => {
    e.stopPropagation(); // prevent accordion toggle
    setEditingGroup({
      id: group.id,
      name: group.name,
      description: group.description,
      color: group.color,
      icon: group.icon,
    });
    setGroupDialogOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header with title and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <span className="text-ig-gradient">Árvore de Dados</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-mono font-bold bg-primary/10 text-primary border border-primary/30">
              {totalPeople} {totalPeople === 1 ? "pessoa" : "pessoas"}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Hierarquia de grupos, organizações e dossiês de pessoas físicas monitoradas.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            asChild
            className="rounded-2xl bg-ig-gradient hover:opacity-90 text-white shadow-md glow-ig-sm text-xs font-semibold gap-1.5 h-10 px-4"
          >
            <Link href="/entity/new">
              <UserPlus className="size-4" />
              <span>Nova Pessoa</span>
            </Link>
          </Button>

          <Button
            variant="outline"
            onClick={handleOpenCreateGroup}
            className="rounded-2xl border-border/60 glass hover:border-primary/40 hover:glow-ig-sm text-xs font-semibold gap-1.5 h-10 px-4"
          >
            <FolderPlus className="size-4 text-primary" />
            <span>+ Novo Grupo</span>
          </Button>
        </div>
      </div>

      {/* Realtime Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome da pessoa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 rounded-2xl glass border-border/60 text-xs"
          />
        </div>
      </div>

      {/* Accordion List of Groups */}
      {filteredGroups.length === 0 && filteredUnassigned.length === 0 ? (
        <ZeroState
          icon={Users}
          message={search ? "Nenhuma pessoa encontrada" : "Nenhum dado cadastrado"}
          submessage={
            search
              ? "Tente outro nome para a busca."
              : "Comece criando um grupo ou adicionando uma nova pessoa ao dossiê."
          }
        />
      ) : (
        <Accordion
          type="multiple"
          value={openAccordionValues}
          onValueChange={setOpenAccordionValues}
          className="space-y-4"
        >
          {filteredGroups.map((group) => {
            const IconComp = GROUP_ICONS[group.icon] || Folder;
            const count = group.entities.length;

            return (
              <AccordionItem
                key={group.id}
                value={group.id}
                className="rounded-3xl glass border border-border/50 overflow-hidden shadow-xs"
              >
                <AccordionHeader className="flex items-center justify-between w-full px-5 sm:px-6 py-4 hover:bg-muted/30 transition-colors">
                  <AccordionTrigger className="flex-1 py-0 hover:no-underline group">
                    <div className="flex items-center gap-3 min-w-0 text-left">
                      <div
                        className="size-9 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0"
                        style={{ backgroundColor: group.color }}
                      >
                        <IconComp className="size-4" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base text-foreground truncate">
                            {group.name}
                          </span>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold shrink-0">
                            {count} {count === 1 ? "pessoa" : "pessoas"}
                          </span>
                        </div>
                        {group.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-md hidden sm:block">
                            {group.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleOpenEditGroup(e, group)}
                      className="h-8 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-background/50 px-2.5 gap-1.5"
                      title="Editar Grupo"
                    >
                      <Edit2 className="size-3.5" />
                      <span className="hidden md:inline">Editar</span>
                    </Button>
                  </div>
                </AccordionHeader>

                <AccordionContent className="px-5 sm:px-6 pb-6 pt-2 border-t border-border/30">
                  {group.entities.length === 0 ? (
                    <div className="py-6 text-center text-xs text-muted-foreground font-mono">
                      Nenhuma pessoa cadastrada neste grupo ainda.
                    </div>
                  ) : (
                    <motion.div
                      layout
                      initial={shouldReduceMotion ? false : "hidden"}
                      animate="visible"
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: {
                            staggerChildren: shouldReduceMotion ? 0 : 0.05,
                          },
                        },
                      }}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pt-2"
                    >
                      {group.entities.map((person) => (
                        <motion.div
                          key={person.id}
                          layout
                          variants={{
                            hidden: { opacity: 0, y: 12, scale: 0.98 },
                            visible: {
                              opacity: 1,
                              y: 0,
                              scale: 1,
                              transition: { type: "spring", stiffness: 350, damping: 25 },
                            },
                          }}
                        >
                          <PersonCard person={person} />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}

          {/* Unassigned entities section if any */}
          {filteredUnassigned.length > 0 && (
            <AccordionItem
              value="unassigned"
              className="rounded-3xl glass border border-border/50 overflow-hidden shadow-xs"
            >
              <AccordionTrigger className="px-5 sm:px-6 py-4 hover:no-underline hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between w-full pr-4 text-left">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl flex items-center justify-center bg-muted text-muted-foreground shadow-xs shrink-0">
                      <Users className="size-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-foreground">
                          Sem Grupo / Não Alocados
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border font-semibold">
                          {filteredUnassigned.length} pessoa(s)
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Entidades sem vinculação direta a uma organização ou família.
                      </p>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-5 sm:px-6 pb-6 pt-2 border-t border-border/30">
                <motion.div
                  layout
                  initial={shouldReduceMotion ? false : "hidden"}
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: shouldReduceMotion ? 0 : 0.05,
                      },
                    },
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pt-2"
                >
                  {filteredUnassigned.map((person) => (
                    <motion.div
                      key={person.id}
                      layout
                      variants={{
                        hidden: { opacity: 0, y: 12, scale: 0.98 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          scale: 1,
                          transition: { type: "spring", stiffness: 350, damping: 25 },
                        },
                      }}
                    >
                      <PersonCard person={person} />
                    </motion.div>
                  ))}
                </motion.div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      )}

      {/* Group Dialog */}
      <GroupDialog
        open={groupDialogOpen}
        onOpenChange={setGroupDialogOpen}
        groupToEdit={editingGroup}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
