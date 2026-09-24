import React, { useState, useMemo } from 'react';
import {
  ListTree,
  Share2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Info,
  X,
  BookOpen,
} from 'lucide-react';
import { StoryInsightData, MindMapNode, GraphNode, GraphLink } from '../../../../../core/files/fileTypes';
import { MindMapTreeCanvas } from './MindMapTreeCanvas';
import { MindMapNetworkCanvas } from './MindMapNetworkCanvas';

interface MindMapCanvasProps {
  data: StoryInsightData;
}

export const MindMapCanvas: React.FC<MindMapCanvasProps> = ({ data }) => {
  // 视图模式: 'tree' (大纲树) | 'network' (关系网络)
  const [viewMode, setViewMode] = useState<'tree' | 'network'>('tree');

  // 当前选中节点详情
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    label: string;
    category?: string;
    desc?: string;
    chapterRef?: string;
  } | null>(null);

  // 缩放级别
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // 宏观概览卡片是否收起 (默认收起以留出最大垂直空间给导图)
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  // 如果 graph.nodes 为空或过少，自动从 tree 递归收集所有叶子实体与建立有机关联
  const effectiveGraph = useMemo(() => {
    if (data.graph && Array.isArray(data.graph.nodes) && data.graph.nodes.length > 0) {
      return data.graph;
    }

    const nodes: GraphNode[] = [];
    const collectNodes = (node: MindMapNode) => {
      if (node.children && node.children.length > 0) {
        node.children.forEach(collectNodes);
      } else if (node.id !== 'root') {
        nodes.push({
          id: node.id,
          label: node.label,
          category: (node.category as any) || 'general',
          desc: node.desc,
          chapterRef: node.chapterRef,
        });
      }
    };
    collectNodes(data.tree);

    // 智能构建人物羁绊与事件连线
    const links: GraphLink[] = [];
    const charNodes = nodes.filter((n) => n.category === 'character');
    const plotNodes = nodes.filter((n) => n.category === 'plot' || n.category === 'event');
    const locNodes = nodes.filter((n) => n.category === 'location');

    // 1. 核心角色（如主角）与其余角色建立关系网
    if (charNodes.length > 1) {
      for (let i = 1; i < charNodes.length; i++) {
        const relation =
          i % 3 === 0
            ? '宿命对立'
            : i % 2 === 0
            ? '暗中结盟'
            : '同行羁绊';
        links.push({
          source: charNodes[0].id,
          target: charNodes[i].id,
          relation,
          sentiment: i % 3 === 0 ? 'negative' : 'positive',
        });
      }

      // 次级角色之间的交叉互动
      for (let i = 1; i < Math.min(charNodes.length - 1, 6); i += 2) {
        links.push({
          source: charNodes[i].id,
          target: charNodes[i + 1].id,
          relation: '暗流交锋',
          sentiment: 'neutral',
        });
      }
    }

    // 2. 角色与剧情/事件连线
    charNodes.slice(0, 6).forEach((char, idx) => {
      if (plotNodes[idx]) {
        links.push({
          source: char.id,
          target: plotNodes[idx].id,
          relation: '关键经历',
          sentiment: 'positive',
        });
      }
    });

    // 3. 地点与剧情连线
    if (locNodes.length > 0 && plotNodes.length > 0) {
      plotNodes.slice(0, 4).forEach((plot, idx) => {
        const loc = locNodes[idx % locNodes.length];
        links.push({
          source: plot.id,
          target: loc.id,
          relation: '发生地',
          sentiment: 'neutral',
        });
      });
    }

    return {
      nodes: nodes.length > 0 ? nodes : [{ id: 'root', label: data.title, category: 'character' as const, desc: data.executiveSummary }],
      links,
    };
  }, [data]);

  const handleSelectTreeNode = (node: MindMapNode) => {
    setSelectedItem({
      id: node.id,
      label: node.label,
      category: node.category,
      desc: node.desc,
      chapterRef: node.chapterRef,
    });
  };

  const handleSelectGraphNode = (node: GraphNode) => {
    setSelectedItem({
      id: node.id,
      label: node.label,
      category: node.category,
      desc: node.desc,
      chapterRef: node.chapterRef,
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        background: 'var(--nm-bg)',
      }}
    >
      {/* 顶部控制栏：双模切换 + 概览气泡 */}
      <div
        style={{
          padding: '10px 16px',
          borderBottom: '1px solid rgba(166, 180, 200, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          background: 'var(--nm-bg-lighter)',
        }}
      >
        {/* 轻拟物双模分段切换器 */}
        <div
          style={{
            display: 'flex',
            background: 'var(--nm-bg)',
            boxShadow: 'var(--nm-inset-xs)',
            borderRadius: '12px',
            padding: '3px',
            gap: '4px',
          }}
        >
          <button
            type="button"
            onClick={() => setViewMode('tree')}
            style={{
              padding: '6px 14px',
              borderRadius: '9px',
              border: 'none',
              background: viewMode === 'tree' ? 'var(--nm-bg)' : 'transparent',
              boxShadow: viewMode === 'tree' ? 'var(--nm-convex-xs)' : 'none',
              color: viewMode === 'tree' ? 'var(--nm-primary)' : 'var(--nm-text-sub)',
              fontSize: '12px',
              fontWeight: viewMode === 'tree' ? 700 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <ListTree size={14} />
            <span>大纲</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('network')}
            style={{
              padding: '6px 14px',
              borderRadius: '9px',
              border: 'none',
              background: viewMode === 'network' ? 'var(--nm-bg)' : 'transparent',
              boxShadow: viewMode === 'network' ? 'var(--nm-convex-xs)' : 'none',
              color: viewMode === 'network' ? '#7753A6' : 'var(--nm-text-sub)',
              fontSize: '12px',
              fontWeight: viewMode === 'network' ? 700 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <Share2 size={14} />
            <span>关系网络</span>
          </button>
        </div>

        {/* 缩放控制器 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--nm-bg)',
              boxShadow: 'var(--nm-convex-xs)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--nm-text-sub)',
              cursor: 'pointer',
            }}
            title="放大"
          >
            <ZoomIn size={14} />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--nm-bg)',
              boxShadow: 'var(--nm-convex-xs)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--nm-text-sub)',
              cursor: 'pointer',
            }}
            title="缩小"
          >
            <ZoomOut size={14} />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(1)}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--nm-bg)',
              boxShadow: 'var(--nm-convex-xs)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--nm-text-sub)',
              cursor: 'pointer',
            }}
            title="重置缩放"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* 宏观叙事底色概述卡片 (可折叠) */}
      {data.executiveSummary && (
        <div
          style={{
            margin: '10px 16px 0',
            padding: '10px 14px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(119, 83, 166, 0.08) 0%, rgba(80, 150, 198, 0.08) 100%)',
            border: '1px solid rgba(119, 83, 166, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <div
            onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#7753A6' }}>
              <Sparkles size={14} />
              <span>宏观洞察</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--nm-text-sub)' }}>
              {isSummaryExpanded ? '收起 ▲' : '展开 ▼'}
            </span>
          </div>
          {isSummaryExpanded && (
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--nm-text-sub)', lineHeight: '1.6' }}>
              {data.executiveSummary}
            </p>
          )}
        </div>
      )}

      {/* 画布主体区域 */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'top left',
          transition: 'transform 0.15s ease-out',
        }}
      >
        {viewMode === 'tree' ? (
          <MindMapTreeCanvas
            rootNode={data.tree}
            onSelectNode={handleSelectTreeNode}
            selectedNodeId={selectedItem?.id || null}
          />
        ) : (
          <MindMapNetworkCanvas
            nodes={effectiveGraph.nodes}
            links={effectiveGraph.links}
            onSelectNode={handleSelectGraphNode}
            selectedNodeId={selectedItem?.id || null}
          />
        )}
      </div>

      {/* 底部浮动实体详情小抽屉 */}
      {selectedItem && (
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '16px',
            right: '16px',
            borderRadius: '18px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            boxShadow: 'var(--nm-convex-md)',
            border: '1px solid rgba(166, 180, 200, 0.3)',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            animation: 'fadeIn 0.15s ease-out',
            zIndex: 30,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--nm-text-main)' }}>
                {selectedItem.label}
              </span>
              {selectedItem.category && (
                <span
                  style={{
                    fontSize: '10px',
                    padding: '1px 6px',
                    borderRadius: '6px',
                    background: 'rgba(119, 83, 166, 0.12)',
                    color: '#7753A6',
                    fontWeight: 700,
                  }}
                >
                  {selectedItem.category}
                </span>
              )}
            </div>
            <button
              onClick={() => setSelectedItem(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--nm-text-muted)',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X size={15} />
            </button>
          </div>

          {selectedItem.desc && (
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--nm-text-sub)', lineHeight: '1.5' }}>
              {selectedItem.desc}
            </p>
          )}

          {selectedItem.chapterRef && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--nm-primary)' }}>
              <BookOpen size={12} />
              <span>印证章节：{selectedItem.chapterRef}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
