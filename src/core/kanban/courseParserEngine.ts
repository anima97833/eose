import { Course, CourseChapter, CoursePlatform, CourseAttributeTag } from './courseKanbanTypes';

/**
 * 格式化秒数为直观时间字符串（如 14小时20分 或 45分钟）
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0分钟';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}小时${minutes > 0 ? `${minutes}分` : ''}`;
  }
  return `${minutes}分钟`;
}

/**
 * 心理降维计算：根据剩余未学秒数和每日目标分钟数，估算通关所需天数
 */
export function estimateRemainingDays(remainingSeconds: number, dailyGoalMinutes = 30): number {
  if (remainingSeconds <= 0) return 0;
  const dailySeconds = dailyGoalMinutes * 60;
  return Math.ceil(remainingSeconds / dailySeconds);
}

/**
 * 从文本或链接中提取 Bilibili BV 号或 AV 号
 */
export function extractBvid(input: string): string | null {
  const trimmed = input.trim();
  const bvMatch = trimmed.match(/BV[a-zA-Z0-9]{10}/i);
  if (bvMatch) return bvMatch[0];
  const avMatch = trimmed.match(/av(\d+)/i);
  if (avMatch) return avMatch[0];
  return null;
}

/**
 * 解析 B 站课程（获取真实视频标题、UP主、封面、分P目录与时长）
 */
