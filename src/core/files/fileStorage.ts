import { db } from '../storage/db';
import { VirtualFileRecord, FolderBreadcrumb, VFSStats } from './fileTypes';

/**
 * 统计字数（支持中文汉字与英文词频）
 */
export function calculateWordCount(text: string): number {
  if (!text) return 0;
  // 匹配中文字符及连续英文单词
  const chineseChars = text.match(/[\u4e00-\u9fa5]/g) || [];
  const englishWords = text.replace(/[\u4e00-\u9fa5]/g, ' ').match(/\b[a-zA-Z0-9_-]+\b/g) || [];
  return chineseChars.length + englishWords.length;
}

/**
 * 从文件名中提取扩展名
 */
export function extractExtension(filename: string): string {
  const parts = filename.split('.');
  if (parts.length > 1) {
    return parts.pop()?.toLowerCase() || 'txt';
  }
  return 'md';
}

/**
 * 获取指定父目录下的所有文件与文件夹
 */
export async function getFilesByParent(parentId: string | null): Promise<VirtualFileRecord[]> {
  try {
    // 兼容 parentId 为 null 或 ''
    const all = await db.virtual_files.toArray();
    const filtered = all.filter(item => {
      if (parentId === null || parentId === '') {
        return item.parentId === null || item.parentId === '' || item.parentId === undefined;
      }
      return item.parentId === parentId;
    });

    // 排序：文件夹置顶，内部按更新时间倒序
    return filtered.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return b.updatedAt - a.updatedAt;
    });
  } catch (err) {
    console.error('[VFS] getFilesByParent error:', err);
    return [];
  }
}

/**
 * 模糊搜索文件
 */
export async function searchFiles(keyword: string): Promise<VirtualFileRecord[]> {
  const query = keyword.trim().toLowerCase();
  if (!query) return [];

  try {
    const all = await db.virtual_files.toArray();
    return all.filter(file => {
      const nameMatch = file.name.toLowerCase().includes(query);
      const contentMatch = file.content ? file.content.toLowerCase().includes(query) : false;
      const tagMatch = file.tags ? file.tags.some(t => t.toLowerCase().includes(query)) : false;
      return nameMatch || contentMatch || tagMatch;
    });
  } catch (err) {
    console.error('[VFS] searchFiles error:', err);
    return [];
  }
}

/**
 * 获取单条文件详情
 */
export async function getFileById(id: string): Promise<VirtualFileRecord | undefined> {
  return await db.virtual_files.get(id);
}

/**
 * 向上回溯生成面包屑导航路径
 */
export async function getBreadcrumbs(folderId: string | null): Promise<FolderBreadcrumb[]> {
  const breadcrumbs: FolderBreadcrumb[] = [{ id: null, name: '根目录' }];
  if (!folderId) return breadcrumbs;

  try {
    const pathSegments: FolderBreadcrumb[] = [];
    let currentId: string | null = folderId;
    const visited = new Set<string>();

    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      const folder: VirtualFileRecord | undefined = await db.virtual_files.get(currentId);
      if (!folder) break;
      pathSegments.unshift({ id: folder.id, name: folder.name });
      currentId = folder.parentId || null;
    }

    return [...breadcrumbs, ...pathSegments];
  } catch (err) {
    console.error('[VFS] getBreadcrumbs error:', err);
    return breadcrumbs;
  }
}

/**
 * 新建文件夹
 */
export async function createFolder(
  name: string,
  parentId: string | null = null
): Promise<VirtualFileRecord> {
  const cleanName = name.trim() || '新建文件夹';
  const now = Date.now();
  const folder: VirtualFileRecord = {
    id: `folder_${now}_${Math.random().toString(36).substring(2, 7)}`,
    name: cleanName,
    type: 'folder',
    parentId: parentId || null,
    size: 0,
    createdAt: now,
    updatedAt: now,
  };

  await db.virtual_files.put(folder);
  return folder;
}

/**
 * 新建或保存文本/Markdown文件
 */
