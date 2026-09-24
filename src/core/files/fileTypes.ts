export interface VirtualFileRecord {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null; // null represents the root directory
  ext?: string; // e.g. 'md', 'txt', 'json', etc.
  content?: string; // Text / Markdown content
  size: number; // File size in bytes
  mimeType?: string;
  source?: 'onenote' | 'manual' | 'import' | 'system' | 'mindmap';
  tags?: string[];
  wordCount?: number;
  createdAt: number;
  updatedAt: number;
}

export interface FolderBreadcrumb {
  id: string | null;
  name: string;
}

export interface VFSStats {
  totalFolders: number;
  totalFiles: number;
  oneNoteNotes: number;
  totalWords: number;
  totalSize: number;
}

export interface OneNoteImportProgress {
  stage: 'scanning' | 'extracting' | 'parsing' | 'saving' | 'done' | 'error';
  message: string;
  current: number;
  total: number;
}

export interface OneNoteImportResult {
  success: boolean;
  importedFilesCount: number;
  importedFoldersCount: number;
  error?: string;
}

// =================== AI 故事洞察与思维导图类型 ===================

export type MindMapCategory =
  | 'root'
  | 'character'
  | 'plot'
  | 'location'
  | 'event'
  | 'foreshadowing'
  | 'theme'
  | 'general';

export interface MindMapNode {
  id: string;
  label: string;
  category?: MindMapCategory;
  desc?: string;
  chapterRef?: string;
  children?: MindMapNode[];
  collapsed?: boolean;
}

export interface GraphNode {
  id: string;
  label: string;
  category: 'character' | 'plot' | 'location' | 'event' | 'faction' | 'theme';
  desc?: string;
  chapterRef?: string;
  x?: number;
  y?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  relation: string;
  sentiment?: 'positive' | 'negative' | 'neutral' | 'mystery';
}

export interface StoryInsightData {
  title: string;
  executiveSummary: string;
  scopeInfo: {
    totalChapters: number;
    totalWords: number;
    scopeName: string;
  };
  tree: MindMapNode;
  graph: {
    nodes: GraphNode[];
    links: GraphLink[];
  };
  generatedAt: number;
}

export interface InsightCorpusItem {
  id: string;
  name: string;
  pathName: string;
  content: string;
  wordCount: number;
}

export interface InsightCorpus {
  scopeName: string;
  items: InsightCorpusItem[];
  totalWords: number;
}
