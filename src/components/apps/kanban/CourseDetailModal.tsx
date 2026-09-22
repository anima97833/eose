import React, { useState } from 'react';
import { Course, CourseStatus } from '../../../core/kanban/courseKanbanTypes';
import {
  toggleChapterCompletion,
  changeCourseStatus,
  deleteCourse,
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

  // 同步外部传入的 course
  React.useEffect(() => {
    setCurrentCourse(course);
  }, [course]);

  if (!isOpen || !currentCourse) return null;

  const progressPercent =
    currentCourse.totalChapters > 0
      ? Math.round((currentCourse.completedChapters / currentCourse.totalChapters) * 100)
      : 0;

  const remainingSeconds = Math.max(
    0,
    currentCourse.totalDurationSeconds * (1 - progressPercent / 100)
  );
  const remainingDays = estimateRemainingDays(remainingSeconds, currentCourse.dailyGoalMinutes);

  // 勾选/取消勾选单章节
  const handleToggleChapter = (idx: number) => {
    const updated = toggleChapterCompletion(currentCourse.id, idx);
    if (updated) {
      setCurrentCourse({ ...updated });
      onCourseUpdated();
      if (updated.chapters[idx].isCompleted) {
        onShowToast('打卡成功 +1');
      }
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
                    : currentCourse.platform === 'pan'
                    ? '#06A7FF'
                    : NM.gold,
                color: '#fff',
              }}
            >
              {currentCourse.platform === 'bilibili' ? 'B站课程' : currentCourse.platform === 'pan' ? '网盘课程' : '自主规划'}
            </span>
            <span
              style={{
                fontSize: '11px',
                color: NM.textMuted,
              }}
            >
              讲师: {currentCourse.author}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              color: NM.textMuted,
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 核心内容区 */}
        <div style={{ padding: '18px 20px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* 课程大标题与链接 */}
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: NM.textMain, lineHeight: '1.4' }}>
              {currentCourse.title}
            </div>
            {currentCourse.sourceUrl && (
              <a
                href={currentCourse.sourceUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  color: '#FB7299',
                  fontWeight: 600,
                  marginTop: '4px',
                  textDecoration: 'none',
                }}
              >
                <span>直达视频主页</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>

          {/* 进度仪表与心理降维卡片 */}
          <div
            style={{
              padding: '14px',
              borderRadius: '16px',
              backgroundColor: NM.bgInset,
              boxShadow: NM.insetSm,
              border: NM.borderSoft,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Flame size={15} color={NM.amber} />
                <span style={{ fontSize: '13px', fontWeight: 800, color: NM.textMain }}>
                  当前攻克进度
                </span>
              </div>
              <span style={{ fontSize: '16px', fontWeight: 900, color: NM.amber }}>
                {progressPercent}%
              </span>
            </div>

            {/* 拟物进度条 */}
            <div
              style={{
                height: '10px',
                borderRadius: '6px',
                backgroundColor: NM.cardBg,
                boxShadow: NM.insetXs,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progressPercent}%`,
                  borderRadius: '6px',
                  background: 'linear-gradient(90deg, #F59E0B, #10B981)',
                  boxShadow: '1px 1px 3px rgba(0,0,0,0.15)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>

            {/* 心理降维提示标签 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                marginTop: '4px',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: NM.textMuted }}>已学 / 总讲数</div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: NM.textMain, marginTop: '2px' }}>
                  {currentCourse.completedChapters} / {currentCourse.totalChapters}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: NM.textMuted }}>还需耗时</div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: NM.amber, marginTop: '2px' }}>
                  {formatDuration(remainingSeconds)}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: NM.textMuted }}>预计通关</div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: NM.emerald, marginTop: '2px' }}>
                  约 {remainingDays} 天
                </div>
              </div>
            </div>
          </div>

          {/* 状态流转操作组 */}
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
              <span style={{ fontSize: '10px', color: NM.textMuted }}>点击圆圈一键打卡</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {currentCourse.chapters.map((ch, idx) => (
                <div
                  key={ch.id}
                  onClick={() => handleToggleChapter(idx)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '12px',
                    backgroundColor: ch.isCompleted ? NM.bgLighter : NM.cardBg,
                    boxShadow: NM.convexXs,
                    border: NM.borderLight,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
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
      </div>
    </div>
  );
};
