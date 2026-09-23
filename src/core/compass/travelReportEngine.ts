import { CheckInSpot } from './types';

export type ReportPeriod = '7d' | '30d' | 'all';

export interface DailyActivityBar {
  dateStr: string; // MM-DD
  dayOfWeek: string; // 周一, 周二...
  count: number;
  heightPercent: number; // 0 - 100
  isMax: boolean;
}

export interface TravelReportData {
  period: ReportPeriod;
  periodLabel: string;
  totalCheckIns: number;
  uniqueSpotsCount: number;
  
  // 核心人文叙事排版数据 (对应截图)
  heroTitle: string;        // 如: "临行的等待"
  subtitle: string;         // 如: "你就是说走就走本尊，在过去7天"
  mainPercent: string;      // 如: "62.96"
  mainPercentLabel: string; // 如: "%的旅程"
  subHighlight: string;     // 如: "在黄昏与夜色 19:00~22:00 出发"
  poeticLines: string[];    // 诗意小作文短句
  
  // 最常到访与时间画像
  topSpotName: string;
  topSpotCategory: string;
  topSpotCount: number;
  busiestDayOfWeek: string; // 周六
  busiestTimeRange: string; // 19:00 - 22:00
  topCompanion: string;     // 和伴侣 / 独自一人
  topCompanionPercent: number;
  
  // 过去7天/阶段的分布柱形数据
  dailyBars: DailyActivityBar[];
  
  // 票据信息 (还原截图底部小票)
  ticket: {
    from: string;
    to: string;
    ticketNo: string;
    date: string;
  };
}

const WEEKDAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

const TIME_SLOTS = [
  { label: '清晨破晓 (05:00 - 08:59)', range: '05:00 - 09:00', start: 5, end: 9 },
  { label: '上午漫步 (09:00 - 11:59)', range: '09:00 - 12:00', start: 9, end: 12 },
  { label: '午后暖阳 (12:00 - 16:59)', range: '12:00 - 17:00', start: 12, end: 17 },
  { label: '黄昏日落 (17:00 - 18:59)', range: '17:00 - 19:00', start: 17, end: 19 },
  { label: '夜色弥漫 (19:00 - 21:59)', range: '19:00 - 22:00', start: 19, end: 22 },
  { label: '星夜独行 (22:00 - 04:59)', range: '22:00 - 05:00', start: 22, end: 29 }, // 跨夜
];

/**
 * 获取打卡点的真实时刻
 */
function getSpotTimestamp(spot: CheckInSpot): { date: Date; hour: number } {
  if (spot.customDate) {
    const timeStr = spot.customTime || '12:00';
    const d = new Date(`${spot.customDate}T${timeStr}:00`);
    if (!isNaN(d.getTime())) {
      return { date: d, hour: d.getHours() };
    }
  }
  const d = new Date(spot.lastCheckInAt);
  return { date: d, hour: d.getHours() };
}

/**
 * 挖掘出行报告统计数据
 */
