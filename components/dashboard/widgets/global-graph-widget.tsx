"use client";

import * as React from "react";
import Link from "next/link";
import { WidgetCard } from "@/components/dashboard/widgets/widget-card";
import {
  ArrowUpRight,
  GitFork,
  Heart,
  Users,
  Briefcase,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface GlobalGraphWidgetProps {
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}

interface GraphNode {
  id: string;
  name: string;
  role: string;
  category: "center" | "family" | "social" | "business";
  color: string;
  icon: React.ElementType;
  position: { left?: string; right?: string; top?: string; bottom?: string };
  x: number; // percentage in SVG coordinate
  y: number;
}

const NODES: GraphNode[] = [
  {
    id: "center",
    name: "Investigado",
    role: "Alvo Primário",
    category: "center",
    color: "#e1306c",
    icon: Sparkles,
    position: { left: "50%", top: "48%" },
    x: 50,
    y: 48,
  },
  {
    id: "father",
    name: "Filiação Paterna",
    role: "Pai (Patriarca)",
    category: "family",
    color: "#e1306c",
    icon: Heart,
    position: { left: "10%", top: "12%" },
    x: 22,
    y: 20,
  },
  {
    id: "mother",
    name: "Filiação Materna",
    role: "Mãe (Matriarca)",
    category: "family",
    color: "#e1306c",
    icon: Heart,
    position: { right: "10%", top: "12%" },
    x: 78,
    y: 20,
  },
  {
    id: "son",
    name: "Relacionamento",
    role: "Cônjuge",
    category: "family",
    color: "#e1306c",
    icon: Heart,
    position: { left: "50%", bottom: "10%" },
    x: 50,
    y: 80,
  },
  {
    id: "partner",
    name: "Circulo Social",
    role: "Amigos",
    category: "social",
    color: "#833ab4",
    icon: Users,
    position: { left: "6%", top: "54%" },
    x: 18,
    y: 58,
  },
  {
    id: "corp",
    name: "Emprego",
    role: "Trabalho",
    category: "business",
    color: "#fcaf45",
    icon: Briefcase,
    position: { right: "6%", top: "54%" },
    x: 82,
    y: 58,
  },
];

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: "family" | "social" | "business";
  stroke: string;
  dashArray?: string;
}

const EDGES: GraphEdge[] = [
  { id: "e1", source: "father", target: "center", type: "family", stroke: "url(#edgeIgGradient)" },
  { id: "e2", source: "mother", target: "center", type: "family", stroke: "url(#edgeIgGradient)" },
  { id: "e3", source: "center", target: "son", type: "family", stroke: "url(#edgeIgGradient)" },
  { id: "e4", source: "partner", target: "center", type: "social", stroke: "#833ab4", dashArray: "5 4" },
  { id: "e5", source: "corp", target: "center", type: "business", stroke: "#fcaf45", dashArray: "3 3" },
];

