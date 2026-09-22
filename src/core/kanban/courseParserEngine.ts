import { Course, CourseChapter, CoursePlatform } from './courseKanbanTypes';

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
