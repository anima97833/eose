import { StarAppMeta, FactItem } from './assistantTypes';
import { getAllCourses } from '../kanban/courseKanbanStorage';
import { loadQuestJournal } from '../quest/questStorage';
import { loadAllBooks } from '../books/bookStorage';
import { loadAllSavedPoems } from '../poetry/poetryStorage';
import { loadMistakeWords } from '../storyword/storyWordStorage';
import { db } from '../storage/db';
import { getInsightHistoryList } from '../files/insightHistoryService';
import { getAllPosters } from '../poster/posterStorage';

export const ALL_STAR_APPS: StarAppMeta[] = [
  {
    id: 'course_kanban',
    name: '技能树',
    iconName: 'BookOpen',
    themeColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.65)',
    x: 18,
    y: 18,
  },
  {
    id: 'diary',
    name: '任务手账',
    iconName: 'ScrollText',
    themeColor: '#34d399',
    glowColor: 'rgba(52, 211, 153, 0.65)',
    x: 48,
    y: 14,
  },
  {
    id: 'books',
    name: '书藏',
    iconName: 'BookMarked',
    themeColor: '#c084fc',
    glowColor: 'rgba(192, 132, 252, 0.65)',
    x: 78,
    y: 20,
  },
  {
    id: 'poetry',
    name: '诗阁',
    iconName: 'Feather',
    themeColor: '#f472b6',
    glowColor: 'rgba(244, 114, 182, 0.65)',
    x: 28,
    y: 35,
  },
  {
    id: 'storyword',
    name: '爽文背词',
    iconName: 'Zap',
    themeColor: '#facc15',
    glowColor: 'rgba(250, 204, 21, 0.65)',
    x: 65,
    y: 32,
  },
  {
    id: 'pomodoro',
    name: '心流结界',
    iconName: 'Clock',
    themeColor: '#fb923c',
    glowColor: 'rgba(251, 146, 60, 0.65)',
    x: 84,
    y: 44,
  },
  {
    id: 'memo',
    name: '便签手账',
    iconName: 'Save',
    themeColor: '#4ade80',
    glowColor: 'rgba(74, 222, 128, 0.65)',
    x: 15,
    y: 48,
  },
  {
    id: 'mood_fortune',
    name: '答案之书',
    iconName: 'HelpCircle',
    themeColor: '#fb7185',
    glowColor: 'rgba(251, 113, 133, 0.65)',
    x: 42,
    y: 46,
  },
  {
    id: 'files',
    name: '思维导图',
    iconName: 'GitBranch',
    themeColor: '#22d3ee',
    glowColor: 'rgba(34, 211, 238, 0.65)',
    x: 60,
    y: 52,
  },
  {
    id: 'camera',
    name: '时光海报',
    iconName: 'Sparkles',
    themeColor: '#a78bfa',
    glowColor: 'rgba(167, 139, 250, 0.65)',
    x: 35,
    y: 58,
  },
];

/**
 * 聚合选中的星宿应用数据，提取上限共 100 条高维关键事实
 */
