import React, { useEffect, useState, useRef } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Sunrise, 
  Archive, 
  Trash2, 
  Edit3, 
  Upload, 
  X, 
  Check, 
  RotateCcw,
  Image as ImageIcon
} from 'lucide-react';
import { 
  PosterRecord, 
  PosterCategory, 
  PosterRepeatMode, 
  PosterTemplateId, 
  PosterBackMemoItem,
  PosterStampType 
} from '../../../core/poster/posterTypes';
import { 
  getAllPosters, 
  savePoster, 
  deletePoster, 
  archivePoster, 
  unarchivePoster,
  formatDateYMD,
  isPosterActiveOnDate,
  getDaysDiff,
  resetTodayDismissed
} from '../../../core/poster/posterStorage';
import { POSTER_TEMPLATES } from '../../../core/poster/posterTemplates';
import { PosterCardView } from './PosterCardView';
import { DailyPosterModal } from '../../modals/DailyPosterModal';
import './posterAlbum.css';

interface PhotoAlbumAppProps {
  onBack: () => void;
}

type TabType = 'active' | 'upcoming' | 'archived';

export const PhotoAlbumApp: React.FC<PhotoAlbumAppProps> = ({ onBack }) => {
  const [posters, setPosters] = useState<PosterRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // 预览今日晨映弹窗
  const [showDailyPreview, setShowDailyPreview] = useState(false);

  // 新建/编辑海报抽屉
  const [editingPoster, setEditingPoster] = useState<PosterRecord | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // 查看大图/正反详情
  const [inspectedPoster, setInspectedPoster] = useState<PosterRecord | null>(null);

  // 加载海报
  const loadPosters = async () => {
    try {
      setLoading(true);
      const list = await getAllPosters();
      setPosters(list);
    } catch (err) {
      console.error('[PhotoAlbumApp] 加载海报失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosters();
  }, []);

  const todayStr = formatDateYMD();

  // 分 Tab 过滤
  const filteredPosters = posters.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) {
      return false;
    }

    if (activeTab === 'archived') {
      return p.isArchived === true;
    }

    if (p.isArchived) return false;

    const isActive = isPosterActiveOnDate(p, todayStr);
    const daysToStart = getDaysDiff(p.startDate, todayStr);

    if (activeTab === 'active') {
      return isActive || getDaysDiff(p.endDate, todayStr) < 0;
    }

    if (activeTab === 'upcoming') {
      return daysToStart > 0;
    }

    return true;
  });

  const counts = {
    active: posters.filter((p) => !p.isArchived && (isPosterActiveOnDate(p, todayStr) || getDaysDiff(p.endDate, todayStr) < 0)).length,
    upcoming: posters.filter((p) => !p.isArchived && getDaysDiff(p.startDate, todayStr) > 0).length,
    archived: posters.filter((p) => p.isArchived).length,
  };

  // 打勾清单项
  const handleToggleItem = async (posterId: string, itemId: string) => {
    const poster = posters.find((p) => p.id === posterId);
    if (!poster || !poster.backItems) return;

    const updatedItems = poster.backItems.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    const updatedPoster: PosterRecord = {
      ...poster,
      backItems: updatedItems,
      updatedAt: Date.now(),
    };

    setPosters((prev) => prev.map((p) => (p.id === posterId ? updatedPoster : p)));
    if (inspectedPoster?.id === posterId) {
      setInspectedPoster(updatedPoster);
    }

    await savePoster(updatedPoster);
    window.dispatchEvent(new Event('cloudfly_posters_updated'));
  };

  // 归档海报
  const handleArchive = async (id: string, stamp: PosterStampType = 'achieved') => {
    await archivePoster(id, stamp);
    await loadPosters();
    if (inspectedPoster?.id === id) setInspectedPoster(null);
    window.dispatchEvent(new Event('cloudfly_posters_updated'));
  };

  // 取消归档
  const handleUnarchive = async (id: string) => {
    await unarchivePoster(id);
    await loadPosters();
    if (inspectedPoster?.id === id) setInspectedPoster(null);
    window.dispatchEvent(new Event('cloudfly_posters_updated'));
  };

  // 删除海报
  const handleDelete = async (id: string) => {
    if (!window.confirm('确定删除这张海报吗？')) return;
    await deletePoster(id);
    await loadPosters();
    if (inspectedPoster?.id === id) setInspectedPoster(null);
    window.dispatchEvent(new Event('cloudfly_posters_updated'));
  };

  // 打开新建弹窗
  const handleOpenCreate = () => {
    const today = new Date();
    const todayYMD = formatDateYMD(today);
    const end = new Date(today);
    end.setDate(today.getDate() + 7);
    const endYMD = formatDateYMD(end);

    setEditingPoster({
      id: `poster_${Date.now()}`,
      title: '',
      category: 'event',
      subtitle: '',
      imageUrl: null,
      templateId: 'supermarket_sale',
      templateTheme: 'super_yellow',
      tagText: '限时特惠',
      startDate: todayYMD,
      endDate: endYMD,
      repeatMode: 'none',
      backNote: '',
      backItems: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    setIsEditorOpen(true);
  };

  // 打开编辑弹窗
  const handleOpenEdit = (poster: PosterRecord) => {
    setEditingPoster({ ...poster });
    setIsEditorOpen(true);
    setInspectedPoster(null);
  };

  // 保存海报
  const handleSavePoster = async (poster: PosterRecord) => {
    if (!poster.title.trim()) {
      alert('请填写海报标题');
      return;
    }
    await savePoster(poster);
    await loadPosters();
    setIsEditorOpen(false);
    setEditingPoster(null);
    window.dispatchEvent(new Event('cloudfly_posters_updated'));
  };

  return (
    <div className="pa-container">
      {/* 顶部导航栏 (简洁明了，无繁冗提示语) */}
      <div className="pa-header">
        <div className="pa-header-top">
          <div className="pa-header-left">
            <button
              type="button"
              className="pa-btn pa-btn-icon"
              onClick={onBack}
              title="返回桌面"
            >
              <ArrowLeft size={18} />
            </button>
            <h2 className="pa-title">相册</h2>
            <span className="pa-count-badge">{posters.length}</span>
          </div>

          <div className="pa-header-actions">
            <button
              type="button"
              className="pa-btn pa-btn-secondary"
              onClick={() => {
                resetTodayDismissed();
                setShowDailyPreview(true);
              }}
              title="预览今日开屏提醒"
            >
              <Sunrise size={14} color="#d97706" />
              <span>今日展映</span>
            </button>

            <button
              type="button"
              className="pa-btn pa-btn-primary"
              onClick={handleOpenCreate}
            >
              <Plus size={15} />
              <span>新建</span>
            </button>
          </div>
        </div>

        {/* 分页 Tab 栏 */}
        <div className="pa-tabs">
          <button
            type="button"
            className={`pa-tab-btn ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            <span>上映中</span>
            <span className="pa-tab-badge">{counts.active}</span>
          </button>

          <button
            type="button"
            className={`pa-tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            <span>待上映</span>
            <span className="pa-tab-badge">{counts.upcoming}</span>
          </button>

          <button
            type="button"
            className={`pa-tab-btn ${activeTab === 'archived' ? 'active' : ''}`}
            onClick={() => setActiveTab('archived')}
          >
            <span>回忆</span>
            <span className="pa-tab-badge">{counts.archived}</span>
          </button>
        </div>

        {/* 分类快捷筛选 */}
        <div className="pa-chips">
          {[
            { id: 'all', label: '全部' },
            { id: 'romance', label: '纪念 ❤️' },
            { id: 'event', label: '特惠 🏷️' },
            { id: 'schedule', label: '日程 🎯' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`pa-chip-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 主展厅画廊 */}
      <div className="pa-gallery">
        {loading ? (
          <div className="pa-empty">加载中...</div>
        ) : filteredPosters.length === 0 ? (
          <div className="pa-empty">
            <ImageIcon size={36} color="#94a3b8" />
            <span style={{ fontSize: 13, fontWeight: 600 }}>暂无海报</span>
            <button
              type="button"
              className="pa-btn pa-btn-primary"
              style={{ marginTop: 6 }}
              onClick={handleOpenCreate}
            >
              <Plus size={14} />
              <span>新建第一张</span>
            </button>
          </div>
        ) : (
          <div className="pa-grid">
            {filteredPosters.map((poster) => (
              <div key={poster.id} style={{ position: 'relative' }}>
                <PosterCardView
                  poster={poster}
                  interactive={true}
                  onToggleItem={handleToggleItem}
                  onOpenDetail={setInspectedPoster}
                />

                {/* 卡片右上角快捷操作条 */}
                <div className="pa-card-actions">
                  <button
                    type="button"
                    className="pa-card-action-btn"
                    title="编辑"
                    onClick={() => handleOpenEdit(poster)}
                  >
                    <Edit3 size={13} />
                  </button>

                  {!poster.isArchived ? (
                    <button
                      type="button"
                      className="pa-card-action-btn"
                      title="归档"
                      onClick={() => handleArchive(poster.id, 'achieved')}
                    >
                      <Archive size={13} color="#d97706" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="pa-card-action-btn"
                      title="取消归档"
                      onClick={() => handleUnarchive(poster.id)}
                    >
                      <RotateCcw size={13} color="#2563eb" />
                    </button>
                  )}

                  <button
                    type="button"
                    className="pa-card-action-btn delete"
                    title="删除"
                    onClick={() => handleDelete(poster.id)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 今日开屏提醒预览 */}
      {showDailyPreview && (
        <DailyPosterModal
          forceOpen={true}
          onClose={() => setShowDailyPreview(false)}
        />
      )}

      {/* 海报大图检视 Modal */}
      {inspectedPoster && (
        <div className="pa-modal-overlay" onClick={() => setInspectedPoster(null)}>
          <div
            style={{ width: '100%', maxWidth: 330 }}
            onClick={(e) => e.stopPropagation()}
          >
            <PosterCardView
              poster={inspectedPoster}
              interactive={true}
              onToggleItem={handleToggleItem}
              style={{ minHeight: 360, height: 370 }}
            />
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 14 }}>
              <button
                type="button"
                className="pa-btn pa-btn-secondary"
                onClick={() => handleOpenEdit(inspectedPoster)}
              >
                <Edit3 size={14} />
                <span>编辑</span>
              </button>
              {!inspectedPoster.isArchived ? (
                <button
                  type="button"
                  className="pa-btn pa-btn-primary"
                  onClick={() => handleArchive(inspectedPoster.id, 'celebrated')}
                >
                  <Archive size={14} />
                  <span>留念归档</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="pa-btn pa-btn-secondary"
                  onClick={() => handleUnarchive(inspectedPoster.id)}
                >
                  <RotateCcw size={14} />
                  <span>重新上映</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 新建 / 编辑海报抽屉 */}
      {isEditorOpen && editingPoster && (
        <PosterEditorModal
          poster={editingPoster}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingPoster(null);
          }}
          onSave={handleSavePoster}
        />
      )}
    </div>
  );
};

/* =========================================================================
   新建与编辑抽屉 (PosterEditorModal)
   ========================================================================= */
interface PosterEditorModalProps {
  poster: PosterRecord;
  onClose: () => void;
  onSave: (poster: PosterRecord) => void;
}

const PosterEditorModal: React.FC<PosterEditorModalProps> = ({
  poster,
  onClose,
  onSave,
}) => {
  const [draft, setDraft] = useState<PosterRecord>({ ...poster });
  const [imageMode, setImageMode] = useState<'template' | 'upload'>(
    draft.imageUrl ? 'upload' : 'template'
  );
  const [newChecklistText, setNewChecklistText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setDraft((prev) => ({
        ...prev,
        imageUrl: base64,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    const newItem: PosterBackMemoItem = {
      id: `item_${Date.now()}`,
      text: newChecklistText.trim(),
      completed: false,
    };
    setDraft((prev) => ({
      ...prev,
      backItems: [...(prev.backItems || []), newItem],
    }));
    setNewChecklistText('');
  };

  const handleRemoveItem = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      backItems: (prev.backItems || []).filter((i) => i.id !== id),
    }));
  };

  const handleSelectTemplate = (templateId: PosterTemplateId) => {
    const def = POSTER_TEMPLATES[templateId];
    setDraft((prev) => ({
      ...prev,
      templateId,
      templateTheme: def.themes[0]?.id || 'warm_cherry',
      tagText: prev.tagText || def.defaultTag,
      title: prev.title || def.defaultTitle,
      subtitle: prev.subtitle || def.defaultSubtitle,
      backNote: prev.backNote || def.defaultNote,
      backItems:
        prev.backItems && prev.backItems.length > 0
          ? prev.backItems
          : def.defaultItems.map((text, i) => ({
              id: `item_${Date.now()}_${i}`,
              text,
              completed: false,
            })),
    }));
  };

  return (
    <div className="pa-modal-overlay" onClick={onClose}>
      <div className="pa-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="pa-modal-header">
          <h3 className="pa-modal-title">
            {poster.title ? '编辑海报' : '新建海报'}
          </h3>
          <button type="button" className="pa-btn-icon" onClick={onClose} style={{ width: 28, height: 28 }}>
            <X size={16} />
          </button>
        </div>

        <div className="pa-modal-body">
          {/* 标题 */}
          <div className="pa-form-group">
            <label className="pa-form-label">标题</label>
            <input
              type="text"
              placeholder="海报标题 (如：一周年纪念 / 超市半价)"
              className="pa-input"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </div>

          {/* 副标题与角标 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div className="pa-form-group">
              <label className="pa-form-label">副标题</label>
              <input
                type="text"
                placeholder="简短寄语"
                className="pa-input"
                value={draft.subtitle || ''}
                onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
              />
            </div>
            <div className="pa-form-group">
              <label className="pa-form-label">角标</label>
              <input
                type="text"
                placeholder="如 5折 / 365天"
                className="pa-input"
                value={draft.tagText || ''}
                onChange={(e) => setDraft({ ...draft, tagText: e.target.value })}
              />
            </div>
          </div>

          {/* 分类 */}
          <div className="pa-form-group">
            <label className="pa-form-label">分类</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {[
                { id: 'romance', label: '纪念 ❤️' },
                { id: 'event', label: '特惠 🏷️' },
                { id: 'schedule', label: '日程 🎯' },
                { id: 'custom', label: '其他 🌟' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`pa-btn ${draft.category === item.id ? 'pa-btn-primary' : 'pa-btn-secondary'}`}
                  style={{ padding: '6px 0', fontSize: 11 }}
                  onClick={() => setDraft({ ...draft, category: item.id as PosterCategory })}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 模式选择 */}
          <div className="pa-form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <label className="pa-form-label">样式模式</label>
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  type="button"
                  className={`pa-btn ${imageMode === 'template' ? 'pa-btn-primary' : 'pa-btn-secondary'}`}
                  style={{ padding: '3px 8px', fontSize: 11 }}
                  onClick={() => {
                    setImageMode('template');
                    setDraft((prev) => ({ ...prev, imageUrl: null }));
                  }}
                >
                  极简模板
                </button>
                <button
                  type="button"
                  className={`pa-btn ${imageMode === 'upload' ? 'pa-btn-primary' : 'pa-btn-secondary'}`}
                  style={{ padding: '3px 8px', fontSize: 11 }}
                  onClick={() => setImageMode('upload')}
                >
                  上传图片
                </button>
              </div>
            </div>

            {imageMode === 'upload' ? (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                {draft.imageUrl ? (
                  <div style={{ position: 'relative', width: '100%', height: 120, borderRadius: 10, overflow: 'hidden' }}>
                    <img src={draft.imageUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      className="pa-btn pa-btn-secondary"
                      style={{ position: 'absolute', bottom: 6, right: 6, padding: '3px 8px', fontSize: 10 }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      重新选择
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="pa-btn pa-btn-secondary"
                    style={{ width: '100%', height: 70, border: '1px dashed #cbd5e1', flexDirection: 'column' }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={16} color="#64748b" />
                    <span style={{ fontSize: 11, marginTop: 4 }}>选择本地照片</span>
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {Object.values(POSTER_TEMPLATES).map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    className={`pa-btn ${draft.templateId === tmpl.id ? 'pa-btn-primary' : 'pa-btn-secondary'}`}
                    style={{ padding: '8px 6px', fontSize: 11 }}
                    onClick={() => handleSelectTemplate(tmpl.id)}
                  >
                    {tmpl.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 日期 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div className="pa-form-group">
              <label className="pa-form-label">开始日期</label>
              <input
                type="date"
                className="pa-input"
                value={draft.startDate}
                onChange={(e) => setDraft({ ...draft, startDate: e.target.value })}
              />
            </div>
            <div className="pa-form-group">
              <label className="pa-form-label">截止日期</label>
              <input
                type="date"
                className="pa-input"
                value={draft.endDate}
                onChange={(e) => setDraft({ ...draft, endDate: e.target.value })}
              />
            </div>
          </div>

          {/* 循环 */}
          <div className="pa-form-group">
            <label className="pa-form-label">循环模式</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {[
                { id: 'none', label: '单次' },
                { id: 'yearly', label: '每年重复' },
                { id: 'monthly', label: '每月重复' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`pa-btn ${draft.repeatMode === item.id ? 'pa-btn-primary' : 'pa-btn-secondary'}`}
                  style={{ padding: '5px 0', fontSize: 11 }}
                  onClick={() => setDraft({ ...draft, repeatMode: item.id as PosterRepeatMode })}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 背面备忘与待办 */}
          <div className="pa-form-group">
            <label className="pa-form-label">背面备忘清单</label>
            <textarea
              rows={2}
              placeholder="备忘说明..."
              className="pa-textarea"
              value={draft.backNote || ''}
              onChange={(e) => setDraft({ ...draft, backNote: e.target.value })}
            />

            {draft.backItems && draft.backItems.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
                {draft.backItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#f1f5f9',
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontSize: 11,
                    }}
                  >
                    <span>{item.text}</span>
                    <button
                      type="button"
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              <input
                type="text"
                placeholder="添加待办项"
                className="pa-input"
                style={{ flex: 1 }}
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChecklistItem();
                  }
                }}
              />
              <button
                type="button"
                className="pa-btn pa-btn-secondary"
                onClick={handleAddChecklistItem}
              >
                添加
              </button>
            </div>
          </div>
        </div>

        <div className="pa-modal-footer">
          <button type="button" className="pa-btn pa-btn-secondary" onClick={onClose}>
            取消
          </button>
          <button type="button" className="pa-btn pa-btn-primary" onClick={() => onSave(draft)}>
            <Check size={14} />
            <span>保存</span>
          </button>
        </div>
      </div>
    </div>
  );
};
