import React, { useState, useEffect } from 'react';
import { Course, CourseStatus, KanbanStats } from '../../../core/kanban/courseKanbanTypes';
import {
  getAllCourses,
  getKanbanStats,
  changeCourseStatus,
  resetDefaultCourses,
  ATTR_TAG_INFO,
} from '../../../core/kanban/courseKanbanStorage';
import { formatDuration, estimateRemainingDays } from '../../../core/kanban/courseParserEngine';
import { CourseImportModal } from './CourseImportModal';
import { CourseDetailModal } from './CourseDetailModal';
import { CourseReflectionsModal } from './CourseReflectionsModal';
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
  BookOpenCheck,
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
  const [isReflectionsModalOpen, setIsReflectionsModalOpen] = useState(false);

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

  // 当前分类课程列表
  const filteredCourses = courses.filter(c => c.status === activeTab);

  // 打开课程详情弹窗
  const handleOpenDetail = (course: Course) => {
    setSelectedCourse(course);
    setIsDetailModalOpen(true);
  };

  // 快捷流转课程状态
  const handleQuickStatusChange = (e: React.MouseEvent, courseId: string, newStatus: CourseStatus) => {
    e.stopPropagation();
    const res = changeCourseStatus(courseId, newStatus);
    if (!res.success) {
      showToast(res.message || '操作受限');
      return;
    }
    loadData();
    showToast(newStatus === 'in_progress' ? '已转入正在学' : newStatus === 'completed' ? '结课达成！' : '已移入待学');
  };

  const handleResetPresets = () => {
    resetDefaultCourses();
    loadData();
    showToast('已恢复预设课程');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: NM.bg,
        color: NM.textMain,
        overflowY: 'auto',
      }}
    >
      {/* 顶部导航栏 */}
      <div
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: NM.borderSoft,
          position: 'sticky',
          top: 0,
          backgroundColor: NM.bg,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                backgroundColor: NM.cardBg,
                boxShadow: NM.convexSm,
                border: NM.borderLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: NM.textSub,
              }}
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              backgroundColor: NM.bgInset,
              boxShadow: NM.insetSm,
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

        {/* 顶部快捷操作：感想按钮与导入按钮，纯图标无文字 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setIsReflectionsModalOpen(true)}
            title="课时心得手账阁"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '11px',
              backgroundColor: NM.cardBg,
              boxShadow: NM.convexSm,
              border: NM.borderLight,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: NM.amber,
              transition: 'all 0.15s ease',
            }}
          >
            <BookOpenCheck size={18} />
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            title="导入课程"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '11px',
              backgroundColor: NM.amber,
              boxShadow: NM.convexSm,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              transition: 'all 0.15s ease',
            }}
          >
            <Plus size={18} />
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
                  正在攻克: {stats.inProgressCount} 门
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    backgroundColor: stats.inProgressCount >= 2 ? '#FEE2E2' : '#FEF3C7',
                    color: stats.inProgressCount >= 2 ? '#DC2626' : '#D97706',
                    fontWeight: 700,
                  }}
                >
                  WIP限额: 最多2门
                </span>
              </div>
              <div style={{ fontSize: '11px', color: NM.textMuted, marginTop: '2px' }}>
                已完成 {stats.completedHours}h / 累计总规划 {stats.totalHours}h
              </div>
            </div>
          </div>

          <button
            onClick={handleResetPresets}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              backgroundColor: NM.bgInset,
              boxShadow: NM.insetXs,
              border: NM.borderLight,
              fontSize: '10px',
              color: NM.textMuted,
              cursor: 'pointer',
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

        {/* 正在学状态提示横幅 */}
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
            <span>💡 <b>学习准则</b>：坚持按部就班打卡，稳步攻克每一讲！</span>
            <span style={{ color: NM.amber, fontWeight: 700 }}>
              共 {stats.inProgressCount} 门进行中
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
              const tagInfo = ATTR_TAG_INFO[course.attributeTag || 'INT'] || ATTR_TAG_INFO.INT;

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
                                : course.platform === 'xiaohongshu'
                                ? '#FF2442'
                                : course.platform === 'pan'
                                ? '#06A7FF'
                                : NM.gold,
                            color: '#fff',
                            flexShrink: 0,
                          }}
                        >
                          {course.platform === 'bilibili'
                            ? 'B站'
                            : course.platform === 'xiaohongshu'
                            ? '小红书'
                            : course.platform === 'pan'
                            ? '网盘'
                            : '自学'}
                        </span>

                        {/* 六维分类属性胶囊 */}
                        <span
                          style={{
                            fontSize: '9.5px',
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            backgroundColor: tagInfo.bg,
                            color: tagInfo.color,
                            border: `1px solid ${tagInfo.color}33`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                            flexShrink: 0,
                          }}
                        >
                          <span>{tagInfo.icon}</span>
                          <span>{tagInfo.name}</span>
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
                  </div>

                  {/* 进度条与预计通关 */}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '11px',
                        marginBottom: '4px',
                      }}
                    >
                      <span style={{ color: NM.textSub, fontWeight: 600 }}>
                        通关: {course.completedChapters} / {course.totalChapters} 讲 ({progress}%)
                      </span>
                      <span style={{ color: NM.textMuted }}>
                        预计通关: 约 {days} 天
                      </span>
                    </div>

                    <div
                      style={{
                        width: '100%',
                        height: '6px',
                        borderRadius: '3px',
                        backgroundColor: NM.bgInset,
                        boxShadow: NM.insetXs,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${progress}%`,
                          height: '100%',
                          borderRadius: '3px',
                          background: `linear-gradient(90deg, ${NM.amber}, ${tagInfo.color})`,
                        }}
                      />
                    </div>
                  </div>

                  {/* 卡片底栏操作 */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '6px',
                      borderTop: '1px solid rgba(0,0,0,0.04)',
                    }}
                  >
                    <span style={{ fontSize: '10px', color: NM.textMuted }}>
                      课时奖励: {tagInfo.name} +3 · 精神 +1
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {course.status !== 'in_progress' && (
                        <button
                          onClick={e => handleQuickStatusChange(e, course.id, 'in_progress')}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: NM.amber,
                            color: '#fff',
                            border: 'none',
                            fontSize: '10px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                          }}
                        >
                          <Play size={10} fill="#fff" />
                          <span>开始攻克</span>
                        </button>
                      )}

                      {course.status === 'in_progress' && (
                        <button
                          onClick={e => handleQuickStatusChange(e, course.id, 'completed')}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: NM.cardBg,
                            color: NM.emerald,
                            border: NM.borderLight,
                            fontSize: '10px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
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

      {/* 弹窗：课程详情与逐章打卡 (支持课时感想提交) */}
      <CourseDetailModal
        course={selectedCourse}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onCourseUpdated={loadData}
        onShowToast={showToast}
      />

      {/* 弹窗：全栈学习心得阁 (汇总展示所有课时感悟与自留心得) */}
      <CourseReflectionsModal
        isOpen={isReflectionsModalOpen}
        onClose={() => setIsReflectionsModalOpen(false)}
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