export function GlobalGraphWidget({ dragHandleProps }: GlobalGraphWidgetProps) {
  const [hoveredNode, setHoveredNode] = React.useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const nodeMap = React.useMemo(() => {
    return new Map(NODES.map((n) => [n.id, n]));
  }, []);

  return (
    <WidgetCard
      id="global_graph"
      title="Grafo Genealógico & Sociométrico"
      description="Relações familiares, vínculos sociais e societários (Seed Real)"
      badge="RELAÇÕES ATIVAS"
      dragHandleProps={dragHandleProps}
      headerAction={
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
        >
          <Link href="/tree" title="Explorar na Árvore de Dados">
            <ArrowUpRight className="size-4" />
          </Link>
        </Button>
      }
    >
      <div className="relative h-[230px] w-full rounded-2xl overflow-hidden bg-card/40 border border-border/40 p-2 select-none flex flex-col justify-between">
        {/* Subtle Dots Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#833ab4_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

        {/* Network SVG Canvas */}
        <div className="relative size-full">
          {/* Animated SVG Connection Edges */}
          <svg className="absolute inset-0 size-full pointer-events-none">
            <defs>
              <linearGradient id="edgeIgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#405de6" />
                <stop offset="50%" stopColor="#833ab4" />
                <stop offset="100%" stopColor="#e1306c" />
              </linearGradient>
            </defs>

            <style>{`
              @keyframes dashFlow {
                to {
                  stroke-dashoffset: -20;
                }
              }
              .dash-flow-anim {
                animation: dashFlow 1.2s linear infinite;
              }
            `}</style>

            {EDGES.map((edge) => {
              const src = nodeMap.get(edge.source);
              const tgt = nodeMap.get(edge.target);
              if (!src || !tgt) return null;

              const isHighlighted =
                hoveredNode === edge.source || hoveredNode === edge.target;

              return (
                <line
                  key={edge.id}
                  x1={`${src.x}%`}
                  y1={`${src.y}%`}
                  x2={`${tgt.x}%`}
                  y2={`${tgt.y}%`}
                  stroke={edge.stroke}
                  strokeWidth={isHighlighted ? 3 : 1.75}
                  strokeDasharray={edge.dashArray || "6 3"}
                  className={cn(
                    "transition-all duration-300",
                    !shouldReduceMotion && "dash-flow-anim"
                  )}
                  style={{
                    opacity: hoveredNode
                      ? isHighlighted
                        ? 1
                        : 0.25
                      : 0.8,
                    filter: isHighlighted
                      ? "drop-shadow(0 0 4px rgba(225,48,108,0.7))"
                      : undefined,
                  }}
                />
              );
            })}
          </svg>

          {/* Graph Nodes with Staggered Spring Entrance */}
          {NODES.map((node, index) => {
            const isCenter = node.category === "center";
            const isHovered = hoveredNode === node.id;
            const Icon = node.icon;

            if (isCenter) {
              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{
                    opacity: 1,
                    scale: isHovered ? 1.06 : 1,
                    boxShadow: shouldReduceMotion
                      ? undefined
                      : [
                        "0 0 12px rgba(193, 53, 132, 0.35)",
                        "0 0 24px rgba(225, 48, 108, 0.6)",
                        "0 0 12px rgba(193, 53, 132, 0.35)",
                      ],
                  }}
                  transition={{
                    opacity: { duration: 0.4, delay: 0.1 },
                    scale: { type: "spring", stiffness: 300, damping: 20 },
                    boxShadow: {
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  style={node.position}
                  className="absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-2xl glass border-2 border-primary/80 bg-card/95 shadow-xl cursor-pointer z-20 flex items-center gap-2 group transition-colors"
                >
                  <div className="size-8 rounded-xl bg-ig-gradient flex items-center justify-center text-white text-[11px] font-bold shadow-md shrink-0">

                  </div>
                  <div className="text-left font-mono">
                    <span className="text-[11px] font-bold text-foreground block leading-tight group-hover:text-primary transition-colors">
                      {node.name}
                    </span>
                    <span className="text-[9px] text-primary font-bold uppercase tracking-wider block">
                      {node.role}
                    </span>
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, scale: 0.7, y: 8 }}
                animate={{
                  opacity: 1,
                  scale: isHovered ? 1.08 : 1,
                  y: 0,
                }}
                transition={{
                  delay: shouldReduceMotion ? 0 : 0.15 + index * 0.08,
                  type: "spring",
                  stiffness: 280,
                  damping: 22,
                }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                style={node.position}
                className={cn(
                  "absolute px-2.5 py-1 rounded-xl glass border transition-all duration-200 cursor-pointer z-10 flex items-center gap-1.5 text-[10px] font-mono",
                  node.category === "family" &&
                  "border-pink-500/40 bg-card/90 shadow-sm",
                  node.category === "social" &&
                  "border-purple-500/40 bg-card/90 shadow-sm text-purple-300",
                  node.category === "business" &&
                  "border-amber-500/40 bg-card/90 shadow-sm text-amber-300",
                  node.id === "son" && "-translate-x-1/2",
                  isHovered && "ring-1 ring-primary shadow-md"
                )}
              >
                <Icon className="size-3" style={{ color: node.color }} />
                <span className="font-semibold text-foreground truncate max-w-[110px]">
                  {node.name}
                </span>
                <span
                  className="text-[8px] font-bold uppercase"
                  style={{ color: node.color }}
                >
                  ({node.role.split(" ")[0]})
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Bar: Auto-layout + CTA Button */}
        <div className="relative z-20 flex items-center justify-between pt-1.5 border-t border-border/30 text-xs">
          <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
            <GitFork className="size-3 text-primary animate-pulse" />
            Auto-layout ativo • 5 conexões
          </span>
          <motion.div
            whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
          >
            <Button
              asChild
              size="sm"
              className="h-6 text-[11px] px-2.5 rounded-xl bg-ig-gradient hover:opacity-90 text-white shadow-sm glow-ig-sm"
            >
              <Link href="/tree">
                Explorar Grafo
                <ArrowUpRight className="ml-1 size-3" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </WidgetCard>
  );
}