export async function parseBilibiliCourse(inputUrlOrBvid: string): Promise<Course> {
  let targetId = extractBvid(inputUrlOrBvid);

  // 如果未能直接正则提取，但包含 http 链接（如 b23.tv 分享短链），尝试通过 Jina 追踪重定向
  if (!targetId) {
    const urlMatch = inputUrlOrBvid.match(/https?:\/\/[^\s]+/i);
    if (urlMatch) {
      try {
        const resolveRes = await fetch(`https://r.jina.ai/${urlMatch[0]}`, {
          signal: AbortSignal.timeout(6000),
        });
        const resolveText = await resolveRes.text();
        targetId = extractBvid(resolveText);
      } catch {
        // 继续向下
      }
    }
  }

  if (!targetId) {
    throw new Error('未识别到有效的 B站 BV号或视频链接');
  }

  const isAid = /^av\d+/i.test(targetId);
  const aid = isAid ? targetId.replace(/^av/i, '') : null;
  const bvid = isAid ? '' : targetId;
  const queryParam = bvid ? `bvid=${bvid}` : `aid=${aid}`;

  // 策略 1：通过 Jina 请求 B站官方 JSON 接口（避开浏览器 CORS 与 WAF 阻断）
  try {
    const jsonUrl = `https://r.jina.ai/https://api.bilibili.com/x/web-interface/view?${queryParam}`;
    const res = await fetch(jsonUrl, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const text = await res.text();
      const jsonStart = text.indexOf('{"code":0');
      if (jsonStart !== -1) {
        const rawJson = text.slice(jsonStart).trim();
        const json = JSON.parse(rawJson);
        if (json.code === 0 && json.data) {
          const d = json.data;
          const actualBvid = d.bvid || targetId;
          const chapters: CourseChapter[] = (d.pages || []).map((p: any, idx: number) => ({
            id: `ch_bili_${actualBvid}_${p.page || idx + 1}`,
            index: idx,
            title: p.part ? p.part.trim() : `第 ${p.page || idx + 1} 讲`,
            durationSeconds: p.duration || 600,
            isCompleted: false,
            url: `https://www.bilibili.com/video/${actualBvid}?p=${p.page || idx + 1}`,
          }));

          const totalDuration = chapters.reduce((sum, ch) => sum + ch.durationSeconds, 0);

          return {
            id: `course_bili_${actualBvid}_${Date.now()}`,
            title: d.title ? d.title.trim() : `B站课程 (${actualBvid})`,
            platform: 'bilibili',
            status: 'backlog',
            author: d.owner?.name ? d.owner.name.trim() : 'B站UP主',
            coverUrl: d.pic ? d.pic.replace('http:', 'https:') : undefined,
            sourceUrl: `https://www.bilibili.com/video/${actualBvid}`,
            intro: d.desc ? d.desc.slice(0, 150).trim() : '源自 Bilibili 优质课程合集',
            totalChapters: chapters.length || 1,
            completedChapters: 0,
            totalDurationSeconds: totalDuration || (d.duration || 1800),
            chapters: chapters.length > 0 ? chapters : [{
              id: `ch_bili_${actualBvid}_1`,
              index: 0,
              title: d.title || '完整视频',
              durationSeconds: d.duration || 1800,
              isCompleted: false,
              url: `https://www.bilibili.com/video/${actualBvid}`,
            }],
            dailyGoalMinutes: 30,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
        }
      }
    }
  } catch (e) {
    console.warn('Bilibili JSON 解析策略失败，尝试页面正文解析:', e);
  }

  // 策略 2：通过 Jina 抓取 B站网页 Markdown 正文（备用回退机制）
  try {
    const pageUrl = `https://r.jina.ai/https://www.bilibili.com/video/${bvid || targetId}`;
    const pageRes = await fetch(pageUrl, { signal: AbortSignal.timeout(8000) });
    if (pageRes.ok) {
      const text = await pageRes.text();

      // 提取真实标题
      const titleMatch = text.match(/Title:\s*(.+)/i);
      let title = titleMatch ? titleMatch[1] : `B站课程 (${targetId})`;
      title = title
        .replace(/_哔哩哔哩_bilibili/gi, '')
        .replace(/ - 哔哩哔哩/gi, '')
        .replace(/_bilibili/gi, '')
        .replace(/- bilibili/gi, '')
        .trim();

      // 提取真实 UP 主
      const authorMatch = text.match(/\[([^\]]+)\]\(https:\/\/space\.bilibili\.com\/\d+\/?\)/i);
      const author = authorMatch ? authorMatch[1].trim() : 'B站UP主';

      // 提取章节与时长
      const lines = text.split(/\r?\n/).map(l => l.trim());
      const timeRegex = /^(\d{1,2}:)?\d{1,2}:\d{2}$/;
      const parsedChapters: CourseChapter[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (timeRegex.test(line)) {
          let chTitle = '';
          for (let j = i - 1; j >= 0 && j >= i - 4; j--) {
            if (lines[j] && !timeRegex.test(lines[j]) && !lines[j].startsWith('http') && !lines[j].startsWith('Title:')) {
              chTitle = lines[j];
              break;
            }
          }
          if (chTitle) {
            const parts = line.split(':').map(Number);
            let sec = 0;
            if (parts.length === 3) sec = parts[0] * 3600 + parts[1] * 60 + parts[2];
            else if (parts.length === 2) sec = parts[0] * 60 + parts[1];
            parsedChapters.push({
              id: `ch_bili_${targetId}_${parsedChapters.length + 1}`,
              index: parsedChapters.length,
              title: chTitle,
              durationSeconds: sec || 600,
              isCompleted: false,
              url: `https://www.bilibili.com/video/${targetId}?p=${parsedChapters.length + 1}`,
            });
          }
        }
      }

      const finalChapters = parsedChapters.length > 0 ? parsedChapters : [{
        id: `ch_bili_${targetId}_1`,
        index: 0,
        title: title,
        durationSeconds: 1800,
        isCompleted: false,
        url: `https://www.bilibili.com/video/${targetId}`,
      }];

      const totalDuration = finalChapters.reduce((sum, ch) => sum + ch.durationSeconds, 0);

      return {
        id: `course_bili_${targetId}_${Date.now()}`,
        title,
        platform: 'bilibili',
        status: 'backlog',
        author,
        sourceUrl: `https://www.bilibili.com/video/${targetId}`,
        intro: `来自 Bilibili · 共 ${finalChapters.length} 讲`,
        totalChapters: finalChapters.length,
        completedChapters: 0,
        totalDurationSeconds: totalDuration,
        chapters: finalChapters,
        dailyGoalMinutes: 30,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }
  } catch (e) {
    console.warn('Bilibili 网页抓取解析策略失败:', e);
  }

  throw new Error('未获取到有效视频，请确认链接或BV号正确且视频公开');
}

/**
 * 智能解析网盘目录文本（从用户复制的一大段文件列表中提取章节结构）
 */
export function parsePanDirectoryText(
  courseTitle: string,
  rawText: string,
  author = '网盘讲师'
): Course {
  const lines = rawText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const cleanLines: string[] = [];

  for (const line of lines) {
    // 过滤无意义的干扰行（例如网盘自带的“全部文件”、“大小”、“修改日期”等）
    if (/^(文件名|大小|修改日期|创建时间|全选|下载|分享|重命名)/i.test(line)) continue;
    if (/^(http|www\.)/i.test(line) && !line.includes('.mp4')) continue;

    // 清洗文件扩展名
    const cleaned = line.replace(/\.(mp4|flv|mkv|avi|mov|wmv|ts|mp3|m4a|pdf|doc|zip|rar)$/i, '').trim();
    if (cleaned.length > 1) {
      cleanLines.push(cleaned);
    }
  }

  // 如果未能提取出有效行，默认给出标准导学结构
  const finalTitles = cleanLines.length > 0 ? cleanLines : ['01 课程导学与核心基础', '02 架构实战与核心要点', '03 终极总结与实操'];

  const chapters: CourseChapter[] = finalTitles.map((title, idx) => ({
    id: `ch_pan_${Date.now()}_${idx}`,
    index: idx,
    title,
    durationSeconds: 1500, // 网盘课程默认预估单节25分钟
    isCompleted: false,
  }));

  return {
    id: `course_pan_${Date.now()}`,
    title: courseTitle.trim() || '网盘精选系统课',
    platform: 'pan',
    status: 'backlog',
    author: author.trim() || '网盘讲师',
    intro: `包含 ${chapters.length} 讲核心内容，已从网盘目录结构化解析导入。`,
    totalChapters: chapters.length,
    completedChapters: 0,
    totalDurationSeconds: chapters.length * 1500,
    chapters,
    dailyGoalMinutes: 30,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * 手动创建自定义课程
 */
export function createCustomCourse(
  title: string,
  author: string,
  chapterCount = 10,
  dailyGoalMinutes = 30
): Course {
  const count = Math.max(1, Math.min(100, chapterCount));
  const chapters: CourseChapter[] = Array.from({ length: count }, (_, i) => ({
    id: `ch_custom_${Date.now()}_${i}`,
    index: i,
    title: `第 ${i + 1} 讲：阶段重点学习目标`,
    durationSeconds: 1800, // 30分钟
    isCompleted: false,
  }));

  return {
    id: `course_custom_${Date.now()}`,
    title: title.trim() || '自定义攻克计划',
    platform: 'custom',
    status: 'backlog',
    author: author.trim() || '自学计划',
    intro: `自主规划课程，共 ${count} 个关键攻克节点。`,
    totalChapters: count,
    completedChapters: 0,
    totalDurationSeconds: count * 1800,
    chapters,
    dailyGoalMinutes,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * 根据标题与正文关键词推断最匹配的六维 RPG 属性
 */
export function inferAttributeTagFromText(text: string): CourseAttributeTag {
  const t = text.toLowerCase();
  if (/(减脂|体态|拉伸|普拉提|腹肌|马甲线|慢跑|早睡|养生|饮食|控糖|健康|护肤|睡眠|作息|瑜伽)/i.test(t)) {
    return 'CON';
  }
  if (/(深蹲|力量|举重|硬拉|爆发力|增肌|哑铃|卧推|拳击|体能)/i.test(t)) {
    return 'STR';
  }
  if (/(穿搭|变美|化妆|发型|情商|社交|演讲|表达|说话|拍照|上镜|魅力|职场人际|沟通|气质)/i.test(t)) {
    return 'CHA';
  }
  if (/(画画|插画|排版|手作|手工|折纸|修图|摄影|剪辑|烘焙|调酒|乐器|吉他|钢琴|手绘)/i.test(t)) {
    return 'DEX';
  }
  if (/(冥想|正念|心理|治愈|玄学|八字|灵性|断舍离|极简|焦虑|内耗|心流|静心|释怀)/i.test(t)) {
    return 'SPI';
  }
  return 'INT'; // 默认：智力/学习/思维/认知
}

/**
 * 从小红书输入文本中提取有效链接与预估标题
 */
export function extractXiaohongshuInfo(input: string): { url: string | null; cleanTitle: string | null } {
  const trimmed = input.trim();

  // 1. 提取链接 (xhslink.com 或 xiaohongshu.com)
  const urlMatch = trimmed.match(/https?:\/\/(?:[a-zA-Z0-9_-]+\.)*(?:xhslink\.com|xiaohongshu\.com)\/[^\s]+/i);
  const url = urlMatch ? urlMatch[0] : null;

  // 2. 清洗提取分享文本自带的标题
  // 小红书常见格式形如: "89 每天10分钟，普拉提改善圆肩驼背 http://xhslink.com/a/xxxx 复制本条信息打开【小红书】App查看精彩内容！"
  let cleanTitle = trimmed;
  if (url) {
    cleanTitle = cleanTitle.replace(url, '');
  }
  // 去除口令前后缀
  cleanTitle = cleanTitle
    .replace(/^[\d\s]+/, '') // 去除开头的分享数字编码 (如 "89 ")
    .replace(/复制(?:本条)?信息打开[【\[]小红书[】\]]App[^\n]*/gi, '')
    .replace(/[【\[]小红书[】\]][^\n]*/gi, '')
    .replace(/#[\w\u4e00-\u9fa5]+/g, '') // 去除 #话题
    .trim();

  // 过滤多行只取第一行作为候选标题
  const firstLine = cleanTitle.split(/\r?\n/).map(l => l.trim()).find(l => l.length > 0);

  return {
    url,
    cleanTitle: firstLine && firstLine.length > 2 ? firstLine.slice(0, 60) : null,
  };
}

/**
 * 将小红书图文内容/笔记按分步标记或核心要点拆解为章节打卡清单
 */
export function splitXiaohongshuChapters(
  title: string,
  content: string,
  sourceUrl?: string
): CourseChapter[] {
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const stepPattern = /^(?:第?[0-9一二三四五六七八九十]+[讲天步期点章节篇]|步骤[0-9一二三四五六七八九十]|Day\s*\d+|Step\s*\d+|[0-9]{1,2}[.、\s]+|【[^】]+】|·\s*)(.+)/i;

  const extractedTitles: string[] = [];

  for (const line of lines) {
    // 忽略过长段落（可能不是标题，而是详细说明）
    if (line.length > 45) continue;
    // 忽略标签和链接
    if (line.startsWith('#') || line.startsWith('http') || line.startsWith('![') || line.startsWith('[')) continue;

    const match = line.match(stepPattern);
    if (match) {
      extractedTitles.push(line);
    }
  }

  // 如果成功提取到 2 个以上清晰步骤/要点
  if (extractedTitles.length >= 2) {
    return extractedTitles.slice(0, 30).map((chTitle, idx) => ({
      id: `ch_xhs_${Date.now()}_${idx}`,
      index: idx,
      title: chTitle,
      durationSeconds: 900, // 小红书图文单点打卡默认预估15分钟
      isCompleted: false,
      url: sourceUrl,
    }));
  }

  // 兜底拆解：如果正文没有显式编号，按典型自学三阶段或5步拆解
  const defaultSteps = [
    `01 核心认知：梳理笔记关键要点与概念`,
    `02 实操落地：对照图文步骤初次演练`,
    `03 举一反三：形成个人方法并打卡复盘`,
  ];

  return defaultSteps.map((chTitle, idx) => ({
    id: `ch_xhs_${Date.now()}_${idx}`,
    index: idx,
    title: chTitle,
    durationSeconds: 900,
    isCompleted: false,
    url: sourceUrl,
  }));
}

/**
 * 解析小红书笔记 / 分享链接
 */
export async function parseXiaohongshuCourse(input: string): Promise<Course> {
  const { url, cleanTitle } = extractXiaohongshuInfo(input);

  let title = cleanTitle || '小红书精选笔记指南';
  let author = '小红书博主';
  let coverUrl: string | undefined = undefined;
  let intro = '来自小红书收藏的干货教程与打卡心得。';
  let rawContent = input;

  // 1. 如果存在链接，尝试借助 Jina Reader 抓取页面
  if (url) {
    try {
      const res = await fetch(`https://r.jina.ai/${url}`, {
        signal: AbortSignal.timeout(7000),
      });
      if (res.ok) {
        const text = await res.text();
        rawContent = text;

        // 提取标题
        const titleMatch = text.match(/Title:\s*(.+)/i);
        if (titleMatch) {
          const parsed = titleMatch[1]
            .replace(/_小红书/gi, '')
            .replace(/ - 小红书/gi, '')
            .replace(/\| 小红书/gi, '')
            .trim();
          if (parsed && parsed !== '小红书') {
            title = parsed;
          }
        }

        // 提取博主名
        const authorMatch = text.match(/\[([^\]]+)\]\(https:\/\/www\.xiaohongshu\.com\/user\/profile\/[^\)]+\)/i);
        if (authorMatch) {
          author = authorMatch[1].trim();
        } else {
          const authorLineMatch = text.match(/(?:作者|博主|发布者)[:：]\s*([^\n\r]+)/i);
          if (authorLineMatch) {
            author = authorLineMatch[1].trim();
          }
        }

        // 提取封面首图
        const imageMatch = text.match(/!\[[^\]]*\]\((https:\/\/[^\)]+)\)/i);
        if (imageMatch) {
          coverUrl = imageMatch[1];
        }

        // 提取正文摘要
        const descMatch = text.match(/Markdown Content:([\s\S]*)/i);
        if (descMatch && descMatch[1]) {
          const cleanDesc = descMatch[1]
            .replace(/!\[.*?\]\(.*?\)/g, '')
            .replace(/\[.*?\]\(.*?\)/g, '')
            .replace(/#+/g, '')
            .trim();
          if (cleanDesc.length > 0) {
            intro = cleanDesc.slice(0, 120).trim() + (cleanDesc.length > 120 ? '...' : '');
          }
        }
      }
    } catch (e) {
      console.warn('Jina 小红书链接抓取超时或拦截，采用本地智能提取兜底:', e);
    }
  }

  // 2. 章节切分
  const chapters = splitXiaohongshuChapters(title, rawContent, url || undefined);
  const totalDurationSeconds = chapters.reduce((sum, c) => sum + c.durationSeconds, 0);

  // 3. 推断六维属性
  const attributeTag = inferAttributeTagFromText(`${title} ${intro} ${rawContent}`);

  return {
    id: `course_xhs_${Date.now()}`,
    title: title.slice(0, 60),
    platform: 'xiaohongshu',
    status: 'backlog',
    author,
    coverUrl,
    sourceUrl: url || undefined,
    intro,
    totalChapters: chapters.length,
    completedChapters: 0,
    totalDurationSeconds,
    chapters,
    dailyGoalMinutes: 20, // 小红书碎片化学习，默认每日20分钟
    attributeTag,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

