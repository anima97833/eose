import { db } from '../storage/db';
import { VirtualFileRecord, StoryInsightData } from './fileTypes';
import { createFile } from './fileStorage';

export interface StoryInsightHistoryItem {
  id: string;
  title: string;
  executiveSummary: string;
  scopeName: string;
  totalChapters: number;
  totalWords: number;
  graphNodeCount: number;
  treeNodeCount: number;
  createdAt: number;
  data: StoryInsightData;
}

/**
 * 递归计算树节点总数
 */
function countTreeNodes(node: any): number {
  if (!node) return 0;
  let count = 1;
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      count += countTreeNodes(child);
    }
  }
  return count;
}

/**
 * 自动归档一份思维导图至 IndexedDB 历史库
 */
export async function autoSaveInsightToHistory(
  data: StoryInsightData,
  folderId: string | null = null
): Promise<VirtualFileRecord> {
  const fileName = `《${data.title}》- 故事洞察思维导图.mindmap`;
  const fileContent = JSON.stringify(data, null, 2);

  // 检查是否已有完全相同标题且在 10 分钟内生成的导图，若是则更新该记录，防止重复刷屏
  const existingFiles = await db.virtual_files.toArray();
  const recentDuplicate = existingFiles.find(
    (f) =>
      (f.ext === 'mindmap' || f.source === 'mindmap') &&
      f.name === fileName &&
      Date.now() - f.updatedAt < 10 * 60 * 1000
  );

  if (recentDuplicate) {
    await db.virtual_files.update(recentDuplicate.id, {
      content: fileContent,
      size: new Blob([fileContent]).size,
      updatedAt: Date.now(),
      tags: ['mindmap_history'],
    });
    return (await db.virtual_files.get(recentDuplicate.id))!;
  }

  // 否则创建全新历史文件记录
  const newFile = await createFile(
    fileName,
    fileContent,
    folderId,
    'mindmap'
  );

  await db.virtual_files.update(newFile.id, {
    source: 'mindmap',
    mimeType: 'application/json',
    tags: ['mindmap_history'],
  });

  return (await db.virtual_files.get(newFile.id))!;
}

/**
 * 从 IndexedDB 中检索所有历史思维导图
 */
export async function getInsightHistoryList(): Promise<StoryInsightHistoryItem[]> {
  try {
    const allFiles = await db.virtual_files.toArray();
    const mindmapFiles = allFiles.filter(
      (f) => f.ext === 'mindmap' || f.source === 'mindmap'
    );

    const historyItems: StoryInsightHistoryItem[] = [];

    for (const file of mindmapFiles) {
      if (!file.content) continue;
      try {
        const parsed: StoryInsightData = JSON.parse(file.content);
        if (!parsed.tree || !parsed.title) continue;

        historyItems.push({
          id: file.id,
          title: parsed.title,
          executiveSummary: parsed.executiveSummary || '无概述内容',
          scopeName: parsed.scopeInfo?.scopeName || '指定范围',
          totalChapters: parsed.scopeInfo?.totalChapters || 1,
          totalWords: parsed.scopeInfo?.totalWords || 0,
          graphNodeCount: parsed.graph?.nodes?.length || 0,
          treeNodeCount: countTreeNodes(parsed.tree),
          createdAt: file.createdAt || file.updatedAt || Date.now(),
          data: parsed,
        });
      } catch (err) {
        console.warn('[InsightHistory] Failed to parse file content:', file.id, err);
      }
    }

    // 按时间倒序排序（最新的排在最前）
    return historyItems.sort((a, b) => b.createdAt - a.createdAt);
  } catch (err) {
    console.error('[InsightHistory] getInsightHistoryList error:', err);
    return [];
  }
}

/**
 * 删除一条 IndexedDB 历史导图
 */
export async function deleteInsightHistoryItem(id: string): Promise<boolean> {
  try {
    await db.virtual_files.delete(id);
    return true;
  } catch (err) {
    console.error('[InsightHistory] delete error:', err);
    return false;
  }
}

/**
 * 清空所有历史思维导图
 */
export async function clearAllInsightHistory(): Promise<boolean> {
  try {
    const allFiles = await db.virtual_files.toArray();
    const mindmapIds = allFiles
      .filter((f) => f.ext === 'mindmap' || f.source === 'mindmap')
      .map((f) => f.id);

    if (mindmapIds.length > 0) {
      await db.virtual_files.bulkDelete(mindmapIds);
    }
    return true;
  } catch (err) {
    console.error('[InsightHistory] clear error:', err);
    return false;
  }
}
