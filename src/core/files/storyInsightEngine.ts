import { loadStoredSettings } from '../../types/settings';
import { DirectBrowserAdapter } from '../llm/DirectBrowserAdapter';
import {
  InsightCorpus,
  InsightCorpusItem,
  StoryInsightData,
  VirtualFileRecord,
  MindMapNode,
} from './fileTypes';
import { getFilesByParent, createFile } from './fileStorage';
import { db } from '../storage/db';

/**
 * 递归收集指定目录或选定条目下的所有 Markdown / 文本文件
 */
export async function prepareInsightCorpus(
  currentFolderId: string | null,
  selectedItemIds?: string[]
): Promise<InsightCorpus> {
  const allFiles: VirtualFileRecord[] = await db.virtual_files.toArray();
  const fileMap = new Map<string, VirtualFileRecord>();
  allFiles.forEach((f) => fileMap.set(f.id, f));

  // 获取当前目录名称
  let scopeName = '全部文件与笔记';
  if (currentFolderId && fileMap.has(currentFolderId)) {
    scopeName = fileMap.get(currentFolderId)!.name;
  }

  // 递归寻找所有子文件
  const collectedFiles: VirtualFileRecord[] = [];

  const traverse = (parentId: string | null, pathPrefix: string) => {
    const children = allFiles.filter((f) => f.parentId === parentId);
    for (const child of children) {
      if (child.type === 'folder') {
        traverse(child.id, `${pathPrefix}${child.name}/`);
      } else if (child.type === 'file' && child.content) {
        // 排除导图文件本身，避免自循环
        if (child.ext !== 'mindmap') {
          collectedFiles.push({
            ...child,
            name: `${pathPrefix}${child.name}`,
          });
        }
      }
    }
  };

  if (selectedItemIds && selectedItemIds.length > 0) {
    // 用户指定了勾选的项（可以是文件夹或文件）
    for (const id of selectedItemIds) {
      const item = fileMap.get(id);
      if (!item) continue;
      if (item.type === 'file' && item.content && item.ext !== 'mindmap') {
        collectedFiles.push(item);
      } else if (item.type === 'folder') {
        traverse(item.id, `${item.name}/`);
      }
    }
  } else {
    // 默认遍历当前文件夹下的所有文件
    traverse(currentFolderId, '');
  }

  // 构建语料条目
  let totalWords = 0;
  const items: InsightCorpusItem[] = [];

  for (const f of collectedFiles) {
    const text = f.content || '';
    const wordCount = f.wordCount || text.length;
    totalWords += wordCount;

    items.push({
      id: f.id,
      name: f.name,
      pathName: f.name,
      content: text,
      wordCount,
    });
  }

  return {
    scopeName,
    items,
    totalWords,
  };
}

/**
 * 针对可能过长的长篇小说进行智能浓缩打包，避免 Token 爆仓
 */
function packCorpusForLLM(corpus: InsightCorpus): string {
  const MAX_TOTAL_CHARS = 45000; // 安全字符上限，适配绝大多数 32k/64k/128k 上下文
  const itemsCount = corpus.items.length;

  if (itemsCount === 0) return '（没有发现任何可分析的文本章节）';

  // 计算每篇平均可用字符
  const charLimitPerItem = Math.max(800, Math.floor(MAX_TOTAL_CHARS / itemsCount));

  let packedText = `【作品范围】: ${corpus.scopeName} (共 ${itemsCount} 篇章节，总计约 ${corpus.totalWords} 字)\n\n`;

  corpus.items.forEach((item, index) => {
    let sample = item.content.trim();
    if (sample.length > charLimitPerItem) {
      // 截取开头 70% 与结尾 30%，保留伏笔与转折
      const headLen = Math.floor(charLimitPerItem * 0.7);
      const tailLen = charLimitPerItem - headLen;
      sample = `${sample.slice(0, headLen)}\n\n[...中间章节内容省略...]\n\n${sample.slice(-tailLen)}`;
    }

    packedText += `=== 第 ${index + 1} 篇: 《${item.name}》 ===\n${sample}\n\n`;
  });

  return packedText;
}

/**
 * 调用 LLM 进行深度叙事思考与双模思维导图生成
 */
