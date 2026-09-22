import { Course, CourseChapter, CourseStatus, KanbanStats } from './courseKanbanTypes';

const STORAGE_KEY = 'neumorphic_course_kanban_v1';
export const MAX_IN_PROGRESS_COURSES = 2; // WIP 正在学限制（最多2门）

const PRESET_COURSES: Course[] = [
  {
    id: 'preset_course_bili_1',
    title: '全栈进阶：React + TypeScript 轻拟物系统实战',
    platform: 'bilibili',
    status: 'in_progress',
    author: '极客架构师',
    sourceUrl: 'https://www.bilibili.com/video/BV1xx411c7mD',
    intro: '深度剖析轻拟物设计规范、组件状态树与高阶 Web 开发实战。',
    totalChapters: 8,
    completedChapters: 3,
    totalDurationSeconds: 8 * 1800, // 4小时
    dailyGoalMinutes: 30,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now(),
    chapters: [
      { id: 'c1', index: 0, title: '01 课程导学：为什么轻拟物正在复兴', durationSeconds: 1200, isCompleted: true, completedAt: Date.now() - 86400000 * 4 },
      { id: 'c2', index: 1, title: '02 核心基石：CSS 光影阴影几何数学模型', durationSeconds: 1500, isCompleted: true, completedAt: Date.now() - 86400000 * 3 },
      { id: 'c3', index: 2, title: '03 状态管理：手势拖拽与物理回弹仿真', durationSeconds: 1800, isCompleted: true, completedAt: Date.now() - 86400000 * 1 },
      { id: 'c4', index: 3, title: '04 组件工程：原生级拟物卡片与按钮封装', durationSeconds: 2100, isCompleted: false },
      { id: 'c5', index: 4, title: '05 跨域网络：高可用爬虫与中继通道搭建', durationSeconds: 1800, isCompleted: false },
      { id: 'c6', index: 5, title: '06 数据持久化：IndexedDB 与离线快照', durationSeconds: 1600, isCompleted: false },
      { id: 'c7', index: 6, title: '07 性能调优：百万级长列表与渲染切片', durationSeconds: 2200, isCompleted: false },
      { id: 'c8', index: 7, title: '08 商业化交付：端到端自动化测试与打包', durationSeconds: 1900, isCompleted: false },
    ],
  },
  {
    id: 'preset_course_pan_2',
    title: '【网盘系统课】2024微服务高并发分布式架构演进',
    platform: 'pan',
    status: 'backlog',
    author: '大厂架构总监',
    intro: '包含30讲核心录播，从分布式锁、MQ消息削峰到微服务高可用集群架构落地。',
    totalChapters: 6,
    completedChapters: 0,
    totalDurationSeconds: 6 * 2400, // 4小时
    dailyGoalMinutes: 40,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now(),
    chapters: [
      { id: 'p1', index: 0, title: '01 分布式高并发系统核心痛点剖析', durationSeconds: 2400, isCompleted: false },
      { id: 'p2', index: 1, title: '02 Redis 集群热点 Key 与缓存雪崩解决方案', durationSeconds: 2600, isCompleted: false },
      { id: 'p3', index: 2, title: '03 消息队列 Kafka / RocketMQ 削峰填谷实战', durationSeconds: 2500, isCompleted: false },
      { id: 'p4', index: 3, title: '04 分布式事务与两阶段提交 TCC 实操', durationSeconds: 2300, isCompleted: false },
      { id: 'p5', index: 4, title: '05 分库分表 ShardingSphere 亿级数据实操', durationSeconds: 2700, isCompleted: false },
      { id: 'p6', index: 5, title: '06 架构师面试与百万年薪技术复盘', durationSeconds: 2100, isCompleted: false },
    ],
  },
  {
    id: 'preset_course_bili_3',
    title: '李永乐老师：量子力学与现代物理学通识课',
    platform: 'bilibili',
    status: 'completed',
    author: '李永乐老师',
    sourceUrl: 'https://www.bilibili.com/video/BV1cs411o7jF',
    intro: '从双缝干涉实验到量子纠缠，通俗易懂的宇宙物理学启蒙。',
    totalChapters: 4,
    completedChapters: 4,
    totalDurationSeconds: 4 * 1200,
    dailyGoalMinutes: 30,
    createdAt: Date.now() - 86400000 * 20,
    updatedAt: Date.now() - 86400000 * 2,
    chapters: [
      { id: 'ly1', index: 0, title: '01 薛定谔的猫与哥本哈根诠释', durationSeconds: 1200, isCompleted: true },
      { id: 'ly2', index: 1, title: '02 双缝干涉：光到底是粒子还是波', durationSeconds: 1100, isCompleted: true },
      { id: 'ly3', index: 2, title: '03 贝尔不等式与量子纠缠', durationSeconds: 1300, isCompleted: true },
      { id: 'ly4', index: 3, title: '04 相对论与时空弯曲之谜', durationSeconds: 1200, isCompleted: true },
    ],
  },
];

