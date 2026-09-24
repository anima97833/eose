import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GraphNode, GraphLink } from '../../../../../core/files/fileTypes';
import { RotateCcw, X } from 'lucide-react';

interface MindMapNetworkCanvasProps {
  nodes: GraphNode[];
  links: GraphLink[];
  onSelectNode: (node: GraphNode) => void;
  selectedNodeId: string | null;
}

const CATEGORY_COLORS: Record<string, { fill: string; stroke: string; text: string; bg: string }> = {
  character: { fill: '#7753A6', stroke: '#5E3B87', text: '#fff', bg: 'rgba(119, 83, 166, 0.15)' },
  plot: { fill: '#2563EB', stroke: '#1D4ED8', text: '#fff', bg: 'rgba(37, 99, 235, 0.15)' },
  location: { fill: '#059669', stroke: '#047857', text: '#fff', bg: 'rgba(5, 150, 105, 0.15)' },
  event: { fill: '#D97706', stroke: '#B45309', text: '#fff', bg: 'rgba(217, 119, 6, 0.15)' },
  faction: { fill: '#DC2626', stroke: '#B91C1C', text: '#fff', bg: 'rgba(220, 38, 38, 0.15)' },
  theme: { fill: '#7C3AED', stroke: '#6D28D9', text: '#fff', bg: 'rgba(124, 58, 237, 0.15)' },
};

