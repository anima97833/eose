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

// ==========================================
// 地球Online 8大场景丰富语料库（每类14条生动有趣的问法台词）
// ==========================================

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

const COURSE_PHRASES = [
  (name: string, ch: string) => `【主线密信】研读《${name}》${ch}，技能点+1，全属性提升！`,
  (name: string, ch: string) => `【转职任务】导师NPC发来密信：《${name}》${ch}该点亮了！`,
  (name: string, ch: string) => `【技能熟练度】《${name}》熟练度停滞中，速推${ch}解锁新被动！`,
  (name: string, ch: string) => `【战力提升】主线卡关了？回《${name}》学完${ch}直接战力暴涨！`,
  (name: string, ch: string) => `【秘籍传功】这本《${name}》法术秘籍，${ch}正散发着金色微光！`,
  (name: string, ch: string) => `【挂机提示】《${name}》离线太久，快去通关${ch}领每日熟练度！`,
  (name: string, ch: string) => `【天赋树加点】检测到脑力槽满溢，立刻参悟《${name}》${ch}！`,
  (name: string, ch: string) => `【职业进阶】距离下一个神级称号，只差《${name}》${ch}的一记顿悟！`,
  (name: string, ch: string) => `【副本通关】《${name}》${ch}副本开启，快带上脑细胞进本开荒！`,
  (name: string, ch: string) => `【突破瓶颈】《${name}》下一层境界近在眼前，${ch}速来参悟！`,
  (name: string, ch: string) => `【经验值双倍】今日脑力在线！研读《${name}》${ch}爆出暴击经验！`,
  (name: string, ch: string) => `【主线警报】检测到《${name}》已挂机许久，${ch}等你上线交任务！`,
  (name: string, ch: string) => `【封印解除】《${name}》${ch}技能锁已解开，快去点亮新分支！`,
  (name: string, ch: string) => `【传功长老】长老拍了拍你的脑门：《${name}》${ch}该结课啦！`,
];

const POETRY_PHRASES = [
  (verse: string, title: string, author: string) => `“${verse}”——文圣结界动荡，少侠能接出下半句吗？`,
  (verse: string, title: string, author: string) => `${author || '李白'}向你投来期待目光：“${verse}”，下联接得住吗？`,
  (verse: string, title: string, author: string) => `【声律结界】“${verse}”，吟出下句即可给诗灵法阵充能！`,
  (verse: string, title: string, author: string) => `《${title}》“${verse}”，背诗雷达扫描中，下一句是啥？`,
  (verse: string, title: string, author: string) => `${author || '文豪群侠'}拍了拍你：“${verse}”，下半句可别卡壳呀！`,
  (verse: string, title: string, author: string) => `【接头暗号】“${verse}”！答对下句，文采属性永久+5点！`,
  (verse: string, title: string, author: string) => `墨香灵力激荡！“${verse}”余音绕梁，速回诗阁接龙破阵！`,
  (verse: string, title: string, author: string) => `【诗道对决】敌方修士念出“${verse}”，请立刻用下一句破招！`,
  (verse: string, title: string, author: string) => `${author || '杜甫'}在草堂前叹了口气：“${verse}”，少侠记得后一句吗？`,
  (verse: string, title: string, author: string) => `【法术真诀】“${verse}”口诀念了一半，下半截真元该怎么运转？`,
  (verse: string, title: string, author: string) => `《${title}》灵光闪烁：“${verse}”，快去诗阁补齐残卷！`,
  (verse: string, title: string, author: string) => `【文曲星眷顾】对出“${verse}”的下联，今日悟性暴击率翻倍！`,
  (verse: string, title: string, author: string) => `${author || '苏轼'}端着东坡肉问你：“${verse}”，下句对完请你吃肘子！`,
  (verse: string, title: string, author: string) => `【江湖密电】暗号已送达：“${verse}”，速去诗阁回复下一句！`,
];