export async function createFile(
  name: string,
  content: string = '',
  parentId: string | null = null,
  source: 'onenote' | 'manual' | 'import' | 'system' | 'mindmap' = 'manual',
  tags: string[] = []
): Promise<VirtualFileRecord> {
  const cleanName = name.trim() || '未命名笔记.md';
  const now = Date.now();
  const ext = extractExtension(cleanName);
  const size = new Blob([content]).size;
  const wordCount = calculateWordCount(content);

  const file: VirtualFileRecord = {
    id: `file_${now}_${Math.random().toString(36).substring(2, 7)}`,
    name: cleanName,
    type: 'file',
    parentId: parentId || null,
    ext,
    content,
    size,
    source,
    tags,
    wordCount,
    createdAt: now,
    updatedAt: now,
  };

  await db.virtual_files.put(file);
  return file;
}

/**
 * 更新文件内容或属性
 */
export async function updateFile(
  id: string,
  updates: Partial<VirtualFileRecord>
): Promise<void> {
  const existing: VirtualFileRecord | undefined = await db.virtual_files.get(id);
  if (!existing) return;

  const now = Date.now();
  const nextData: Partial<VirtualFileRecord> = {
    ...updates,
    updatedAt: now,
  };

  if (typeof updates.content === 'string') {
    nextData.size = new Blob([updates.content]).size;
    nextData.wordCount = calculateWordCount(updates.content);
  }

  if (updates.name) {
    nextData.ext = extractExtension(updates.name);
  }

  await db.virtual_files.update(id, nextData);
}

/**
 * 重命名文件或文件夹
 */
export async function renameItem(id: string, newName: string): Promise<void> {
  const cleanName = newName.trim();
  if (!cleanName) return;
  await updateFile(id, { name: cleanName });
}

/**
 * 递归删除文件或文件夹及其全部子项
 */
export async function deleteItem(id: string): Promise<void> {
  const item: VirtualFileRecord | undefined = await db.virtual_files.get(id);
  if (!item) return;

  if (item.type === 'file') {
    await db.virtual_files.delete(id);
    return;
  }

  // 文件夹递归收集所有子级 id
  const all = await db.virtual_files.toArray();
  const idsToDelete = new Set<string>([id]);
  let addedNew = true;

  while (addedNew) {
    addedNew = false;
    for (const record of all) {
      if (record.parentId && idsToDelete.has(record.parentId) && !idsToDelete.has(record.id)) {
        idsToDelete.add(record.id);
        addedNew = true;
      }
    }
  }

  await db.virtual_files.bulkDelete(Array.from(idsToDelete));
}

/**
 * 获取文件系统的综合统计数据
 */
export async function getVFSStats(): Promise<VFSStats> {
  try {
    const all = await db.virtual_files.toArray();
    let totalFolders = 0;
    let totalFiles = 0;
    let oneNoteNotes = 0;
    let totalWords = 0;
    let totalSize = 0;

    for (const item of all) {
      if (item.type === 'folder') {
        totalFolders += 1;
      } else {
        totalFiles += 1;
        totalSize += item.size || 0;
        totalWords += item.wordCount || 0;
        if (item.source === 'onenote') {
          oneNoteNotes += 1;
        }
      }
    }

    return {
      totalFolders,
      totalFiles,
      oneNoteNotes,
      totalWords,
      totalSize,
    };
  } catch (err) {
    console.error('[VFS] getVFSStats error:', err);
    return {
      totalFolders: 0,
      totalFiles: 0,
      oneNoteNotes: 0,
      totalWords: 0,
      totalSize: 0,
    };
  }
}

/**
 * 初始化默认文件系统目录树（首次打开时自动注入体验数据）
 */