export async function generateStoryInsight(
  corpus: InsightCorpus,
  onProgress?: (message: string) => void
): Promise<StoryInsightData> {
  if (corpus.items.length === 0) {
    throw new Error('当前选中的范围内没有包含正文的笔记或小说章节，无法进行洞察分析。');
  }

  onProgress?.('正在检查 AI 接口配置与模型...');
  const settings = loadStoredSettings();
  const preferred = settings.activeTab === 'branch' ? settings.branch : settings.primary;
  const route = preferred.apiKey?.trim() ? preferred : settings.primary.apiKey?.trim() ? settings.primary : preferred;

  if (!route.baseUrl?.trim() || !route.apiKey?.trim() || !route.model?.trim()) {
    throw new Error(
      '尚未配置 AI 接口！请先在桌面的「系统设置」应用中填入有效的 Base URL、API Key 与 Model 名称。'
    );
  }

  const adapter = new DirectBrowserAdapter({
    baseUrl: route.baseUrl.trim(),
    apiKey: route.apiKey.trim(),
    model: route.model.trim(),
    temperature: 0.5,
    maxTokens: 4096,
  });

  onProgress?.(`正在压缩聚合 ${corpus.items.length} 篇章节正文内容...`);
  const packedCorpusText = packCorpusForLLM(corpus);

  onProgress?.('AI 正在深度思考人物命运、情节脉络、世界观与暗线伏笔 (可能需要 10~30 秒)...');

  const systemPrompt = `你是一位享誉国际的文学理论家、资深小说架构师兼叙事脉络分析专家。
你的任务是：深度阅读创作者提交的作品章节，穿透数万字文本，抽丝剥茧，为作者构建一份极具洞察力的【双模故事思维导图】。

必须提炼以下核心要素：
1. 【核心主题与高维洞察 (executiveSummary)】：提炼故事核心精神、情感底色与时代/意境风貌（120字以内，文笔雅致凝练）。
2. 【星空关系网络图谱 (graph)】：
   - 提取 8~16 个核心实体作为节点（nodes）：包括主要人物、核心事件、关键势力或地点。desc 需在 25 字以内。
   - 提取实体间的相互连线（links）：source, target, relation（如："宿命对决"、"暗生情愫"、"暗中结盟"、"伏笔隐患"）, sentiment ("positive"|"negative"|"neutral"|"mystery")。
3. 【树状大纲导图 (tree)】：
   - 根节点为书名或卷名
   - 下级主干包括：
     * 👥 人物群像与阵营（主角、关键配角、性格与动机）
     * 📜 核心主线情节（开端、发展、高潮、转折）
     * 🗺️ 关键地点与世界观（地理、势力、氛围）
     * ⚡ 重大转折事件（触发命运巨变的节点）
     * 🧶 伏笔与隐秘暗线（前文铺垫、尚未解开的悬念）
   - 每个子节点包含：id, label, category, desc（25字以内简述）, chapterRef（出处章节）。

【严格格式与输出规范 - 违反将导致程序解析崩溃】：
1. 必须直接输出纯合法 JSON 格式数据，绝对不要包含任何 markdown 提示语或额外说明！
2. 严禁在 JSON 属性值内部使用半角英文双引号 "！书名、引用一律使用中文双引号“ ”或单引号 '！
3. 每条 desc 严格限制在 25 字以内，确保 JSON 在 2000 tokens 内完整结束，严防截断！
4. 必须优先生成 graph，再生成 tree。

JSON 数据结构示例：
{
  "title": "作品/卷名",
  "executiveSummary": "深入简出的全局洞察概要...",
  "graph": {
    "nodes": [
      { "id": "n1", "label": "角色A", "category": "character", "desc": "绣衣楼楼主，暗藏天道之力" },
      { "id": "n2", "label": "角色B", "category": "character", "desc": "五斗米教少主，通幽冥" },
      { "id": "n3", "label": "鬼城之变", "category": "event", "desc": "刘璋失踪，三眼之秘浮出" }
    ],
    "links": [
      { "source": "n1", "target": "n2", "relation": "同行羁绊", "sentiment": "positive" },
      { "source": "n1", "target": "n3", "relation": "亲身涉险", "sentiment": "neutral" }
    ]
  },
  "tree": {
    "id": "root",
    "label": "作品总揽",
    "category": "root",
    "desc": "故事宇宙核心",
    "children": [
      {
        "id": "char_group",
        "label": "人物群像与宿命",
        "category": "character",
        "children": [
          { "id": "c1", "label": "主角名", "category": "character", "desc": "身份与执念", "chapterRef": "第1章" }
        ]
      },
      {
        "id": "plot_group",
        "label": "主线波澜与转折",
        "category": "plot",
        "children": [
          { "id": "p1", "label": "起承转合", "category": "plot", "desc": "情节推动", "chapterRef": "第2章" }
        ]
      },
      {
        "id": "loc_group",
        "label": "世界观与风土",
        "category": "location",
        "children": []
      },
      {
        "id": "event_group",
        "label": "重要转折事件",
        "category": "event",
        "children": []
      },
      {
        "id": "hook_group",
        "label": "伏笔暗线与悬念",
        "category": "foreshadowing",
        "children": []
      }
    ]
  }
}`;

  const responseText = await adapter.sendMessage([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: packedCorpusText },
  ]);

  onProgress?.('正在校准并自愈解析思维导图数据结构...');

  // 使用强大自愈式容错解析器
  const result = robustParseStoryInsightJSON(responseText, corpus.scopeName, corpus);
  return result;
}

