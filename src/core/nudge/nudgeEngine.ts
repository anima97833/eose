import { NudgeNotification } from './nudgeTypes';
import { getAllCourses } from '../kanban/courseKanbanStorage';
import { Course, CourseChapter } from '../kanban/courseKanbanTypes';
import { db } from '../storage/db';
import { MemoChapter } from '../memo/memoTypes';
import { loadAllSavedPoems } from '../poetry/poetryStorage';
import { loadAllBooks } from '../books/bookStorage';
import { loadMistakeWords } from '../storyword/storyWordStorage';
import { SavedPoemRecord } from '../poetry/poetryTypes';
import { PhysicalBookRecord } from '../books/bookTypes';
import { StoryWordMistake } from '../storyword/storyWordTypes';

const LAST_NUDGE_TIME_KEY = 'cloudfly_last_nudge_timestamp';
const NEXT_INTERVAL_KEY = 'cloudfly_next_nudge_interval_ms';
const LAST_NUDGE_SOURCE_KEY = 'cloudfly_last_nudge_source';
const LAST_NUDGE_ID_KEY = 'cloudfly_last_nudge_id';

/**
 * 获取随机冷却间隔（15 ~ 20 分钟）
 */
function getRandomCooldownMs(): number {
  const minMs = 15 * 60 * 1000; // 15 分钟
  const maxMs = 20 * 60 * 1000; // 20 分钟
  return Math.floor(minMs + Math.random() * (maxMs - minMs));
}

/**
 * 检查当前是否已过冷却窗口
 */
function isCooldownPassed(): boolean {
  try {
    const lastTime = parseInt(localStorage.getItem(LAST_NUDGE_TIME_KEY) || '0', 10);
    const interval = parseInt(localStorage.getItem(NEXT_INTERVAL_KEY) || `${15 * 60 * 1000}`, 10);
    return Date.now() - lastTime >= interval;
  } catch {
    return true;
  }
}

/**
 * 标记刚刚触发过提醒，并预定下次 15~20 分钟随机时间
 */
export function markNudgeTriggered(): void {
  try {
    localStorage.setItem(LAST_NUDGE_TIME_KEY, `${Date.now()}`);
    localStorage.setItem(NEXT_INTERVAL_KEY, `${getRandomCooldownMs()}`);
  } catch (err) {
    console.warn('[NudgeEngine] 记录提醒冷却失败:', err);
  }
}

/**
 * 重置冷却（用于手动测试）
 */
export function resetNudgeCooldown(): void {
  try {
    localStorage.removeItem(LAST_NUDGE_TIME_KEY);
    localStorage.removeItem(NEXT_INTERVAL_KEY);
  } catch (err) {
    console.warn('[NudgeEngine] 重置冷却失败:', err);
  }
}

/**
 * 格式化精简名称，避免太长挤爆胶囊
 */
function trimTitle(title: string, maxLen = 14): string {
  if (!title) return '未命名';
  const clean = title.replace(/【.*?】/g, '').replace(/\[.*?\]/g, '').trim();
  return clean.length > maxLen ? `${clean.slice(0, maxLen)}...` : clean;
}

/**
 * 清除诗句末尾标点
 */
function cleanVerseLine(line: string): string {
  if (!line) return '';
  return line.replace(/[,，.。?!？！、;；]$/g, '').trim();
}

/**
 * 智能嗅探所有待提醒事项池，采用【防重复·真随机开盲盒算法】
 * 涵盖：课程技能树、诗阁在背诗词、书藏在读/未读书目、爽文背词错题、番茄专注、日记手账
 * 真正的随机抽取，越随机越好；绝不连续抽中相同的大类！
 */