export function getAllCourses(): Course[] {
  if (typeof window === 'undefined') return PRESET_COURSES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(PRESET_COURSES));
      return PRESET_COURSES;
    }
    return JSON.parse(raw);
  } catch {
    return PRESET_COURSES;
  }
}

export function saveCourse(course: Course): void {
  const all = getAllCourses();
  const idx = all.findIndex(c => c.id === course.id);
  course.updatedAt = Date.now();
  if (idx !== -1) {
    all[idx] = course;
  } else {
    all.unshift(course);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function deleteCourse(id: string): void {
  const all = getAllCourses().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

/**
 * 切换课程在看板中的状态（包含 WIP 限制检测）
 */
export function changeCourseStatus(
  courseId: string,
  newStatus: CourseStatus
): { success: boolean; message?: string; course?: Course } {
  const all = getAllCourses();
  const target = all.find(c => c.id === courseId);
  if (!target) {
    return { success: false, message: '未找到该课程' };
  }

  // WIP 校验：如果试图移入“正在学”
  if (newStatus === 'in_progress' && target.status !== 'in_progress') {
    const currentInProgressCount = all.filter(c => c.status === 'in_progress').length;
    if (currentInProgressCount >= MAX_IN_PROGRESS_COURSES) {
      return {
        success: false,
        message: `专注限制：同时最多攻克 ${MAX_IN_PROGRESS_COURSES} 门课程！请先结课或移回待学库。`,
      };
    }
  }

  target.status = newStatus;
  target.updatedAt = Date.now();
  saveCourse(target);
  return { success: true, course: target };
}

/**
 * 打卡或取消打卡某一章节
 */
export function toggleChapterCompletion(courseId: string, chapterIndex: number): Course | null {
  const all = getAllCourses();
  const target = all.find(c => c.id === courseId);
  if (!target || !target.chapters[chapterIndex]) return null;

  const ch = target.chapters[chapterIndex];
  ch.isCompleted = !ch.isCompleted;
  ch.completedAt = ch.isCompleted ? Date.now() : undefined;

  // 重新计算完成章节数
  const completedCount = target.chapters.filter(c => c.isCompleted).length;
  target.completedChapters = completedCount;

  // 如果全部章节完成，自动建议或流转为已结课
  if (completedCount === target.totalChapters && target.totalChapters > 0) {
    target.status = 'completed';
  } else if (target.status === 'completed' && completedCount < target.totalChapters) {
    target.status = 'in_progress';
  }

  target.updatedAt = Date.now();
  saveCourse(target);
  return target;
}

export function getKanbanStats(): KanbanStats {
  const all = getAllCourses();
  const backlogCount = all.filter(c => c.status === 'backlog').length;
  const inProgressCount = all.filter(c => c.status === 'in_progress').length;
  const completedCount = all.filter(c => c.status === 'completed').length;

  let totalSec = 0;
  let compSec = 0;

  for (const c of all) {
    totalSec += c.totalDurationSeconds || 0;
    const completedRatio = c.totalChapters > 0 ? c.completedChapters / c.totalChapters : 0;
    compSec += (c.totalDurationSeconds || 0) * completedRatio;
  }

  return {
    backlogCount,
    inProgressCount,
    completedCount,
    totalHours: Math.round((totalSec / 3600) * 10) / 10,
    completedHours: Math.round((compSec / 3600) * 10) / 10,
  };
}

export function resetDefaultCourses(): Course[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(PRESET_COURSES));
  return PRESET_COURSES;
}
