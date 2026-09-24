import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, BookOpen, User, MapPin, Zap, Bookmark, Sparkles } from 'lucide-react';
import { MindMapNode, MindMapCategory } from '../../../../../core/files/fileTypes';

interface MindMapTreeCanvasProps {
  rootNode: MindMapNode;
  onSelectNode: (node: MindMapNode) => void;
  selectedNodeId: string | null;
}

const CATEGORY_CONFIG: Record<
  MindMapCategory,
  { label: string; color: string; bg: string; icon: any }
> = {
  root: { label: '核心', color: '#5E3B87', bg: 'rgba(119, 83, 166, 0.15)', icon: BookOpen },
  character: { label: '人物', color: '#7753A6', bg: 'rgba(119, 83, 166, 0.12)', icon: User },
  plot: { label: '主线', color: '#2563EB', bg: 'rgba(37, 99, 235, 0.12)', icon: Zap },
  location: { label: '世界观', color: '#059669', bg: 'rgba(5, 150, 105, 0.12)', icon: MapPin },
  event: { label: '事件', color: '#D97706', bg: 'rgba(217, 119, 6, 0.12)', icon: Sparkles },
  foreshadowing: { label: '伏笔', color: '#DB2777', bg: 'rgba(219, 39, 119, 0.12)', icon: Bookmark },
  theme: { label: '意境', color: '#7C3AED', bg: 'rgba(124, 58, 237, 0.12)', icon: Sparkles },
  general: { label: '分支', color: '#4B5563', bg: 'rgba(75, 85, 99, 0.12)', icon: BookOpen },
};

interface FlattenedItem {
  node: MindMapNode;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
  parentId: string | null;
}

export const MindMapTreeCanvas: React.FC<MindMapTreeCanvasProps> = ({
  rootNode,
  onSelectNode,
  selectedNodeId,
}) => {
  // 记录折叠状态的节点 ID 集合
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // 展开所有
  const expandAll = () => setCollapsedIds(new Set());
  // 折叠所有子分支
  const collapseAll = () => {
    const allIds = new Set<string>();
    const collect = (n: MindMapNode) => {
      if (n.children && n.children.length > 0) {
        if (n.id !== rootNode.id) allIds.add(n.id);
        n.children.forEach(collect);
      }
    };
    collect(rootNode);
    setCollapsedIds(allIds);
  };

  // 递归展平树结构
  const flattenedList = useMemo(() => {
    const list: FlattenedItem[] = [];

    const traverse = (node: MindMapNode, depth: number, parentId: string | null) => {
      const hasChildren = Boolean(node.children && node.children.length > 0);
      const isExpanded = !collapsedIds.has(node.id);

      list.push({
        node,
        depth,
        hasChildren,
        isExpanded,
        parentId,
      });

      if (hasChildren && isExpanded) {
        node.children!.forEach((child: MindMapNode) => traverse(child, depth + 1, node.id));
      }
    };

    traverse(rootNode, 0, null);
    return list;
  }, [rootNode, collapsedIds]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 快捷展开/折叠按钮 */}
      <div
        style={{
          padding: '6px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          borderBottom: '1px solid rgba(166, 180, 200, 0.2)',
          fontSize: '11px',
          color: 'var(--nm-text-sub)',
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={expandAll}
            style={{
              padding: '3px 8px',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--nm-bg)',
              boxShadow: 'var(--nm-convex-xs)',
              fontSize: '11px',
              color: 'var(--nm-text-main)',
              cursor: 'pointer',
            }}
          >
            全部展开
          </button>
          <button
            type="button"
            onClick={collapseAll}
            style={{
              padding: '3px 8px',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--nm-bg)',
              boxShadow: 'var(--nm-convex-xs)',
              fontSize: '11px',
              color: 'var(--nm-text-main)',
              cursor: 'pointer',
            }}
          >
            全部收起
          </button>
        </div>
      </div>

      {/* 树状渲染主体列表 */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'auto',
          padding: '16px 20px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '320px' }}>
          {flattenedList.map(({ node, depth, hasChildren, isExpanded }) => {
            const isSelected = selectedNodeId === node.id;
            const cat = node.category || 'general';
            const catCfg = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.general;
            const Icon = catCfg.icon;

            const isRoot = depth === 0;

            return (
              <div
                key={node.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: `${depth * 24}px`,
                  position: 'relative',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* 树枝连接辅助线 */}
                {depth > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: '-14px',
                      top: '50%',
                      width: '12px',
                      height: '1px',
                      background: 'rgba(166, 180, 200, 0.4)',
                    }}
                  />
                )}

                {/* 节点微拟物卡片 */}
                <div
                  onClick={() => onSelectNode(node)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: isRoot ? '10px 16px' : '7px 12px',
                    borderRadius: isRoot ? '16px' : '12px',
                    background: isSelected
                      ? 'linear-gradient(135deg, rgba(80, 150, 198, 0.2) 0%, rgba(119, 83, 166, 0.15) 100%)'
                      : 'var(--nm-bg)',
                    boxShadow: isSelected ? 'var(--nm-inset-xs)' : 'var(--nm-convex-xs)',
                    border: isSelected
                      ? '1px solid var(--nm-primary)'
                      : isRoot
                      ? '1px solid rgba(119, 83, 166, 0.4)'
                      : '1px solid rgba(255, 255, 255, 0.8)',
                    cursor: 'pointer',
                    userSelect: 'none',
                    maxWidth: '85%',
                  }}
                >
                  {/* 折叠/展开切换小触控 */}
                  {hasChildren ? (
                    <button
                      type="button"
                      onClick={(e) => toggleCollapse(node.id, e)}
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'rgba(166, 180, 200, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'var(--nm-text-sub)',
                        padding: 0,
                        flexShrink: 0,
                      }}
                    >
                      {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                    </button>
                  ) : (
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: catCfg.color, flexShrink: 0 }} />
                  )}

                  {/* 类别徽章 */}
                  {!isRoot && (
                    <span
                      style={{
                        fontSize: '9px',
                        padding: '1px 5px',
                        borderRadius: '6px',
                        background: catCfg.bg,
                        color: catCfg.color,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={10} />
                      {catCfg.label}
                    </span>
                  )}

                  {/* 节点标题 */}
                  <span
                    style={{
                      fontSize: isRoot ? '14px' : '12px',
                      fontWeight: isRoot ? 700 : 600,
                      color: isRoot ? '#7753A6' : 'var(--nm-text-main)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {node.label}
                  </span>

                  {/* 章节印证角标 */}
                  {node.chapterRef && (
                    <span
                      style={{
                        fontSize: '10px',
                        color: 'var(--nm-text-sub)',
                        background: 'rgba(0,0,0,0.04)',
                        padding: '1px 5px',
                        borderRadius: '6px',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      {node.chapterRef}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
