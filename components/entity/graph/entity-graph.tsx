"use client";

import * as React from "react";
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
  Node,
  Edge,
  BackgroundVariant,
  Connection,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "@dagrejs/dagre";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import {
  CentralEntityNode,
  RelatedEntityNode,
  CentralNodeData,
  RelatedNodeData,
} from "./custom-nodes";
import { CustomEntityEdge, CustomEdgeData } from "./custom-edges";
import {
  CATEGORY_CONFIGS,
  inferCategoryFromRole,
  type GraphCategory,
} from "./graph-types";
import { ConnectionModal } from "./connection-modal";
import { EdgeModal } from "./edge-modal";
import { NodeInspectorDrawer } from "./node-inspector-drawer";
import {
  Download,
  LayoutGrid,
  Maximize2,
  Minimize2,
  Plus,
  Search,
  Filter,
  Layers,
  Map,
  RotateCcw,
  Sparkles,
  GitFork,
  Heart,
  Users,
  Briefcase,
  ShieldAlert,
  ChevronDown,
  X,
  Compass,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const nodeTypes = {
  centralEntity: CentralEntityNode,
  relatedEntity: RelatedEntityNode,
};

const edgeTypes = {
  customEntity: CustomEntityEdge,
};

interface EntityGraphProps {
  entity: any;
  height?: string | number;
}

function EntityGraphInternal({ entity, height = "650px" }: EntityGraphProps) {
  const router = useRouter();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const reactFlowInstance = useReactFlow();
  const storageKey = React.useMemo(() => `vigia_graph_pos_${entity.id}`, [entity.id]);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // MiniMap collapse state
  const [showMiniMap, setShowMiniMap] = React.useState(false);

  // Filter category state
  const [activeCategoryFilter, setActiveCategoryFilter] = React.useState<GraphCategory | "ALL">("ALL");

  // Search input state
  const [searchQuery, setSearchQuery] = React.useState("");

  // Modals state
  const [inspectorEntityId, setInspectorEntityId] = React.useState<string | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = React.useState(false);

  const [isConnectModalOpen, setIsConnectModalOpen] = React.useState(false);
  const [connectSource, setConnectSource] = React.useState<{
    id: string;
    fullName: string;
    photo?: string | null;
  } | null>(null);
  const [connectTarget, setConnectTarget] = React.useState<{
    id: string;
    fullName: string;
    photo?: string | null;
  } | null>(null);

  const [selectedEdgeData, setSelectedEdgeData] = React.useState<any>(null);
  const [isEdgeModalOpen, setIsEdgeModalOpen] = React.useState(false);

  // Layout mode
  const [currentLayout, setCurrentLayout] = React.useState<"TB" | "LR" | "RADIAL">("TB");

  // Helper callbacks passed to nodes/edges
  const handleInspectNode = React.useCallback((id: string) => {
    setInspectorEntityId(id);
    setIsInspectorOpen(true);
  }, []);

  const handleConnectFromNode = React.useCallback(
    (id: string) => {
      // Find node info
      const found = [entity, ...(entity.relationships?.map((r: any) => r.relatedEntity) || [])].find(
        (e: any) => e?.id === id
      );
      setConnectSource({
        id,
        fullName: found?.fullName || entity.fullName,
        photo: found?.photo,
      });
      setConnectTarget(null);
      setIsConnectModalOpen(true);
    },
    [entity]
  );

  const handleOpenDossier = React.useCallback(
    (id: string) => {
      router.push(`/entity/${id}`);
    },
    [router]
  );

  const handleEditEdge = React.useCallback((edgeData: any) => {
    setSelectedEdgeData(edgeData);
    setIsEdgeModalOpen(true);
  }, []);

  // Assemble initial nodes and edges from entity data
  const { initialNodes, initialEdges } = React.useMemo(() => {
    let savedPositions: Record<string, { x: number; y: number }> = {};
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(`vigia_graph_pos_${entity.id}`);
        if (stored) savedPositions = JSON.parse(stored);
      } catch (e) {}
    }

    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const addedEntityIds = new Set<string>();
    const addedEdgeKeys = new Set<string>();

    const primaryAddress = entity.addresses?.[0];
    const primaryPhone = entity.phones?.[0];
    const primaryJob = entity.jobs?.[0];

    // 1. Central Target Node
    nodes.push({
      id: entity.id,
      type: "centralEntity",
      position: savedPositions[entity.id] || { x: 400, y: 300 },
      data: {
        id: entity.id,
        fullName: entity.fullName,
        aliases: entity.aliases,
        photo: entity.photo,
        gender: entity.gender,
        job: primaryJob?.title || entity.currentJob,
        company: primaryJob?.company,
        groupName: entity.group?.name,
        groupColor: entity.group?.color,
        cpf: entity.cpf,
        city: primaryAddress?.city,
        state: primaryAddress?.state,
        primaryPhone: primaryPhone?.phone,
        hasWhatsapp: primaryPhone?.isWhatsapp,
        riskScore: entity.riskScore,
        connectionsCount: 0, // Will be computed after
        onInspectNode: handleInspectNode,
        onConnectNode: handleConnectFromNode,
      } as CentralNodeData,
    });
    addedEntityIds.add(entity.id);

    // Helpers to add related node & custom edge
    const addRelation = (
      relEntity: {
        id?: string;
        fullName: string;
        photo?: string | null;
        gender?: string | null;
        currentJob?: string | null;
        cpf?: string | null;
        group?: any;
        phones?: any[];
        addresses?: any[];
        jobs?: any[];
        riskScore?: number;
      },
      role: string,
      direction: "incoming" | "outgoing" = "outgoing",
      relationshipId?: string,
      notes?: string | null,
      isSystemFamily?: boolean
    ) => {
      const nodeId = relEntity.id || `free_${relEntity.fullName.replace(/\s+/g, "_")}`;
      const category = inferCategoryFromRole(role);
      const config = CATEGORY_CONFIGS[category] || CATEGORY_CONFIGS.SOCIAL;

      const pPhone = relEntity.phones?.[0];
      const pAddress = relEntity.addresses?.[0];
      const pJob = relEntity.jobs?.[0];

      if (!addedEntityIds.has(nodeId)) {
        nodes.push({
          id: nodeId,
          type: "relatedEntity",
          position: savedPositions[nodeId] || { x: 0, y: 0 },
          data: {
            id: relEntity.id,
            fullName: relEntity.fullName,
            photo: relEntity.photo,
            gender: relEntity.gender,
            role,
            category,
            isRegistered: !!relEntity.id,
            job: pJob?.title || relEntity.currentJob,
            company: pJob?.company,
            cpf: relEntity.cpf,
            city: pAddress?.city,
            state: pAddress?.state,
            primaryPhone: pPhone?.phone,
            hasWhatsapp: pPhone?.isWhatsapp,
            groupName: relEntity.group?.name,
            groupColor: relEntity.group?.color,
            riskScore: relEntity.riskScore,
            relationshipId,
            relNotes: notes,
            onInspectNode: handleInspectNode,
            onConnectNode: handleConnectFromNode,
            onOpenDossier: handleOpenDossier,
          } as RelatedNodeData,
        });
        addedEntityIds.add(nodeId);
      }

      const source = direction === "incoming" ? nodeId : entity.id;
      const target = direction === "incoming" ? entity.id : nodeId;
      const edgeKey = `${source}->${target}:${role}`;

      if (addedEdgeKeys.has(edgeKey)) return;
      addedEdgeKeys.add(edgeKey);

      const edgeId = `edge_${source}_${target}_${role.replace(/\s+/g, "_")}`;
      edges.push({
        id: edgeId,
        type: "customEntity",
        source,
        target,
        data: {
          relationshipId,
          label: role,
          category,
          notes,
          sourceName: direction === "incoming" ? relEntity.fullName : entity.fullName,
          targetName: direction === "incoming" ? entity.fullName : relEntity.fullName,
          isSystemFamily,
          onEditEdge: handleEditEdge,
        } as CustomEdgeData,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: config.color,
          width: 14,
          height: 14,
        },
      });
    };

    // 2. Pai
    if (entity.father) {
      addRelation(entity.father, "Pai", "incoming", undefined, undefined, true);
    } else if (entity.fatherName) {
      addRelation({ fullName: entity.fatherName }, "Pai", "incoming", undefined, undefined, true);
    }

    // 3. Mãe
    if (entity.mother) {
      addRelation(entity.mother, "Mãe", "incoming", undefined, undefined, true);
    } else if (entity.motherName) {
      addRelation({ fullName: entity.motherName }, "Mãe", "incoming", undefined, undefined, true);
    }

    // 4. Filhos
    if (entity.childrenAsFather) {
      for (const child of entity.childrenAsFather) {
        addRelation(child, "Filho(a)", "outgoing", undefined, undefined, true);
      }
    }
    if (entity.childrenAsMother) {
      for (const child of entity.childrenAsMother) {
        addRelation(child, "Filho(a)", "outgoing", undefined, undefined, true);
      }
    }

    // 5. Irmãos
    if (entity.siblings) {
      for (const sib of entity.siblings) {
        addRelation(sib, "Irmão(ã)", "outgoing", undefined, undefined, true);
      }
    }
    if (entity.siblingOf) {
      for (const sib of entity.siblingOf) {
        addRelation(sib, "Irmão(ã)", "outgoing", undefined, undefined, true);
      }
    }
    if (entity.siblingNames) {
      for (const sn of entity.siblingNames) {
        addRelation({ fullName: sn.name }, "Irmão(ã)", "outgoing", undefined, undefined, true);
      }
    }

    // 6. Tabela Relationship (Diretos)
    if (entity.relationships) {
      for (const rel of entity.relationships) {
        if (rel.relatedEntity) {
          const roleLabel = rel.label || formatRelationshipDefault(rel.type);
          addRelation(
            rel.relatedEntity,
            roleLabel,
            "outgoing",
            rel.id,
            rel.notes,
            false
          );
        }
      }
    }

    // 7. Tabela Relationship (Inversos)
    if (entity.relatedIn) {
      for (const rel of entity.relatedIn) {
        if (rel.entity) {
          const roleLabel = rel.label || formatRelationshipDefault(rel.type);
          addRelation(
            rel.entity,
            roleLabel,
            "incoming",
            rel.id,
            rel.notes,
            false
          );
        }
      }
    }

    // Update central node connection count
    if (nodes[0]?.data) {
      (nodes[0].data as CentralNodeData).connectionsCount = edges.length;
    }

    return { initialNodes: nodes, initialEdges: edges };
  }, [entity, handleInspectNode, handleConnectFromNode, handleOpenDossier, handleEditEdge]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Persist positions when user finishes dragging any node
  const handleNodeDragStop = React.useCallback(
    (_event: any, _node: any) => {
      setNodes((currentNodes) => {
        try {
          const positions: Record<string, { x: number; y: number }> = {};
          currentNodes.forEach((n) => {
            positions[n.id] = n.position;
          });
          localStorage.setItem(storageKey, JSON.stringify(positions));
        } catch (e) {}
        return currentNodes;
      });
    },
    [storageKey, setNodes]
  );

  // Sync state if initialNodes/initialEdges changes (preserving existing user-dragged node positions)
  React.useEffect(() => {
    let savedPositions: Record<string, { x: number; y: number }> = {};
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) savedPositions = JSON.parse(stored);
    } catch (e) {}

    setNodes((currentNodes) => {
      const currentPosMap: Record<string, { x: number; y: number }> = {};
      currentNodes.forEach((n) => {
        if (n.position && (n.position.x !== 0 || n.position.y !== 0)) {
          currentPosMap[n.id] = n.position;
        }
      });

      return initialNodes.map((initNode) => {
        const existingPos = currentPosMap[initNode.id] || savedPositions[initNode.id];
        if (existingPos) {
          return {
            ...initNode,
            position: existingPos,
          };
        }
        return initNode;
      });
    });

    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges, storageKey]);

  // Handle Drag-to-Connect on React Flow handles!
  const onConnect = React.useCallback(
    (connection: Connection) => {
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);

      if (!sourceNode || !targetNode) return;

      setConnectSource({
        id: sourceNode.id,
        fullName: (sourceNode.data as any).fullName || "Entidade",
        photo: (sourceNode.data as any).photo,
      });

      setConnectTarget({
        id: targetNode.id,
        fullName: (targetNode.data as any).fullName || "Entidade",
        photo: (targetNode.data as any).photo,
      });

      setIsConnectModalOpen(true);
    },
    [nodes]
  );

  // Callback when a connection is created in modal
  const handleConnectionCreated = React.useCallback(
    (created: any) => {
      const targetEntity = created.targetEntity;
      const category = created.category;
      const config = CATEGORY_CONFIGS[category as GraphCategory] || CATEGORY_CONFIGS.SOCIAL;

      // Ensure target node is added if it was outside initial graph
      setNodes((prevNodes) => {
        const exists = prevNodes.some((n) => n.id === created.target);
        if (exists) return prevNodes;

        const newNode: Node = {
          id: created.target,
          type: "relatedEntity",
          position: {
            x: 400 + (Math.random() - 0.5) * 300,
            y: 300 + (Math.random() - 0.5) * 300,
          },
          data: {
            id: targetEntity?.id,
            fullName: targetEntity?.fullName || "Nova Conexão",
            photo: targetEntity?.photo,
            gender: targetEntity?.gender,
            role: created.label,
            category,
            isRegistered: true,
            job: targetEntity?.currentJob,
            cpf: targetEntity?.cpf,
            city: targetEntity?.addresses?.[0]?.city,
            state: targetEntity?.addresses?.[0]?.state,
            primaryPhone: targetEntity?.phones?.[0]?.phone,
            hasWhatsapp: targetEntity?.phones?.[0]?.isWhatsapp,
            groupName: targetEntity?.group?.name,
            groupColor: targetEntity?.group?.color,
            relationshipId: created.relationshipId,
            relNotes: created.notes,
            onInspectNode: handleInspectNode,
            onConnectNode: handleConnectFromNode,
            onOpenDossier: handleOpenDossier,
          } as RelatedNodeData,
        };
        return [...prevNodes, newNode];
      });

      // Add edge to canvas
      const edgeId = `edge_${created.source}_${created.target}_${Date.now()}`;
      const newEdge: Edge = {
        id: edgeId,
        type: "customEntity",
        source: created.source,
        target: created.target,
        data: {
          relationshipId: created.relationshipId,
          label: created.label,
          category: created.category,
          notes: created.notes,
          bidirectional: created.bidirectional,
          onEditEdge: handleEditEdge,
        } as CustomEdgeData,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: config.color,
          width: 14,
          height: 14,
        },
      };

      setEdges((prevEdges) => addEdge(newEdge, prevEdges));
      setTimeout(() => applyAutoLayout(currentLayout), 100);
    },
    [handleInspectNode, handleConnectFromNode, handleOpenDossier, handleEditEdge, currentLayout]
  );

  // Callback when an edge is updated
  const handleEdgeUpdated = React.useCallback(
    (updatedEdge: any) => {
      setEdges((prevEdges) =>
        prevEdges.map((e) => {
          if (e.id === updatedEdge.id) {
            const config =
              CATEGORY_CONFIGS[updatedEdge.category as GraphCategory] || CATEGORY_CONFIGS.SOCIAL;
            return {
              ...e,
              data: {
                ...e.data,
                label: updatedEdge.label,
                category: updatedEdge.category,
                notes: updatedEdge.notes,
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: config.color,
                width: 14,
                height: 14,
              },
            };
          }
          return e;
        })
      );
    },
    [setEdges]
  );

  // Callback when an edge is deleted
  const handleEdgeDeleted = React.useCallback(
    (edgeId: string) => {
      setEdges((prevEdges) => prevEdges.filter((e) => e.id !== edgeId));
    },
    [setEdges]
  );

  // Layout Algorithms
  const applyAutoLayout = React.useCallback(
    (direction: "TB" | "LR" | "RADIAL" = "TB", showToast: boolean = true) => {
      setCurrentLayout(direction);

      setNodes((currentNodes) => {
        if (!currentNodes.length) return currentNodes;

        let layoutedNodes: Node[] = [];

        if (direction === "RADIAL") {
          // Radial / Concentric Layout around Target Node
          const centralNode = currentNodes.find((n) => n.type === "centralEntity") || currentNodes[0];
          const otherNodes = currentNodes.filter((n) => n.id !== centralNode?.id);

          const centerX = 500;
          const centerY = 400;
          const radius = Math.max(280, otherNodes.length * 40);
          const angleStep = (2 * Math.PI) / Math.max(1, otherNodes.length);

          layoutedNodes = currentNodes.map((n) => {
            if (n.id === centralNode?.id) {
              return { ...n, position: { x: centerX - 140, y: centerY - 80 } };
            }
            const idx = otherNodes.findIndex((on) => on.id === n.id);
            const angle = idx * angleStep;
            const x = centerX + radius * Math.cos(angle) - 120;
            const y = centerY + radius * Math.sin(angle) - 40;
            return { ...n, position: { x, y } };
          });
        } else {
          // Dagre Layout (TB or LR)
          const g = new dagre.graphlib.Graph();
          g.setDefaultEdgeLabel(() => ({}));
          g.setGraph({
            rankdir: direction,
            nodesep: 90,
            ranksep: 120,
            align: "UL",
          });

          currentNodes.forEach((node) => {
            const isCentral = node.type === "centralEntity";
            g.setNode(node.id, {
              width: isCentral ? 290 : 250,
              height: isCentral ? 170 : 90,
            });
          });

          edges.forEach((edge) => {
            g.setEdge(edge.source, edge.target);
          });

          dagre.layout(g);

          layoutedNodes = currentNodes.map((node) => {
            const nodeWithPos = g.node(node.id);
            const isCentral = node.type === "centralEntity";
            return {
              ...node,
              position: {
                x: (nodeWithPos?.x || 0) - (isCentral ? 145 : 125),
                y: (nodeWithPos?.y || 0) - (isCentral ? 85 : 45),
              },
            };
          });
        }

        // Persist newly computed positions to localStorage
        try {
          const positions: Record<string, { x: number; y: number }> = {};
          layoutedNodes.forEach((n) => {
            positions[n.id] = n.position;
          });
          localStorage.setItem(storageKey, JSON.stringify(positions));
        } catch (e) {}

        return layoutedNodes;
      });

      if (showToast) {
        if (direction === "RADIAL") {
          toast.success("Grafo organizado em padrão radial/concêntrico!");
        } else {
          toast.success(
            `Grafo organizado hierarquicamente (${direction === "TB" ? "Vertical" : "Horizontal"})!`
          );
        }
      }

      setTimeout(() => {
        try {
          reactFlowInstance.fitView({ padding: 0.25, duration: 400 });
        } catch (e) {}
      }, 60);
    },
    [edges, reactFlowInstance, storageKey, setNodes]
  );

  // Executa auto-layout vertical apenas uma única vez na inicialização E se não houver posições salvas
  const hasAutoLayoutRunRef = React.useRef(false);
  React.useEffect(() => {
    if (hasAutoLayoutRunRef.current) return;
    if (initialNodes.length === 0) return;

    hasAutoLayoutRunRef.current = true;

    let hasSavedPositions = false;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Object.keys(parsed).length > 0) {
          hasSavedPositions = true;
        }
      }
    } catch (e) {}

    if (!hasSavedPositions) {
      applyAutoLayout("TB", false);
    }
  }, [applyAutoLayout, initialNodes.length, storageKey]);

  // Filtered nodes and edges based on activeCategoryFilter and search query
  const { visibleNodes, visibleEdges } = React.useMemo(() => {
    let filteredEdges = edges;

    if (activeCategoryFilter !== "ALL") {
      filteredEdges = edges.filter(
        (e) => (e.data as CustomEdgeData)?.category === activeCategoryFilter
      );
    }

    const connectedNodeIds = new Set<string>();
    filteredEdges.forEach((e) => {
      connectedNodeIds.add(e.source);
      connectedNodeIds.add(e.target);
    });

    const filteredNodes = nodes.map((n) => {
      const isCentral = n.type === "centralEntity";
      const matchesSearch = searchQuery
        ? (n.data as any)?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (n.data as any)?.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (n.data as any)?.job?.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      const isConnected = isCentral || connectedNodeIds.has(n.id);
      const isVisible = activeCategoryFilter === "ALL" ? true : isConnected;

      return {
        ...n,
        hidden: !isVisible,
        style: {
          ...n.style,
          opacity: matchesSearch ? 1 : 0.25,
          filter: matchesSearch ? "none" : "grayscale(80%)",
          transition: "opacity 0.2s ease, filter 0.2s ease",
        },
      };
    });

    return { visibleNodes: filteredNodes, visibleEdges: filteredEdges };
  }, [nodes, edges, activeCategoryFilter, searchQuery]);

  // Search Focus helper
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const matchedNode = nodes.find(
      (n) =>
        (n.data as any)?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.data as any)?.role?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (matchedNode) {
      reactFlowInstance.setCenter(
        matchedNode.position.x + 120,
        matchedNode.position.y + 45,
        { zoom: 1.2, duration: 600 }
      );
      toast.success(`Focado em: ${(matchedNode.data as any).fullName}`);
    } else {
      toast.error("Nenhuma pessoa encontrada com este termo.");
    }
  };

  // Center on a specific node
  const handleFocusNodeFromDrawer = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      reactFlowInstance.setCenter(node.position.x + 120, node.position.y + 45, {
        zoom: 1.3,
        duration: 500,
      });
      setIsInspectorOpen(false);
    }
  };

  // Export PNG com html-to-image
  const handleExportPng = async () => {
    try {
      const viewportElem = containerRef.current?.querySelector(
        ".react-flow__viewport"
      ) as HTMLElement;

      if (!viewportElem) {
        toast.error("Visualização do grafo indisponível para captura.");
        return;
      }

      toast.info("Gerando imagem em alta resolução...");
      const dataUrl = await toPng(viewportElem, {
        backgroundColor: "#050508",
        pixelRatio: 2,
      });

      const a = document.createElement("a");
      a.download = `VIGIA-Grafo-${entity.fullName.replace(/\s+/g, "_")}.png`;
      a.href = dataUrl;
      a.click();
      toast.success("Grafo exportado com sucesso em PNG!");
    } catch (err) {
      console.error("Erro ao exportar PNG:", err);
      toast.error("Falha ao exportar imagem do grafo.");
    }
  };

  // Listen to native fullscreen change event so state is always 100% in sync
  React.useEffect(() => {
    const handleFsChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullscreen(isFs);
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.25, duration: 300 });
      }, 100);
    };

    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("webkitfullscreenchange", handleFsChange);
    };
  }, [reactFlowInstance]);

  const toggleFullscreen = React.useCallback(async () => {
    if (!containerRef.current) return;

    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (err) {
        console.warn("Exit fullscreen failed:", err);
      }
      setIsFullscreen(false);
      setTimeout(() => reactFlowInstance.fitView({ padding: 0.25, duration: 300 }), 150);
      return;
    }

    try {
      if (containerRef.current.requestFullscreen) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        // Fallback to in-window fullscreen CSS
        setIsFullscreen((prev) => !prev);
      }
    } catch (err) {
      // In case native fullscreen fails due to browser permissions/sandbox, fallback to CSS maximize!
      console.warn("Native fullscreen request denied, using CSS in-window maximize:", err);
      setIsFullscreen((prev) => !prev);
    }

    setTimeout(() => reactFlowInstance.fitView({ padding: 0.25, duration: 300 }), 150);
  }, [reactFlowInstance]);

  // Recarregar e reorganizar o grafo por completo
  const [isReloading, setIsReloading] = React.useState(false);

  const handleReloadGraph = React.useCallback(async () => {
    setIsReloading(true);
    try {
      // 1. Resetar filtros e busca
      setActiveCategoryFilter("ALL");
      setSearchQuery("");

      // 2. Limpar posições salvas para reiniciar do layout padrão
      try {
        localStorage.removeItem(storageKey);
      } catch (e) {}

      // 3. Re-aplicar auto layout para reorganizar posições dos nós
      applyAutoLayout(currentLayout, true);

      // 4. Sincronizar dados do servidor
      router.refresh();

      toast.success("Grafo recarregado e reorganizado com sucesso!");
    } catch (err) {
      console.error("Erro ao recarregar grafo:", err);
      toast.error("Falha ao recarregar grafo.");
    } finally {
      setTimeout(() => setIsReloading(false), 400);
    }
  }, [applyAutoLayout, currentLayout, router, storageKey]);

  // Available nodes for modal selection
  const availableNodeList = React.useMemo(() => {
    return nodes.map((n) => ({
      id: n.id,
      fullName: (n.data as any).fullName,
      photo: (n.data as any).photo,
    }));
  }, [nodes]);

  // Connected nodes for the currently inspected entity in drawer
  const connectedNodesForInspector = React.useMemo(() => {
    if (!inspectorEntityId) return [];
    const directEdges = edges.filter(
      (e) => e.source === inspectorEntityId || e.target === inspectorEntityId
    );

    return directEdges.map((e) => {
      const otherId = e.source === inspectorEntityId ? e.target : e.source;
      const otherNode = nodes.find((n) => n.id === otherId);
      const edgeData = e.data as CustomEdgeData;
      return {
        id: otherId,
        edgeId: e.id,
        fullName: (otherNode?.data as any)?.fullName || "Entidade",
        role: edgeData?.label || "Vínculo",
        category: edgeData?.category,
      };
    });
  }, [inspectorEntityId, edges, nodes]);

  // Counts by category
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      ALL: edges.length,
      ROMANCE: 0,
      FAMILY: 0,
      PROFESSIONAL: 0,
      SOCIAL: 0,
      INVESTIGATIVE: 0,
    };
    edges.forEach((e) => {
      const cat = (e.data as CustomEdgeData)?.category || "SOCIAL";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [edges]);

  return (
    <div
      ref={containerRef}
      style={{
        height: isFullscreen ? "100vh" : height,
        width: isFullscreen ? "100vw" : "100%",
      }}
      className={`relative w-full rounded-3xl glass border border-border/50 overflow-hidden shadow-2xl bg-black transition-all ${
        isFullscreen
          ? "!fixed !inset-0 !z-[9999] !h-screen !w-screen !rounded-none !m-0 !p-0"
          : ""
      }`}
    >
      <ReactFlow
        nodes={visibleNodes}
        edges={visibleEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={handleNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.15}
        maxZoom={2.5}
        attributionPosition="bottom-left"
        defaultEdgeOptions={{
          type: "customEntity",
          animated: false,
        }}
      >
        {/* Subtle dynamic background */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={22}
          size={1.5}
          color="rgba(255, 255, 255, 0.12)"
        />

        {/* Controls - Bottom Left */}
        <Controls
          showInteractive={false}
          className="!bg-card/90 !border !border-border/60 !rounded-2xl !p-1 !shadow-lg !left-4 !bottom-4 [&>button]:!bg-transparent [&>button]:!border-0 [&>button]:!text-foreground hover:[&>button]:!bg-muted"
        />

        {/* MiniMap (Collapsible, placed safely on bottom-left above controls) */}
        {showMiniMap && (
          <div className="absolute left-4 bottom-28 z-10 w-44 h-32 rounded-2xl overflow-hidden glass border border-border/60 shadow-xl">
            <MiniMap
              nodeColor={(n) => {
                if (n.type === "centralEntity") return "#e1306c";
                const cat = (n.data as any)?.category;
                return CATEGORY_CONFIGS[cat as GraphCategory]?.color || "#8b5cf6";
              }}
              maskColor="rgba(0, 0, 0, 0.85)"
              className="!m-0 !w-full !h-full !bg-black/90"
            />
          </div>
        )}

        {/* Unified Top Navigation & Controls Bar (Zero Overlap!) */}
        <Panel position="top-left" className="!m-3 !w-[calc(100%-1.5rem)] pointer-events-none">
          <div className="flex flex-col gap-2 w-full">
            {/* Top Row: Search + Primary Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 w-full pointer-events-auto">
              {/* Left: Quick Search */}
              <div className="flex items-center gap-2">
                <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                  <Search className="absolute left-2.5 size-3.5 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar pessoa ou cargo no grafo..."
                    className="h-8.5 w-44 sm:w-60 pl-8 pr-7 text-xs rounded-xl glass border-border/60 bg-card/95 text-foreground placeholder:text-muted-foreground shadow-md focus-visible:w-72 transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </form>
              </div>

              {/* Right: Actions Group */}
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {/* + Nova Conexão */}
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setConnectSource({
                      id: entity.id,
                      fullName: entity.fullName,
                      photo: entity.photo,
                    });
                    setConnectTarget(null);
                    setIsConnectModalOpen(true);
                  }}
                  className="h-8.5 px-3 rounded-xl bg-ig-gradient hover:opacity-90 text-white text-xs font-semibold gap-1.5 shadow-md glow-ig-sm border-0 cursor-pointer"
                  title="Criar nova conexão entre entidades"
                >
                  <Plus className="size-3.5" />
                  <span>Nova Conexão</span>
                </Button>

                {/* Organizar Layout Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8.5 rounded-xl glass border-border/60 text-xs font-semibold hover:border-primary gap-1.5 shadow-md bg-card/95 text-foreground"
                      title="Organizar layout do grafo"
                    >
                      <LayoutGrid className="size-3.5 text-primary" />
                      <span>Organizar</span>
                      <ChevronDown className="size-3 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass border-border/60 rounded-xl p-1 text-xs z-50">
                    <DropdownMenuItem
                      onClick={() => applyAutoLayout("TB")}
                      className="cursor-pointer font-medium gap-2"
                    >
                      <Layers className="size-3.5 text-primary" />
                      <span>Hierárquico Vertical (Cima ➔ Baixo)</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => applyAutoLayout("LR")}
                      className="cursor-pointer font-medium gap-2"
                    >
                      <GitFork className="size-3.5 text-primary" />
                      <span>Hierárquico Horizontal (Esquerda ➔ Direita)</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => applyAutoLayout("RADIAL")}
                      className="cursor-pointer font-medium gap-2"
                    >
                      <Compass className="size-3.5 text-rose-500" />
                      <span>Concéntrico / Radial (Órbitas)</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Exportar PNG */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleExportPng}
                  className="h-8.5 rounded-xl glass border-border/60 text-xs font-semibold hover:border-primary gap-1.5 shadow-md bg-card/95 text-foreground"
                  title="Exportar imagem PNG em alta resolução"
                >
                  <Download className="size-3.5 text-primary" />
                  <span className="hidden sm:inline">Exportar PNG</span>
                </Button>

                {/* Recarregar Grafo */}
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleReloadGraph}
                  disabled={isReloading}
                  className="size-8.5 rounded-xl glass border-border/60 text-foreground hover:border-primary shadow-md bg-card/95"
                  title="Recarregar e reorganizar grafo"
                >
                  <RotateCcw className={`size-3.5 ${isReloading ? "animate-spin text-primary" : ""}`} />
                </Button>

                {/* Toggle MiniMap */}
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowMiniMap(!showMiniMap)}
                  className={`size-8.5 rounded-xl glass border-border/60 text-foreground hover:border-primary shadow-md ${
                    showMiniMap ? "bg-primary/20 text-primary border-primary" : "bg-card/95"
                  }`}
                  title={showMiniMap ? "Ocultar mini-mapa" : "Exibir mini-mapa"}
                >
                  <Map className="size-3.5" />
                </Button>

                {/* Fullscreen */}
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={toggleFullscreen}
                  className={`size-8.5 rounded-xl glass border-border/60 text-foreground hover:border-primary shadow-md ${
                    isFullscreen ? "bg-primary/20 text-primary border-primary" : "bg-card/95"
                  }`}
                  title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
                >
                  {isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
                </Button>
              </div>
            </div>

            {/* Bottom Row: Category Filter Chips (Clean, horizontal scroll, zero overlapping!) */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 pointer-events-auto">
              <button
                type="button"
                onClick={() => setActiveCategoryFilter("ALL")}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shadow-xs transition-all shrink-0 cursor-pointer ${
                  activeCategoryFilter === "ALL"
                    ? "bg-foreground text-background border-foreground ring-1 ring-primary/40"
                    : "bg-card/95 text-muted-foreground border-border/60 hover:text-foreground hover:bg-card"
                }`}
              >
                Todos ({categoryCounts.ALL || 0})
              </button>

              {(Object.keys(CATEGORY_CONFIGS) as GraphCategory[]).map((cat) => {
                const cfg = CATEGORY_CONFIGS[cat];
                const active = activeCategoryFilter === cat;
                const count = categoryCounts[cat] || 0;

                const compactName =
                  cat === "ROMANCE"
                    ? "Afetivo"
                    : cat === "FAMILY"
                    ? "Família"
                    : cat === "PROFESSIONAL"
                    ? "Trabalho"
                    : cat === "SOCIAL"
                    ? "Social"
                    : "Investigativo";

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategoryFilter(active ? "ALL" : cat)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      active
                        ? `${cfg.badgeBg} ${cfg.badgeText} ${cfg.badgeBorder} ring-1 ring-primary/40`
                        : "bg-card/95 text-muted-foreground border-border/60 hover:text-foreground hover:bg-card"
                    }`}
                    style={active ? { borderColor: cfg.color } : {}}
                  >
                    <span className="size-1.5 rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
                    <span>{compactName}</span>
                    <span className="text-[9px] opacity-75 font-mono">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </Panel>

        {/* Bottom-Right Pristine Glassmorphic Legenda (Zero overlap!) */}
        <Panel position="bottom-right" className="m-4">
          <div className="glass rounded-2xl p-3 border border-border/60 shadow-2xl text-[10px] font-medium space-y-1.5 bg-card/95 backdrop-blur-md max-w-[210px]">
            <div className="flex items-center justify-between pb-1 border-b border-border/40">
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                Legenda & Estilos
              </span>
              <span className="text-[9px] text-muted-foreground font-mono">
                {edges.length} vínculos
              </span>
            </div>

            <div
              onClick={() => setActiveCategoryFilter(activeCategoryFilter === "ROMANCE" ? "ALL" : "ROMANCE")}
              className="flex items-center justify-between gap-2 cursor-pointer hover:opacity-80 py-0.5"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-0.5 bg-[#f43f5e] rounded-full shadow-[0_0_6px_#f43f5e]" />
                <span className="text-foreground">Afetivo / Amoroso</span>
              </div>
              <Heart className="size-2.5 text-[#f43f5e]" />
            </div>

            <div
              onClick={() => setActiveCategoryFilter(activeCategoryFilter === "FAMILY" ? "ALL" : "FAMILY")}
              className="flex items-center justify-between gap-2 cursor-pointer hover:opacity-80 py-0.5"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-0.5 bg-[#e1306c] rounded-full shadow-[0_0_6px_#e1306c]" />
                <span className="text-foreground">Família (Sólida)</span>
              </div>
              <Users className="size-2.5 text-[#e1306c]" />
            </div>

            <div
              onClick={() => setActiveCategoryFilter(activeCategoryFilter === "PROFESSIONAL" ? "ALL" : "PROFESSIONAL")}
              className="flex items-center justify-between gap-2 cursor-pointer hover:opacity-80 py-0.5"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-0.5 border-t-2 border-dotted border-[#f59e0b]" />
                <span className="text-foreground">Profissional (Pontos)</span>
              </div>
              <Briefcase className="size-2.5 text-[#f59e0b]" />
            </div>

            <div
              onClick={() => setActiveCategoryFilter(activeCategoryFilter === "SOCIAL" ? "ALL" : "SOCIAL")}
              className="flex items-center justify-between gap-2 cursor-pointer hover:opacity-80 py-0.5"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-0.5 border-t-2 border-dashed border-[#8b5cf6]" />
                <span className="text-foreground">Social (Traços)</span>
              </div>
              <Users className="size-2.5 text-[#8b5cf6]" />
            </div>

            <div
              onClick={() => setActiveCategoryFilter(activeCategoryFilter === "INVESTIGATIVE" ? "ALL" : "INVESTIGATIVE")}
              className="flex items-center justify-between gap-2 cursor-pointer hover:opacity-80 py-0.5"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-0.5 border-t-2 border-dashed border-[#ef4444]" />
                <span className="text-foreground">Investigativo (Alerta)</span>
              </div>
              <ShieldAlert className="size-2.5 text-[#ef4444]" />
            </div>
          </div>
        </Panel>
      </ReactFlow>

      {/* 1. Connection Modal */}
      <ConnectionModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        sourceEntity={connectSource}
        targetEntity={connectTarget}
        availableNodes={availableNodeList}
        onConnectionCreated={handleConnectionCreated}
      />

      {/* 2. Edge Edit/Delete Modal */}
      <EdgeModal
        isOpen={isEdgeModalOpen}
        onClose={() => setIsEdgeModalOpen(false)}
        edgeData={selectedEdgeData}
        onEdgeUpdated={handleEdgeUpdated}
        onEdgeDeleted={handleEdgeDeleted}
      />

      {/* 3. Node Inspector Slide-over Drawer */}
      <NodeInspectorDrawer
        entityId={inspectorEntityId}
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        onOpenConnectModal={handleConnectFromNode}
        onFocusNode={handleFocusNodeFromDrawer}
        connectedNodes={connectedNodesForInspector}
      />
    </div>
  );
}

export function EntityGraph(props: EntityGraphProps) {
  return (
    <ReactFlowProvider>
      <EntityGraphInternal {...props} />
    </ReactFlowProvider>
  );
}

function formatRelationshipDefault(type: string): string {
  switch (type) {
    case "FATHER":
      return "Pai";
    case "MOTHER":
      return "Mãe";
    case "CHILD":
      return "Filho(a)";
    case "SIBLING":
      return "Irmão(ã)";
    case "SPOUSE":
      return "Cônjuge";
    case "GRANDPARENT":
      return "Avô/Avó";
    case "FRIEND":
      return "Amigo(a)";
    case "BUSINESS_PARTNER":
      return "Sócio(a)";
    case "COLLEAGUE":
      return "Colega";
    default:
      return "Vínculo";
  }
}