const BOOK_READING_PHRASES = [
  (title: string, page: number, pct: number, rem: number) => `《${title}》停在第 ${page} 页！主角身陷重围等你翻页施救呢！`,
  (title: string, page: number, pct: number, rem: number) => `进度 ${pct}%！还剩 ${rem} 页通关《${title}》，今晚不推完主线吗？`,
  (title: string, page: number, pct: number, rem: number) => `书签在第 ${page} 页发出急电：《${title}》神展开将至，速归！`,
  (title: string, page: number, pct: number, rem: number) => `【副本进度更新】《${title}》已通关 ${pct}%，今晚冲刺最后 ${rem} 页！`,
  (title: string, page: number, pct: number, rem: number) => `主角在第 ${page} 页已经被定身3天了！快去《${title}》给世界线解冻！`,
  (title: string, page: number, pct: number, rem: number) => `《${title}》高潮剧情锁定中！翻过第 ${page} 页，揭开终极真相！`,
  (title: string, page: number, pct: number, rem: number) => `进度条停在 ${pct}%！《${title}》字里行间的神秘伏笔快要憋不住了！`,
  (title: string, page: number, pct: number, rem: number) => `【主线挂机中】《${title}》第 ${page} 页掉落稀有见识，翻两页领走！`,
  (title: string, page: number, pct: number, rem: number) => `只剩 ${rem} 页就能合上《${title}》了，今晚直接通关拿成就！`,
  (title: string, page: number, pct: number, rem: number) => `书中的 NPC 都在第 ${page} 页等你下达指令，快去《${title}》开图！`,
  (title: string, page: number, pct: number, rem: number) => `《${title}》第 ${page} 页检测到心流波动，翻开书页一秒入戏！`,
  (title: string, page: number, pct: number, rem: number) => `【书藏急件】《${title}》已攻略至 ${pct}%，再翻5页即可达成今日阅读羁绊！`,
  (title: string, page: number, pct: number, rem: number) => `第 ${page} 页的谜题悬而未决，《${title}》呼唤你今夜续写篇章！`,
  (title: string, page: number, pct: number, rem: number) => `【世界线停滞】你在《${title}》第 ${page} 页下线，故事正等待神级翻盘！`,
];

const BOOK_UNREAD_PHRASES = [
  (title: string, loc: string) => `躺在${loc}的《${title}》快落灰了，今晚拆封翻两页破个冰？`,
  (title: string, loc: string) => `【金色传说吃灰】《${title}》在${loc}躺平，快去鉴定它的隐藏属性！`,
  (title: string, loc: string) => `【新手礼包未拆】买书如山倒！${loc}的《${title}》正可怜巴巴望着你！`,
  (title: string, loc: string) => `检测到《${title}》被封印在${loc}，翻开扉页破除吃灰DeBuff！`,
  (title: string, loc: string) => `【背包负重警报】${loc}的《${title}》催你激活，读一页就是赚一页！`,
  (title: string, loc: string) => `未鉴定的实体道具《${title}》在${loc}沉睡，快去翻开第一章启程！`,
  (title: string, loc: string) => `《${title}》在${loc}叹气：买我的时候叫人家小甜甜，现在都不翻一下！`,
  (title: string, loc: string) => `【藏宝图解封】${loc}的《${title}》散发智慧清香，今晚翻5页尝尝鲜！`,
  (title: string, loc: string) => `《${title}》在${loc}发来好友申请：少侠，今晚能给我一个开荒机会吗？`,
  (title: string, loc: string) => `【书架防尘警报】给${loc}的《${title}》掸掸灰，第一章的精彩在等你！`,
  (title: string, loc: string) => `买都买了，不翻两页血亏！快去${loc}把《${title}》激活成在读状态！`,
  (title: string, loc: string) => `《${title}》在${loc}发出脑电波：我真的是一本神作，快翻我两页！`,
  (title: string, loc: string) => `【神秘卷轴】${loc}的《${title}》封印尚未解开，第一批经验值等你来领！`,
  (title: string, loc: string) => `再不读，《${title}》就要在${loc}和书架长在一起了，今晚先读序言！`,
];