/**
 * 标准化补全 StoryInsightData
 */
function normalizeStoryInsight(
  parsed: any,
  defaultTitle: string,
  corpus: InsightCorpus
): StoryInsightData {
  const tree = parsed.tree || {
    id: 'root',
    label: defaultTitle,
    category: 'root',
    children: [],
  };

  // 提取或回退构建关系网络图谱
  let graphNodes = Array.isArray(parsed.graph?.nodes) ? parsed.graph.nodes : [];
  let graphLinks = Array.isArray(parsed.graph?.links) ? parsed.graph.links : [];

  // 如果模型因截断没有输出 graph.nodes，直接从 tree 递归提取实体并建立互联
  if (graphNodes.length === 0) {
    const collected: any[] = [];
    const walkTree = (n: any) => {
      if (n.children && n.children.length > 0) {
        n.children.forEach(walkTree);
      } else if (n.id !== 'root') {
        collected.push({
          id: n.id,
          label: n.label,
          category: n.category || 'general',
          desc: n.desc,
          chapterRef: n.chapterRef,
        });
      }
    };
    walkTree(tree);
    graphNodes = collected.slice(0, 25);

    // 智能建立连线
    const charNodes = graphNodes.filter((n: any) => n.category === 'character');
    const plotNodes = graphNodes.filter((n: any) => n.category === 'plot' || n.category === 'event');

    if (charNodes.length > 1) {
      for (let i = 1; i < charNodes.length; i++) {
        graphLinks.push({
          source: charNodes[0].id,
          target: charNodes[i].id,
          relation: i % 3 === 0 ? '宿命对决' : i % 2 === 0 ? '暗中结盟' : '同行纠葛',
          sentiment: i % 3 === 0 ? 'negative' : 'positive',
        });
      }
      for (let i = 1; i < Math.min(charNodes.length - 1, 6); i += 2) {
        graphLinks.push({
          source: charNodes[i].id,
          target: charNodes[i + 1].id,
          relation: '暗流交锋',
          sentiment: 'neutral',
        });
      }
    }

    charNodes.slice(0, 6).forEach((char: any, idx: number) => {
      if (plotNodes[idx]) {
        graphLinks.push({
          source: char.id,
          target: plotNodes[idx].id,
          relation: '关键经历',
          sentiment: 'positive',
        });
      }
    });
  }

  return {
    title: parsed.title || defaultTitle,
    executiveSummary: parsed.executiveSummary || '已梳理出本范围作品的脉络骨架。',
    scopeInfo: {
      totalChapters: corpus.items.length,
      totalWords: corpus.totalWords,
      scopeName: corpus.scopeName,
    },
    tree,
    graph: {
      nodes: graphNodes,
      links: graphLinks,
    },
    generatedAt: Date.now(),
  };
}

/**
 * 强大的多级容错与自愈式 JSON 解析器
 */
