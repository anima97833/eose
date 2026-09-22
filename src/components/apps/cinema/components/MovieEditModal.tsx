import React, { useState } from 'react';
import { X, Star, Calendar, MessageSquare, Film, Check, Tag } from 'lucide-react';
import { MovieRecord, MovieStatus } from '../../../../core/cinema/cinemaTypes';

interface MovieEditModalProps {
  initialMovie: Partial<MovieRecord>;
  onSave: (movie: MovieRecord) => void;
  onClose: () => void;
}

const PRESET_TAGS = ['神作', '治愈', '催泪', '烧脑', '经典', '二刷', '科幻', '动画', '悬疑', '下饭'];

export const MovieEditModal: React.FC<MovieEditModalProps> = ({
  initialMovie,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState(initialMovie.title || '');
  const [originalTitle, setOriginalTitle] = useState(initialMovie.originalTitle || '');
  const [posterUrl, setPosterUrl] = useState(initialMovie.posterUrl || '');
  const [year, setYear] = useState<number>(initialMovie.year || new Date().getFullYear());
  const [runtimeMinutes, setRuntimeMinutes] = useState<number>(initialMovie.runtimeMinutes || 0);
  const [status, setStatus] = useState<MovieStatus>(initialMovie.status || 'watched');
  const [rating, setRating] = useState<number>(typeof initialMovie.rating === 'number' ? initialMovie.rating : 8.5);
  const [watchedDate, setWatchedDate] = useState(
    initialMovie.watchedDate || new Date().toISOString().slice(0, 10)
  );
  const [comment, setComment] = useState(initialMovie.comment || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(initialMovie.tags || []);

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const getScoreVerdict = (score: number) => {
    if (score >= 9.5) return '神作传世';
    if (score >= 8.5) return '强烈推荐';
    if (score >= 7.5) return '值得一看';
    if (score >= 6.0) return '中规中矩';
    return '略显平庸';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const movieToSave: MovieRecord = {
      id: initialMovie.id || `movie_${Date.now()}`,
      title: title.trim(),
      originalTitle: originalTitle.trim(),
      posterUrl: posterUrl.trim(),
      backdropUrl: initialMovie.backdropUrl,
      year: Number(year) || 0,
      runtimeMinutes: Number(runtimeMinutes) || 0,
      status,
      rating: status === 'watched' ? Number(rating) : 0,
      watchedDate: status === 'watched' ? watchedDate : '',
      comment: comment.trim(),
      tags: selectedTags,
      createdAt: initialMovie.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    onSave(movieToSave);
  };

  const setTodayDate = () => {
    setWatchedDate(new Date().toISOString().slice(0, 10));
  };

  const setYesterdayDate = () => {
    const yesterday = new Date(Date.now() - 86400000);
    setWatchedDate(yesterday.toISOString().slice(0, 10));
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        zIndex: 110,
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxHeight: '90%',
          backgroundColor: '#F8FAFC',
          borderRadius: '24px 24px 0 0',
          padding: '18px 16px 20px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.3)',
          animation: 'slideUp 0.24s cubic-bezier(0.25, 1, 0.5, 1)',
          overflowY: 'auto',
        }}
      >
        {/* 顶部标题与关闭 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Film size={18} color="#D97706" />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: '#1E293B' }}>
              {initialMovie.id ? '编辑票根' : '添加新票根'}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: '#E2E8F0',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748B',
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* 观影状态切换 Tab：已放映 vs 待看 */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#E2E8F0',
            borderRadius: '12px',
            padding: '3px',
            gap: '4px',
          }}
        >
          <button
            type="button"
            onClick={() => setStatus('watched')}
            style={{
              flex: 1,
              padding: '7px 0',
              borderRadius: '9px',
              border: 'none',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: 'pointer',
              backgroundColor: status === 'watched' ? '#FFFFFF' : 'transparent',
              color: status === 'watched' ? '#D97706' : '#64748B',
              boxShadow: status === 'watched' ? '0 2px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            ★ 已放映
          </button>
          <button
            type="button"
            onClick={() => setStatus('wishlist')}
            style={{
              flex: 1,
              padding: '7px 0',
              borderRadius: '9px',
              border: 'none',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: 'pointer',
              backgroundColor: status === 'wishlist' ? '#FFFFFF' : 'transparent',
              color: status === 'wishlist' ? '#2563EB' : '#64748B',
              boxShadow: status === 'wishlist' ? '0 2px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            ⌚ 待看清单
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* 电影基本信息（海报预览 + 中英文标题） */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '56px',
                height: '78px',
                borderRadius: '8px',
                backgroundColor: '#334155',
                overflow: 'hidden',
                flexShrink: 0,
                boxShadow: '0 3px 6px rgba(0,0,0,0.15)',
              }}
            >
              {posterUrl ? (
                <img src={posterUrl} alt="海报" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                  <Film size={20} />
                </div>
              )}
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569' }}>影片片名</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="如: 千与千寻"
                  required
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '13px',
                    fontWeight: 700,
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                    color: '#1E293B',
                    boxSizing: 'border-box',
                    marginTop: '2px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '10px', fontWeight: 700, color: '#64748B' }}>上映年份</label>
                  <input
                    type="number"
                    value={year || ''}
                    onChange={(e) => setYear(Number(e.target.value))}
                    placeholder="2024"
                    style={{
                      width: '100%',
                      padding: '5px 8px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '11px',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      color: '#334155',
                      boxSizing: 'border-box',
                      marginTop: '2px',
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '10px', fontWeight: 700, color: '#64748B' }}>片长(分钟)</label>
                  <input
                    type="number"
                    value={runtimeMinutes || ''}
                    onChange={(e) => setRuntimeMinutes(Number(e.target.value))}
                    placeholder="120"
                    style={{
                      width: '100%',
                      padding: '5px 8px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '11px',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      color: '#334155',
                      boxSizing: 'border-box',
                      marginTop: '2px',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 核心亮点功能 1：用户自由滑动打分 (Slider Rating 0 ~ 10) */}
          {status === 'watched' && (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                padding: '12px 14px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Star size={16} fill="#F59E0B" color="#F59E0B" />
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#1E293B' }}>滑动评分</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '20px', fontWeight: 900, color: '#D97706', fontFamily: 'monospace' }}>
                    {Number(rating).toFixed(1)}
                  </span>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>/ 10.0</span>
                  <span
                    style={{
                      marginLeft: '6px',
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '1.5px 6px',
                      borderRadius: '6px',
                      backgroundColor: '#FEF3C7',
                      color: '#B45309',
                    }}
                  >
                    {getScoreVerdict(rating)}
                  </span>
                </div>
              </div>

              {/* 平滑高质感滑动条 */}
              <input
                type="range"
                min="1.0"
                max="10.0"
                step="0.5"
                value={rating}
                onChange={(e) => setRating(parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  outline: 'none',
                  cursor: 'pointer',
                  accentColor: '#D97706',
                  marginTop: '6px',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#94A3B8', marginTop: '3px', fontFamily: 'monospace' }}>
                <span>1.0 较差</span>
                <span>5.0 及格</span>
                <span>8.0 佳作</span>
                <span>10.0 封神</span>
              </div>
            </div>
          )}

          {/* 核心亮点功能 2：标注观影日期 */}
          {status === 'watched' && (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                padding: '12px 14px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={15} color="#475569" />
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#1E293B' }}>观影日期</span>
                </div>

                {/* 快速预设药丸按钮 */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={setTodayDate}
                    style={{
                      padding: '2px 8px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#F8FAFC',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    今天
                  </button>
                  <button
                    type="button"
                    onClick={setYesterdayDate}
                    style={{
                      padding: '2px 8px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#F8FAFC',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    昨天
                  </button>
                </div>
              </div>

              <input
                type="date"
                value={watchedDate}
                onChange={(e) => setWatchedDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: '8px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '13px',
                  fontWeight: 700,
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  color: '#1E293B',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          {/* 核心亮点功能 3：观后短评与短金句 */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              padding: '12px 14px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <MessageSquare size={15} color="#475569" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#1E293B' }}>观后速评 / 摘抄</span>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="写下这部电影给你的感触、经典的台词或一句话短评..."
              rows={3}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1.5px solid #CBD5E1',
                fontSize: '12px',
                outline: 'none',
                backgroundColor: '#FAF6EE',
                color: '#2C251E',
                boxSizing: 'border-box',
                resize: 'none',
                lineHeight: '1.4',
                fontFamily: 'inherit',
              }}
            />

            {/* 灵感便签标签快捷点选 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
              <Tag size={12} color="#94A3B8" />
              {PRESET_TAGS.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    style={{
                      padding: '2px 8px',
                      borderRadius: '6px',
                      border: active ? '1px solid #D97706' : '1px solid #E2E8F0',
                      backgroundColor: active ? '#FEF3C7' : '#F8FAFC',
                      color: active ? '#B45309' : '#64748B',
                      fontSize: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 保存按钮 */}
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px 0',
              borderRadius: '14px',
              backgroundColor: '#D97706',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '14px',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(217, 119, 6, 0.35)',
            }}
          >
            <Check size={16} strokeWidth={3} />
            保存入票夹
          </button>
        </form>
      </div>
    </div>
  );
};
