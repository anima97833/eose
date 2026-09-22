import React, { useState, useEffect } from 'react';
import { Course, CourseStatus, KanbanStats } from '../../../core/kanban/courseKanbanTypes';
import {
  getAllCourses,
  getKanbanStats,
  changeCourseStatus,
  resetDefaultCourses,
  MAX_IN_PROGRESS_COURSES,
} from '../../../core/kanban/courseKanbanStorage';
import { formatDuration, estimateRemainingDays } from '../../../core/kanban/courseParserEngine';
import { CourseImportModal } from './CourseImportModal';
import { CourseDetailModal } from './CourseDetailModal';
import { NM } from '../storyword/storyWordNeumorphism';
import {
  ArrowLeft,
  GraduationCap,
  Plus,
  Flame,
  CheckCircle2,
  Clock,
  Play,
  Award,
  RotateCcw,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface CourseKanbanAppProps {
  onBack?: () => void;
}

export const CourseKanbanApp: React.FC<CourseKanbanAppProps> = ({ onBack }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<KanbanStats>({
    backlogCount: 0,
    inProgressCount: 0,
    completedCount: 0,
    totalHours: 0,
    completedHours: 0,
  });

  const [activeTab, setActiveTab] = useState<CourseStatus>('in_progress');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const loadData = () => {
    const list = getAllCourses();
    setCourses(list);
    setStats(getKanbanStats());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDetail = (course: Course) => {
    setSelectedCourse(course);
    setIsDetailModalOpen(true);
  };

  // 快捷开始学习（带 WIP 限制提示）
  const handleQuickStart = (e: React.MouseEvent, courseId: string) => {
    e.stopPropagation();
    const res = changeCourseStatus(courseId, 'in_progress');
    if (!res.success) {
      showToast(res.message || '操作受限');
      return;
    }
    loadData();
    showToast('已开始攻克');
  };

  // 快捷标记结课
  const handleQuickComplete = (e: React.MouseEvent, courseId: string) => {
    e.stopPropagation();
    const res = changeCourseStatus(courseId, 'completed');
    if (res.success) {
      loadData();
      showToast('恭喜结课！');
    }
  };

  // 过滤当前栏目课程
  const filteredCourses = courses.filter(c => c.status === activeTab);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: NM.bg,
        color: NM.textMain,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", sans-serif',
        overflowY: 'auto',
        boxSizing: 'border-box',
      }}
    >
      {/* 顶部应用栏 */}
      <div
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: NM.cardBg,
          boxShadow: NM.convexSm,
          borderBottom: NM.borderLight,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: NM.textMain,
                backgroundColor: NM.cardBg,
                boxShadow: NM.convexSm,
                border: NM.borderLight,
                cursor: 'pointer',
                padding: 0,
                marginRight: '4px',
              }}
              title="返回桌面"
            >
              <ArrowLeft size={17} />
            </button>
          )}
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              backgroundColor: NM.cardBg,
              boxShadow: NM.convexXs,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <GraduationCap size={20} color={NM.amber} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: NM.textMain }}>
              学习看板
            </div>
            <div style={{ fontSize: '11px', color: NM.textMuted }}>
              告别囤积 · 专注在学 · 逐讲通关
            </div>
          </div>
        </div>

        {/* 顶部快捷操作 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setIsImportModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              borderRadius: '10px',
              backgroundColor: NM.amber,
              boxShadow: NM.convexXs,
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 700,
              color: '#fff',
            }}
          >
            <Plus size={14} />
            <span>导入课程</span>
          </button>
        </div>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* WIP 与总体学习统计卡片 */}
        <div
          style={{
            padding: '14px 16px',
            borderRadius: '18px',
            backgroundColor: NM.cardBg,
            boxShadow: NM.convex,
            border: NM.borderLight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: NM.bgInset,
                boxShadow: NM.insetSm,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Flame size={20} color={NM.amber} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: NM.textMain }}>
                  正在攻克: {stats.inProgressCount}/{MAX_IN_PROGRESS_COURSES}
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    backgroundColor:
                      stats.inProgressCount >= MAX_IN_PROGRESS_COURSES ? '#FEE2E2' : '#FEF3C7',
                    color: stats.inProgressCount >= MAX_IN_PROGRESS_COURSES ? '#B91C1C' : '#B45309',
                    fontWeight: 700,
                  }}
                >
                  {stats.inProgressCount >= MAX_IN_PROGRESS_COURSES ? '槽位已满' : '精力充沛'}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: NM.textSub, marginTop: '2px' }}>
                已结课 {stats.completedCount} 门 · 累计消化 {stats.completedHours} 小时
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              resetDefaultCourses();
              loadData();
              showToast('已重置示例');
            }}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '11px',
              color: NM.textMuted,
              cursor: 'pointer',
              padding: '4px 6px',
            }}
          >
            重置示例
          </button>
        </div>

        {/* 看板分段导航切换 */}
        <div
          style={{
            display: 'flex',
            padding: '4px',
            borderRadius: '14px',
            backgroundColor: NM.bgInset,
            boxShadow: NM.insetSm,
            border: NM.borderSoft,
            gap: '4px',
          }}
        >
          {[
            { id: 'in_progress', label: '🎯 正在学', count: stats.inProgressCount },
            { id: 'backlog', label: '🎒 待学库', count: stats.backlogCount },
            { id: 'completed', label: '✅ 已结课', count: stats.completedCount },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as CourseStatus)}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: isActive ? NM.cardBg : 'transparent',
                  color: isActive ? NM.textMain : NM.textMuted,
                  boxShadow: isActive ? NM.convexXs : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    fontSize: '10px',
                    padding: '0 5px',
                    borderRadius: '8px',
                    backgroundColor: isActive ? NM.bgInset : 'rgba(0,0,0,0.05)',
                    color: isActive ? NM.gold : NM.textMuted,
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 正在学特别提醒横幅 */}
        {activeTab === 'in_progress' && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: '10px',
              backgroundColor: NM.bgLighter,
              fontSize: '11px',
              color: NM.textSub,
              boxShadow: NM.insetXs,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>💡 <b>专注准则</b>：同时在学最多 2 门，防止注意力涣散。</span>
            <span style={{ color: NM.amber, fontWeight: 700 }}>
              {stats.inProgressCount} / {MAX_IN_PROGRESS_COURSES}
            </span>
          </div>
        )}

        {/* 课程卡片列表 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredCourses.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 0',
                color: NM.textMuted,
                fontSize: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <BookOpen size={28} color={NM.textMuted} />
              <div>
                {activeTab === 'in_progress'
                  ? '暂无正在学的课程，快从“待学库”挑选 1~2 门开启吧！'
                  : activeTab === 'backlog'
                  ? '待学库为空，可点击右上角“导入课程”解析 B站 或 网盘课！'
                  : '还没有结课记录，坚持通关每一讲！'}
              </div>
            </div>
          ) : (
            filteredCourses.map(course => {
              const progress =
                course.totalChapters > 0
                  ? Math.round((course.completedChapters / course.totalChapters) * 100)
                  : 0;

              const remainingSec = Math.max(
                0,
                course.totalDurationSeconds * (1 - progress / 100)
              );
              const days = estimateRemainingDays(remainingSec, course.dailyGoalMinutes);

              return (
                <div
                  key={course.id}
                  onClick={() => handleOpenDetail(course)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '16px',
                    backgroundColor: NM.cardBg,
                    boxShadow: NM.convexSm,
                    border: NM.borderLight,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    transition: 'transform 0.15s ease',
                  }}
                >
                  {/* 卡片头部 */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                    {course.coverUrl && (
                      <img
                        src={course.coverUrl}
                        alt="封面"
                        referrerPolicy="no-referrer"
                        style={{
                          width: '56px',
                          height: '40px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          boxShadow: NM.insetXs,
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            fontSize: '9px',
                            fontWeight: 800,
                            padding: '1px 5px',
                            borderRadius: '4px',
                            backgroundColor:
                              course.platform === 'bilibili'
                                ? '#FB7299'
                                : course.platform === 'pan'
                                ? '#06A7FF'
                                : NM.gold,
                            color: '#fff',
                            flexShrink: 0,
                          }}
                        >
                          {course.platform === 'bilibili' ? 'B站' : course.platform === 'pan' ? '网盘' : '自学'}
                        </span>
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: 800,
                            color: NM.textMain,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {course.title}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: NM.textMuted, marginTop: '2px' }}>
                        讲师: {course.author} · 共 {course.totalChapters} 讲
                      </div>
                    </div>

                    <span style={{ fontSize: '14px', fontWeight: 900, color: NM.amber, flexShrink: 0 }}>
                      {progress}%
                    </span>
                  </div>

                  {/* 拟物进度条 */}
                  <div
                    style={{
                      height: '6px',
                      borderRadius: '4px',
                      backgroundColor: NM.bgInset,
                      boxShadow: NM.insetXs,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${progress}%`,
                        borderRadius: '4px',
                        background: 'linear-gradient(90deg, #F59E0B, #10B981)',
                        transition: 'width 0.2s ease',
                      }}
                    />
                  </div>

                  {/* 心理降维提示与快捷动作 */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '10px', color: NM.textSub }}>
                      已学 {course.completedChapters}/{course.totalChapters} 讲
                      {progress < 100 && ` · 需 ${formatDuration(remainingSec)} (约${days}天)`}
                    </span>

                    {/* 快捷操作按键 */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {course.status === 'backlog' && (
                        <button
                          onClick={e => handleQuickStart(e, course.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            backgroundColor: NM.amber,
                            color: '#fff',
                            border: 'none',
                            fontSize: '10px',
                            fontWeight: 700,
                            boxShadow: NM.convexXs,
                            cursor: 'pointer',
                          }}
                        >
                          <Play size={10} fill="#fff" />
                          <span>开学</span>
                        </button>
                      )}

                      {course.status === 'in_progress' && (
                        <button
                          onClick={e => handleQuickComplete(e, course.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            backgroundColor: NM.cardBg,
                            color: NM.emerald,
                            border: NM.borderLight,
                            fontSize: '10px',
                            fontWeight: 700,
                            boxShadow: NM.convexXs,
                            cursor: 'pointer',
                          }}
                        >
                          <Award size={11} />
                          <span>结课</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 弹窗：导入课程 */}
      <CourseImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onCourseAdded={() => {
          loadData();
          setActiveTab('backlog');
        }}
      />

      {/* 弹窗：课程详情与逐章打卡 */}
      <CourseDetailModal
        course={selectedCourse}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onCourseUpdated={loadData}
        onShowToast={showToast}
      />

      {/* 全局 Toast */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#362E22',
            color: '#FAF7F0',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 700,
            boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
            zIndex: 120,
          }}
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
};
