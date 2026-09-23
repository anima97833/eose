import {
  Course,
  CourseChapter,
  CourseStatus,
  KanbanStats,
  CourseAttributeTag,
  CourseReflectionRecord,
} from './courseKanbanTypes';
import { loadRPGProfile, saveRPGProfile, computeAttributeMax } from '../rpg/rpgStorage';

const STORAGE_KEY = 'neumorphic_course_kanban_v1';
const CUSTOM_REFLECTIONS_KEY = 'neumorphic_course_custom_reflections_v1';
export const MAX_IN_PROGRESS_COURSES = 2; // WIP 正在学限制（最多2门）

export const ATTR_TAG_INFO: Record<
  CourseAttributeTag,
  { name: string; short: string; icon: string; color: string; bg: string }
> = {
  INT: { name: '智力', short: 'INT', icon: '🧪', color: '#2563EB', bg: '#EFF6FF' },
  STR: { name: '力量', short: 'STR', icon: '🥊', color: '#D9483B', bg: '#FEF2F2' },
  DEX: { name: '敏捷', short: 'DEX', icon: '⚡', color: '#D97706', bg: '#FFFBEB' },
  SPI: { name: '精神', short: 'SPI', icon: '🔮', color: '#7C3AED', bg: '#F5F3FF' },
  CON: { name: '体质', short: 'CON', icon: '🛡️', color: '#059669', bg: '#ECFDF5' },
  CHA: { name: '魅力', short: 'CHA', icon: '✨', color: '#DB2777', bg: '#FDF2F8' },
};

const PRESET_COURSES: Course[] = [
  {
    id: 'preset_course_bili_1',
    title: '全栈进阶：React + TypeScript 轻拟物系统实战',
    platform: 'bilibili',
    status: 'in_progress',
    attributeTag: 'INT',
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
      {
        id: 'c1',
        index: 0,
        title: '01 课程导学：为什么轻拟物正在复兴',
        durationSeconds: 1200,
        isCompleted: true,
        completedAt: Date.now() - 86400000 * 4,
        reflection: '轻拟物不仅是视觉质感，更是通过物理光影增强真实感知与交互隐喻。',
        reflectionSubmittedAt: Date.now() - 86400000 * 4,
        rewardClaimed: true,
      },
      {
        id: 'c2',
        index: 1,
        title: '02 核心基石：CSS 光影阴影几何数学模型',
        durationSeconds: 1500,
        isCompleted: true,
        completedAt: Date.now() - 86400000 * 3,
        reflection: '深入理解了凸起 convex 与内嵌 inset 阴影的明暗对角光源分布逻辑。',
        reflectionSubmittedAt: Date.now() - 86400000 * 3,
        rewardClaimed: true,
      },
      {
        id: 'c3',
        index: 2,
        title: '03 状态管理：手势拖拽与物理回弹仿真',
        durationSeconds: 1800,
        isCompleted: true,
        completedAt: Date.now() - 86400000 * 1,
        reflection: '阻尼弹性函数让手势交互脱胎换骨，组件状态树需要保持单一真实信源。',
        reflectionSubmittedAt: Date.now() - 86400000 * 1,
        rewardClaimed: true,
      },
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
    attributeTag: 'INT',
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
    attributeTag: 'INT',
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
      { id: 'ly1', index: 0, title: '01 薛定谔的猫与哥本哈根诠释', durationSeconds: 1200, isCompleted: true, rewardClaimed: true },
      { id: 'ly2', index: 1, title: '02 双缝干涉：光到底是粒子还是波', durationSeconds: 1100, isCompleted: true, rewardClaimed: true },
      { id: 'ly3', index: 2, title: '03 贝尔不等式与量子纠缠', durationSeconds: 1300, isCompleted: true, rewardClaimed: true },
      { id: 'ly4', index: 3, title: '04 相对论与时空弯曲之谜', durationSeconds: 1200, isCompleted: true, rewardClaimed: true },
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
    const parsed: Course[] = JSON.parse(raw);
    // 兼容补全 attributeTag
    let hasMigration = false;
    for (const c of parsed) {
      if (!c.attributeTag) {
        c.attributeTag = 'INT';
        hasMigration = true;
      }
    }
    if (hasMigration) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return PRESET_COURSES;
  }
}

