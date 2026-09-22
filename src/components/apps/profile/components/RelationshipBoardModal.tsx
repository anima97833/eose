import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import {
  RelationshipNode,
  RelationshipLink,
  RelationshipData,
  RelationshipCategory,
} from '../../../../core/rpg/relationshipTypes';
import { loadRelationshipData, saveRelationshipData } from '../../../../core/rpg/rpgStorage';
import { Plus, RotateCcw, X, Trash2, Edit3, Heart } from 'lucide-react';

interface RelationshipBoardModalProps {
  onClose: () => void;
}

const CATEGORY_NAMES: Record<RelationshipCategory, string> = {
  family: '血亲',
  partner: '伴侣',
  friend: '挚友',
  mentor: '引路',
  pet: '爱宠',
};

const CATEGORY_EMOJIS: Record<RelationshipCategory, string[]> = {
  family: ['👨', '👩', '👴', '👵', '🛡️', '🌸', '🏡'],
  partner: ['💖', '💍', '🕊️', '✨', '🌹'],
  friend: ['🍻', '🎸', '🎮', '🤝', '⚡'],
  mentor: ['📜', '📚', '🦉', '🔮', '🎓'],
  pet: ['🐾', '🐱', '🐶', '🐰', '🐹', '🦜'],
};

export const RelationshipBoardModal: React.FC<RelationshipBoardModalProps> = ({ onClose }) => {
  const [data, setData] = useState<RelationshipData>(loadRelationshipData);
  const [selectedNode, setSelectedNode] = useState<RelationshipNode | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // 编辑表单字段
  const [editName, setEditName] = useState('');
  const [editRelation, setEditRelation] = useState('');
  const [editCategory, setEditCategory] = useState<RelationshipCategory>('family');
  const [editEmoji, setEditEmoji] = useState('🌸');
  const [editDesc, setEditDesc] = useState('');

  // 新增表单字段
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('');
  const [newCategory, setNewCategory] = useState<RelationshipCategory>('family');
  const [newEmoji, setNewEmoji] = useState('👨');

  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const simulationRef = useRef<d3.Simulation<RelationshipNode, RelationshipLink> | null>(null);

  // 保存数据
  useEffect(() => {
    saveRelationshipData(data);
  }, [data]);

  // D3 力导向与绘制引擎
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 340;
    const height = containerRef.current.clientHeight || 460;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // 清理旧渲染

    // 容器根分组（用于支持平移与缩放）
    const g = svg.append('g').attr('class', 'board-zoom-container');

    // 缩放与平移行为
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.6, 2.2])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // 复制数据，防止 D3 破坏不可变状态
    const nodes: RelationshipNode[] = data.nodes.map((d) => ({
      ...d,
      x: d.isCenter ? width / 2 : (d.x ?? width / 2 + (Math.random() - 0.5) * 120),
      y: d.isCenter ? height / 2 : (d.y ?? height / 2 + (Math.random() - 0.5) * 120),
      fx: d.isCenter ? width / 2 : undefined,
      fy: d.isCenter ? height / 2 : undefined,
    }));

    const links: RelationshipLink[] = data.links.map((l) => ({
      ...l,
      source: typeof l.source === 'object' ? l.source.id : l.source,
      target: typeof l.target === 'object' ? l.target.id : l.target,
    }));

    // 初始化力导向系统（方向A：以“我”为中心发散）
    const simulation = d3
      .forceSimulation<RelationshipNode, RelationshipLink>(nodes)
      .force(
        'link',
        d3
          .forceLink<RelationshipNode, RelationshipLink>(links)
          .id((d) => d.id)
          .distance(95)
          .strength(0.8)
      )
      .force('charge', d3.forceManyBody().strength(-260))
      .force('collide', d3.forceCollide().radius(48).iterations(3))
      .force('radial', d3.forceRadial(100, width / 2, height / 2).strength(0.35))
      .alphaDecay(0.04);

    simulationRef.current = simulation;

    // 1. 绘制红绳连线层
    const linkGroup = g.append('g').attr('class', 'links');
    const link = linkGroup
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#E05A47')
      .attr('stroke-width', 2.5)
      .attr('stroke-dasharray', '5 2')
      .attr('opacity', 0.85);

    // 2. 绘制绳线上的图钉小铆钉
    const pinGroup = g.append('g').attr('class', 'pins');

    // 3. 绘制节点卡片层（软木板便签卡）
    const nodeGroup = g.append('g').attr('class', 'nodes');
    const node = nodeGroup
      .selectAll<SVGGElement, RelationshipNode>('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node-card')
      .style('cursor', 'grab')
      .call(
        d3
          .drag<SVGGElement, RelationshipNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            if (!d.isCenter) {
              d.fx = null;
              d.fy = null;
            }
          })
      )
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode(d);
        setIsEditing(false);
      });

    // 绘制卡片背景阴影
    node
      .append('rect')
      .attr('x', (d) => (d.isCenter ? -38 : -32))
      .attr('y', (d) => (d.isCenter ? -34 : -30))
      .attr('width', (d) => (d.isCenter ? 76 : 64))
      .attr('height', (d) => (d.isCenter ? 68 : 60))
      .attr('rx', 8)
      .attr('fill', 'rgba(80, 36, 40, 0.18)')
      .attr('transform', 'translate(2, 3)');

    // 绘制卡片本体（纯白偏暖纸片）
    node
      .append('rect')
      .attr('x', (d) => (d.isCenter ? -38 : -32))
      .attr('y', (d) => (d.isCenter ? -34 : -30))
      .attr('width', (d) => (d.isCenter ? 76 : 64))
      .attr('height', (d) => (d.isCenter ? 68 : 60))
      .attr('rx', 8)
      .attr('fill', (d) => (d.isCenter ? '#FFFDF5' : '#FFFFFF'))
      .attr('stroke', '#502428')
      .attr('stroke-width', (d) => (d.isCenter ? 2.5 : 2));

    // 绘制四角明黄米字胶带纸（Washi Tape）
    // 左上胶带
    node
      .append('rect')
      .attr('x', (d) => (d.isCenter ? -42 : -36))
      .attr('y', (d) => (d.isCenter ? -36 : -32))
      .attr('width', 16)
      .attr('height', 7)
      .attr('fill', '#FDE047')
      .attr('opacity', 0.85)
      .attr('transform', 'rotate(-25, -34, -30)');

    // 右上胶带
    node
      .append('rect')
      .attr('x', (d) => (d.isCenter ? 26 : 20))
      .attr('y', (d) => (d.isCenter ? -36 : -32))
      .attr('width', 16)
      .attr('height', 7)
      .attr('fill', '#FDE047')
      .attr('opacity', 0.85)
      .attr('transform', 'rotate(25, 34, -30)');

    // 绘制中心大卡主角金皇冠
    node
      .filter((d) => !!d.isCenter)
      .append('text')
      .attr('x', 0)
      .attr('y', -36)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .text('👑');

    // 绘制卡片头像/Emoji
    node
      .append('text')
      .attr('x', 0)
      .attr('y', (d) => (d.isCenter ? -6 : -5))
      .attr('text-anchor', 'middle')
      .attr('font-size', (d) => (d.isCenter ? '24px' : '20px'))
      .text((d) => d.avatarEmoji || '⭐');

    // 绘制人物姓名 (萌系胖胖艺术字，<= 5字)
    node
      .append('text')
      .attr('x', 0)
      .attr('y', (d) => (d.isCenter ? 15 : 12))
      .attr('text-anchor', 'middle')
      .attr('fill', '#502428')
      .attr('font-weight', '800')
      .attr('font-size', (d) => (d.isCenter ? '12px' : '11px'))
      .attr(
        'font-family',
        '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", "幼圆", cursive, sans-serif'
      )
      .text((d) => d.name);

    // 绘制人物关系小标签底色
    node
      .append('rect')
      .attr('x', -18)
      .attr('y', (d) => (d.isCenter ? 22 : 18))
      .attr('width', 36)
      .attr('height', 12)
      .attr('rx', 6)
      .attr('fill', (d) => (d.isCenter ? '#FDE047' : '#FAF3E8'))
      .attr('stroke', '#502428')
      .attr('stroke-width', 1);

    // 绘制关系文字（<=5字）
    node
      .append('text')
      .attr('x', 0)
      .attr('y', (d) => (d.isCenter ? 30.5 : 26.5))
      .attr('text-anchor', 'middle')
      .attr('fill', '#502428')
      .attr('font-weight', '800')
      .attr('font-size', '8px')
      .attr(
        'font-family',
        '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", "幼圆", cursive, sans-serif'
      )
      .text((d) => d.relation);

    // 顶心图钉
    node
      .append('circle')
      .attr('cx', 0)
      .attr('cy', (d) => (d.isCenter ? -34 : -30))
      .attr('r', 4)
      .attr('fill', '#DC2626')
      .attr('stroke', '#502428')
      .attr('stroke-width', 1.5);

    // 每帧物理模拟更新
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d) => `translate(${d.x}, ${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [data]);

  // 重置力导向位置居中
  const handleResetView = () => {
    if (simulationRef.current) {
      simulationRef.current.alpha(1).restart();
    }
  };

  // 保存修改
  const handleSaveEdit = () => {
    if (!selectedNode) return;
    setData((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) =>
        n.id === selectedNode.id
          ? {
              ...n,
              name: editName.trim() || n.name,
              relation: editRelation.trim() || n.relation,
              category: editCategory,
              avatarEmoji: editEmoji,
              desc: editDesc.trim(),
            }
          : n
      ),
    }));
    setIsEditing(false);
    setSelectedNode(null);
  };

  // 删除节点
  const handleDeleteNode = (id: string) => {
    if (id === 'node_self') return; // 不能删除主角自己
    setData((prev) => ({
      nodes: prev.nodes.filter((n) => n.id !== id),
      links: prev.links.filter(
        (l) =>
          (typeof l.source === 'object' ? l.source.id : l.source) !== id &&
          (typeof l.target === 'object' ? l.target.id : l.target) !== id
      ),
    }));
    setSelectedNode(null);
  };

  // 新增节点
  const handleAddNode = () => {
    if (!newName.trim()) return;
    const newId = `node_${Date.now()}`;
    const newNode: RelationshipNode = {
      id: newId,
      name: newName.slice(0, 5),
      relation: newRelation.slice(0, 5) || '亲友',
      category: newCategory,
      avatarEmoji: newEmoji,
    };
    const newLink: RelationshipLink = {
      id: `link_self_${newId}`,
      source: 'node_self',
      target: newId,
      label: '羁绊',
    };
    setData((prev) => ({
      nodes: [...prev.nodes, newNode],
      links: [...prev.links, newLink],
    }));
    setShowAddModal(false);
    setNewName('');
    setNewRelation('');
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(28, 20, 24, 0.65)',
        backdropFilter: 'blur(6px)',
        padding: '12px',
      }}
    >
      {/* 软木挂板外框（100% 对齐图2：木质上下挂轴 + 藤蔓星星） */}
      <div
        style={{
          width: '100%',
          maxWidth: '360px',
          height: '92%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          borderRadius: '20px',
          background: '#C7BD96',
          border: '3px solid #502428',
          boxShadow: '0 16px 36px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden',
          userSelect: 'none',
        }}
      >
        {/* ================= 顶部木质横轴与藤蔓星星 ================= */}
        <div
          style={{
            width: '100%',
            height: '48px',
            background: 'linear-gradient(180deg, #D48C46 0%, #A55E22 100%)',
            borderBottom: '3px solid #502428',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 12px',
            position: 'relative',
            zIndex: 10,
          }}
        >
          {/* 藤蔓绿叶装饰条 */}
          <div
            style={{
              position: 'absolute',
              top: '-4px',
              left: '20%',
              right: '20%',
              height: '10px',
              background: '#65A30D',
              borderRadius: '5px',
              opacity: 0.85,
            }}
          />

          {/* 标题胶囊（<=5字） */}
          <div
            style={{
              background: '#FFFDF5',
              border: '2px solid #502428',
              borderRadius: '16px',
              padding: '2px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 4px rgba(80, 36, 40, 0.2)',
            }}
          >
            <span style={{ fontSize: '13px' }}>⭐</span>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 900,
                color: '#502428',
                fontFamily:
                  '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", "幼圆", cursive, sans-serif',
              }}
            >
              亲缘图谱
            </span>
          </div>

          {/* 右侧操作按钮群 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* 居中重置 */}
            <button
              onClick={handleResetView}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: '#FAF4E8',
                border: '1.8px solid #502428',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#502428',
              }}
              title="整理"
            >
              <RotateCcw size={14} />
            </button>

            {/* 新增亲友 */}
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: '#FDE047',
                border: '1.8px solid #502428',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#502428',
              }}
              title="添亲友"
            >
              <Plus size={16} strokeWidth={3} />
            </button>

            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: '#EF4444',
                border: '1.8px solid #502428',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
              title="关闭"
            >
              <X size={16} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* ================= 中间软木画板主体 ================= */}
        <div
          ref={containerRef}
          style={{
            flex: 1,
            position: 'relative',
            background: '#F5EBD7',
            backgroundImage:
              'radial-gradient(#E8DAC0 15%, transparent 16%), radial-gradient(#DFCEAF 15%, transparent 16%)',
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px',
            overflow: 'hidden',
          }}
        >
          {/* D3 SVG 画布 */}
          <svg
            ref={svgRef}
            style={{ width: '100%', height: '100%', display: 'block' }}
          />

          {/* 底部轻量提示 */}
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(255, 253, 245, 0.9)',
              border: '1.5px solid #502428',
              borderRadius: '12px',
              padding: '2px 10px',
              fontSize: '10px',
              fontWeight: 800,
              color: '#502428',
              pointerEvents: 'none',
              fontFamily:
                '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", "幼圆", cursive, sans-serif',
            }}
          >
            拖拽晃动 · 双指缩放
          </div>
        </div>

        {/* ================= 底部木质轴 ================= */}
        <div
          style={{
            width: '100%',
            height: '20px',
            background: 'linear-gradient(180deg, #D48C46 0%, #A55E22 100%)',
            borderTop: '3px solid #502428',
          }}
        />
      </div>

      {/* ================= 详情 / 编辑微型小卡片弹窗 ================= */}
      {selectedNode && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 90,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setSelectedNode(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '280px',
              background: '#FFFDF5',
              border: '3px solid #502428',
              borderRadius: '20px',
              padding: '16px',
              boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 卡片顶栏 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: 900,
                  color: '#502428',
                  fontFamily:
                    '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", "幼圆", cursive, sans-serif',
                }}
              >
                {isEditing ? '编辑信息' : '人物详情'}
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer',
                  color: '#502428',
                  fontWeight: 900,
                }}
              >
                ✕
              </button>
            </div>

            {!isEditing ? (
              // 查看模式
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div style={{ fontSize: '38px' }}>
                  {selectedNode.avatarEmoji || '⭐'}
                </div>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: 900,
                    color: '#502428',
                    fontFamily:
                      '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", "幼圆", cursive, sans-serif',
                  }}
                >
                  {selectedNode.name}
                </div>
                <div
                  style={{
                    background: '#FAF3E8',
                    border: '1.5px solid #502428',
                    borderRadius: '12px',
                    padding: '2px 10px',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#502428',
                  }}
                >
                  称谓: {selectedNode.relation} · {CATEGORY_NAMES[selectedNode.category]}
                </div>

                {selectedNode.desc && (
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#6B4A52',
                      textAlign: 'center',
                      lineHeight: '1.5',
                      padding: '6px 10px',
                      background: '#F5EBD7',
                      borderRadius: '10px',
                      width: '100%',
                    }}
                  >
                    “{selectedNode.desc}”
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    width: '100%',
                    marginTop: '8px',
                  }}
                >
                  <button
                    onClick={() => {
                      setEditName(selectedNode.name);
                      setEditRelation(selectedNode.relation);
                      setEditCategory(selectedNode.category);
                      setEditEmoji(selectedNode.avatarEmoji || '⭐');
                      setEditDesc(selectedNode.desc || '');
                      setIsEditing(true);
                    }}
                    style={{
                      flex: 1,
                      padding: '6px',
                      borderRadius: '10px',
                      background: '#FDE047',
                      border: '1.8px solid #502428',
                      fontWeight: 800,
                      color: '#502428',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    编辑
                  </button>

                  {!selectedNode.isCenter && (
                    <button
                      onClick={() => handleDeleteNode(selectedNode.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '10px',
                        background: '#EF4444',
                        border: '1.8px solid #502428',
                        fontWeight: 800,
                        color: '#FFFFFF',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      删除
                    </button>
                  )}
                </div>
              </div>
            ) : (
              // 编辑模式
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#502428' }}>
                    姓名 (5字内)
                  </label>
                  <input
                    value={editName}
                    maxLength={5}
                    onChange={(e) => setEditName(e.target.value)}
                    style={{
                      padding: '5px 8px',
                      borderRadius: '8px',
                      border: '1.5px solid #502428',
                      fontSize: '12px',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#502428' }}>
                    称谓 (如: 母亲)
                  </label>
                  <input
                    value={editRelation}
                    maxLength={5}
                    onChange={(e) => setEditRelation(e.target.value)}
                    style={{
                      padding: '5px 8px',
                      borderRadius: '8px',
                      border: '1.5px solid #502428',
                      fontSize: '12px',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#502428' }}>
                    羁绊类型
                  </label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {(Object.keys(CATEGORY_NAMES) as RelationshipCategory[]).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setEditCategory(cat);
                          setEditEmoji(CATEGORY_EMOJIS[cat][0]);
                        }}
                        style={{
                          flex: 1,
                          padding: '3px 0',
                          fontSize: '10px',
                          fontWeight: 800,
                          borderRadius: '6px',
                          border: '1.5px solid #502428',
                          background: editCategory === cat ? '#FDE047' : '#FAF4E8',
                          cursor: 'pointer',
                        }}
                      >
                        {CATEGORY_NAMES[cat]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Emoji 头像选择 */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {CATEGORY_EMOJIS[editCategory].map((emo) => (
                    <button
                      key={emo}
                      type="button"
                      onClick={() => setEditEmoji(emo)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        border:
                          editEmoji === emo
                            ? '2px solid #DC2626'
                            : '1.5px solid #502428',
                        background: '#FAF4E8',
                        fontSize: '15px',
                        cursor: 'pointer',
                      }}
                    >
                      {emo}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <button
                    onClick={handleSaveEdit}
                    style={{
                      flex: 1,
                      padding: '6px',
                      borderRadius: '10px',
                      background: '#10B981',
                      border: '1.8px solid #502428',
                      fontWeight: 800,
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    style={{
                      flex: 1,
                      padding: '6px',
                      borderRadius: '10px',
                      background: '#E2E8F0',
                      border: '1.8px solid #502428',
                      fontWeight: 800,
                      color: '#502428',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= 新增亲友浮层 ================= */}
      {showAddModal && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 90,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '280px',
              background: '#FFFDF5',
              border: '3px solid #502428',
              borderRadius: '20px',
              padding: '16px',
              boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: 900,
                  color: '#502428',
                  fontFamily:
                    '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", "幼圆", cursive, sans-serif',
                }}
              >
                添加亲友
              </span>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer',
                  color: '#502428',
                  fontWeight: 900,
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#502428' }}>
                姓名 (5字内)
              </label>
              <input
                value={newName}
                maxLength={5}
                placeholder="例如: 阿橘 / 导师"
                onChange={(e) => setNewName(e.target.value)}
                style={{
                  padding: '5px 8px',
                  borderRadius: '8px',
                  border: '1.5px solid #502428',
                  fontSize: '12px',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#502428' }}>
                称谓 (如: 妹妹)
              </label>
              <input
                value={newRelation}
                maxLength={5}
                placeholder="例如: 挚友 / 妹妹"
                onChange={(e) => setNewRelation(e.target.value)}
                style={{
                  padding: '5px 8px',
                  borderRadius: '8px',
                  border: '1.5px solid #502428',
                  fontSize: '12px',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#502428' }}>
                类别
              </label>
              <div style={{ display: 'flex', gap: '4px' }}>
                {(Object.keys(CATEGORY_NAMES) as RelationshipCategory[]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setNewCategory(cat);
                      setNewEmoji(CATEGORY_EMOJIS[cat][0]);
                    }}
                    style={{
                      flex: 1,
                      padding: '3px 0',
                      fontSize: '10px',
                      fontWeight: 800,
                      borderRadius: '6px',
                      border: '1.5px solid #502428',
                      background: newCategory === cat ? '#FDE047' : '#FAF4E8',
                      cursor: 'pointer',
                    }}
                  >
                    {CATEGORY_NAMES[cat]}
                  </button>
                ))}
              </div>
            </div>

            {/* Emoji 选定 */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {CATEGORY_EMOJIS[newCategory].map((emo) => (
                <button
                  key={emo}
                  type="button"
                  onClick={() => setNewEmoji(emo)}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    border:
                      newEmoji === emo
                        ? '2px solid #DC2626'
                        : '1.5px solid #502428',
                    background: '#FAF4E8',
                    fontSize: '15px',
                    cursor: 'pointer',
                  }}
                >
                  {emo}
                </button>
              ))}
            </div>

            <button
              onClick={handleAddNode}
              disabled={!newName.trim()}
              style={{
                width: '100%',
                marginTop: '6px',
                padding: '7px',
                borderRadius: '10px',
                background: newName.trim() ? '#10B981' : '#CBD5E1',
                border: '1.8px solid #502428',
                fontWeight: 800,
                color: '#FFFFFF',
                cursor: newName.trim() ? 'pointer' : 'not-allowed',
                fontSize: '12px',
              }}
            >
              完成添加
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
