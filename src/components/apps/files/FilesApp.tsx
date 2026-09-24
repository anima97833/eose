import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  Search,
  Folder,
  FileText,
  Plus,
  FolderPlus,
  UploadCloud,
  LayoutGrid,
  List,
  MoreVertical,
  ChevronRight,
  FolderOpen,
  Edit2,
  Trash2,
  X,
  FileEdit,
  BrainCircuit,
} from 'lucide-react';
import { VirtualFileRecord, FolderBreadcrumb, VFSStats, StoryInsightData } from '../../../core/files/fileTypes';
import {
  getFilesByParent,
  getBreadcrumbs,
  createFolder,
  createFile,
  renameItem,
  deleteItem,
  getVFSStats,
  searchFiles,
  initializeDefaultFileSystem,
} from '../../../core/files/fileStorage';
import { NewFolderModal } from './components/NewFolderModal';
import { NewFileModal } from './components/NewFileModal';
import { OneNoteImportModal } from './components/OneNoteImportModal';
import { FileViewerModal } from './components/FileViewerModal';
import { FileInsightModal } from './components/FileInsightModal';

interface FilesAppProps {
  onBack: () => void;
  onOpenApp?: (appId: string) => void;
}

export const FilesApp: React.FC<FilesAppProps> = ({ onBack }) => {
  // 当前目录层级状态
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<FolderBreadcrumb[]>([{ id: null, name: '根目录' }]);
  const [items, setItems] = useState<VirtualFileRecord[]>([]);
  const [stats, setStats] = useState<VFSStats | null>(null);
  const [loading, setLoading] = useState(true);

  // 视图模式: 'grid' | 'list'
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // 搜索状态
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<VirtualFileRecord[]>([]);

  // 弹窗状态
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [isNewFileOpen, setIsNewFileOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [activeFile, setActiveFile] = useState<VirtualFileRecord | null>(null);

  // AI 故事洞察与思维导图弹窗状态
  const [isInsightModalOpen, setIsInsightModalOpen] = useState(false);
  const [openedInsightData, setOpenedInsightData] = useState<StoryInsightData | null>(null);

  // 重命名菜单与操作弹窗
  const [menuItemId, setMenuItemId] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] = useState<VirtualFileRecord | null>(null);
  const [renameText, setRenameText] = useState('');

  // 刷新当前目录数据
  const refreshDirectory = useCallback(async () => {
    setLoading(true);
    try {
      await initializeDefaultFileSystem();
      const files = await getFilesByParent(currentFolderId);
      const crumbs = await getBreadcrumbs(currentFolderId);
      const currentStats = await getVFSStats();

      setItems(files);
      setBreadcrumbs(crumbs);
      setStats(currentStats);
    } catch (err) {
      console.error('[FilesApp] refresh error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentFolderId]);

  useEffect(() => {
    refreshDirectory();
  }, [refreshDirectory]);

  // 处理搜索
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const results = await searchFiles(searchQuery);
      setSearchResults(results);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 导航逻辑：返回上一级
  const handleBack = () => {
    if (isSearchOpen) {
      setIsSearchOpen(false);
      setSearchQuery('');
      return;
    }
    if (currentFolderId === null) {
      onBack();
      return;
    }
    if (breadcrumbs.length <= 2) {
      setCurrentFolderId(null);
    } else {
      const parentCrumb = breadcrumbs[breadcrumbs.length - 2];
      setCurrentFolderId(parentCrumb.id);
    }
  };

  // 进入子文件夹
  const handleOpenFolder = (folder: VirtualFileRecord) => {
    setMenuItemId(null);
    setCurrentFolderId(folder.id);
  };

  // 打开文件
  const handleOpenFile = (file: VirtualFileRecord) => {
    setMenuItemId(null);
    if (file.ext === 'mindmap' && file.content) {
      try {
        const parsed = JSON.parse(file.content);
        setOpenedInsightData(parsed);
        setIsInsightModalOpen(true);
        return;
      } catch (err) {
        console.error('Failed to parse mindmap content:', err);
      }
    }
    setActiveFile(file);
  };

  // 新建文件夹确认
  const handleCreateFolder = async (name: string) => {
    await createFolder(name, currentFolderId);
    await refreshDirectory();
  };

  // 新建文件确认
  const handleCreateFile = async (title: string, content: string) => {
    await createFile(title, content, currentFolderId, 'manual');
    await refreshDirectory();
  };

  // 提交重命名
  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameTarget || !renameText.trim()) return;

    await renameItem(renameTarget.id, renameText);
    setRenameTarget(null);
    setRenameText('');
    await refreshDirectory();
  };

  // 删除项
  const handleDeleteItem = async (item: VirtualFileRecord) => {
    setMenuItemId(null);
    const itemType = item.type === 'folder' ? '文件夹及其全部子内容' : '笔记文件';
    if (window.confirm(`确定要永久删除${itemType}「${item.name}」吗？`)) {
      await deleteItem(item.id);
      await refreshDirectory();
    }
  };

  // 当前显示的项目列表 (如果是搜索态则显示搜索结果)
  const displayItems = isSearchOpen && searchQuery.trim() ? searchResults : items;
  const currentFolderName = breadcrumbs[breadcrumbs.length - 1]?.name || '文件管理';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--nm-bg)',
        overflow: 'hidden',
        position: 'relative',
        userSelect: 'none',
      }}
      onClick={() => setMenuItemId(null)}
    >
      {/* ================= 顶部 Header ================= */}
      <div
        style={{
          padding: '14px 16px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--nm-bg)',
          borderBottom: '1px solid rgba(166, 180, 200, 0.2)',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleBack}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: 'none',
              background: 'var(--nm-bg)',
              boxShadow: 'var(--nm-convex-xs)',
              color: 'var(--nm-text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1
              style={{
                fontSize: '17px',
                fontWeight: 800,
                color: 'var(--nm-text-main)',
                maxWidth: '180px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {currentFolderName}
            </h1>
            <p style={{ fontSize: '10px', color: 'var(--nm-text-sub)' }}>
              {stats ? `${stats.totalFiles} 篇笔记 · ${stats.totalFolders} 个文件夹` : '离线虚拟沙盒'}
            </p>
          </div>
        </div>

        {/* 顶部操作按钮 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* AI 故事洞察与思维导图纯按钮 (位于放大镜左侧) */}
          <button
            type="button"
            onClick={() => {
              setOpenedInsightData(null);
              setIsInsightModalOpen(true);
            }}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              border: 'none',
              background: 'var(--nm-bg)',
              boxShadow: 'var(--nm-convex-xs)',
              color: '#7753A6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.1s ease',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.94)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            title="AI 故事洞察与思维导图"
          >
            <BrainCircuit size={17} />
          </button>

          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              border: 'none',
              background: isSearchOpen ? 'var(--nm-primary)' : 'var(--nm-bg)',
              boxShadow: isSearchOpen ? 'none' : 'var(--nm-convex-xs)',
              color: isSearchOpen ? '#fff' : 'var(--nm-text-sub)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Search size={16} />
          </button>

          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              border: 'none',
              background: 'var(--nm-bg)',
              boxShadow: 'var(--nm-convex-xs)',
              color: 'var(--nm-text-sub)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {viewMode === 'grid' ? <List size={16} /> : <LayoutGrid size={16} />}
          </button>
        </div>
      </div>

      {/* ================= 搜索栏展开浮层 ================= */}
      {isSearchOpen && (
        <div
          style={{
            padding: '10px 16px',
            background: 'var(--nm-bg)',
            borderBottom: '1px solid rgba(166, 180, 200, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              flex: 1,
              background: 'var(--nm-bg)',
              boxShadow: 'var(--nm-inset-xs)',
              borderRadius: '12px',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Search size={14} style={{ color: 'var(--nm-text-sub)' }} />
            <input
              type="text"
              placeholder="搜索笔记名称或正文内容..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '12px',
                color: 'var(--nm-text-main)',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'transparent', border: 'none', color: 'var(--nm-text-muted)', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => {
              setIsSearchOpen(false);
              setSearchQuery('');
            }}
            style={{
              padding: '6px 10px',
              borderRadius: '10px',
              border: 'none',
              background: 'transparent',
              fontSize: '12px',
              color: 'var(--nm-text-sub)',
              cursor: 'pointer',
            }}
          >
            取消
          </button>
        </div>
      )}

      {/* ================= 面包屑路径栏 ================= */}
      {!isSearchOpen && (
        <div
          style={{
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            borderBottom: '1px solid rgba(166, 180, 200, 0.15)',
            background: 'var(--nm-bg-lighter)',
          }}
          className="no-scrollbar"
        >
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.id || 'root'}>
                <button
                  onClick={() => setCurrentFolderId(crumb.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: isLast ? 700 : 500,
                    color: isLast ? 'var(--nm-primary)' : 'var(--nm-text-sub)',
                    cursor: isLast ? 'default' : 'pointer',
                    padding: '2px 4px',
                    borderRadius: '6px',
                  }}
                >
                  {idx === 0 ? '📁 根目录' : crumb.name}
                </button>
                {!isLast && <ChevronRight size={12} style={{ color: 'var(--nm-text-muted)', flexShrink: 0 }} />}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* ================= 快捷操作功能条 ================= */}
      <div
        style={{
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--nm-bg)',
        }}
      >
        {/* 导入笔记/小说核心入口 */}
        <button
          onClick={() => setIsImportModalOpen(true)}
          style={{
            flex: 1.3,
            padding: '8px 12px',
            borderRadius: '14px',
            border: 'none',
            background: 'linear-gradient(135deg, #7753A6 0%, #20BF6B 100%)',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(119, 83, 166, 0.35)',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
            transition: 'transform 0.15s ease',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <UploadCloud size={15} />
          <span>导入笔记/小说</span>
        </button>

        {/* 新建文件夹 */}
        <button
          onClick={() => setIsNewFolderOpen(true)}
          style={{
            flex: 1,
            padding: '8px 10px',
            borderRadius: '14px',
            border: 'none',
            background: 'var(--nm-bg)',
            boxShadow: 'var(--nm-convex-xs)',
            color: 'var(--nm-text-main)',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            cursor: 'pointer',
          }}
        >
          <FolderPlus size={14} style={{ color: 'var(--nm-primary)' }} />
          <span>加文件夹</span>
        </button>

        {/* 新建笔记 */}
        <button
          onClick={() => setIsNewFileOpen(true)}
          style={{
            flex: 1,
            padding: '8px 10px',
            borderRadius: '14px',
            border: 'none',
            background: 'var(--nm-bg)',
            boxShadow: 'var(--nm-convex-xs)',
            color: 'var(--nm-text-main)',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            cursor: 'pointer',
          }}
        >
          <Plus size={14} style={{ color: '#38D39F' }} />
          <span>写笔记</span>
        </button>
      </div>

      {/* ================= 主体列表/网格内容区域 ================= */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 16px 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--nm-text-muted)', fontSize: '13px' }}>
            载入离线文件系统中...
          </div>
        ) : displayItems.length === 0 ? (
          /* 空状态 */
          <div
            style={{
              padding: '48px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '22px',
                background: 'var(--nm-bg)',
                boxShadow: 'var(--nm-convex)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--nm-text-muted)',
                marginBottom: '16px',
              }}
            >
              <FolderOpen size={32} />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--nm-text-main)', marginBottom: '6px' }}>
              {isSearchOpen ? '未找到相关笔记或文件' : '当前文件夹空空如也'}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--nm-text-sub)', maxWidth: '240px', marginBottom: '20px' }}>
              {isSearchOpen
                ? '可以尝试搜索其他关键字，或在上方新建笔记'
                : '点击上方「导入笔记/小说」一键还原内容，或随时新建文件夹分类'}
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setIsImportModalOpen(true)}
                style={{
                  padding: '9px 16px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #7753A6 0%, #20BF6B 100%)',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 600,
                  boxShadow: '0 4px 10px rgba(119, 83, 166, 0.35)',
                  cursor: 'pointer',
                }}
              >
                导入外部笔记 / 小说
              </button>
              <button
                onClick={() => setIsNewFileOpen(true)}
                style={{
                  padding: '9px 14px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'var(--nm-bg)',
                  boxShadow: 'var(--nm-convex-xs)',
                  color: 'var(--nm-text-main)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                新建笔记
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* ================= 网格视图 ================= */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
            }}
          >
            {displayItems.map((item) => {
              const isFolder = item.type === 'folder';
              return (
                <div
                  key={item.id}
                  onClick={() => (isFolder ? handleOpenFolder(item) : handleOpenFile(item))}
                  style={{
                    background: 'var(--nm-bg)',
                    boxShadow: 'var(--nm-convex-sm)',
                    borderRadius: '18px',
                    padding: '14px 12px',
                    border: '1px solid rgba(255, 255, 255, 0.65)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '110px',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
                  onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '12px',
                        background: isFolder
                          ? 'rgba(80, 150, 198, 0.14)'
                          : item.ext === 'mindmap'
                          ? 'rgba(119, 83, 166, 0.18)'
                          : item.source === 'onenote'
                          ? 'rgba(119, 83, 166, 0.14)'
                          : 'rgba(56, 211, 159, 0.14)',
                        color: isFolder
                          ? 'var(--nm-primary)'
                          : item.ext === 'mindmap'
                          ? '#7753A6'
                          : item.source === 'onenote'
                          ? '#7753A6'
                          : '#38D39F',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isFolder ? (
                        <Folder size={20} />
                      ) : item.ext === 'mindmap' ? (
                        <BrainCircuit size={20} />
                      ) : (
                        <FileText size={20} />
                      )}
                    </div>

                    {/* 更多菜单按钮 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuItemId(menuItemId === item.id ? null : item.id);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--nm-text-muted)',
                        padding: '4px',
                        cursor: 'pointer',
                        borderRadius: '6px',
                      }}
                    >
                      <MoreVertical size={15} />
                    </button>
                  </div>

                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: 'var(--nm-text-main)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1,
                        }}
                      >
                        {item.name}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', color: 'var(--nm-text-sub)' }}>
                      <span>
                        {isFolder ? '文件夹' : `${item.wordCount || 0} 字`}
                      </span>
                      {item.source === 'onenote' && (
                        <span
                          style={{
                            fontSize: '9px',
                            padding: '1px 5px',
                            borderRadius: '5px',
                            background: 'rgba(119, 83, 166, 0.12)',
                            color: '#7753A6',
                            fontWeight: 700,
                          }}
                        >
                          OneNote
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 弹出菜单 */}
                  {menuItemId === item.id && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '40px',
                        right: '8px',
                        zIndex: 30,
                        background: 'var(--nm-bg)',
                        boxShadow: 'var(--nm-convex-lg)',
                        borderRadius: '14px',
                        padding: '4px',
                        border: '1px solid rgba(255, 255, 255, 0.7)',
                        display: 'flex',
                        flexDirection: 'column',
                        minWidth: '100px',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          setRenameTarget(item);
                          setRenameText(item.name);
                          setMenuItemId(null);
                        }}
                        style={{
                          padding: '6px 10px',
                          border: 'none',
                          background: 'transparent',
                          color: 'var(--nm-text-main)',
                          fontSize: '11px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          borderRadius: '8px',
                        }}
                      >
                        <Edit2 size={12} /> 重命名
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item)}
                        style={{
                          padding: '6px 10px',
                          border: 'none',
                          background: 'transparent',
                          color: '#FF5E7E',
                          fontSize: '11px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          borderRadius: '8px',
                        }}
                      >
                        <Trash2 size={12} /> 删除
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* ================= 列表视图 ================= */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {displayItems.map((item) => {
              const isFolder = item.type === 'folder';
              return (
                <div
                  key={item.id}
                  onClick={() => (isFolder ? handleOpenFolder(item) : handleOpenFile(item))}
                  style={{
                    background: 'var(--nm-bg)',
                    boxShadow: 'var(--nm-convex-xs)',
                    borderRadius: '16px',
                    padding: '10px 14px',
                    border: '1px solid rgba(255, 255, 255, 0.65)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '10px',
                        background: isFolder
                          ? 'rgba(80, 150, 198, 0.14)'
                          : item.ext === 'mindmap'
                          ? 'rgba(119, 83, 166, 0.18)'
                          : item.source === 'onenote'
                          ? 'rgba(119, 83, 166, 0.14)'
                          : 'rgba(56, 211, 159, 0.14)',
                        color: isFolder
                          ? 'var(--nm-primary)'
                          : item.ext === 'mindmap'
                          ? '#7753A6'
                          : item.source === 'onenote'
                          ? '#7753A6'
                          : '#38D39F',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {isFolder ? (
                        <Folder size={18} />
                      ) : item.ext === 'mindmap' ? (
                        <BrainCircuit size={18} />
                      ) : (
                        <FileText size={18} />
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            color: 'var(--nm-text-main)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.name}
                        </span>
                        {item.ext === 'mindmap' && (
                          <span
                            style={{
                              fontSize: '9px',
                              padding: '1px 5px',
                              borderRadius: '5px',
                              background: 'rgba(119, 83, 166, 0.15)',
                              color: '#7753A6',
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            思维导图
                          </span>
                        )}
                        {item.source === 'onenote' && (
                          <span
                            style={{
                              fontSize: '9px',
                              padding: '1px 5px',
                              borderRadius: '5px',
                              background: 'rgba(119, 83, 166, 0.12)',
                              color: '#7753A6',
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            OneNote
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '10px', color: 'var(--nm-text-sub)', marginTop: '2px' }}>
                        {isFolder ? '文件夹' : `${item.wordCount || 0} 字 · ${new Date(item.updatedAt).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>

                  {/* 菜单触发 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuItemId(menuItemId === item.id ? null : item.id);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--nm-text-muted)',
                      padding: '6px',
                      cursor: 'pointer',
                      borderRadius: '6px',
                    }}
                  >
                    <MoreVertical size={16} />
                  </button>

                  {/* 弹出菜单 */}
                  {menuItemId === item.id && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '40px',
                        right: '12px',
                        zIndex: 30,
                        background: 'var(--nm-bg)',
                        boxShadow: 'var(--nm-convex-lg)',
                        borderRadius: '14px',
                        padding: '4px',
                        border: '1px solid rgba(255, 255, 255, 0.7)',
                        display: 'flex',
                        flexDirection: 'column',
                        minWidth: '100px',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          setRenameTarget(item);
                          setRenameText(item.name);
                          setMenuItemId(null);
                        }}
                        style={{
                          padding: '6px 10px',
                          border: 'none',
                          background: 'transparent',
                          color: 'var(--nm-text-main)',
                          fontSize: '11px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          borderRadius: '8px',
                        }}
                      >
                        <Edit2 size={12} /> 重命名
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item)}
                        style={{
                          padding: '6px 10px',
                          border: 'none',
                          background: 'transparent',
                          color: '#FF5E7E',
                          fontSize: '11px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          borderRadius: '8px',
                        }}
                      >
                        <Trash2 size={12} /> 删除
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= 重命名弹窗 ================= */}
      {renameTarget && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            backgroundColor: 'rgba(20, 30, 45, 0.45)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setRenameTarget(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '320px',
              background: 'var(--nm-bg)',
              boxShadow: 'var(--nm-convex-lg)',
              borderRadius: '24px',
              padding: '20px',
              border: '1px solid rgba(255, 255, 255, 0.7)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--nm-text-main)', marginBottom: '14px' }}>
              重命名 {renameTarget.type === 'folder' ? '文件夹' : '文件'}
            </h3>
            <form onSubmit={handleRenameSubmit}>
              <div
                style={{
                  background: 'var(--nm-bg)',
                  boxShadow: 'var(--nm-inset-sm)',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  marginBottom: '16px',
                }}
              >
                <input
                  type="text"
                  value={renameText}
                  onChange={(e) => setRenameText(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%',
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '13px',
                    color: 'var(--nm-text-main)',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setRenameTarget(null)}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'var(--nm-bg)',
                    boxShadow: 'var(--nm-convex-xs)',
                    color: 'var(--nm-text-sub)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={!renameText.trim()}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'var(--nm-primary)',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  确定
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= 业务子弹窗组 ================= */}
      <NewFolderModal
        isOpen={isNewFolderOpen}
        onClose={() => setIsNewFolderOpen(false)}
        onCreate={handleCreateFolder}
      />

      <NewFileModal
        isOpen={isNewFileOpen}
        onClose={() => setIsNewFileOpen(false)}
        onCreate={handleCreateFile}
      />

      <OneNoteImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        targetParentId={currentFolderId}
        onSuccess={refreshDirectory}
      />

      <FileViewerModal
        file={activeFile}
        isOpen={!!activeFile}
        onClose={() => setActiveFile(null)}
        onUpdated={refreshDirectory}
      />

      {/* AI 故事洞察与思维导图弹窗 */}
      <FileInsightModal
        isOpen={isInsightModalOpen}
        onClose={() => {
          setIsInsightModalOpen(false);
          setOpenedInsightData(null);
        }}
        currentFolderId={currentFolderId}
        currentFolderName={breadcrumbs[breadcrumbs.length - 1]?.name}
        itemsInCurrentFolder={items}
        initialInsightData={openedInsightData}
        onSuccessSave={refreshDirectory}
      />
    </div>
  );
};