export function generateTravelReport(
  allSpots: CheckInSpot[],
  period: ReportPeriod = '7d'
): TravelReportData {
  const now = new Date();
  let startTime = 0;

  if (period === '7d') {
    startTime = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  } else if (period === '30d') {
    startTime = now.getTime() - 30 * 24 * 60 * 60 * 1000;
  } else {
    startTime = 0; // 全部
  }

  // 过滤当前周期的打卡
  const filteredSpots = allSpots.filter((s) => {
    const { date } = getSpotTimestamp(s);
    return date.getTime() >= startTime;
  });

  const periodLabels: Record<ReportPeriod, string> = {
    '7d': '过去七天',
    '30d': '过去一月',
    all: '全部足迹',
  };
  const periodLabel = periodLabels[period];

  // 如果打卡为空，生成温暖的初行指引数据
  if (filteredSpots.length === 0) {
    const defaultBars: DailyActivityBar[] = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(now.getTime() - (6 - i) * 24 * 3600 * 1000);
      return {
        dateStr: `${d.getMonth() + 1}.${d.getDate()}`,
        dayOfWeek: WEEKDAY_NAMES[d.getDay()],
        count: 0,
        heightPercent: 12,
        isMax: i === 6,
      };
    });

    return {
      period,
      periodLabel,
      totalCheckIns: 0,
      uniqueSpotsCount: 0,
      heroTitle: '临行的等待',
      subtitle: `城市在沉睡，而你在准备出发 · ${periodLabel}`,
      mainPercent: '100.0',
      mainPercentLabel: '%的期待',
      subHighlight: '随时迈出通往世界的下一瞬',
      poeticLines: [
        '收拾行囊，系紧鞋带，一气呵成',
        '即兴出发的快乐，只要踏出第一步就懂',
      ],
      topSpotName: '城市原点',
      topSpotCategory: '探索起点',
      topSpotCount: 0,
      busiestDayOfWeek: '随时',
      busiestTimeRange: '任何心动时刻',
      topCompanion: '独自漫步',
      topCompanionPercent: 100,
      dailyBars: defaultBars,
      ticket: {
        from: '日常原地',
        to: '远方心境',
        ticketNo: 'CF-' + (now.getFullYear() % 100) + '001',
        date: `${now.getMonth() + 1}月${now.getDate()}日`,
      },
    };
  }

  // 1. 统计频次最高地点
  const spotFreqMap = new Map<string, { spot: CheckInSpot; count: number }>();
  filteredSpots.forEach((s) => {
    const existing = spotFreqMap.get(s.id);
    const count = (existing ? existing.count : 0) + (s.checkInCount || 1);
    spotFreqMap.set(s.id, { spot: s, count });
  });

  let topSpot = filteredSpots[0];
  let topCount = 1;
  spotFreqMap.forEach((val) => {
    if (val.count > topCount) {
      topCount = val.count;
      topSpot = val.spot;
    }
  });

  // 2. 统计星期几最集中
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  filteredSpots.forEach((s) => {
    const { date } = getSpotTimestamp(s);
    dayCounts[date.getDay()] += s.checkInCount || 1;
  });
  let maxDayIdx = 0;
  let maxDayCount = 0;
  dayCounts.forEach((c, idx) => {
    if (c > maxDayCount) {
      maxDayCount = c;
      maxDayIdx = idx;
    }
  });
  const busiestDayOfWeek = WEEKDAY_NAMES[maxDayIdx];

  // 3. 统计时间段最集中 (精准算出百分比，如 62.96%)
  const slotCounts = [0, 0, 0, 0, 0, 0];
  let totalCalculatedCheckIns = 0;

  filteredSpots.forEach((s) => {
    const { hour } = getSpotTimestamp(s);
    const times = s.checkInCount || 1;
    totalCalculatedCheckIns += times;

    if (hour >= 5 && hour < 9) slotCounts[0] += times;
    else if (hour >= 9 && hour < 12) slotCounts[1] += times;
    else if (hour >= 12 && hour < 17) slotCounts[2] += times;
    else if (hour >= 17 && hour < 19) slotCounts[3] += times;
    else if (hour >= 19 && hour < 22) slotCounts[4] += times;
    else slotCounts[5] += times; // 22:00 - 05:00
  });

  let maxSlotIdx = 4; // 默认为夜色
  let maxSlotCount = 0;
  slotCounts.forEach((c, idx) => {
    if (c > maxSlotCount) {
      maxSlotCount = c;
      maxSlotIdx = idx;
    }
  });

  const busiestTimeRange = TIME_SLOTS[maxSlotIdx].range;
  const rawRatio = totalCalculatedCheckIns > 0 ? (maxSlotCount / totalCalculatedCheckIns) * 100 : 62.96;
  // 保持一位或两位小数，如 "62.96" 或 "75.00"
  const mainPercent = rawRatio >= 99.9 ? '100' : rawRatio.toFixed(2);

  // 4. 随行人员画像
  const compMap = new Map<string, number>();
  filteredSpots.forEach((s) => {
    const comp = (s.companions || '独自一人').trim();
    compMap.set(comp, (compMap.get(comp) || 0) + (s.checkInCount || 1));
  });
  let topCompanion = '独自漫步';
  let topCompCount = 0;
  compMap.forEach((cnt, comp) => {
    if (cnt > topCompCount) {
      topCompCount = cnt;
      topCompanion = comp;
    }
  });
  const topCompanionPercent = Math.round((topCompCount / (totalCalculatedCheckIns || 1)) * 100);

  // 5. 每日柱状图数据 (过去 7 个采样区间)
  const barCount = 7;
  const dailyBars: DailyActivityBar[] = [];
  let maxBarValue = 1;

  for (let i = 0; i < barCount; i++) {
    const targetDate = new Date(now.getTime() - (barCount - 1 - i) * 24 * 3600 * 1000);
    const y = targetDate.getFullYear();
    const m = targetDate.getMonth();
    const d = targetDate.getDate();

    let countInDay = 0;
    filteredSpots.forEach((s) => {
      const { date } = getSpotTimestamp(s);
      if (date.getFullYear() === y && date.getMonth() === m && date.getDate() === d) {
        countInDay += s.checkInCount || 1;
      }
    });

    if (countInDay > maxBarValue) maxBarValue = countInDay;

    dailyBars.push({
      dateStr: `${m + 1}.${d}`,
      dayOfWeek: WEEKDAY_NAMES[targetDate.getDay()],
      count: countInDay,
      heightPercent: 0,
      isMax: false,
    });
  }

  dailyBars.forEach((bar) => {
    bar.heightPercent = Math.max(16, Math.round((bar.count / maxBarValue) * 100));
    bar.isMax = bar.count === maxBarValue && maxBarValue > 0;
  });

  // 6. 拟新人文叙事与标题生成 (高度还原截图氛围)
  let heroTitle = '临行的等待';
  let subtitle = `你就是说走就走本尊，在${periodLabel}`;
  let subHighlight = `最常在 ${busiestTimeRange} 出发`;
  const poeticLines = [
    '订票定行程收拾行李，一气呵成',
    '即兴出发的快乐，你一定很懂',
  ];

  if (maxSlotIdx === 0) {
    heroTitle = '晨光与朝露';
    subtitle = `沐浴第一缕阳光的行者，在${periodLabel}`;
    subHighlight = `晨曦初现的 ${busiestTimeRange} 最具动力`;
    poeticLines[0] = '整座城市尚未苏醒，街道属于你的步履';
    poeticLines[1] = '每一缕新鲜空气，都是清晨给探寻者的奖赏';
  } else if (maxSlotIdx === 4 || maxSlotIdx === 5) {
    heroTitle = '临行的等待';
    subtitle = `你就是说走就走本尊，在${periodLabel}`;
    subHighlight = `夜幕降临的 ${busiestTimeRange} 启程`;
    poeticLines[0] = '订票定行程收拾行李，一气呵成';
    poeticLines[1] = '晚风微凉的夜色里，即兴出发的浪漫最动人';
  } else {
    heroTitle = '漫步的序章';
    subtitle = `把日子过成流动的诗，在${periodLabel}`;
    subHighlight = `最钟爱在 ${busiestDayOfWeek} 的午后穿行`;
    poeticLines[0] = '随心拐进未知的巷弄，与惊喜不期而遇';
    poeticLines[1] = '每一步真实的踩踏，都在重塑自己的生活半径';
  }

  // 7. 车票票据数据
  const ticketFrom = filteredSpots.length > 1 ? filteredSpots[filteredSpots.length - 1].name : '城市原点';
  const ticketTo = topSpot ? topSpot.name : '未知秘境';
  const ticketNo = 'CF-' + (now.getFullYear() % 100) + String(filteredSpots.length).padStart(3, '0');

  return {
    period,
    periodLabel,
    totalCheckIns: totalCalculatedCheckIns,
    uniqueSpotsCount: spotFreqMap.size,
    heroTitle,
    subtitle,
    mainPercent,
    mainPercentLabel: '%的旅程',
    subHighlight,
    poeticLines,
    topSpotName: topSpot ? topSpot.name : '漫步街区',
    topSpotCategory: topSpot ? topSpot.category : 'spot',
    topSpotCount: topCount,
    busiestDayOfWeek,
    busiestTimeRange,
    topCompanion,
    topCompanionPercent,
    dailyBars,
    ticket: {
      from: ticketFrom.length > 8 ? ticketFrom.slice(0, 8) + '...' : ticketFrom,
      to: ticketTo.length > 8 ? ticketTo.slice(0, 8) + '...' : ticketTo,
      ticketNo,
      date: `${now.getMonth() + 1}月${now.getDate()}日`,
    },
  };
}
