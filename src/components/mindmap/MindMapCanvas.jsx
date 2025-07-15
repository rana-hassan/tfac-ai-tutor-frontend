import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

// Simple mind map implementation without external dependencies
const initialNodes = [
  { 
    id: '1', 
    x: 400, 
    y: 200, 
    label: 'Root Topic',
    color: '#8b5cf6',
    isRoot: true
  },
  { 
    id: '2', 
    x: 200, 
    y: 350, 
    label: 'Child Node 1',
    color: '#3b82f6',
    parent: '1'
  },
  { 
    id: '3', 
    x: 600, 
    y: 350, 
    label: 'Child Node 2',
    color: '#10b981',
    parent: '1'
  },
];

export default function MindMapCanvas() {
  const [nodes, setNodes] = useState(initialNodes);
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  const handleNodeMouseDown = (e, node) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - node.x * scale - panOffset.x;
    const offsetY = e.clientY - rect.top - node.y * scale - panOffset.y;
    
    setDragging(node.id);
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      const rect = canvasRef.current.getBoundingClientRect();
      const newX = (e.clientX - rect.left - dragOffset.x - panOffset.x) / scale;
      const newY = (e.clientY - rect.top - dragOffset.y - panOffset.y) / scale;
      
      setNodes(prev => prev.map(node => 
        node.id === dragging 
          ? { ...node, x: newX, y: newY }
          : node
      ));
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(0.5, Math.min(2, prev * delta)));
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, dragOffset, scale, panOffset]);

  const getConnectionPath = (fromNode, toNode) => {
    const fromX = fromNode.x * scale + panOffset.x;
    const fromY = fromNode.y * scale + panOffset.y;
    const toX = toNode.x * scale + panOffset.x;
    const toY = toNode.y * scale + panOffset.y;
    
    return `M ${fromX} ${fromY} Q ${(fromX + toX) / 2} ${fromY} ${toX} ${toY}`;
  };

  return (
    <div 
      className="h-full w-full bg-gradient-to-br from-[#1A1033] to-[#120623] relative overflow-hidden cursor-grab"
      role="region"
      aria-label="Interactive mind map"
      tabIndex={0}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#3c2a62" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      {/* Mind map canvas */}
      <div
        ref={canvasRef}
        className="relative w-full h-full"
        onWheel={handleWheel}
        style={{ cursor: dragging ? 'grabbing' : 'grab' }}
      >
        {/* Connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {nodes.map(node => {
            const parentNode = nodes.find(n => n.id === node.parent);
            if (!parentNode) return null;
            
            return (
              <motion.path
                key={`edge-${node.id}`}
                d={getConnectionPath(parentNode, node)}
                stroke="#6366f1"
                strokeWidth="2"
                fill="none"
                strokeDasharray="5,5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map((node, index) => (
          <motion.div
            key={node.id}
            className="absolute select-none cursor-pointer"
            style={{
              left: node.x * scale + panOffset.x - 60,
              top: node.y * scale + panOffset.y - 20,
              transform: `scale(${scale})`,
              transformOrigin: '60px 20px'
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            whileHover={{ scale: 1.05 }}
            onMouseDown={(e) => handleNodeMouseDown(e, node)}
          >
            <div
              className={`px-4 py-2 rounded-lg text-white font-medium shadow-lg border-2 border-white/20 ${
                node.isRoot ? 'text-lg px-6 py-3' : 'text-sm'
              }`}
              style={{ 
                backgroundColor: node.color,
                minWidth: '120px',
                textAlign: 'center'
              }}
            >
              {node.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 right-4 bg-black/50 rounded-lg p-2 flex flex-col gap-2">
        <button
          className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded text-white font-bold"
          onClick={() => setScale(prev => Math.min(2, prev * 1.2))}
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded text-white font-bold"
          onClick={() => setScale(prev => Math.max(0.5, prev * 0.8))}
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded text-white text-xs"
          onClick={() => {
            setScale(1);
            setPanOffset({ x: 0, y: 0 });
          }}
          aria-label="Reset view"
        >
          ⌂
        </button>
      </div>

      {/* Instructions */}
      <div className="absolute top-4 left-4 bg-black/50 rounded-lg p-3 text-white text-sm max-w-xs">
        <p className="font-semibold mb-1">Mind Map Controls:</p>
        <ul className="text-xs space-y-1">
          <li>• Drag nodes to reposition them</li>
          <li>• Scroll to zoom in/out</li>
          <li>• Use controls to reset view</li>
        </ul>
      </div>
    </div>
  );
}