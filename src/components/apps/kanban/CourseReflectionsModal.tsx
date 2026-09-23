import React, { useState, useEffect, useMemo } from 'react';
import {
  CourseReflectionRecord,
  CourseAttributeTag,
} from '../../../core/kanban/courseKanbanTypes';
import {
  getAllCourseReflections,
  addCustomCourseReflection,
  deleteCustomCourseReflection,
  ATTR_TAG_INFO,
} from '../../../core/kanban/courseKanbanStorage';
import { NM } from '../storyword/storyWordNeumorphism';
import {
  X,
  BookOpenCheck,
  Send,
  Trash2,
  Sparkles,
  Calendar,
  Filter,
  Plus,
} from 'lucide-react';

interface CourseReflectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const CourseReflectionsModal: React.FC<CourseReflectionsModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [reflections, setReflections] = useState<CourseReflectionRecord[]>([]);
  const [selectedTag, setSelectedTag] = useState<CourseAttributeTag | 'ALL'>('ALL');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTag, setNewTag] = useState<CourseAttributeTag>('INT');

  const loadData = () => {
    setReflections(getAllCourseReflections());
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const filteredReflections = useMemo(() => {
    if (selectedTag === 'ALL') return reflections;
    return reflections.filter(r => r.attributeTag === selectedTag);
  }, [reflections, selectedTag]);

  if (!isOpen) return null;

  const handleAddCustom = () => {
    if (!newContent.trim()) {
      onShowToast('请写下心得内容');
      return;
    }
    addCustomCourseReflection(newContent, newTag, newTitle);
    setNewContent('');
    setNewTitle('');
    setShowAddForm(false);
    loadData();
    onShowToast('自留心得已保存至手账阁！');
  };

  const handleDelete = (id: string) => {
    deleteCustomCourseReflection(id);
    loadData();
    onShowToast('记录已删除');
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const h = d.getHours().toString().padStart(2, '0');
    const min = d.getMinutes().toString().padStart(2, '0');
    return `${m}-${day} ${h}:${min}`;
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(54, 46, 34, 0.48)',
        backdropFilter: 'blur(4px)',
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '430px',
          maxHeight: '88vh',
          backgroundColor: NM.cardBg,
          borderRadius: '22px',
          boxShadow: NM.convexLg,
          border: NM.borderLight,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* 顶部标题栏 */}
        <div
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: NM.borderSoft,
            background: 'linear-gradient(180deg, #FBF8F2 0%, #F5F0E6 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                backgroundColor: NM.bgInset,
                boxShadow: NM.insetSm,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BookOpenCheck size={18} color={NM.amber} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: NM.textMain }}>
                全栈学习心得阁
              </div>
              <div style={{ fontSize: '10.5px', color: NM.textMuted }}>
                课时感悟 · 六维沉淀 · 费曼笔记 ({reflections.length} 篇)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              title="写一段自留心得"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: showAddForm ? NM.amber : NM.cardBg,
                boxShadow: NM.convexXs,
                border: NM.borderLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: showAddForm ? '#fff' : NM.textSub,
                transition: 'all 0.15s ease',
              }}
            >
              <Plus size={16} />
            </button>

            <button
              onClick={onClose}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: NM.cardBg,
                boxShadow: NM.convexXs,
                border: NM.borderLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: NM.textMuted,
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* 六维分类筛选标签栏 */}
        <div
          style={{
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            overflowX: 'auto',
            backgroundColor: '#F7F2E8',
            borderBottom: '1px solid #ECE3D4',
          }}
        >
          <button
            onClick={() => setSelectedTag('ALL')}
            style={{
              padding: '4px 10px',
              borderRadius: '8px',
              border: selectedTag === 'ALL' ? '1.5px solid #B0894C' : NM.borderLight,
              backgroundColor: selectedTag === 'ALL' ? '#FFFFFF' : 'transparent',
              color: selectedTag === 'ALL' ? '#78350F' : NM.textMuted,
              fontSize: '11px',
              fontWeight: selectedTag === 'ALL' ? 800 : 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: selectedTag === 'ALL' ? NM.convexXs : 'none',
            }}
          >
            全部 ({reflections.length})
          </button>
          {(['INT', 'SPI', 'CHA', 'DEX', 'STR', 'CON'] as CourseAttributeTag[]).map(tag => {
            const info = ATTR_TAG_INFO[tag];
            const count = reflections.filter(r => r.attributeTag === tag).length;
            const isSelected = selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                style={{
                  padding: '4px 9px',
                  borderRadius: '8px',
                  border: isSelected ? `1.5px solid ${info.color}` : '1px solid transparent',
                  backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
                  color: isSelected ? info.color : NM.textMuted,
                  fontSize: '11px',
                  fontWeight: isSelected ? 800 : 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  whiteSpace: 'nowrap',
                  boxShadow: isSelected ? NM.convexXs : 'none',
                }}
              >
                <span>{info.icon}</span>
                <span>{info.name}</span>
                {count > 0 && <span style={{ opacity: 0.7, fontSize: '10px' }}>({count})</span>}
              </button>
            );
          })}
        </div>

        {/* 滚动主体内容 */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {/* 自主快捷写感悟表单 */}
          {showAddForm && (
            <div
              style={{
                padding: '14px',
                borderRadius: '16px',
                backgroundColor: '#FFFFFF',
                boxShadow: NM.convexSm,
                border: '1.5px solid #E2D7C5',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                animation: 'fadeIn 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: NM.textMain }}>
                  ✍️ 记一段今日自主心得
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {(['INT', 'SPI', 'CHA', 'DEX', 'STR', 'CON'] as CourseAttributeTag[]).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewTag(t)}
                      style={{
                        padding: '2px 6px',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: 700,
                        border: newTag === t ? `1.5px solid ${ATTR_TAG_INFO[t].color}` : '1px solid #E2D7C5',
                        backgroundColor: newTag === t ? ATTR_TAG_INFO[t].bg : '#FFF',
                        color: ATTR_TAG_INFO[t].color,
                        cursor: 'pointer',
                      }}
                    >
                      {ATTR_TAG_INFO[t].icon} {ATTR_TAG_INFO[t].name}
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                placeholder="主题 / 来源（可选，如：读《思考快与慢》）"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '10px',
                  backgroundColor: NM.bgInset,
                  border: '1px solid #E2D7C5',
                  fontSize: '12px',
                  outline: 'none',
                  color: NM.textMain,
                }}
              />

              <textarea
                placeholder="写下你今天学到的精髓、顿悟或实践复盘..."
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                rows={3}
                style={{
                  padding: '8px 10px',
                  borderRadius: '10px',
                  backgroundColor: NM.bgInset,
                  border: '1px solid #E2D7C5',
                  fontSize: '12px',
                  lineHeight: '1.5',
                  outline: 'none',
                  resize: 'none',
                  color: NM.textMain,
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'none',
                    fontSize: '12px',
                    color: NM.textMuted,
                    cursor: 'pointer',
                  }}
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleAddCustom}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: NM.amber,
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: NM.convexXs,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Send size={12} />
                  <span>存入心得阁</span>
                </button>
              </div>
            </div>
          )}

          {/* 心得列表 */}
          {filteredReflections.length === 0 ? (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: NM.textMuted,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div style={{ fontSize: '32px', opacity: 0.7 }}>📖</div>
              <div style={{ fontSize: '13px', fontWeight: 700 }}>暂无此分类的心得感想</div>
              <div style={{ fontSize: '11px' }}>
                完成任一课时并提交感悟，或点击右上角「+」快速记录，将永久沉淀在此。
              </div>
            </div>
          ) : (
            filteredReflections.map(item => {
              const tagInfo = ATTR_TAG_INFO[item.attributeTag] || ATTR_TAG_INFO.INT;
              return (
                <div
                  key={item.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '16px',
                    backgroundColor: NM.cardBg,
                    boxShadow: NM.convexSm,
                    border: NM.borderLight,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    position: 'relative',
                  }}
                >
                  {/* 头部元信息 */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 800,
                          padding: '2px 7px',
                          borderRadius: '6px',
                          backgroundColor: tagInfo.bg,
                          color: tagInfo.color,
                          border: `1px solid ${tagInfo.color}33`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          flexShrink: 0,
                        }}
                      >
                        <span>{tagInfo.icon}</span>
                        <span>{tagInfo.name}</span>
                      </span>

                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 800,
                          color: NM.textMain,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.courseTitle}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <span style={{ fontSize: '10px', color: NM.textMuted }}>
                        {formatTime(item.createdAt)}
                      </span>
                      {item.isCustom && (
                        <button
                          onClick={() => handleDelete(item.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: NM.rose,
                            cursor: 'pointer',
                            padding: 2,
                            opacity: 0.7,
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 课时名称 */}
                  {item.chapterTitle && (
                    <div
                      style={{
                        fontSize: '11px',
                        color: NM.textSub,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span style={{ opacity: 0.6 }}>课时:</span>
                      <span>{item.chapterTitle}</span>
                    </div>
                  )}

                  {/* 感想内容卷轴气泡 */}
                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: '12px',
                      backgroundColor: '#FFFFFF',
                      boxShadow: NM.insetSm,
                      border: '1px solid #ECE3D4',
                      fontSize: '12px',
                      color: NM.textMain,
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                      position: 'relative',
                    }}
                  >
                    <span style={{ color: NM.amber, fontWeight: 900, marginRight: '4px' }}>“</span>
                    {item.content}
                    <span style={{ color: NM.amber, fontWeight: 900, marginLeft: '4px' }}>”</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