export const MindMapNetworkCanvas: React.FC<MindMapNetworkCanvasProps> = ({
  nodes,
  links,
  onSelectNode,
  selectedNodeId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // 画布平移偏移量（支持滚轮上下滑动、按住背景拖动画布、触屏单指滑动）
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });


  // 节点动态坐标
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // 鼠标悬停聚焦节点
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // 初始化星空/环形力导向坐标分布（采用 660x560 充足纵深空间）
  useEffect(() => {
    if (!nodes || nodes.length === 0) return;

    const width = 660;
    const height = 540;
    const centerX = width / 2;
    const centerY = height / 2;

    const positions: Record<string, { x: number; y: number }> = {};
    const radius = Math.min(centerX, centerY) * 0.74;

    // 环形均分 + 微随机散落
    nodes.forEach((node, index) => {
      const angle = (index / nodes.length) * 2 * Math.PI - Math.PI / 2;
      // 轻微离心散落使画面自然
      const jitter = index % 2 === 0 ? 1 : 0.84;
      const x = centerX + Math.cos(angle) * radius * jitter;
      const y = centerY + Math.sin(angle) * radius * jitter;
      positions[node.id] = { x, y };
    });

    setNodePositions(positions);
  }, [nodes]);

  // 活跃/选中的节点高亮集合
  const activeNodeId = hoveredNodeId || selectedNodeId;
  const connectedNodeIds = useMemo(() => {
    if (!activeNodeId) return null;
    const set = new Set<string>([activeNodeId]);
    links.forEach((l) => {
      if (l.source === activeNodeId) set.add(l.target);
      if (l.target === activeNodeId) set.add(l.source);
    });
    return set;
  }, [activeNodeId, links]);

  const getNodePos = (nodeId: string, fallbackIdx = 0) => {
    if (nodePositions[nodeId]) return nodePositions[nodeId];
    const width = 660;
    const height = 540;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) * 0.74;
    const angle = (fallbackIdx / Math.max(1, nodes.length)) * 2 * Math.PI - Math.PI / 2;
    const jitter = fallbackIdx % 2 === 0 ? 1 : 0.84;
    return {
      x: centerX + Math.cos(angle) * radius * jitter,
      y: centerY + Math.sin(angle) * radius * jitter,
    };
  };

  // 处理拖拽节点
  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggingNodeId(nodeId);
    const pos = getNodePos(nodeId);
    if (pos) {
      dragOffsetRef.current = {
        x: e.clientX - pos.x,
        y: e.clientY - pos.y,
      };
    }
  };

  // 背景点击拖拽平移画布
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNodeId) {
      const newX = e.clientX - dragOffsetRef.current.x;
      const newY = e.clientY - dragOffsetRef.current.y;
      setNodePositions((prev) => ({
        ...prev,
        [draggingNodeId]: { x: newX, y: newY },
      }));
    } else if (isPanning) {
      setPanOffset({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
    setIsPanning(false);
  };

  // 鼠标滚轮滑动平移（支持上下/左右自然滑动）
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setPanOffset((prev) => ({
      x: prev.x - e.deltaX * 0.85,
      y: prev.y - e.deltaY * 0.85,
    }));
  };

  // 触屏滑动支持
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX - panOffset.x,
        y: touch.clientY - panOffset.y,
      };
      setIsPanning(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isPanning && e.touches.length === 1) {
      const touch = e.touches[0];
      setPanOffset({
        x: touch.clientX - touchStartRef.current.x,
        y: touch.clientY - touchStartRef.current.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
  };

  if (!nodes || nodes.length === 0) {
    return (
      <div style={{ padding: '30px', textAlign: 'center', color: 'var(--nm-text-sub)' }}>
        暂无可绘制的关系节点数据
      </div>
    );
  }

  const isPanned = panOffset.x !== 0 || panOffset.y !== 0;

  return (
    <div
      ref={containerRef}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        background: 'radial-gradient(circle at center, rgba(119, 83, 166, 0.03) 0%, var(--nm-bg) 70%)',
        overflow: 'hidden',
        userSelect: 'none',
        cursor: isPanning ? 'grabbing' : 'grab',
      }}
    >

      {/* 视角复位悬浮徽标 */}
      {isPanned && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setPanOffset({ x: 0, y: 0 });
          }}
          style={{
            position: 'absolute',
            bottom: '14px',
            right: '14px',
            zIndex: 20,
            padding: '5px 10px',
            borderRadius: '10px',
            border: 'none',
            background: 'var(--nm-bg)',
            boxShadow: 'var(--nm-convex-xs)',
            fontSize: '11px',
            color: 'var(--nm-primary)',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
          title="复位画布位置"
        >
          <RotateCcw size={12} />
          <span>复位视角</span>
        </button>
      )}

      <svg
        id="network-canvas-bg"
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          inset: 0,
        }}
        viewBox="0 0 660 540"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* 平移变换主图层 */}
        <g transform={`translate(${panOffset.x}, ${panOffset.y})`}>
          {/* 1. 连线绘制 */}
          {links.map((link, idx) => {
            const sPos = getNodePos(link.source, nodes.findIndex((n) => n.id === link.source));
            const tPos = getNodePos(link.target, nodes.findIndex((n) => n.id === link.target));
            if (!sPos || !tPos) return null;

            const isConnected =
              !connectedNodeIds ||
              (connectedNodeIds.has(link.source) && connectedNodeIds.has(link.target));

            // 连线中点
            const midX = (sPos.x + tPos.x) / 2;
            const midY = (sPos.y + tPos.y) / 2;

            return (
              <g key={`link_${idx}`} opacity={isConnected ? 1 : 0.15} style={{ transition: 'opacity 0.2s' }}>
                {/* 连线光晕底衬 */}
                <line
                  x1={sPos.x}
                  y1={sPos.y}
                  x2={tPos.x}
                  y2={tPos.y}
                  stroke={isConnected && activeNodeId ? 'var(--nm-primary)' : 'rgba(166, 180, 200, 0.45)'}
                  strokeWidth={isConnected && activeNodeId ? 2.5 : 1.5}
                  strokeDasharray={link.sentiment === 'mystery' ? '4 3' : undefined}
                />

                {/* 关系标签胶囊 */}
                {link.relation && (
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x="-24"
                      y="-9"
                      width="48"
                      height="18"
                      rx="9"
                      fill="var(--nm-bg)"
                      stroke="rgba(166, 180, 200, 0.35)"
                      strokeWidth="1"
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={isConnected && activeNodeId ? 'var(--nm-primary)' : 'var(--nm-text-sub)'}
                      fontSize="9"
                      fontWeight="600"
                    >
                      {link.relation.slice(0, 4)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* 2. 节点绘制 */}
          {nodes.map((node, index) => {
            const pos = getNodePos(node.id, index);
            if (!pos) return null;

            const isSelected = selectedNodeId === node.id;
            const isDimmed = connectedNodeIds !== null && !connectedNodeIds.has(node.id);
            const colorCfg = CATEGORY_COLORS[node.category] || CATEGORY_COLORS.character;

            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                opacity={isDimmed ? 0.25 : 1}
                style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectNode(node);
                }}
              >
                {/* 选中高亮光环 */}
                {isSelected && (
                  <circle
                    r="26"
                    fill="none"
                    stroke="var(--nm-primary)"
                    strokeWidth="2.5"
                    strokeDasharray="4 2"
                    opacity="0.8"
                  />
                )}

                {/* 实体外圈投影与球体 */}
                <circle
                  r="18"
                  fill="var(--nm-bg)"
                  stroke={colorCfg.fill}
                  strokeWidth="2.5"
                  style={{
                    filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.12))',
                  }}
                />

                {/* 内部主色圆心 */}
                <circle r="12" fill={colorCfg.fill} />

                {/* 节点标题 */}
                <text
                  y="30"
                  textAnchor="middle"
                  fill="var(--nm-text-main)"
                  fontSize="11"
                  fontWeight="700"
                  style={{ pointerEvents: 'none' }}
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