const WORD_PHRASES = [
  (w: string, cnt: number) => `【野怪突袭】“${w}”向你投来挑衅目光，错题阁里它绊倒你 ${cnt} 次了！`,
  (w: string, cnt: number) => `【宿命仇敌】“${w}”从草丛跳出！这次能秒说出它的中文释义击杀它吗？`,
  (w: string, cnt: number) => `【洗雪前耻】昨晚单杀你 ${cnt} 次的“${w}”刷新了，速去错题阁收割经验！`,
  (w: string, cnt: number) => `【词根法术反噬】生词怪“${w}”狂妄叫嚣，点进来一键斩杀它！`,
  (w: string, cnt: number) => `精英怪“${w}”正在错题阁徘徊，成功认出即可夺回被扣除的词汇量！`,
  (w: string, cnt: number) => `【考官截杀】“${w}”对你施加了遗忘术，快去错题集给它来一记迎头痛击！`,
  (w: string, cnt: number) => `这只名叫“${w}”的小怪你已经打翻 ${cnt} 回了，今天必须彻底降服它！`,
  (w: string, cnt: number) => `【智力判定】野外Boss“${w}”现身，你能顶住威压说出它的含义吗？`,
  (w: string, cnt: number) => `【悬赏通缉】错题阁S级通缉犯“${w}”，速去一决高下拿下悬赏！`,
  (w: string, cnt: number) => `“${w}”在你的背词记录里留下了 ${cnt} 道刀痕，是时候完成终极复仇了！`,
  (w: string, cnt: number) => `【生词伏击】叮！“${w}”向你发动了偷袭，快去背词阁辨识它的真身！`,
  (w: string, cnt: number) => `击败“${w}”，词汇量属性永久+10，这次可别再给它逃跑的机会！`,
  (w: string, cnt: number) => `【记忆擂台】“${w}”站在擂台上叫阵，点进来看看能不能一次KO它！`,
  (w: string, cnt: number) => `【生词封印】将“${w}”打入熟练掌握区，今晚的生词怪清缴任务就靠你了！`,
];

const POMODORO_PHRASES = [
  '【精力满溢】蓝条已满，开启25分钟专注结界，回蓝冥想刷大招！',
  '【闭关修炼】开启专注结界！拒绝外界低维信息干扰，心流+999！',
  '【心流领域展开】今日尚未开启专注法阵，快去注入25分钟神级专注力！',
  '【回蓝时刻】脑力齿轮已就绪，点燃专注香炉，开启一段无敌心流！',
  '【结界加护】开启25分钟专注防御罩，屏蔽一切杂音，悟性临时翻倍！',
  '【修炼洞府】进入番茄钟洞府，打坐25分钟，将浮躁值彻底归零！',
  '【心流暴击】当世界安静下来，你的产出将产生暴击，速启专注钟！',
  '【灵气充能】耐力槽正在满格发光，开启专注结界，把杂事一扫而空！',
  '【沉浸模式】进入深度潜行状态，用25分钟给今日进度条来一次大突进！',
  '【专注光环】法力池充盈，现在展开专注结界可获得全属性专注加成！',
  '【极意之境】万籁俱寂，是时候开启心流结界，给今天的难题致命一击！',
  '【神级专注】专注时钟已上膛，点下开始键，进入属于你的绝对领域！',
  '【心流护盾】外界杂念正在逼近，快缩进番茄结界里安心产出吧！',
  '【道心稳固】25分钟弹指一挥间，点亮专注番茄，收获沉甸甸的成就感！',
];