export function saveCourse(course: Course): void {
  const all = getAllCourses();
  const idx = all.findIndex(c => c.id === course.id);
  course.updatedAt = Date.now();
  if (!course.attributeTag) {
    course.attributeTag = 'INT';
  }
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

  target.status = newStatus;
  target.updatedAt = Date.now();
  saveCourse(target);
  return { success: true, course: target };
}

/**
 * 课时打卡完成并提交感想时的 RPG 六维属性与精力消耗联动：
 * 规则：
 * 1. 对应课程主属性 +3 (上限为等级上限 cap)
 * 2. 内省精神 SPI +1 (若主属性非 SPI 则额外获得，若主属性已为 SPI 则不重复叠加)
 * 3. 精神专注 (MP) 消耗 -5 (最低扣至 0，不为负)
 */
export function rewardChapterCompletionToRPG(tag: CourseAttributeTag): {
  attrKey: string;
  attrName: string;
  attrGain: number;
  spiGain: number;
  mpCost: number;
  message: string;
} {
  const info = ATTR_TAG_INFO[tag] || ATTR_TAG_INFO.INT;

  try {
    const profile = loadRPGProfile();
    const cap = computeAttributeMax(profile.level);

    // 1. 对应主标签属性 +3
    const curAttrVal = profile.attributes?.[tag]?.value || 0;
    const nextAttrVal = Math.min(cap, curAttrVal + 3);
    const attrGain = nextAttrVal - curAttrVal;

    // 2. 内省精神 SPI +1
    let spiGain = 0;
    if (tag !== 'SPI') {
      const curSpi = profile.attributes?.SPI?.value || 0;
      const nextSpi = Math.min(cap, curSpi + 1);
      spiGain = nextSpi - curSpi;
      if (profile.attributes?.SPI) {
        profile.attributes.SPI.value = nextSpi;
      }
    }

    // 3. 精神专注 MP -5
    const curMp = typeof profile.mp === 'number' ? profile.mp : 100;
    const nextMp = Math.max(0, curMp - 5);
    const mpCost = curMp - nextMp;

    profile.mp = nextMp;
    if (profile.attributes?.[tag]) {
      profile.attributes[tag].value = nextAttrVal;
    }

    saveRPGProfile(profile);

    const parts = [`${info.name} +${attrGain}`];
    if (spiGain > 0) parts.push(`内省精神 +${spiGain}`);
    parts.push(`精神专注 -${mpCost}`);

    return {
      attrKey: tag,
      attrName: info.name,
      attrGain,
      spiGain,
      mpCost,
      message: parts.join(' · '),
    };
  } catch (err) {
    console.warn('[CourseKanbanStorage] RPG reward error:', err);
    return {
      attrKey: tag,
      attrName: info.name,
      attrGain: 3,
      spiGain: tag === 'SPI' ? 0 : 1,
      mpCost: 5,
      message: `${info.name} +3 · 精神专注 -5`,
    };
  }
}

/**
 * 提交课时感想并打卡完成
 */
