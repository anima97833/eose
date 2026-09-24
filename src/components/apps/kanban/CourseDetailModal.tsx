import React, { useState } from 'react';
import { Course, CourseStatus, CourseChapter } from '../../../core/kanban/courseKanbanTypes';
import {
  toggleChapterCompletion,
  changeCourseStatus,
  deleteCourse,
  completeChapterWithReflection,
  ATTR_TAG_INFO,
} from '../../../core/kanban/courseKanbanStorage';
import { formatDuration, estimateRemainingDays } from '../../../core/kanban/courseParserEngine';
import { NM } from '../storyword/storyWordNeumorphism';
import {
  X,
  CheckCircle2,
  Circle,
  ExternalLink,
  Flame,
  Clock,
  Calendar,
  Trash2,
  Award,
  Play,
  RotateCcw,
  Sparkles,
  Send,
  BookOpen,
} from 'lucide-react';

interface CourseDetailModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  onCourseUpdated: () => void;
  onShowToast: (msg: string) => void;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  course,
  isOpen,
  onClose,
  onCourseUpdated,
  onShowToast,
}) => {
  const [currentCourse, setCurrentCourse] = useState<Course | null>(course);

  // 课时心得录入与查看弹窗状态
  const [reflectionTarget, setReflectionTarget] = useState<{
    index: number;
    chapter: CourseChapter;
  } | null>(null);
  const [reflectionText, setReflectionText] = useState('');

  // 同步外部传入的 course
  React.useEffect(() => {
    setCurrentCourse(course);
  }, [course]);

  if (!isOpen || !currentCourse) return null;

  const attrInfo = ATTR_TAG_INFO[currentCourse.attributeTag || 'INT'] || ATTR_TAG_INFO.INT;

  const progressPercent =
    currentCourse.totalChapters > 0
      ? Math.round((currentCourse.completedChapters / currentCourse.totalChapters) * 100)
      : 0;

  const remainingSeconds = Math.max(
    0,
    currentCourse.totalDurationSeconds * (1 - progressPercent / 100)
  );
  const remainingDays = estimateRemainingDays(remainingSeconds, currentCourse.dailyGoalMinutes);

  // 点击章节：打开课时心得手账弹窗
  const handleClickChapter = (idx: number, ch: CourseChapter) => {
    setReflectionTarget({ index: idx, chapter: ch });
    setReflectionText(ch.reflection || '');
  };

  // 提交感想并打卡
  const handleSubmitReflection = () => {
    if (!reflectionTarget) return;
    if (!reflectionText.trim()) {
      onShowToast('请写下本课时的一点收获感想');
      return;
    }

    const res = completeChapterWithReflection(
      currentCourse.id,
      reflectionTarget.index,
      reflectionText
    );

    if (res) {
      setCurrentCourse({ ...res.course });
      onCourseUpdated();
      onShowToast(res.rewardNotice);
      setReflectionTarget(null);
      setReflectionText('');
    }
  };

  // 仅取消本章节打卡
  const handleRevertCompletion = () => {
    if (!reflectionTarget) return;
    const updated = toggleChapterCompletion(currentCourse.id, reflectionTarget.index);
    if (updated) {
      setCurrentCourse({ ...updated });
      onCourseUpdated();
      onShowToast('已取消该课时完成状态');
      setReflectionTarget(null);
    }
  };

  // 状态流转（处理 WIP 限制）
  const handleStatusChange = (newStatus: CourseStatus) => {
    const res = changeCourseStatus(currentCourse.id, newStatus);
    if (!res.success) {
      onShowToast(res.message || '操作受限');
      return;
    }
    if (res.course) {
      setCurrentCourse({ ...res.course });
      onCourseUpdated();
      onShowToast(newStatus === 'in_progress' ? '已开始攻克' : newStatus === 'completed' ? '恭喜结课！' : '已移入待学');
    }
  };

  const handleDelete = () => {
    deleteCourse(currentCourse.id);
    onCourseUpdated();
    onShowToast('课程已删除');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(54, 46, 34, 0.45)',
        backdropFilter: 'blur(3px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '430px',
          maxHeight: '88vh',
          backgroundColor: NM.cardBg,
          borderRadius: '20px',
          boxShadow: NM.convexLg,
          border: NM.borderLight,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* 顶部标题与关闭 */}
        <div
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: NM.borderSoft,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor:
                  currentCourse.platform === 'bilibili'
                    ? '#FB7299'
                    : currentCourse.platform === 'xiaohongshu'
                    ? '#FF2442'
                    : currentCourse.platform === 'pan'
                    ? '#06A7FF'
                    : NM.gold,
                color: '#fff',
              }}
            >
              {currentCourse.platform === 'bilibili'
                ? 'B站课程'
                : currentCourse.platform === 'xiaohongshu'
                ? '小红书精选'
                : currentCourse.platform === 'pan'
                ? '网盘课程'
                : '自主规划'}
            </span>

            {/* 六维分类属性徽标 */}
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: attrInfo.bg,
                color: attrInfo.color,
                border: `1px solid ${attrInfo.color}33`,
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <span>{attrInfo.icon}</span>
              <span>{attrInfo.name}</span>
            </span>

            <span
              style={{
                fontSize: '11px',
                color: NM.textMuted,
              }}
            >
              讲师/作者: {currentCourse.author}
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: NM.textMuted,
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 主体滚动区 */}
        <div
          style={{
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* 课程大标题与简介 */}
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: NM.textMain, lineHeight: '1.4' }}>
              {currentCourse.title}
            </div>
            {currentCourse.intro && (
              <div
                style={{
                  fontSize: '12px',
                  color: NM.textSub,
                  marginTop: '6px',
                  lineHeight: '1.5',
                  backgroundColor: NM.bgInset,
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: NM.borderLight,
                }}
              >
                {currentCourse.intro}
              </div>
            )}
            {currentCourse.sourceUrl && (
              <a
                href={currentCourse.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  marginTop: '8px',
                  padding: '5px 12px',
                  borderRadius: '8px',
                  backgroundColor: NM.bgInset,
                  border: NM.borderSoft,
                  color: currentCourse.platform === 'xiaohongshu' ? '#FF2442' : currentCourse.platform === 'bilibili' ? '#FB7299' : NM.gold,
                  fontSize: '11px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: NM.convexXs,
                }}
              >
                <ExternalLink size={12} />
                <span>
                  {currentCourse.platform === 'xiaohongshu'
                    ? '在小红书查看原笔记'
                    : currentCourse.platform === 'bilibili'
                    ? '在 B 站观看原视频'
                    : '打开课程来源'}
                </span>
              </a>
            )}
          </div>

          {/* 进度仪表卡 */}
          <div
            style={{
              padding: '14px',
              borderRadius: '14px',
              backgroundColor: NM.cardBg,
              boxShadow: NM.insetSm,
              border: NM.borderLight,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={15} color={NM.amber} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: NM.textMain }}>
                  学习通关进度: {currentCourse.completedChapters} / {currentCourse.totalChapters} 讲
                </span>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 900, color: NM.amber }}>
                {progressPercent}%
              </span>
            </div>

            {/* 拟物进度条 */}
            <div
              style={{
                width: '100%',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: NM.bgInset,
                boxShadow: NM.insetSm,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  borderRadius: '4px',
                  background: `linear-gradient(90deg, ${NM.amber}, ${attrInfo.color})`,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: NM.textMuted,
              }}
            >
              <span>剩余时长: {formatDuration(remainingSeconds)}</span>
              <span>预计通关: 约 {remainingDays} 天</span>
            </div>
          </div>

          {/* 状态操作按钮条 */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {currentCourse.status !== 'in_progress' && (
              <button
                onClick={() => handleStatusChange('in_progress')}
                style={{
                  flex: 1,
                  padding: '9px 0',
                  borderRadius: '10px',
                  backgroundColor: NM.amber,
                  color: '#fff',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  boxShadow: NM.convexSm,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <Play size={13} fill="#fff" />
                <span>开始攻克 (正在学)</span>
              </button>
            )}

            {currentCourse.status !== 'completed' && (
              <button
                onClick={() => handleStatusChange('completed')}
                style={{
                  flex: 1,
                  padding: '9px 0',
                  borderRadius: '10px',
                  backgroundColor: NM.cardBg,
                  color: NM.emerald,
                  border: NM.borderLight,
                  fontSize: '12px',
                  fontWeight: 700,
                  boxShadow: NM.convexSm,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <Award size={14} />
                <span>标记结课</span>
              </button>
            )}

            {currentCourse.status !== 'backlog' && (
              <button
                onClick={() => handleStatusChange('backlog')}
                style={{
                  flex: 1,
                  padding: '9px 0',
                  borderRadius: '10px',
                  backgroundColor: NM.cardBg,
                  color: NM.textSub,
                  border: NM.borderLight,
                  fontSize: '12px',
                  fontWeight: 700,
                  boxShadow: NM.convexSm,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <RotateCcw size={13} />
                <span>移回待学</span>
              </button>
            )}
          </div>

          {/* 章节打卡清单 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: NM.textSub }}>
                章节逐课清单 ({currentCourse.chapters.length})
              </span>
              <span style={{ fontSize: '10px', color: NM.textMuted }}>
                点击课时提交感想 · 获得 {attrInfo.name} +3
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {currentCourse.chapters.map((ch, idx) => (
                <div
                  key={ch.id}
                  onClick={() => handleClickChapter(idx, ch)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '12px',
                    backgroundColor: ch.isCompleted ? NM.bgLighter : NM.cardBg,
                    boxShadow: NM.convexXs,
                    border: NM.borderLight,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {ch.isCompleted ? (
                      <CheckCircle2 size={18} color={NM.emerald} />
                    ) : (
                      <Circle size={18} color={NM.textMuted} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: ch.isCompleted ? 500 : 700,
                          color: ch.isCompleted ? NM.textMuted : NM.textMain,
                          textDecoration: ch.isCompleted ? 'line-through' : 'none',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {ch.title}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '10px', color: NM.textMuted }}>
                        {formatDuration(ch.durationSeconds)}
                      </span>
                      {ch.url && (
                        <a
                          href={ch.url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{ color: '#FB7299', display: 'flex', alignItems: 'center' }}
                        >
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* 若已有感想，展示轻拟物心得摘要胶囊 */}
                  {ch.reflection && (
                    <div
                      style={{
                        marginLeft: '28px',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #ECE3D4',
                        fontSize: '10.5px',
                        color: NM.textSub,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span style={{ color: NM.amber, fontWeight: 900 }}>“</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ch.reflection}
                      </span>
                      <span style={{ color: NM.amber, fontWeight: 900 }}>”</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 底部删除课程按钮 */}
          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={handleDelete}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'none',
                border: 'none',
                fontSize: '11px',
                color: NM.rose,
                cursor: 'pointer',
                padding: '6px 12px',
              }}
            >
              <Trash2 size={13} />
              <span>删除本课程</span>
            </button>
          </div>
        </div>

        {/* ================= 方案 A：课时心得手账轻拟物弹窗 ================= */}
        {reflectionTarget && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(54, 46, 34, 0.65)',
              backdropFilter: 'blur(5px)',
              zIndex: 105,
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
                maxWidth: '380px',
                backgroundColor: '#FAF5EB',
                borderRadius: '18px',
                border: '2px solid #D8C7A5',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* 弹窗头部 */}
              <div
                style={{
                  padding: '12px 16px',
                  background: 'linear-gradient(180deg, #F3EBD8 0%, #FAEDD9 100%)',
                  borderBottom: '1px solid #D8C7A5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '16px' }}>📖</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#451A03' }}>
                      {reflectionTarget.chapter.isCompleted ? '课时心得手账（温习/修改）' : '课时心得手账 · 结课打卡'}
                    </div>
                    <div style={{ fontSize: '10px', color: '#78350F' }}>
                      第 {reflectionTarget.index + 1} 讲 · {reflectionTarget.chapter.title}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setReflectionTarget(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#78350F',
                    cursor: 'pointer',
                    padding: 4,
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* 奖励预告横幅 */}
              <div
                style={{
                  padding: '8px 14px',
                  backgroundColor: attrInfo.bg,
                  borderBottom: `1px solid ${attrInfo.color}22`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                }}
              >
                <span style={{ color: attrInfo.color, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>{attrInfo.icon}</span>
                  <span>打卡激励：{attrInfo.name} +3 · 精神 +1</span>
                </span>
                <span style={{ color: '#78350F', fontSize: '10px' }}>
                  精神专注 -5
                </span>
              </div>

              {/* 感想输入表单 */}
              <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '11px', color: '#78350F', fontWeight: 700 }}>
                  “学而不思则罔，思而不学则殆” —— 费曼输出感悟：
                </div>

                <textarea
                  rows={4}
                  placeholder="写下本课时最核心的收获、解法体会或实操心得（几句话即可）..."
                  value={reflectionText}
                  onChange={e => setReflectionText(e.target.value)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '12px',
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #D8C7A5',
                    fontSize: '12px',
                    color: '#451A03',
                    lineHeight: '1.6',
                    outline: 'none',
                    resize: 'none',
                  }}
                />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                  {reflectionTarget.chapter.isCompleted ? (
                    <button
                      type="button"
                      onClick={handleRevertCompletion}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: NM.rose,
                        fontSize: '11px',
                        cursor: 'pointer',
                        padding: '4px 6px',
                      }}
                    >
                      取消本课完成状态
                    </button>
                  ) : <div />}

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setReflectionTarget(null)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'none',
                        fontSize: '12px',
                        color: '#78350F',
                        cursor: 'pointer',
                      }}
                    >
                      关闭
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitReflection}
                      style={{
                        padding: '6px 16px',
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
                      <span>{reflectionTarget.chapter.isCompleted ? '保存心得' : '提交感想并打卡'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
