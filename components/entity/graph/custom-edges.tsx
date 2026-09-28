"use client";

import * as React from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";
import {
  CATEGORY_CONFIGS,
  inferCategoryFromRole,
  type GraphCategory,
} from "./graph-types";
import {
  Heart,
  Users,
  Briefcase,
  ShieldAlert,
  FileText,
  ArrowRightLeft,
} from "lucide-react";

export interface CustomEdgeData {
  relationshipId?: string;
  label?: string;
  category?: GraphCategory;
  notes?: string | null;
  bidirectional?: boolean;
  onEditEdge?: (edgeData: any) => void;
  [key: string]: unknown;
}

export function CustomEntityEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgeData = (data || {}) as CustomEdgeData;
  const label = edgeData.label || "Vínculo";
  const category = edgeData.category || inferCategoryFromRole(label);
  const config = CATEGORY_CONFIGS[category] || CATEGORY_CONFIGS.SOCIAL;

  const getIcon = () => {
    switch (category) {
      case "ROMANCE":
        return <Heart className="size-2.5 text-rose-500 fill-rose-500/30" />;
      case "FAMILY":
        return <Users className="size-2.5 text-pink-500" />;
      case "PROFESSIONAL":
        return <Briefcase className="size-2.5 text-amber-500" />;
      case "INVESTIGATIVE":
        return <ShieldAlert className="size-2.5 text-red-500" />;
      case "SOCIAL":
      default:
        return <Users className="size-2.5 text-purple-500" />;
    }
  };

  const handlePillClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (edgeData.onEditEdge) {
      edgeData.onEditEdge({ id, ...edgeData });
    }
  };

  return (
    <>
      {/* Background glow path on hover */}
      <BaseEdge
        path={edgePath}
        style={{
          stroke: config.color,
          strokeWidth: 4,
          opacity: 0.15,
          filter: "blur(2px)",
        }}
      />

      {/* Main Connection Path */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: config.color,
          strokeWidth: 2,
          strokeDasharray: config.dasharray,
        }}
      />

      {/* Interactive Edge Label HTML Overlay */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          <button
            type="button"
            onClick={handlePillClick}
            className={`group inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide shadow-md transition-all duration-200 border cursor-pointer hover:scale-105 active:scale-95 bg-card/95 text-foreground hover:bg-card ${config.badgeBorder} hover:shadow-lg`}
            style={{
              boxShadow: `0 2px 8px ${config.glowColor}`,
            }}
            title={edgeData.notes ? `${label}: ${edgeData.notes}` : label}
          >
            {getIcon()}
            <span className="font-semibold">{label}</span>

            {edgeData.bidirectional && (
              <ArrowRightLeft className="size-2.5 text-muted-foreground ml-0.5 opacity-80" />
            )}

            {edgeData.notes && (
              <FileText className="size-2.5 text-primary opacity-80" />
            )}
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