export function completeChapterWithReflection(
  courseId: string,
  chapterIndex: number,
  reflection: string
): { course: Course; rewardNotice: string } | null {
  const all = getAllCourses();
  const target = all.find(c => c.id === courseId);
  if (!target || !target.chapters[chapterIndex]) return null;

  const ch = target.chapters[chapterIndex];
  const isFirstReward = !ch.rewardClaimed;

  ch.isCompleted = true;
  ch.completedAt = Date.now();
  ch.reflection = reflection.trim();
  ch.reflectionSubmittedAt = Date.now();

  let rewardNotice = '';
  if (isFirstReward) {
    ch.rewardClaimed = true;
    const reward = rewardChapterCompletionToRPG(target.attributeTag || 'INT');
    rewardNotice = `🎉 课时完成！获得：${reward.message}`;
  } else {
    rewardNotice = '📝 课时感想已更新保存！';
  }

  // 重新计算完成章节数
  const completedCount = target.chapters.filter(c => c.isCompleted).length;
  target.completedChapters = completedCount;

  if (completedCount === target.totalChapters && target.totalChapters > 0) {
    target.status = 'completed';
  } else if (target.status === 'backlog') {
    target.status = 'in_progress';
  }

  target.updatedAt = Date.now();
  saveCourse(target);

  return { course: target, rewardNotice };
}

/**
 * 仅取消打卡单章节（保留已写入的感想与防刷标记）
 */
export function toggleChapterCompletion(courseId: string, chapterIndex: number): Course | null {
  const all = getAllCourses();
  const target = all.find(c => c.id === courseId);
  if (!target || !target.chapters[chapterIndex]) return null;

  const ch = target.chapters[chapterIndex];
  ch.isCompleted = !ch.isCompleted;
  ch.completedAt = ch.isCompleted ? Date.now() : undefined;

  const completedCount = target.chapters.filter(c => c.isCompleted).length;
  target.completedChapters = completedCount;

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

/**
 * 获取全站所有课程与自主记录的学习心得流
 */
export function getAllCourseReflections(): CourseReflectionRecord[] {
  const list: CourseReflectionRecord[] = [];
  const courses = getAllCourses();

  for (const c of courses) {
    for (const ch of c.chapters) {
      if (ch.reflection && ch.reflection.trim()) {
        list.push({
          id: `${c.id}_${ch.id}`,
          courseId: c.id,
          courseTitle: c.title,
          attributeTag: c.attributeTag || 'INT',
          chapterIndex: ch.index,
          chapterTitle: ch.title,
          content: ch.reflection,
          createdAt: ch.reflectionSubmittedAt || ch.completedAt || c.updatedAt,
          isCustom: false,
        });
      }
    }
  }

  // 拼接独立自留心得
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(CUSTOM_REFLECTIONS_KEY);
      if (raw) {
        const customList: CourseReflectionRecord[] = JSON.parse(raw);
        list.push(...customList);
      }
    } catch (e) {
      console.warn(e);
    }
  }

  list.sort((a, b) => b.createdAt - a.createdAt);
  return list;
}

/**
 * 添加一条独立自留心得
 */
export function addCustomCourseReflection(
  content: string,
  attributeTag: CourseAttributeTag,
  title?: string
): CourseReflectionRecord {
  const record: CourseReflectionRecord = {
    id: `custom_ref_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    courseTitle: title?.trim() || '今日学习悟得',
    attributeTag,
    content: content.trim(),
    createdAt: Date.now(),
    isCustom: true,
  };

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(CUSTOM_REFLECTIONS_KEY);
      const list: CourseReflectionRecord[] = raw ? JSON.parse(raw) : [];
      list.unshift(record);
      localStorage.setItem(CUSTOM_REFLECTIONS_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn(e);
    }
  }

  return record;
}

/**
 * 删除一条自留心得
 */
export function deleteCustomCourseReflection(id: string): void {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(CUSTOM_REFLECTIONS_KEY);
      if (raw) {
        const list: CourseReflectionRecord[] = JSON.parse(raw);
        const filtered = list.filter(r => r.id !== id);
        localStorage.setItem(CUSTOM_REFLECTIONS_KEY, JSON.stringify(filtered));
      }
    } catch (e) {
      console.warn(e);
    }
  }
}

export function resetDefaultCourses(): Course[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(PRESET_COURSES));
  return PRESET_COURSES;
}
