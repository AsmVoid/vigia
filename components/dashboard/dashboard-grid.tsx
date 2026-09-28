"use client";

import * as React from "react";
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
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import * as motion from "motion/react-client";
import { RotateCcw, LayoutGrid, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Widgets
import { TimeWidget } from "@/components/dashboard/widgets/time-widget";
import { SessionTimeWidget } from "@/components/dashboard/widgets/session-time-widget";
import { SessionDataWidget } from "@/components/dashboard/widgets/session-data-widget";
import { TotalPeopleWidget } from "@/components/dashboard/widgets/total-people-widget";
import { TotalGroupsWidget } from "@/components/dashboard/widgets/total-groups-widget";
import {
  AgeDistributionWidget,
  AgeDistributionItem,
} from "@/components/dashboard/widgets/age-distribution-widget";
import {
  GenderDistributionWidget,
  GenderDistributionItem,
} from "@/components/dashboard/widgets/gender-distribution-widget";
import {
  ActivityFlowWidget,
  ActivityFlowItem,
} from "@/components/dashboard/widgets/activity-flow-widget";
import {
  GeographicDistributionWidget,
  GeographicDistributionItem,
} from "@/components/dashboard/widgets/geographic-distribution-widget";
import { GlobalGraphWidget } from "@/components/dashboard/widgets/global-graph-widget";

const STORAGE_KEY = "vigia:dashboard:layout";

export const DEFAULT_WIDGET_ORDER = [
  "system_time",
  "session_time",
  "session_data",
  "total_people",
  "total_groups",
  "age_distribution",
  "gender_distribution",
  "activity_flow",
  "geographic_distribution",
  "global_graph",
];

const WIDGET_SPAN_CLASSES: Record<string, string> = {
  system_time: "col-span-12 sm:col-span-6 lg:col-span-4",
  session_time: "col-span-12 sm:col-span-6 lg:col-span-4",
  session_data: "col-span-12 sm:col-span-12 lg:col-span-4",
  total_people: "col-span-12 sm:col-span-6",
  total_groups: "col-span-12 sm:col-span-6",
  age_distribution: "col-span-12 lg:col-span-6",
  gender_distribution: "col-span-12 lg:col-span-6",
  activity_flow: "col-span-12 lg:col-span-8",
  geographic_distribution: "col-span-12 lg:col-span-4",
  global_graph: "col-span-12",
};

export interface DashboardGridProps {
  initialIp?: string;
  totalPeople: number;
  totalGroups: number;
  ageDistribution: AgeDistributionItem[];
  genderDistribution: GenderDistributionItem[];
  activityFlow: ActivityFlowItem[];
  geographicDistribution: GeographicDistributionItem[];
}

interface SortableWidgetProps {
  id: string;
  children: (dragHandleProps: React.HTMLAttributes<HTMLButtonElement>) => React.ReactNode;
  spanClass: string;
  index: number;
}

function SortableWidget({ id, children, spanClass, index }: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        spanClass,
        "transition-opacity duration-200",
        isDragging && "opacity-40"
      )}
    >
      <motion.div
        layout
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.35,
          delay: Math.min(index * 0.04, 0.4),
          ease: [0.16, 1, 0.3, 1],
        }}
        className="h-full w-full"
      >
        {children({ ...attributes, ...listeners })}
      </motion.div>
    </div>
  );
}

export function DashboardGrid({
  initialIp,
  totalPeople,
  totalGroups,
  ageDistribution,
  genderDistribution,
  activityFlow,
  geographicDistribution,
}: DashboardGridProps) {
  const [items, setItems] = React.useState<string[]>(DEFAULT_WIDGET_ORDER);
  const [mounted, setMounted] = React.useState(false);

  // Load layout from localStorage
  React.useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Ensure all default items exist
          const merged = [...parsed];
          DEFAULT_WIDGET_ORDER.forEach((id) => {
            if (!merged.includes(id)) merged.push(id);
          });
          setItems(merged);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.indexOf(String(active.id));
        const newIndex = prev.indexOf(String(over.id));
        const next = arrayMove(prev, oldIndex, newIndex);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    }
  };

  const handleResetLayout = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setItems(DEFAULT_WIDGET_ORDER);
    toast.success("Layout do painel restaurado para o padrão.");
  };

  const renderWidgetContent = (id: string, dragHandleProps: React.HTMLAttributes<HTMLButtonElement>) => {
    switch (id) {
      case "system_time":
        return <TimeWidget dragHandleProps={dragHandleProps} />;
      case "session_time":
        return <SessionTimeWidget dragHandleProps={dragHandleProps} />;
      case "session_data":
        return (
          <SessionDataWidget
            initialIp={initialIp}
            dragHandleProps={dragHandleProps}
          />
        );
      case "total_people":
        return (
          <TotalPeopleWidget
            total={totalPeople}
            dragHandleProps={dragHandleProps}
          />
        );
      case "total_groups":
        return (
          <TotalGroupsWidget
            total={totalGroups}
            dragHandleProps={dragHandleProps}
          />
        );
      case "age_distribution":
        return (
          <AgeDistributionWidget
            data={ageDistribution}
            dragHandleProps={dragHandleProps}
          />
        );
      case "gender_distribution":
        return (
          <GenderDistributionWidget
            data={genderDistribution}
            dragHandleProps={dragHandleProps}
          />
        );
      case "activity_flow":
        return (
          <ActivityFlowWidget
            data={activityFlow}
            dragHandleProps={dragHandleProps}
          />
        );
      case "geographic_distribution":
        return (
          <GeographicDistributionWidget
            data={geographicDistribution}
            dragHandleProps={dragHandleProps}
          />
        );
      case "global_graph":
        return <GlobalGraphWidget dragHandleProps={dragHandleProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <span className="text-ig-gradient">Painel de Controle</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-mono font-bold bg-primary/10 text-primary border border-primary/30">
              LIVE
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Métricas de inteligência, fluxo operacional e síntese demográfica de alvos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetLayout}
            className="rounded-xl border-border/50 glass hover:border-primary/40 hover:glow-ig-sm text-xs gap-1.5 transition-all"
            title="Restaurar layout padrão dos widgets"
          >
            <RotateCcw className="size-3.5" />
            <span>Resetar Layout</span>
          </Button>
        </div>
      </div>

      {/* Grid of Sortable Widgets */}
      <DndContext
        id="dashboard-dnd-context"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-12 gap-4 sm:gap-6">
            {items.map((id, idx) => {
              const spanClass = WIDGET_SPAN_CLASSES[id] || "col-span-12";
              return (
                <SortableWidget key={id} id={id} spanClass={spanClass} index={idx}>
                  {(dragHandleProps) => renderWidgetContent(id, dragHandleProps)}
                </SortableWidget>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