export async function detectEarthOnlineNudge(force: boolean = false): Promise<NudgeNotification | null> {
  if (!force && !isCooldownPassed()) {
    return null;
  }

  const candidatePool: NudgeNotification[] = [];

  // 1. 搜集滞后/未学完的课程技能书
  try {
    const courses: Course[] = getAllCourses();
    const laggingCourses = courses.filter((c: Course) => {
      if (c.status === 'completed') return false;
      const progress = c.totalChapters > 0 ? (c.completedChapters / c.totalChapters) * 100 : 0;
      const daysSinceUpdate = (Date.now() - (c.updatedAt || c.createdAt)) / (1000 * 60 * 60 * 24);
      return progress < 60 || daysSinceUpdate >= 1.5 || c.completedChapters === 0;
    });

    for (const course of laggingCourses) {
      const nextChapter = course.chapters.find((ch: CourseChapter) => !ch.isCompleted);
      const chapterLabel = nextChapter ? `第${nextChapter.index + 1}节` : '下节';
      const shortName = trimTitle(course.title, 11);

      candidatePool.push({
        id: `nudge_course_${course.id}_${Date.now()}`,
        source: 'course',
        tag: '地球Online · 技能树',
        icon: 'skill',
        message: `研读《${shortName}》${chapterLabel}，熟练度+20%！`,
        targetAppId: 'course_kanban',
        actionLabel: '去研读',
        courseId: course.id,
        createdAt: Date.now(),
      });
    }
  } catch (err) {
    console.warn('[NudgeEngine] 检查课程失败:', err);
  }

  // 2. 嗅探诗阁：提取在背诗词，趣味诗句提问/接句 (注入多个不同候选诗)
  try {
    const poems: SavedPoemRecord[] = await loadAllSavedPoems();
    const learningPoems = poems.filter((p) => p.status === 'learning');
    const targetPoemPool = learningPoems.length > 0 ? learningPoems : poems;

    if (targetPoemPool.length > 0) {
      // 随机挑出最多 3 首不同诗词加入候选池
      const shuffledPoems = [...targetPoemPool].sort(() => 0.5 - Math.random()).slice(0, 3);

      for (const poem of shuffledPoems) {
        if (poem.content && poem.content.length > 0) {
          const verseIdx = Math.floor(Math.random() * Math.min(2, poem.content.length));
          const rawVerse = poem.content[verseIdx] || poem.content[0];
          const cleanVerse = cleanVerseLine(rawVerse);

          const poemPhrases = [
            `“${cleanVerse}”——下联接得住吗？快回诗阁对一句！`,
            `《${trimTitle(poem.title, 8)}》“${cleanVerse}”，下一句是什么来着？`,
            `${poem.author || '文豪'}拍了拍你：“${cleanVerse}”，下半句可别卡壳呀！`,
          ];
          const msg = poemPhrases[Math.floor(Math.random() * poemPhrases.length)];

          candidatePool.push({
            id: `nudge_poetry_${poem.id}_${Date.now()}`,
            source: 'poetry',
            tag: '地球Online · 诗阁',
            icon: 'poetry',
            message: msg,
            targetAppId: 'poetry',
            actionLabel: '去对诗',
            poemId: poem.id,
            createdAt: Date.now(),
          });
        }
      }
    }
  } catch (err) {
    console.warn('[NudgeEngine] 检查诗阁失败:', err);
  }

  // 3. 嗅探书藏：在读书目剧情催读 + 未读书目吃灰调侃
  try {
    const books: PhysicalBookRecord[] = await loadAllBooks();
    const readingBooks = books.filter((b) => b.status === 'reading');
    const unreadBooks = books.filter((b) => b.status === 'unread');

    // 3.1 在读图书催读（注入在读书目候选）
    const sampledReading = [...readingBooks].sort(() => 0.5 - Math.random()).slice(0, 2);
    for (const book of sampledReading) {
      const pct = book.pageCount > 0 ? Math.round((book.currentPage / book.pageCount) * 100) : 50;
      const remainingPages = Math.max(1, (book.pageCount || 200) - book.currentPage);

      const readingPhrases = [
        `《${trimTitle(book.title, 9)}》停在第 ${book.currentPage} 页好久了，主角正陷入危局等你翻页！`,
        `进度 ${pct}%！《${trimTitle(book.title, 9)}》还剩 ${remainingPages} 页通关，今晚不翻两页破个局？`,
        `书签在第 ${book.currentPage} 页呼唤你！《${trimTitle(book.title, 9)}》剧情正到高潮，速归！`,
      ];
      const msg = readingPhrases[Math.floor(Math.random() * readingPhrases.length)];

      candidatePool.push({
        id: `nudge_book_reading_${book.id}_${Date.now()}`,
        source: 'book',
        tag: '地球Online · 书藏催读',
        icon: 'book',
        message: msg,
        targetAppId: 'books',
        actionLabel: '去翻书',
        bookId: book.id,
        createdAt: Date.now(),
      });
    }

    // 3.2 未读图书吃灰预警（注入未读书目候选）
    const sampledUnread = [...unreadBooks].sort(() => 0.5 - Math.random()).slice(0, 2);
    for (const unreadBook of sampledUnread) {
      const loc = unreadBook.physicalLocation ? `『${unreadBook.physicalLocation}』` : '书架上';

      const unreadPhrases = [
        `躺在${loc}的《${trimTitle(unreadBook.title, 9)}》快落灰了，今晚拆封翻两页破个冰？`,
        `【藏书吃灰警报】《${trimTitle(unreadBook.title, 9)}》还没开动，给新书一个被翻牌的机会！`,
      ];
      const msg = unreadPhrases[Math.floor(Math.random() * unreadPhrases.length)];

      candidatePool.push({
        id: `nudge_book_unread_${unreadBook.id}_${Date.now()}`,
        source: 'book',
        tag: '地球Online · 书架吃灰',
        icon: 'book',
        message: msg,
        targetAppId: 'books',
        actionLabel: '去翻书',
        bookId: unreadBook.id,
        createdAt: Date.now(),
      });
    }
  } catch (err) {
    console.warn('[NudgeEngine] 检查书藏失败:', err);
  }

  // 4. 嗅探爽文背词：从错题阁中随机抽取多个高频生词进行突击
  try {
    const mistakes: StoryWordMistake[] = await loadMistakeWords();
    const unmastered = mistakes.filter((m) => !m.mastered);

    if (unmastered.length > 0) {
      // 提取前 5 个高频生词并随机挑选出最多 3 个注入候选池
      const sorted = [...unmastered].sort((a, b) => (b.wrongCount || 1) - (a.wrongCount || 1));
      const topCandidates = sorted.slice(0, Math.min(5, sorted.length)).sort(() => 0.5 - Math.random()).slice(0, 3);

      for (const targetWord of topCandidates) {
        const wordPhrases = [
          `【错词突袭】“${targetWord.word}”是什么意思还记得吗？错题阁里绊倒你 ${targetWord.wrongCount} 次了！`,
          `昨晚背错的单词“${targetWord.word}”突然跳出，这次能秒懂它的中文释义吗？`,
          `【考官挑衅】“${targetWord.word}”向你投来挑衅目光，点进来看看能不能一次拿下它！`,
        ];
        const msg = wordPhrases[Math.floor(Math.random() * wordPhrases.length)];

        candidatePool.push({
          id: `nudge_word_${targetWord.id}_${Date.now()}`,
          source: 'word',
          tag: '地球Online · 爽文背词',
          icon: 'word',
          message: msg,
          targetAppId: 'storyword',
          actionLabel: '去攻克',
          word: targetWord.word,
          createdAt: Date.now(),
        });
      }
    }
  } catch (err) {
    console.warn('[NudgeEngine] 检查爽文背词错题失败:', err);
  }

  // 5. 搜集番茄钟专注结界候选
  try {
    if (!db.isOpen()) await db.open();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todaySessions = await db.pomodoro_sessions
      .where('completedAt')
      .aboveOrEqual(todayStart.getTime())
      .toArray();

    if (todaySessions.length === 0) {
      candidatePool.push({
        id: `nudge_pomodoro_${Date.now()}`,
        source: 'pomodoro',
        tag: '地球Online · 心流结界',
        icon: 'focus',
        message: `耐力条满溢，开启25分钟专注结界回蓝刷经验！`,
        targetAppId: 'pomodoro',
        actionLabel: '去专注',
        createdAt: Date.now(),
      });
    }
  } catch (err) {
    console.warn('[NudgeEngine] 检查番茄钟失败:', err);
  }

  // 6. 搜集手账日记存盘点候选
  try {
    if (!db.isOpen()) await db.open();
    const chapters: MemoChapter[] = await db.memo_chapters.toArray();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const hasTodayEntry = chapters.some((ch: MemoChapter) => ch.updatedAt >= todayStart.getTime());
    if (!hasTodayEntry) {
      candidatePool.push({
        id: `nudge_memo_${Date.now()}`,
        source: 'memo',
        tag: '地球Online · 存档点',
        icon: 'save',
        message: `今日剧情丰富，尚未生成每日存档，速去记录！`,
        targetAppId: 'memo',
        actionLabel: '去记录',
        createdAt: Date.now(),
      });
    }
  } catch (err) {
    console.warn('[NudgeEngine] 检查日记手账失败:', err);
  }

  // 兜底候选项
  if (candidatePool.length === 0) {
    candidatePool.push({
      id: `nudge_daily_${Date.now()}`,
      source: 'daily',
      tag: '地球Online · 系统广播',
      icon: 'earth',
      message: `亚太东八区服务器运行良好，去课程本刷刷经验吧！`,
      targetAppId: 'course_kanban',
      actionLabel: '去刷级',
      createdAt: Date.now(),
    });
  }

  // 7. 【防重复 · 真随机盲盒抽取算法】（越随机越好，充满开盲盒的不可预测性与惊喜感）
  const lastSource = localStorage.getItem(LAST_NUDGE_SOURCE_KEY);
  const lastId = localStorage.getItem(LAST_NUDGE_ID_KEY);

  // 第一优先级防连抽：排除上一次刚出现过的应用大类（例如刚对完诗，下一次绝不会又是诗歌）
  let poolForDraw = candidatePool.filter((item) => item.source !== lastSource);

  // 如果排除大类后池子为空（比如用户当前仅有一类未完成项目），退回排除具体上一次的那条特定任务
  if (poolForDraw.length === 0) {
    poolForDraw = candidatePool.filter((item) => item.id !== lastId);
  }

  // 兜底：若依然为空，使用全量候选池
  if (poolForDraw.length === 0) {
    poolForDraw = candidatePool;
  }

  // 真正开盲盒随机抽取！
  const randomIdx = Math.floor(Math.random() * poolForDraw.length);
  const selectedNudge = poolForDraw[randomIdx];

  // 记录本次抽中的类型与具体 ID，供下一次防连抽算法比对
  try {
    localStorage.setItem(LAST_NUDGE_SOURCE_KEY, selectedNudge.source);
    localStorage.setItem(LAST_NUDGE_ID_KEY, selectedNudge.id);
  } catch (err) {
    console.warn('[NudgeEngine] 记录盲盒抽取历史失败:', err);
  }

  return selectedNudge;
}
