"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Search, Folder, MoreVertical, Edit2, Trash2, ArrowUpRight, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GroupDialog, GroupItem, GROUP_ICONS } from "@/components/groups/group-dialog";
import { DeleteGroupDialog } from "@/components/groups/delete-group-dialog";
import { ZeroState } from "@/components/dashboard/widgets/zero-state";
import { useRouter } from "next/navigation";

interface GroupsClientProps {
  groups: GroupItem[];
}

export function GroupsClient({ groups }: GroupsClientProps) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingGroup, setEditingGroup] = React.useState<GroupItem | null>(null);
  const [deletingGroup, setDeletingGroup] = React.useState<GroupItem | null>(null);

  const filteredGroups = React.useMemo(() => {
    if (!search.trim()) return groups;
    const q = search.toLowerCase();
    return groups.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        (g.description && g.description.toLowerCase().includes(q))
    );
  }, [groups, search]);

  const handleOpenCreate = () => {
    setEditingGroup(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (group: GroupItem) => {
    setEditingGroup(group);
    setDialogOpen(true);
  };

  const handleOpenDelete = (group: GroupItem) => {
    setDeletingGroup(group);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <span className="text-ig-gradient">Grupos & Organizações</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-mono font-bold bg-primary/10 text-primary border border-primary/30">
              {groups.length} {groups.length === 1 ? "grupo" : "grupos"}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Clusters organizacionais, redes familiares e núcleos operacionais.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleOpenCreate}
            className="rounded-2xl bg-ig-gradient hover:opacity-90 text-white shadow-md glow-ig-sm text-xs font-semibold gap-1.5 h-10 px-4"
          >
            <Plus className="size-4" />
            <span>+ Novo Grupo</span>
          </Button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar grupo pelo nome ou descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 rounded-2xl glass border-border/60 text-xs"
          />
        </div>
      </div>

      {/* Groups Grid */}
      {filteredGroups.length === 0 ? (
        <ZeroState
          icon={Folder}
          message={search ? "Nenhum grupo encontrado" : "Nenhum grupo cadastrado"}
          submessage={
            search
              ? "Tente outro termo de busca."
              : "Crie o primeiro grupo para começar a organizar as entidades na árvore."
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredGroups.map((group) => {
            const IconComp = GROUP_ICONS[group.icon] || Folder;
            const entityCount = group._count?.entities || 0;

            return (
              <div
                key={group.id}
                className="group relative flex flex-col justify-between rounded-3xl p-5 sm:p-6 glass border border-border/50 hover:glow-ig-sm hover:border-primary/40 transition-all duration-300"
              >
                {/* Top bar with color badge & dropdown actions */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="size-11 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0 transition-transform group-hover:scale-105"
                      style={{ backgroundColor: group.color }}
                    >
                      <IconComp className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base font-bold text-foreground truncate">
                        {group.name}
                      </h2>
                      <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Users className="size-3 text-primary" />
                        {entityCount} {entityCount === 1 ? "pessoa" : "pessoas"}
                      </span>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-xl text-muted-foreground hover:text-foreground glass border-border/40"
                      >
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="glass border-border/70 rounded-2xl p-1.5 backdrop-blur-xl"
                    >
                      <DropdownMenuItem
                        onClick={() => handleOpenEdit(group)}
                        className="rounded-xl cursor-pointer text-xs focus:bg-primary/10"
                      >
                        <Edit2 className="mr-2 size-3.5" />
                        <span>Editar Grupo</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border/40" />
                      <DropdownMenuItem
                        onClick={() => handleOpenDelete(group)}
                        className="rounded-xl cursor-pointer text-xs text-destructive focus:bg-destructive/10"
                      >
                        <Trash2 className="mr-2 size-3.5" />
                        <span>Excluir Grupo</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px] mb-4">
                  {group.description || "Nenhuma descrição fornecida para este grupo."}
                </p>

                {/* Footer link to Tree */}
                <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: group.color }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="rounded-xl text-xs text-primary hover:text-primary hover:bg-primary/10 h-8 px-2.5"
                  >
                    <Link href={`/tree?group=${group.id}`}>
                      Ver na Árvore
                      <ArrowUpRight className="ml-1 size-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dialogs */}
      <GroupDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        groupToEdit={editingGroup}
        onSuccess={() => router.refresh()}
      />

      <DeleteGroupDialog
        open={!!deletingGroup}
        onOpenChange={(open) => !open && setDeletingGroup(null)}
        group={deletingGroup}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
