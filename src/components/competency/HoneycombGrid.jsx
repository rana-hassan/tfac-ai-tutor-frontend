
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Lock, CheckCircle, Loader2, HelpCircle, Code, Database, Brain } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// --- Helper Functions ---

/**
 * Calculates true honeycomb tessellation layout for competencies.
 * Uses axial coordinates to ensure hexagons share edges with zero gaps.
 * @param {Array} competencies - The raw competency data.
 * @param {number} hexSize - The size of the hexagon (flat-to-flat distance).
 * @returns {{nodes: Array, connections: Array, posMap: Map, gridWidth: number, gridHeight: number}}
 */
const calculateLayout = (competencies, hexSize = 120) => {
  if (!competencies || competencies.length === 0) {
    return { nodes: [], connections: [], posMap: new Map(), gridWidth: 0, gridHeight: 0 };
  }

  const nodes = [];
  const posMap = new Map();
  
  // Hexagon math for perfect tessellation
  const hexWidth = hexSize; // flat-to-flat distance
  const hexHeight = hexSize * (2 / Math.sqrt(3)); // point-to-point distance
  const verticalSpacing = hexHeight * 0.75; // 3/4 of hex height for tessellation
  const horizontalSpacing = hexWidth * 0.75; // 3/4 of hex width for tessellation

  // For linear arrangement, place hexes in a horizontal line with proper tessellation
  competencies.forEach((competency, index) => {
    if(!competency) return;
    
    // Linear layout: all hexes in a row (q = index, r = 0)
    const q = index;
    const r = 0;
    
    // Convert axial coordinates to pixel coordinates for perfect tessellation
    const x = horizontalSpacing * q;
    const y = verticalSpacing * r;

    let status = 'locked';
    if (competency.is_completed) status = 'mastered';
    else if (competency.is_unlocked) status = 'in-progress';
    
    const node = {
      ...competency,
      x,
      y,
      q, // axial coordinate
      r, // axial coordinate
      title: competency.name,
      status,
      icon: competency.icon || 'HelpCircle'
    };
    
    nodes.push(node);
    
    // Store center position for connection calculations
    posMap.set(competency.id, { 
      x: x + hexWidth / 2, 
      y: y + hexHeight / 2 
    });
  });

  const gridWidth = competencies.length > 0 ? 
    Math.max(...nodes.map(n => n.x)) + hexWidth : 0;
  const gridHeight = hexHeight;

  return { nodes, connections: [], posMap, gridWidth, gridHeight };
};

/**
 * Computes edge connections between neighboring hexagons for light-rail effects.
 * In tessellated layout, calculates which hexes are truly adjacent (sharing an edge).
 * Creates visual connections between ALL adjacent hexes, regardless of unlock status.
 * 
 * @param {Array} nodes - Array of positioned hex nodes with axial coordinates
 * @param {Map} posMap - Map of node IDs to center positions
 * @returns {Array} Array of edge objects with from/to positions and states
 */
const computeHexEdges = (nodes, posMap) => {
  const edges = [];
  
  // For linear layout: connect each hex to its immediate neighbor
  // This creates the visual "rails" between ALL adjacent hexes
  for (let i = 0; i < nodes.length - 1; i++) {
    const fromNode = nodes[i];
    const toNode = nodes[i + 1];
    const fromPos = posMap.get(fromNode.id);
    const toPos = posMap.get(toNode.id);
    
    if (fromPos && toPos) {
      // A rail is "active" only if BOTH connected hexes are unlocked
      const isActive = fromNode.status !== 'locked' && toNode.status !== 'locked';
      
      edges.push({
        id: `${fromNode.id}-${toNode.id}`,
        x1: fromPos.x,
        y1: fromPos.y,
        x2: toPos.x,
        y2: toPos.y,
        active: isActive
      });
    }
  }
  
  return edges;
};

// --- Component ---

