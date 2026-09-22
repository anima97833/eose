import React, { useState } from 'react';
import { Search, X, Loader2, Plus, Film, AlertCircle } from 'lucide-react';
import { searchMoviesOnline } from '../../../../core/cinema/cinemaApi';
import { MovieSearchResult, MovieRecord } from '../../../../core/cinema/cinemaTypes';

interface MovieSearchModalProps {
  onSelectMovie: (draft: Partial<MovieRecord>) => void;
  onManualCreate: () => void;
  onClose: () => void;
}

export const MovieSearchModal: React.FC<MovieSearchModalProps> = ({
  onSelectMovie,
  onManualCreate,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<MovieSearchResult[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setErrorMsg(null);
    setHasSearched(true);

    try {
      const list = await searchMoviesOnline(trimmed);
      setResults(list);
    } catch (err: any) {
      setErrorMsg(err.message || '搜索暂时超时');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickResult = (item: MovieSearchResult) => {
    const today = new Date().toISOString().slice(0, 10);
    onSelectMovie({
      id: `movie_${Date.now()}`,
      title: query.trim() || item.title, // 保留用户的中文输入作为主标题
      originalTitle: item.title,
      posterUrl: item.posterUrl,
      backdropUrl: item.backdropUrl,
      year: item.year,
      runtimeMinutes: item.runtimeMinutes,
      status: 'watched',
      rating: 8.5, // 默认打分
      watchedDate: today,
      comment: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
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
        zIndex: 100,
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxHeight: '85%',
          backgroundColor: '#F8FAFC',
          borderRadius: '24px 24px 0 0',
          padding: '18px 16px 20px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: '0 -8px 30px rgba(0,0,0,0.3)',
          animation: 'slideUp 0.24s cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      >
        {/* 顶部标题与关闭 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Film size={18} color="#D97706" />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: '#1E293B' }}>
              搜影片录票夹
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

        {/* 搜索输入表单 */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '0 10px',
              border: '1.5px solid #CBD5E1',
              boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            <Search size={16} color="#94A3B8" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="输入中英文片名..."
              autoFocus
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                padding: '10px 8px',
                fontSize: '13px',
                backgroundColor: 'transparent',
                color: '#1E293B',
              }}
            />
            {query && (
              <X
                size={14}
                color="#94A3B8"
                style={{ cursor: 'pointer' }}
                onClick={() => setQuery('')}
              />
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            style={{
              padding: '0 16px',
              borderRadius: '12px',
              backgroundColor: query.trim() ? '#D97706' : '#94A3B8',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '13px',
              fontWeight: 800,
              cursor: query.trim() ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '58px',
            }}
          >
            {isLoading ? <Loader2 size={16} className="spin-animation" /> : '搜索'}
          </button>
        </form>

        {/* 搜索结果列表容器 */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            minHeight: '180px',
            maxHeight: '360px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            paddingRight: '2px',
          }}
        >
          {isLoading && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 0',
                color: '#D97706',
                gap: '8px',
              }}
            >
              <Loader2 size={24} className="spin-animation" />
              <span style={{ fontSize: '12px', fontWeight: 800 }}>正在查询海报与片源...</span>
            </div>
          )}

          {errorMsg && (
            <div
              style={{
                padding: '12px',
                backgroundColor: '#FEF2F2',
                borderRadius: '12px',
                border: '1px solid #FECACA',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#DC2626',
                fontSize: '12px',
              }}
            >
              <AlertCircle size={16} flex-shrink="0" />
              <span>{errorMsg}，可点击下方手动录入</span>
            </div>
          )}

          {!isLoading && hasSearched && results.length === 0 && !errorMsg && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '30px 0',
                color: '#94A3B8',
                gap: '6px',
              }}
            >
              <Film size={28} />
              <span style={{ fontSize: '13px', fontWeight: 700 }}>未找到对应影片</span>
              <span style={{ fontSize: '11px' }}>试试切换中英文关键词，或手动创建</span>
            </div>
          )}

          {/* 结果卡片项 */}
          {!isLoading &&
            results.map((item) => (
              <div
                key={item.id}
                onClick={() => handlePickResult(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 10px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
                  cursor: 'pointer',
                  gap: '10px',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F1F5F9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                }}
              >
                {/* 封面海报缩略 */}
                <div
                  style={{
                    width: '42px',
                    height: '58px',
                    borderRadius: '6px',
                    backgroundColor: '#334155',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  {item.posterUrl ? (
                    <img
                      src={item.posterUrl}
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#94A3B8',
                      }}
                    >
                      <Film size={16} />
                    </div>
                  )}
                </div>

                {/* 片名与信息 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4
                    style={{
                      margin: 0,
                      fontSize: '13.5px',
                      fontWeight: 800,
                      color: '#1E293B',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.title}
                  </h4>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '11px',
                      color: '#64748B',
                      marginTop: '3px',
                      fontFamily: 'monospace',
                    }}
                  >
                    {item.year > 0 && <span>{item.year} 年</span>}
                    {item.runtimeMinutes > 0 && <span>{item.runtimeMinutes} 分钟</span>}
                  </div>
                </div>

                {/* 存入票夹按钮 */}
                <div
                  style={{
                    padding: '5px 10px',
                    borderRadius: '8px',
                    backgroundColor: '#FEF3C7',
                    color: '#B45309',
                    fontSize: '11px',
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  + 入票夹
                </div>
              </div>
            ))}
        </div>

        {/* 底部手动自主录入按钮 */}
        <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '10px' }}>
          <button
            onClick={onManualCreate}
            style={{
              width: '100%',
              padding: '10px 0',
              borderRadius: '12px',
              backgroundColor: '#FFFFFF',
              border: '1.5px dashed #CBD5E1',
              color: '#475569',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Plus size={15} />
            手动录入影片
          </button>
        </div>
      </div>
    </div>
  );
};