export async function initializeDefaultFileSystem(): Promise<void> {
  try {
    const count = await db.virtual_files.count();
    if (count > 0) return;

    const now = Date.now();

    // 1. OneNote 笔记本根文件夹
    const oneNoteFolderId = `folder_onenote_root`;
    const oneNoteFolder: VirtualFileRecord = {
      id: oneNoteFolderId,
      name: 'OneNote 笔记本',
      type: 'folder',
      parentId: null,
      size: 0,
      source: 'onenote',
      createdAt: now - 3600000 * 24,
      updatedAt: now,
    };

    // 1.1 欢迎笔记
    const welcomeNoteContent = `# 欢迎来到 OneNote 离线笔记本 📓

这是一套内嵌于小手机桌面的轻拟物**离线文件与笔记本系统**。

---

### ✨ 核心特性
1. **纯离线存储**：所有笔记均存储于本地 IndexedDB 沙盒，断网可用，隐私安全。
2. **OneNote 极速提取**：支持从 OneNote 导出的 Markdown 文件夹、Zip 压缩包或直接拖入导入，保留原有笔记本与分区层级！
3. **跨应用随心联动**：后续可将重要笔记一键发送至「背词爽文」、「世界线任务」、「心愿扭蛋」或「灵感漂流瓶」。

---

### 📥 如何将我的 OneNote 笔记导入到这里？
- **方式一（最推荐·文件夹直接拖拽）**：
  点击顶部 **「📥 导入 OneNote」** 按钮，选择你在电脑上导出的笔记文件夹（或直接将文件夹拖拽至虚线框内）。
- **方式二（Zip 压缩包）**：
  直接将打包好的笔记压缩包 \`.zip\` 拖入导入器，系统将全自动解压并还原目录层级。
- **方式三（单篇笔记粘贴）**：
  在 OneNote 中直接复制文字内容，在导入器中粘贴即可生成独立 Markdown 页面。

---

> 💡 *小提示：点击右上角编辑按钮可实时编辑修改，所有更改自动保存！*
`;

    const welcomeNote: VirtualFileRecord = {
      id: `file_onenote_welcome`,
      name: '欢迎使用 OneNote 离线笔记本.md',
      type: 'file',
      parentId: oneNoteFolderId,
      ext: 'md',
      content: welcomeNoteContent,
      size: new Blob([welcomeNoteContent]).size,
      source: 'onenote',
      tags: ['指南', 'OneNote', '欢迎'],
      wordCount: calculateWordCount(welcomeNoteContent),
      createdAt: now - 3600000 * 20,
      updatedAt: now,
    };

    // 1.2 示例分区：工作与学习
    const subFolderId = `folder_onenote_sub1`;
    const subFolder: VirtualFileRecord = {
      id: subFolderId,
      name: '工作与学习',
      type: 'folder',
      parentId: oneNoteFolderId,
      size: 0,
      source: 'onenote',
      createdAt: now - 3600000 * 15,
      updatedAt: now,
    };

    const taskNoteContent = `# 本周学习与待办重点 🎯

- [x] 完成心愿扭蛋机手绘拟物动效与物理弹跳
- [x] 支持 Colormind 深度配色无缝映射
- [ ] 整理 OneNote 常用速查笔记并归档
- [ ] 在背词爽文中完成 5 篇剧情章节复习
`;

    const taskNote: VirtualFileRecord = {
      id: `file_onenote_tasks`,
      name: '本周备忘与规划.md',
      type: 'file',
      parentId: subFolderId,
      ext: 'md',
      content: taskNoteContent,
      size: new Blob([taskNoteContent]).size,
      source: 'onenote',
      tags: ['待办', '工作'],
      wordCount: calculateWordCount(taskNoteContent),
      createdAt: now - 3600000 * 10,
      updatedAt: now,
    };

    // 2. 灵感与随想手账
    const memoFolderId = `folder_memo_root`;
    const memoFolder: VirtualFileRecord = {
      id: memoFolderId,
      name: '灵感手账与日记',
      type: 'folder',
      parentId: null,
      size: 0,
      createdAt: now - 3600000 * 8,
      updatedAt: now,
    };

    const inspirationContent = `# 夜深漫步随想 🌙

城市路灯把影子拉得很长。
拟物设计的魅力，在于让每一个数字像素都拥有温度、质感和物理的重量。
就像桌面上旋转的心愿扭蛋机，或者是这一页翻开的纸质笔记。
`;

    const inspirationNote: VirtualFileRecord = {
      id: `file_inspiration_note`,
      name: '夜深漫步随想.md',
      type: 'file',
      parentId: memoFolderId,
      ext: 'md',
      content: inspirationContent,
      size: new Blob([inspirationContent]).size,
      source: 'manual',
      tags: ['随想', '生活'],
      wordCount: calculateWordCount(inspirationContent),
      createdAt: now - 3600000 * 5,
      updatedAt: now,
    };

    // 3. 常用文档
    const docsFolder: VirtualFileRecord = {
      id: `folder_docs_root`,
      name: '常用文档与参考',
      type: 'folder',
      parentId: null,
      size: 0,
      createdAt: now - 3600000 * 2,
      updatedAt: now,
    };

    await db.virtual_files.bulkPut([
      oneNoteFolder,
      welcomeNote,
      subFolder,
      taskNote,
      memoFolder,
      inspirationNote,
      docsFolder,
    ]);
  } catch (err) {
    console.error('[VFS] initializeDefaultFileSystem error:', err);
  }
}
