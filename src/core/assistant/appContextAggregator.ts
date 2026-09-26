import { StarAppMeta, FactItem } from './assistantTypes';
import { getAllCourses } from '../kanban/courseKanbanStorage';
import { loadQuestJournal } from '../quest/questStorage';
import { loadAllBooks } from '../books/bookStorage';
import { loadAllSavedPoems } from '../poetry/poetryStorage';
import { loadMistakeWords } from '../storyword/storyWordStorage';
import { db } from '../storage/db';
import { getInsightHistoryList } from '../files/insightHistoryService';
import { getAllPosters } from '../poster/posterStorage';
import { loadMomentsFromDB } from '../moments/momentsStorage';
import { loadWishes } from '../../components/apps/gachapon/core/gachaStorage';
import { loadAllMovies, calculateCinemaStats } from '../cinema/cinemaStorage';
import { loadCheckInSpots, getExplorationStats } from '../compass/compassStorage';
import { loadRPGProfile, loadRelationshipData } from '../rpg/rpgStorage';
import { loadDossierFromDB } from '../rpg/dossierStorage';
import { getAllMealRecords } from '../rpg/mealStorage';
import { getAllLifeStories } from '../rpg/lifeStorage';
import { loadAllGames, calculateGameStats } from '../games/gameStorage';
import { PLATFORM_NAMES, STATUS_NAMES } from '../games/gameTypes';

/**
 * 星空全星宿矩阵 (16 颗核心轻拟物应用星星)
 * 采用银河三星团错落分布算法：左翼灵感学识、中央生活羁绊、右翼光影探索与游戏
 */