export default function HoneycombGrid({ 
  competencies = [], 
  onSelect = () => {}, 
  rpgMode = true,
  className = "" 
}) {
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const isReducedMotion = useReducedMotion();

  const { nodes, posMap, gridWidth, gridHeight } = useMemo(
    () => calculateLayout(competencies, typeof window !== 'undefined' && window.innerWidth <= 640 ? 80 : 120), // Smaller hexes on mobile
    [competencies]
  );

  const hexEdges = useMemo(
    () => computeHexEdges(nodes, posMap),
    [nodes, posMap]
  );
  
  if (!rpgMode || nodes.length === 0) {
    return <div className="p-4 text-center text-slate-500 text-base">No competencies to display in this path.</div>;
  }
  
  const iconMap = { 'Code': Code, 'Database': Database, 'Brain': Brain, 'HelpCircle': HelpCircle };

  const handleNodeClick = (node) => {
    if (node.status === 'locked') return;
    setSelectedNodeId(node.id);
    setTimeout(() => setSelectedNodeId(null), 300);
    if (typeof onSelect === 'function') onSelect(node.id);
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'mastered': return "bg-green-400 text-white border-green-500 shadow-lg shadow-green-500/30";
      case 'in-progress': return "bg-blue-400 text-white border-blue-500 shadow-md shadow-blue-500/25";
      default: return "bg-slate-200 text-slate-500 border-slate-300";
    }
  };

  const getStatusIcon = (status, nodeIcon) => {
    if (status === 'mastered') return CheckCircle;
    if (status === 'in-progress') return iconMap[nodeIcon] || Loader2;
    return Lock;
  };

  // Ensure uniform hexagon size by defining it once
  const hexSize = typeof window !== 'undefined' && window.innerWidth <= 640 ? 80 : 120; // Responsive hex size
  const hexHeight = hexSize * (2 / Math.sqrt(3));
  
  return (
    <TooltipProvider>
      {/* Mobile: Single column layout */}
      <div className="sm:hidden w-full">
        <div className="space-y-4 p-4">
          {nodes.map((node, index) => {
            const IconComponent = getStatusIcon(node.status, node.icon);
            // const isSelected = selectedNodeId === node.id; // not used in mobile layout, but kept for consistency if needed

            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="w-full"
              >
                <button
                  className={`w-full h-24 flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 ${getStatusStyles(node.status)}`}
                  onClick={() => handleNodeClick(node)}
                  disabled={node.status === 'locked'}
                  aria-label={node.title}
                >
                  <IconComponent className="w-8 h-8 flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <h3 className="text-base font-medium leading-tight">{node.title}</h3>
                    {node.description && (
                      <p className="text-sm opacity-80 mt-1 line-clamp-2">{node.description}</p>
                    )}
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Desktop: Honeycomb layout */}
      <div 
        className={`hidden sm:block relative ${className}`}
        style={{ width: gridWidth, height: gridHeight }}
      >
        {/* Animated Light-Rail SVG Overlay */}
        <svg 
          className="absolute top-0 left-0 w-full h-full" 
          style={{ zIndex: 5, pointerEvents: 'none' }}
          viewBox={`0 0 ${gridWidth} ${gridHeight}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Active gradient with animated flowing effect */}
            <linearGradient id="active-rail-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8">
                {!isReducedMotion && (
                  <animate 
                    attributeName="stop-color" 
                    values="#3b82f6;#8b5cf6;#06d6a0;#3b82f6" 
                    dur="3s" 
                    repeatCount="indefinite" 
                  />
                )}
              </stop>
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="1">
                {!isReducedMotion && (
                  <animate 
                    attributeName="stop-color" 
                    values="#8b5cf6;#06d6a0;#3b82f6;#8b5cf6" 
                    dur="3s" 
                    repeatCount="indefinite" 
                  />
                )}
              </stop>
              <stop offset="100%" stopColor="#06d6a0" stopOpacity="0.8">
                {!isReducedMotion && (
                  <animate 
                    attributeName="stop-color" 
                    values="#06d6a0;#3b82f6;#8b5cf6;#06d6a0" 
                    dur="3s" 
                    repeatCount="indefinite" 
                  />
                )}
              </stop>
            </linearGradient>
            
            {/* Inactive gradient - static grey */}
            <linearGradient id="inactive-rail-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#64748b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#64748b" stopOpacity="0.3" />
            </linearGradient>

            {/* Glowing filter for active rails */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Render light-rail connectors */}
          {hexEdges.map((edge) => (
            <motion.line
              key={edge.id}
              x1={edge.x1}
              y1={edge.y1}
              x2={edge.x2}
              y2={edge.y2}
              stroke={edge.active ? "url(#active-rail-gradient)" : "url(#inactive-rail-gradient)"}
              strokeWidth="4"
              strokeLinecap="round"
              filter={edge.active ? "url(#glow)" : "none"}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: 1, 
                opacity: edge.active ? 1 : 0.6,
                strokeWidth: edge.active ? 4 : 2
              }}
              transition={{ 
                pathLength: { duration: 0.8, ease: "easeInOut" },
                opacity: { duration: 0.5 },
                strokeWidth: { duration: 0.3 }
              }}
            />
          ))}
        </svg>

        {/* Hexagon Nodes Layer */}
        <div className="relative w-full h-full">
          <AnimatePresence>
            {nodes.map((node) => {
              const IconComponent = getStatusIcon(node.status, node.icon);
              const isSelected = selectedNodeId === node.id;

              return (
                <motion.div
                  key={node.id}
                  className="absolute"
                  style={{
                    left: node.x,
                    top: node.y,
                    width: hexSize,
                    height: hexHeight,
                    zIndex: 10
                  }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    ...(isSelected && !isReducedMotion && { rotateY: 180 })
                  }}
                  whileHover={!isReducedMotion ? { scale: 1.05, zIndex: 20 } : {}}
                  transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 17
                  }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className={`w-full h-full flex flex-col items-center justify-center gap-2 p-4 border-2 transition-all duration-300 ${getStatusStyles(node.status)}`}
                        style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                        onClick={() => handleNodeClick(node)}
                        disabled={node.status === 'locked'}
                        aria-label={node.title}
                      >
                        <motion.div style={{ rotateY: isSelected ? '180deg' : '0deg' }}>
                          <IconComponent className="w-6 h-6 sm:w-8 sm:h-8" />
                          <span className="text-xs sm:text-sm text-center leading-tight font-medium mt-1">
                            {node.title}
                          </span>
                        </motion.div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-base">{node.status === 'locked' ? "Finish previous skill to unlock" : node.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </TooltipProvider>
  );
}
