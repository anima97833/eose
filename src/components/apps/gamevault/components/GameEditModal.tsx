import React, { useState } from 'react';
import { X, Star, Trash2, Camera, Check } from 'lucide-react';
import { GameRecord, GamePlatform, GameStatus, PLATFORM_NAMES, STATUS_NAMES } from '../../../../core/games/gameTypes';

interface GameEditModalProps {
  initialGame?: Partial<GameRecord> | null;
  onClose: () => void;
  onSave: (game: GameRecord) => void;
  onDelete?: (id: string) => void;
}

export const GameEditModal: React.FC<GameEditModalProps> = ({
  initialGame,
  onClose,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState(initialGame?.title || '');
  const [platform, setPlatform] = useState<GamePlatform>(initialGame?.platform || 'steam');
  const [status, setStatus] = useState<GameStatus>(initialGame?.status || 'playing');
  const [playtimeHours, setPlaytimeHours] = useState<number>(initialGame?.playtimeHours || 0);
  const [rating, setRating] = useState<number>(initialGame?.rating || 5);
  const [coverUrl, setCoverUrl] = useState(initialGame?.coverUrl || '');
  const [comment, setComment] = useState(initialGame?.comment || '');
  const [tagsStr, setTagsStr] = useState((initialGame?.tags || []).join(' '));

  const isEditing = Boolean(initialGame?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const tags = tagsStr
      .split(/[\s,，]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    const record: GameRecord = {
      id: initialGame?.id || `g_${Date.now()}`,
      title: trimmedTitle,
      originalTitle: initialGame?.originalTitle,
      coverUrl: coverUrl.trim() || undefined,
      bannerUrl: initialGame?.bannerUrl,
      platform,
      status,
      playtimeHours: Math.max(0, Number(playtimeHours) || 0),
      rating,
      comment: comment.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      source: initialGame?.source || 'manual',
      externalId: initialGame?.externalId,
      createdAt: initialGame?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    onSave(record);
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 70,
        background: 'rgba(26, 20, 22, 0.65)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '340px',
          maxHeight: '88vh',
          background: '#FAF4E8',
          borderRadius: '20px',
          border: '2.5px solid #502428',
          boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'scaleUp 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部标题栏 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px 8px',
            borderBottom: '1.5px solid rgba(80, 36, 40, 0.1)',
          }}
        >
          <span style={{ fontSize: '15px', fontWeight: 900, color: '#502428' }}>
            {isEditing ? '编辑游戏卡带' : '新增入库卡带'}
          </span>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#502428',
              padding: '2px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 表单内容 */}
        <form
          onSubmit={handleSubmit}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {/* 封面预览与 URL */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div
              style={{
                width: '56px',
                height: '70px',
                borderRadius: '8px',
                border: '1.5px solid #502428',
                background: '#2B2D42',
                overflow: 'hidden',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
              }}
            >
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt="cover"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <span style={{ fontSize: '24px' }}>🎮</span>
              )}
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#502428' }}>
                封面链接 (可选)
              </span>
              <input
                type="text"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://..."
                style={{
                  padding: '5px 8px',
                  borderRadius: '8px',
                  border: '1.5px solid #502428',
                  fontSize: '11px',
                  outline: 'none',
                  background: '#FFFFFF',
                  color: '#502428',
                }}
              />
            </div>
          </div>

          {/* 游戏名称 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#502428' }}>
              游戏名称 *
            </span>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="如：黑神话：悟空"
              style={{
                padding: '6px 8px',
                borderRadius: '8px',
                border: '1.5px solid #502428',
                fontSize: '12.5px',
                fontWeight: 800,
                outline: 'none',
                background: '#FFFFFF',
                color: '#502428',
              }}
            />
          </div>

          {/* 所属平台 (单选按钮组) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#502428' }}>
              所属平台
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {(['steam', 'switch', 'playstation', 'xbox', 'mobile', 'pc'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '8px',
                    border: platform === p ? '1.5px solid #502428' : '1.5px solid rgba(80,36,40,0.2)',
                    background: platform === p ? '#502428' : '#FFFFFF',
                    color: platform === p ? '#FFFFFF' : '#6B4A34',
                    fontSize: '10.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {PLATFORM_NAMES[p]}
                </button>
              ))}
            </div>
          </div>

          {/* 当前状态 (单选按钮组) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#502428' }}>
              当前状态
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {(['wishlist', 'playing', 'cleared', 'dropped'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  style={{
                    flex: 1,
                    padding: '4px 0',
                    borderRadius: '8px',
                    border: status === s ? '1.5px solid #502428' : '1.5px solid rgba(80,36,40,0.2)',
                    background: status === s ? '#F472B6' : '#FFFFFF',
                    color: status === s ? '#FFFFFF' : '#6B4A34',
                    fontSize: '11px',
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  {STATUS_NAMES[s]}
                </button>
              ))}
            </div>
          </div>

          {/* 游玩时长与星级评分 */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#502428' }}>
                已玩时长 (小时)
              </span>
              <input
                type="number"
                step="0.5"
                min="0"
                value={playtimeHours}
                onChange={(e) => setPlaytimeHours(Number(e.target.value))}
                style={{
                  padding: '5px 8px',
                  borderRadius: '8px',
                  border: '1.5px solid #502428',
                  fontSize: '12px',
                  fontWeight: 800,
                  outline: 'none',
                  background: '#FFFFFF',
                  color: '#502428',
                }}
              />
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#502428' }}>
                评价星级
              </span>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', height: '32px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 1px' }}
                  >
                    <Star
                      size={18}
                      fill={star <= rating ? '#F59E0B' : '#E5E7EB'}
                      color={star <= rating ? '#B45309' : '#9CA3AF'}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 随手简评 / 心得札记 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#502428' }}>
              通关评语 / 备忘随笔
            </span>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="写下你对这部作品的感动、通关体验或游玩备忘..."
              rows={2}
              style={{
                padding: '6px 8px',
                borderRadius: '8px',
                border: '1.5px solid #502428',
                fontSize: '11px',
                fontWeight: 600,
                outline: 'none',
                background: '#FFFFFF',
                color: '#502428',
                resize: 'none',
              }}
            />
          </div>

          {/* 标签 (以空格分隔) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#502428' }}>
              标签 (空格分隔)
            </span>
            <input
              type="text"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              placeholder="动作RPG 魂系 国风神作"
              style={{
                padding: '5px 8px',
                borderRadius: '8px',
                border: '1.5px solid #502428',
                fontSize: '11px',
                outline: 'none',
                background: '#FFFFFF',
                color: '#502428',
              }}
            />
          </div>

          {/* 底部按钮栏 */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={() => initialGame?.id && onDelete(initialGame.id)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid #DC2626',
                  background: '#FEE2E2',
                  color: '#DC2626',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Trash2 size={14} />
                <span>删除</span>
              </button>
            )}

            <button
              type="submit"
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: '10px',
                border: '2px solid #502428',
                background: '#10B981',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                boxShadow: '0 2px 0 #064E3B',
              }}
            >
              <Check size={16} strokeWidth={3} />
              <span>保存卡带</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