export function robustParseStoryInsightJSON(
  raw: string,
  defaultTitle: string,
  corpus: InsightCorpus
): StoryInsightData {
  let cleaned = raw.trim();

  // 1. 剔除 markdown ```json ... ``` 标记
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }

  // 截取从第一个 { 开始的内容
  const firstBrace = cleaned.indexOf('{');
  if (firstBrace !== -1) {
    cleaned = cleaned.slice(firstBrace);
  }

  // 尝试一：原生解析
  try {
    const parsed = JSON.parse(cleaned);
    return normalizeStoryInsight(parsed, defaultTitle, corpus);
  } catch {
    // 失败进入自愈阶段
  }

  // 尝试二：修复属性值内部未转义的半角英文双引号
  const quoteFixed = cleaned
    .split('\n')
    .map((line) => {
      const match = line.match(/^(\s*"[^"]+"\s*:\s*")(.*)("(?:,)?\s*)$/);
      if (match) {
        const prefix = match[1];
        let content = match[2];
        const suffix = match[3];
        // 将内容中裸双引号替换为中文双引号
        content = content.replace(/(?<!\\)"/g, '”');
        return prefix + content + suffix;
      }
      return line;
    })
    .join('\n');

  try {
    const parsed = JSON.parse(quoteFixed);
    return normalizeStoryInsight(parsed, defaultTitle, corpus);
  } catch {
    // 依然失败，尝试修复截断的 JSON
  }

  // 尝试三：修复被 Token 截断的 JSON (Truncated JSON Healer)
  try {
    let truncated = quoteFixed;
    const lastValidToken = Math.max(truncated.lastIndexOf('}'), truncated.lastIndexOf(']'));
    if (lastValidToken !== -1) {
      truncated = truncated.slice(0, lastValidToken + 1);

      // 统计剥离所有字符串后的括号未闭合差值
      const strippedStrings = truncated.replace(/"(?:\\.|[^"\\])*"/g, '');
      const openCurly = (strippedStrings.match(/\{/g) || []).length;
      const closeCurly = (strippedStrings.match(/\}/g) || []).length;
      const openSquare = (strippedStrings.match(/\[/g) || []).length;
      const closeSquare = (strippedStrings.match(/\]/g) || []).length;

      let suffix = '';
      for (let i = 0; i < openSquare - closeSquare; i++) {
        suffix += ']';
      }
      for (let i = 0; i < openCurly - closeCurly; i++) {
        suffix += '}';
      }

      truncated += suffix;
      const parsed = JSON.parse(truncated);
      return normalizeStoryInsight(parsed, defaultTitle, corpus);
    }
  } catch {
    // 截断自愈失败，进入正则兜底
  }

  // 尝试四：终极正则提取兜底（保障 100% 成功不崩溃）
  return regexFallbackExtract(raw, defaultTitle, corpus);
}

/**
 * 终极正则提取兜底：即便 JSON 完全被截断，也能捞出所有已生成的角色、情节与地点
 */