export async function aggregateSelectedStarsFacts(selectedStarIds: string[]): Promise<FactItem[]> {
  if (!selectedStarIds || selectedStarIds.length === 0) {
    return [];
  }

  const TOTAL_FACT_LIMIT = 100;
  const quotaPerApp = Math.max(10, Math.floor(TOTAL_FACT_LIMIT / selectedStarIds.length));
  const allFacts: FactItem[] = [];

  for (const appId of selectedStarIds) {
    try {
      switch (appId) {
        case 'course_kanban': {
          const courses = getAllCourses();
          for (const c of courses.slice(0, quotaPerApp)) {
            const pct = c.totalChapters > 0 ? Math.round((c.completedChapters / c.totalChapters) * 100) : 0;
            const nextCh = c.chapters.find((ch) => !ch.isCompleted);
            allFacts.push({
              sourceAppId: 'course_kanban',
              sourceAppName: '技能树课程',
              category: '课程进度',
              title: c.title,
              detail: `总章节 ${c.totalChapters}，已完成 ${c.completedChapters} (${pct}%)。下节待学：${nextCh ? nextCh.title : '已通关'}`,
              timestamp: c.updatedAt || c.createdAt,
            });
          }
          break;
        }

        case 'diary': {
          const quests = loadQuestJournal();
          for (const q of quests.slice(0, quotaPerApp)) {
            const statusLabel = q.status === 'completed' ? '已达成打卡' : '进行中未打卡';
            allFacts.push({
              sourceAppId: 'diary',
              sourceAppName: '任务手账',
              category: q.category === 'main' ? '生活主线' : '冒险支线',
              title: q.title,
              detail: `【${statusLabel}】${q.desc || ''}（属性联动：${q.tag || '精力'}）`,
            });
          }
          break;
        }

        case 'books': {
          const books = await loadAllBooks();
          for (const b of books.slice(0, quotaPerApp)) {
            const pct = b.pageCount > 0 ? Math.round((b.currentPage / b.pageCount) * 100) : 0;
            allFacts.push({
              sourceAppId: 'books',
              sourceAppName: '书藏',
              category: b.status === 'reading' ? '在读图书' : b.status === 'read' ? '已读完' : '待读吃灰',
              title: b.title,
              detail: `作者：${b.author || '未知'}，当前进度第 ${b.currentPage || 1}/${b.pageCount || '?'} 页 (${pct}%)，存放位置：${b.physicalLocation || '书架'}`,
              timestamp: b.updatedAt || b.createdAt,
            });
          }
          break;
        }

        case 'poetry': {
          const poems = await loadAllSavedPoems();
          for (const p of poems.slice(0, quotaPerApp)) {
            const firstLine = p.content && p.content.length > 0 ? p.content[0] : '';
            allFacts.push({
              sourceAppId: 'poetry',
              sourceAppName: '诗阁',
              category: p.status === 'learning' ? '在背诗篇' : '已背默',
              title: `《${p.title}》 [${p.dynasty || '古代'}] ${p.author}`,
              detail: `名句摘抄：“${firstLine}”。考核通关次数：${p.quizPassCount || 0}`,
              timestamp: p.createdAt,
            });
          }
          break;
        }

        case 'storyword': {
          const mistakes = await loadMistakeWords();
          const unmastered = mistakes.filter((m) => !m.mastered);
          for (const m of unmastered.slice(0, quotaPerApp)) {
            allFacts.push({
              sourceAppId: 'storyword',
              sourceAppName: '爽文背词',
              category: '错题高频生词',
              title: m.word,
              detail: `被绊倒 ${m.wrongCount || 1} 次，等级 ${m.level || '生词'}。上次测试时间：${m.lastTestedAt ? new Date(m.lastTestedAt).toLocaleDateString() : '近期'}`,
              timestamp: m.lastTestedAt,
            });
          }
          break;
        }

        case 'pomodoro': {
          if (!db.isOpen()) await db.open();
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);
          const sessions = await db.pomodoro_sessions.where('completedAt').aboveOrEqual(todayStart.getTime()).toArray();
          const tasks = await db.pomodoro_tasks.toArray();

          const totalMins = sessions.reduce((acc, s) => acc + (s.durationMinutes || 25), 0);
          allFacts.push({
            sourceAppId: 'pomodoro',
            sourceAppName: '心流番茄钟',
            category: '今日专注',
            title: '今日心流累计',
            detail: `今日已完成 ${sessions.length} 个番茄结界，专注总时长约 ${totalMins} 分钟。`,
          });

          for (const t of tasks.slice(0, quotaPerApp - 1)) {
            allFacts.push({
              sourceAppId: 'pomodoro',
              sourceAppName: '心流番茄钟',
              category: '专注任务',
              title: t.title,
              detail: `分类：${t.categoryLabel || t.category}，目标 ${t.estimatedPoms} 番茄，已完成 ${t.completedPoms} 番茄 (${t.isCompleted ? '已完成' : '进行中'})`,
              timestamp: t.createdAt,
            });
          }
          break;
        }

        case 'memo': {
          if (!db.isOpen()) await db.open();
          const chapters = await db.memo_chapters.orderBy('updatedAt').reverse().limit(quotaPerApp).toArray();
          for (const ch of chapters) {
            const title = ch.titleLevel2 || ch.titleLevel1 || ch.chapterName || '未命名便签';
            const preview = ch.pages && ch.pages.length > 0 ? ch.pages[0].slice(0, 100) : '';
            allFacts.push({
              sourceAppId: 'memo',
              sourceAppName: '随手便签',
              category: '手账便签',
              title,
              detail: `正文摘要：${preview}...`,
              timestamp: ch.updatedAt,
            });
          }
          break;
        }

        case 'mood_fortune': {
          const item = await db.settings.get('neumorphic_answers_book_history_v1');
          let answers: any[] = [];
          if (item && Array.isArray(item.data)) {
            answers = item.data;
          } else {
            const raw = localStorage.getItem('neumorphic_answers_book_history_v1');
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) answers = parsed;
            }
          }
          for (const a of answers.slice(-quotaPerApp)) {
            allFacts.push({
              sourceAppId: 'mood_fortune',
              sourceAppName: '答案之书',
              category: '历史神谕',
              title: `曾提问：“${a.question}”`,
              detail: `神谕答案：『${a.answerCn}』(${a.answerEn})，翻开于第 ${a.page} 页，时间：${a.timeStr || ''}`,
            });
          }
          break;
        }

        case 'files': {
          const mindmaps = await getInsightHistoryList();
          for (const mm of mindmaps.slice(0, quotaPerApp)) {
            allFacts.push({
              sourceAppId: 'files',
              sourceAppName: '思维导图',
              category: '深度认知大纲',
              title: mm.title,
              detail: `全景概述：${mm.executiveSummary || ''}。包含知识节点数：${mm.treeNodeCount || 0} 个`,
              timestamp: mm.createdAt,
            });
          }
          break;
        }

        case 'camera': {
          const posters = await getAllPosters();
          for (const p of posters.slice(0, quotaPerApp)) {
            const itemsText = (p.backItems || []).map((it: { text: string }) => it.text).join('；');
            allFacts.push({
              sourceAppId: 'camera',
              sourceAppName: '时光海报',
              category: '生活纪念日/心愿单',
              title: p.title,
              detail: `日期规划：${p.startDate} ~ ${p.endDate}，备忘打勾清单：${itemsText}`,
              timestamp: p.createdAt,
            });
          }
          break;
        }
      }
    } catch (err) {
      console.warn(`[ContextAggregator] 萃取 ${appId} 数据异常:`, err);
    }
  }

  // 保证总条目不超过 100 条
  return allFacts.slice(0, TOTAL_FACT_LIMIT);
}

/**
 * 将高维事实格式化为注入 System Prompt 的精炼 XML 上下文
 */
export function formatFactsAsPromptContext(facts: FactItem[]): string {
  if (!facts || facts.length === 0) return '';

  const lines = facts.map(
    (f, idx) =>
      `${idx + 1}. [${f.sourceAppName} · ${f.category}] 《${f.title}》: ${f.detail}`
  );

  return `
<user_connected_stars_context>
【重要提示：用户在星空中点亮了对应的应用星座，以下是系统自动萃取出的用户的真实学习与生活数据（共 ${facts.length} 条高维事实）。请在保持你的角色人设与口吻的前提下，自然地引述或结合这些事实来回应用户的问题】：
${lines.join('\n')}
</user_connected_stars_context>
`.trim();
}