const MEMO_PHRASES = [
  '【篝火存盘】今日世界线剧情丰富，尚未生成每日存档，速去营地记录！',
  '【服务器维护前】地球Online今日副本行将结算，快去日记本保存剧情进度！',
  '【防掉档警报】检测到今日灵感碎片掉落满地，去手账本一键收纳存盘！',
  '【冒险日志】今日经历了哪些神级事件？速去手账本记录今日高光时刻！',
  '【时间胶囊】把今天的奇思妙想刻进手账，给未来的自己留个彩蛋！',
  '【存档点刷新】营地篝火噼啪作响，翻开手账本，写下属于今天的结语！',
  '【灵魂存盘】今天地球Online游玩体验如何？回手账写两句防掉档！',
  '【日志封印】今日探险即将谢幕，快去给今日份的记忆盖上金色印章！',
  '【岁月留痕】生活里细碎的小美好，正等着被你收录进手账秘卷中！',
  '【主线结算】今天的主线任务打通了几条？去手账本复个盘领奖励！',
  '【记忆备份】人类脑内存有限，快去手账本做一次每日全量增量备份！',
  '【夜间篝火】在手账本的存盘点坐下，喝口热茶，写下今天最快乐的瞬间！',
  '【史官起笔】你今天的故事就是一部微型史诗，快回手账本记录成章！',
  '【每日心绪】把今天的喜怒哀乐打包存档，清空缓存，明天又是新起点！',
];

const DAILY_PHRASES = [
  '【世界广播】亚太东八区服务器运行良好，去课程本刷刷经验吧！',
  '【NPC学伴】灵动小助理朝你比了个加油手势：今天也是元气满满的玩家！',
  '【日常活跃度】今日地球Online日常宝箱刷新，点进应用随意做做日常！',
  '【低频信号】接收到来自未来的量子广播：坚持学习的玩家运气都不会差！',
  '【状态检测】体能槽良、脑力值优，宜：探索新知，忌：长时间摸鱼！',
  '【系统公告】服务器检测到你的悟性正在悄悄提高，快去挑个任务做做！',
  '【天降好运】今日探索幸运值+10%，随便学点什么都能收获满满灵感！',
  '【主世界漫游】别光在主城挂机发呆，挑一本好书或一门课出发冒险吧！',
  '【学伴传音】嗨！今天的地球Online风景不错，要不要开启第一段心流？',
  '【版本热更】你的大脑正进行无感热更新，多学一个概念就是一次升级！',
  '【世界线观测】每一个点开应用的微小举动，都在塑造更强大的你！',
  '【能量共振】检测到周围灵气充沛，正是开卷有益、提升战力的绝佳时机！',
  '【主线提示】不要忘记你的终极目标，从完成当前的一个小任务开始吧！',
  '【玩家嘉奖】恭喜你今天依然保持在线，地球Online为你点亮一颗星！',
];

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
      const phraseGen = pickRandom(COURSE_PHRASES);

      candidatePool.push({
        id: `nudge_course_${course.id}_${Date.now()}`,
        source: 'course',
        tag: '地球Online · 技能树',
        icon: 'skill',
        message: phraseGen(shortName, chapterLabel),
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
          const shortTitle = trimTitle(poem.title, 8);
          const phraseGen = pickRandom(POETRY_PHRASES);
          const msg = phraseGen(cleanVerse, shortTitle, poem.author || '文豪');

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
      const shortTitle = trimTitle(book.title, 9);
      const phraseGen = pickRandom(BOOK_READING_PHRASES);
      const msg = phraseGen(shortTitle, book.currentPage || 1, pct, remainingPages);

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
      const shortTitle = trimTitle(unreadBook.title, 9);
      const phraseGen = pickRandom(BOOK_UNREAD_PHRASES);
      const msg = phraseGen(shortTitle, loc);

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
        const phraseGen = pickRandom(WORD_PHRASES);
        const msg = phraseGen(targetWord.word, targetWord.wrongCount || 1);

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
        message: pickRandom(POMODORO_PHRASES),
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
        message: pickRandom(MEMO_PHRASES),
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
      message: pickRandom(DAILY_PHRASES),
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