function regexFallbackExtract(
  raw: string,
  defaultTitle: string,
  corpus: InsightCorpus
): StoryInsightData {
  const titleMatch = raw.match(/"title"\s*:\s*"([^"\n]+)"/);
  const title = titleMatch ? titleMatch[1] : defaultTitle;

  let executiveSummary = '已从所选章节中深度提取故事人物与剧情脉络。';
  const summaryMatch = raw.match(/"executiveSummary"\s*:\s*"([^"\n]{10,500})/);
  if (summaryMatch) {
    executiveSummary = summaryMatch[1].replace(/"/g, '”').trim();
  }

  const nodes: any[] = [];
  const nodeRegex = /\{\s*"id"\s*:\s*"([^"]+)"\s*,\s*"label"\s*:\s*"([^"]+)"(?:\s*,\s*"category"\s*:\s*"([^"]+)")?(?:\s*,\s*"desc"\s*:\s*"([^"]+)")?(?:\s*,\s*"chapterRef"\s*:\s*"([^"]+)")?/g;
  let match: RegExpExecArray | null;

  while ((match = nodeRegex.exec(raw)) !== null) {
    const [, id, label, category, desc, chapterRef] = match;
    nodes.push({
      id,
      label: label.replace(/"/g, ''),
      category: (category as any) || 'general',
      desc: desc ? desc.replace(/"/g, '') : undefined,
      chapterRef: chapterRef ? chapterRef.replace(/"/g, '') : undefined,
    });
  }

  const links: any[] = [];
  const linkRegex = /\{\s*"source"\s*:\s*"([^"]+)"\s*,\s*"target"\s*:\s*"([^"]+)"\s*,\s*"relation"\s*:\s*"([^"]+)"(?:\s*,\s*"sentiment"\s*:\s*"([^"]+)")?/g;
  while ((match = linkRegex.exec(raw)) !== null) {
    const [, source, target, relation, sentiment] = match;
    links.push({
      source,
      target,
      relation,
      sentiment: (sentiment as any) || 'neutral',
    });
  }

  const categories = [
    { key: 'character', label: '人物群像与阵营' },
    { key: 'plot', label: '主线波澜与转折' },
    { key: 'location', label: '世界观与风土' },
    { key: 'event', label: '重要转折事件' },
    { key: 'foreshadowing', label: '伏笔暗线与悬念' },
  ];

  const treeChildren = categories
    .map((cat) => ({
      id: `${cat.key}_group`,
      label: cat.label,
      category: cat.key as any,
      children: nodes.filter((n) => n.category === cat.key),
    }))
    .filter((group) => group.children.length > 0);

  const otherNodes = nodes.filter(
    (n) => !categories.some((c) => c.key === n.category) && n.id !== 'root'
  );
  if (otherNodes.length > 0) {
    treeChildren.push({
      id: 'other_group',
      label: '其他脉络节点',
      category: 'general',
      children: otherNodes,
    });
  }

  const graphNodes = nodes.slice(0, 25);
  if (links.length === 0 && graphNodes.length > 1) {
    for (let i = 0; i < Math.min(graphNodes.length - 1, 10); i++) {
      links.push({
        source: graphNodes[i].id,
        target: graphNodes[i + 1].id,
        relation: '关键关联',
        sentiment: 'neutral',
      });
    }
  }

  return {
    title,
    executiveSummary,
    scopeInfo: {
      totalChapters: corpus.items.length,
      totalWords: corpus.totalWords,
      scopeName: corpus.scopeName,
    },
    tree: {
      id: 'root',
      label: title,
      category: 'root',
      desc: executiveSummary,
      children: treeChildren,
    },
    graph: {
      nodes: graphNodes,
      links,
    },
    generatedAt: Date.now(),
  };
}

/**
 * 将生成的洞察思维导图作为独立文件归档入 IndexedDB 虚拟文件系统
 */
export async function saveInsightAsMindMapFile(
  targetParentId: string | null,
  data: StoryInsightData
): Promise<VirtualFileRecord> {
  const fileName = `《${data.title}》- 故事洞察思维导图.mindmap`;
  const fileContent = JSON.stringify(data, null, 2);

  const newFile = await createFile(
    fileName,
    fileContent,
    targetParentId,
    'mindmap'
  );

  // 标记来源为 mindmap
  await db.virtual_files.update(newFile.id, {
    source: 'mindmap',
    mimeType: 'application/json',
  });

  return {
    ...newFile,
    source: 'mindmap',
    mimeType: 'application/json',
  };
}

/**
 * 将导图数据转换为可供复制的格式化 Markdown 大纲文本
 */
export function convertInsightToMarkdown(data: StoryInsightData): string {
  let md = `# 📖 《${data.title}》故事全景洞察与思维导图\n\n`;
  md += `> **分析范围**: ${data.scopeInfo.scopeName}（共 ${data.scopeInfo.totalChapters} 篇，约 ${data.scopeInfo.totalWords} 字）  \n`;
  md += `> **生成时间**: ${new Date(data.generatedAt).toLocaleString()}  \n\n`;
  md += `### 💡 核心叙事底色与宏观洞察\n${data.executiveSummary}\n\n---\n\n`;

  md += `## 📋 树状大纲脉络\n\n`;

  const renderNode = (node: MindMapNode, depth: number) => {
    const indent = '  '.repeat(depth);
    const badge = node.category ? ` [${node.category}]` : '';
    const ref = node.chapterRef ? ` *(见: ${node.chapterRef})*` : '';
    const desc = node.desc ? ` - ${node.desc}` : '';
    md += `${indent}- **${node.label}**${badge}${desc}${ref}\n`;

    if (node.children && node.children.length > 0) {
      node.children.forEach((c) => renderNode(c, depth + 1));
    }
  };

  if (data.tree.children && data.tree.children.length > 0) {
    data.tree.children.forEach((c) => renderNode(c, 0));
  } else {
    renderNode(data.tree, 0);
  }

  md += `\n---\n\n## 🕸️ 角色与事件关系谱\n\n`;
  if (data.graph.links.length > 0) {
    data.graph.links.forEach((l) => {
      const sourceNode = data.graph.nodes.find((n) => n.id === l.source);
      const targetNode = data.graph.nodes.find((n) => n.id === l.target);
      const sName = sourceNode?.label || l.source;
      const tName = targetNode?.label || l.target;
      md += `- **${sName}** ── [${l.relation}] ──> **${tName}**\n`;
    });
  } else {
    md += `*(暂无跨实体关系连线)*\n`;
  }

  return md;
}