export const ALL_STAR_APPS: StarAppMeta[] = [
  // === 左翼星宿群【学识·灵感·沉思】 ===
  {
    id: 'course_kanban',
    name: '学习看板',
    iconName: 'BookOpen',
    themeColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.65)',
    x: 14,
    y: 16,
  },
  {
    id: 'storyword',
    name: '间词',
    iconName: 'Zap',
    themeColor: '#facc15',
    glowColor: 'rgba(250, 204, 21, 0.65)',
    x: 32,
    y: 18,
  },
  {
    id: 'poetry',
    name: '诗阁',
    iconName: 'Feather',
    themeColor: '#f472b6',
    glowColor: 'rgba(244, 114, 182, 0.65)',
    x: 16,
    y: 36,
  },
  {
    id: 'memo',
    name: '便签手账',
    iconName: 'Save',
    themeColor: '#4ade80',
    glowColor: 'rgba(74, 222, 128, 0.65)',
    x: 30,
    y: 38,
  },
  {
    id: 'mood_fortune',
    name: '答案之书',
    iconName: 'HelpCircle',
    themeColor: '#fb7185',
    glowColor: 'rgba(251, 113, 133, 0.65)',
    x: 18,
    y: 56,
  },

  // === 中央星宿群【生活·羁绊·心愿】 ===
  {
    id: 'diary',
    name: '世界线',
    iconName: 'GitBranch',
    themeColor: '#34d399',
    glowColor: 'rgba(52, 211, 153, 0.65)',
    x: 50,
    y: 14,
  },
  {
    id: 'moments',
    name: '动态',
    iconName: 'Image',
    themeColor: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.65)',
    x: 48,
    y: 32,
  },
  {
    id: 'profile',
    name: '我的',
    iconName: 'User',
    themeColor: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.65)',
    x: 62,
    y: 28,
  },
  {
    id: 'gachapon',
    name: '扭蛋机',
    iconName: 'Gift',
    themeColor: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.65)',
    x: 40,
    y: 52,
  },
  {
    id: 'files',
    name: '思维导图',
    iconName: 'GitBranch',
    themeColor: '#22d3ee',
    glowColor: 'rgba(34, 211, 238, 0.65)',
    x: 58,
    y: 54,
  },

  // === 右翼星宿群【放映·探险·游戏·光影】 ===
  {
    id: 'books',
    name: '书藏',
    iconName: 'BookMarked',
    themeColor: '#c084fc',
    glowColor: 'rgba(192, 132, 252, 0.65)',
    x: 74,
    y: 16,
  },
  {
    id: 'compass',
    name: '时空指南',
    iconName: 'Compass',
    themeColor: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.65)',
    x: 88,
    y: 18,
  },
  {
    id: 'gamevault',
    name: '游戏仓',
    iconName: 'Joystick',
    themeColor: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.65)',
    x: 72,
    y: 36,
  },
  {
    id: 'cinema',
    name: '放映室',
    iconName: 'Film',
    themeColor: '#8b5cf6',
    glowColor: 'rgba(139, 92, 246, 0.65)',
    x: 88,
    y: 36,
  },
  {
    id: 'camera',
    name: '刻时',
    iconName: 'Aperture',
    themeColor: '#a78bfa',
    glowColor: 'rgba(167, 139, 250, 0.65)',
    x: 80,
    y: 56,
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
              sourceAppName: '学习看板',
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
              sourceAppName: '间词',
              category: '错题高频生词',
              title: m.word,
              detail: `被绊倒 ${m.wrongCount || 1} 次，等级 ${m.level || '生词'}。上次测试时间：${m.lastTestedAt ? new Date(m.lastTestedAt).toLocaleDateString() : '近期'}`,
              timestamp: m.lastTestedAt,
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

        // ================= 朋友圈动态 (全局内容萃取) =================
        case 'moments': {
          const moments = await loadMomentsFromDB();
          const starredMoments = moments.filter((m) => m.isStarred);
          const totalAttrGains = moments.reduce((acc, m) => acc + (m.attributeGain || 0), 0);
          const totalCoins = moments.reduce((acc, m) => acc + (m.rewardCoins || 0), 0);

          // 1. 动态全局大盘统计
          allFacts.push({
            sourceAppId: 'moments',
            sourceAppName: '朋友圈动态',
            category: '动态全局大盘',
            title: `生活动态全记录 (${moments.length} 条瞬间)`,
            detail: `累计发布日常动态 ${moments.length} 条，其中星标珍藏 ${starredMoments.length} 篇。动态日常修行累计汲取六维属性 +${totalAttrGains} 点，收获金币 +${totalCoins} 枚。`,
          });

          // 2. 读取全局动态内容明细
          for (const m of moments.slice(0, quotaPerApp - 1)) {
            const starTag = m.isStarred ? '★已珍藏' : '日常';
            const attrText = m.attributeTag ? `[${m.attributeTag} +${m.attributeGain || 2}]` : '';
            const imgCountText = m.images && m.images.length > 0 ? `(附带 ${m.images.length} 张生活配图)` : '';
            allFacts.push({
              sourceAppId: 'moments',
              sourceAppName: '朋友圈动态',
              category: m.themeTitle || '日常动态',
              title: `【${m.dateStr || '近期'}】${m.themeTitle || '生活瞬间'} (${starTag})`,
              detail: `正文：“${m.content}” ${imgCountText}。奖励结算：属性收益 ${attrText}，金币奖励 +${m.rewardCoins || 50}。`,
              timestamp: m.createdAt,
            });
          }
          break;
        }

        // ================= 游戏仓 (全局内容萃取) =================
        case 'gamevault': {
          const games = await loadAllGames();
          const stats = calculateGameStats(games);

          // 1. 游戏仓全局大盘总览
          allFacts.push({
            sourceAppId: 'gamevault',
            sourceAppName: '游戏仓',
            category: '游戏大盘总览',
            title: `游戏库全览 (${stats.totalCount} 款典藏)`,
            detail: `总收录游戏 ${stats.totalCount} 款，累计通关 ${stats.clearedCount} 款，正在游玩 ${stats.playingCount} 款，心愿想玩 ${stats.wishlistCount} 款，封盘 ${stats.droppedCount} 款。累计总游玩投入时间 ${stats.totalPlaytimeHours} 小时。`,
          });

          // 2. 读取全局游戏内容明细
          for (const g of games.slice(0, quotaPerApp - 1)) {
            const platformLabel = PLATFORM_NAMES[g.platform] || g.platform;
            const statusLabel = STATUS_NAMES[g.status] || g.status;
            const stars = g.rating ? `${g.rating} 星` : '未评分';
            const commentText = g.comment ? `玩家评语：“${g.comment}”` : '暂无评测';
            const tagsText = g.tags && g.tags.length > 0 ? `标签：${g.tags.join('/')}` : '';
            const timeText = g.playtimeHours > 0 ? `累计游玩 ${g.playtimeHours} 小时` : '尚未记录时长';
            const clearedInfo = g.clearedDate ? `，于 ${g.clearedDate} 通关` : '';

            allFacts.push({
              sourceAppId: 'gamevault',
              sourceAppName: '游戏仓',
              category: `游戏明细·${statusLabel}`,
              title: `${g.title} (${platformLabel})`,
              detail: `【${statusLabel}】${timeText}${clearedInfo}，个人评分：${stars}。${tagsText}。${commentText}`,
              timestamp: g.updatedAt || g.createdAt,
            });
          }
          break;
        }

        case 'gachapon': {
          const wishes = loadWishes();
          for (const w of wishes.slice(0, quotaPerApp)) {
            const isCompleted = w.status === 'completed' || !!w.completedAt;
            const statusLabel = isCompleted ? '已达成愿望' : '待办心愿纸条';
            allFacts.push({
              sourceAppId: 'gachapon',
              sourceAppName: '心愿扭蛋机',
              category: statusLabel,
              title: w.content,
              detail: `【${statusLabel}】状态：${w.status}。胶囊色调：${w.colorKey}，心愿标识：${w.icon || '✨'}`,
              timestamp: w.completedAt || w.createdAt,
            });
          }
          break;
        }

        case 'cinema': {
          const movies = await loadAllMovies();
          const stats = calculateCinemaStats(movies);

          allFacts.push({
            sourceAppId: 'cinema',
            sourceAppName: '时光放映室',
            category: '观影总览',
            title: '个人影院大盘',
            detail: `已看影片 ${stats.totalWatched} 部，累计观影时长 ${stats.totalHours} 小时，个人综合均分 ${stats.avgRating} 星，待看心愿单 ${stats.totalWishlist} 部。`,
          });

          for (const m of movies.slice(0, quotaPerApp - 1)) {
            const statusText = m.status === 'watched' ? '已观影' : '待看愿望';
            allFacts.push({
              sourceAppId: 'cinema',
              sourceAppName: '时光放映室',
              category: statusText,
              title: m.title,
              detail: `原名/年份：${m.originalTitle || m.title} (${m.year || '经典'})，个人评分：${m.rating ? m.rating + '分' : '未评'}，观后感：${m.comment || '暂无影评'}，观影时间：${m.watchedDate || '近期'}`,
              timestamp: m.watchedDate ? new Date(m.watchedDate).getTime() : m.createdAt,
            });
          }
          break;
        }

        case 'compass': {
          const spots = loadCheckInSpots();
          const stats = getExplorationStats();

          allFacts.push({
            sourceAppId: 'compass',
            sourceAppName: '时空指南',
            category: '探险足迹',
            title: '城市迷雾漫步',
            detail: `累计打卡专属据点 ${stats.totalSpotsCount || spots.length} 处（秘密基地 ${stats.secretBasesCount || 0} 处），驱散迷雾解锁区域 ${stats.unlockedAreasCount || 0} 块，徒步漫步探索总里程约 ${stats.totalDistanceMeters || 0} 米。`,
          });

          for (const s of spots.slice(0, quotaPerApp - 1)) {
            allFacts.push({
              sourceAppId: 'compass',
              sourceAppName: '时空指南',
              category: '打卡据点',
              title: s.name,
              detail: `位于：${s.address || '未知位置'}，据点等级：Lv.${s.level}【${s.levelTitle || '秘密据点'}】，已打卡 ${s.checkInCount} 次。探险笔记：${s.note || '暂无笔记'}`,
              timestamp: s.lastCheckInAt || s.createdAt,
            });
          }
          break;
        }

        // ================= 我的 (个人档案/亲缘图谱/美食手账/半生手账/背包/职业) =================
        case 'profile': {
          const profile = loadRPGProfile();
          const [dossier, meals, lifeStories] = await Promise.all([
            loadDossierFromDB(),
            getAllMealRecords(),
            getAllLifeStories(),
          ]);
          const relationshipData = loadRelationshipData();

          const charName = dossier.name || profile.name || '旅行者';
          const charTitle = dossier.title || profile.title || '初醒之人';
          const zodiac = dossier.zodiac || profile.zodiac || '双鱼座';
          const mbti = dossier.mbti || profile.mbti || 'INFP';
          const gender = dossier.gender || profile.gender || '保密';

          // 1. 个人档案与属性大盘
          allFacts.push({
            sourceAppId: 'profile',
            sourceAppName: '我的·角色与档案',
            category: '个人档案',
            title: `${charName} · ${charTitle} (Lv.${profile.level})`,
            detail: `姓名：${charName}，称号：${charTitle}，星座：${zodiac}，MBTI：${mbti}，性别：${gender}。当前经验：${profile.currentExp}/${profile.maxExp}，生命值：${profile.hp}/${profile.maxHp}，法力值：${profile.mp}/${profile.maxMp}，拥有金币：${profile.gold || 0} 枚，今日心情值：${profile.mood ?? 100} 分。六维战力：精神(SPI) ${profile.attributes?.SPI?.value || 0}，魅力(CHA) ${profile.attributes?.CHA?.value || 0}，智力(INT) ${profile.attributes?.INT?.value || 0}，体质(CON) ${profile.attributes?.CON?.value || 0}，敏捷(DEX) ${profile.attributes?.DEX?.value || 0}，力量(STR) ${profile.attributes?.STR?.value || 0}。`,
          });

          // 2. 职业体系
          const currentClass = profile.classes?.find((c) => c.id === profile.currentClassId) || profile.classes?.[0];
          const allClassTitles = profile.classes?.map((c) => `${c.title}(${c.job})`).join('、') || '暂无';
          allFacts.push({
            sourceAppId: 'profile',
            sourceAppName: '我的·就职生涯',
            category: '职业',
            title: `当前就任职业：${currentClass ? currentClass.title : '冒险家'}`,
            detail: currentClass
              ? `正式职位：${currentClass.job}，核心主属性：${currentClass.mainAttr}，期望薪资：${currentClass.salary || '未设'}，期望工作地：${currentClass.location || '自由'}。职业信条：“${currentClass.desc}”。已兼修/可选职业库：${allClassTitles}。`
              : '尚未就职特定流派。',
          });

          // 3. 我的故事 (个人手账活页本)
          const stories = (dossier.storyPages && dossier.storyPages.length > 0)
            ? dossier.storyPages
            : (profile.storyPages && profile.storyPages.length > 0 ? profile.storyPages : []);
          for (const sp of stories.slice(0, 5)) {
            allFacts.push({
              sourceAppId: 'profile',
              sourceAppName: '我的·个人故事',
              category: '我的故事',
              title: `手账随笔 第 ${sp.pageIndex + 1} 页 (${sp.date || '未知日期'})`,
              detail: `故事正文：“${sp.content}”`,
              timestamp: sp.updatedAt,
            });
          }

          // 4. 亲缘图谱
          const nodes = relationshipData.nodes || [];
          const otherNodes = nodes.filter((n) => !n.isCenter);
          allFacts.push({
            sourceAppId: 'profile',
            sourceAppName: '我的·亲缘图谱',
            category: '亲缘图谱',
            title: `羁绊星网 (${nodes.length} 位生命伙伴)`,
            detail: `图谱核心为【${charName}】，已缔结羁绊的伙伴共 ${otherNodes.length} 位：${otherNodes.map((n) => `${n.name}【${n.relation}·${n.category}】`).join('，') || '暂无其他伙伴'}。`,
          });
          for (const n of otherNodes.slice(0, 4)) {
            allFacts.push({
              sourceAppId: 'profile',
              sourceAppName: '我的·亲缘图谱',
              category: '羁绊伙伴',
              title: `${n.name} (${n.relation})`,
              detail: `分类：${n.category}，随笔寄语：“${n.desc || '同路前行的重要之人'}”`,
            });
          }

          // 5. 美食手账
          if (meals && meals.length > 0) {
            allFacts.push({
              sourceAppId: 'profile',
              sourceAppName: '我的·美食手账',
              category: '美食手账',
              title: `寻味记录 (${meals.length} 道珍味)`,
              detail: `最近记录美食包含：${meals.slice(0, 3).map((m) => `${m.dishName}（${'⭐'.repeat(m.rating || 1)}）`).join('、')}。`,
            });
            for (const m of meals.slice(0, 4)) {
              const typeLabel = m.mealType === 'breakfast' ? '早餐' : m.mealType === 'lunch' ? '午餐' : m.mealType === 'dinner' ? '晚餐' : '茶点小食';
              allFacts.push({
                sourceAppId: 'profile',
                sourceAppName: '我的·美食手账',
                category: '赏味日志',
                title: `${m.dishName} [${typeLabel}]`,
                detail: `记录日期：${m.date}，美味星级：${'⭐'.repeat(m.rating || 1)}，品评体会：“${m.review}”`,
                timestamp: m.updatedAt,
              });
            }
          }

          // 6. 半生手账状态
          if (lifeStories && lifeStories.length > 0) {
            allFacts.push({
              sourceAppId: 'profile',
              sourceAppName: '我的·半生手账',
              category: '半生手账状态',
              title: `人生轨迹记忆簿 (${lifeStories.length} 篇岁月篇章)`,
              detail: `涵盖从童年到当下的关键转折与回忆，包括：${lifeStories.map((s) => `${s.age}岁【${s.tag}】`).join('、')}。`,
            });
            for (const s of lifeStories.slice(0, 4)) {
              allFacts.push({
                sourceAppId: 'profile',
                sourceAppName: '我的·半生手账',
                category: '人生足迹',
                title: s.title,
                detail: `年份地点：${s.year} ${s.location}，生活阶段：${s.stage}，心境标识：【${s.moodTag}】。记忆原貌：“${s.content}”`,
                timestamp: s.createdAt,
              });
            }
          }

          // 7. 背包与装备
          const items = profile.items || [];
          const equippedGears = items.filter((i) => i.equipped);
          const bagItems = items.filter((i) => !i.equipped);
          allFacts.push({
            sourceAppId: 'profile',
            sourceAppName: '我的·背包装备',
            category: '背包',
            title: `行囊与神装 (${equippedGears.length} 件穿戴 / ${bagItems.length} 件藏品)`,
            detail: `已穿戴装备：${equippedGears.map((g) => `${g.name}[${g.slot || '装备'}](${g.effect})`).join('；') || '未佩戴装备'}。背包内物品/愿望单：${bagItems.map((b) => `${b.name}(${b.type === 'wish' ? '心愿单' : '道具'})`).join('、') || '背包空空'}。`,
          });

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
