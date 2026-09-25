import React, { useState } from 'react';
import { Search, X, Loader2, Sparkles, Plus, ExternalLink } from 'lucide-react';
import { GameSearchResult, GamePlatform } from '../../../../core/games/gameTypes';
import { searchGames } from '../../../../core/games/gameSearchService';

interface GameSearchModalProps {
  onClose: () => void;
  onSelectGame: (result: Partial<GameSearchResult>) => void;
  onOpenManual: () => void;
}

export const GameSearchModal: React.FC<GameSearchModalProps> = ({
  onClose,
  onSelectGame,
  onOpenManual,
}) => {
  const [query, setQuery] = useState('');
  const [engine, setEngine] = useState<'all' | 'steam' | 'mobile'>('all');
  const [results, setResults] = useState<GameSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const data = await searchGames(trimmed, engine);
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 60,
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
          maxHeight: '85vh',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '18px' }}>🎮</span>
            <span style={{ fontSize: '14.5px', fontWeight: 900, color: '#502428' }}>
              检索入库游戏
            </span>
          </div>

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

        {/* 搜索与分类引擎切换 */}
        <div style={{ padding: '10px 14px 6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <form
            onSubmit={handleSearch}
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#FFFFFF',
              border: '2px solid #502428',
              borderRadius: '12px',
              padding: '2px 8px',
              boxShadow: 'inset 0 2px 3px rgba(0,0,0,0.06)',
            }}
          >
            <Search size={16} color="#8A6D55" style={{ marginRight: '6px', flexShrink: 0 }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜 Steam 端游 / 手游 / 别名..."
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '12.5px',
                fontWeight: 700,
                color: '#502428',
                padding: '6px 0',
              }}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A6D55' }}
              >
                <X size={14} />
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              style={{
                marginLeft: '6px',
                background: '#502428',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 900,
                cursor: query.trim() ? 'pointer' : 'default',
                opacity: query.trim() ? 1 : 0.6,
              }}
            >
              搜索
            </button>
          </form>

          {/* 引擎切换药丸 */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { key: 'all', label: '双引擎全部' },
              { key: 'steam', label: 'Steam 商店' },
              { key: 'mobile', label: 'AppStore 手游' },
            ].map((tab) => {
              const isSelected = engine === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setEngine(tab.key as any)}
                  style={{
                    flex: 1,
                    padding: '3px 0',
                    borderRadius: '8px',
                    border: isSelected ? '1.5px solid #502428' : '1.5px solid rgba(80,36,40,0.2)',
                    background: isSelected ? '#502428' : '#FFFDF9',
                    color: isSelected ? '#FFFFFF' : '#6B4A34',
                    fontSize: '10.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* 快捷推荐热词 */}
          <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'none' }}>
            {['如鸢', '恋与深空', '黑神话', '哈迪斯', '原神', '星穹铁道'].map((word) => (
              <button
                key={word}
                type="button"
                onClick={() => {
                  setQuery(word);
                  setIsLoading(true);
                  setHasSearched(true);
                  searchGames(word, engine).then((res) => {
                    setResults(res);
                    setIsLoading(false);
                  });
                }}
                style={{
                  padding: '2px 7px',
                  borderRadius: '12px',
                  background: 'rgba(80, 36, 40, 0.06)',
                  border: '1px solid rgba(80, 36, 40, 0.18)',
                  fontSize: '9.5px',
                  color: '#6B4A34',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {word}
              </button>
            ))}
          </div>
        </div>

        {/* 结果列表区域 */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '4px 14px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            minHeight: '160px',
          }}
        >
          {isLoading ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px 0',
                gap: '8px',
                color: '#8A6D55',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              <Loader2 size={24} className="animate-spin" color="#502428" />
              <span>正在连通 Steam 与 AppStore 游戏数据库...</span>
            </div>
          ) : results.length > 0 ? (
            results.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectGame(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px',
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1.5px solid #502428',
                  boxShadow: '0 2px 4px rgba(80,36,40,0.1)',
                  cursor: 'pointer',
                  transition: 'transform 0.1s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                {/* 封面缩略图 */}
                <div
                  style={{
                    width: '42px',
                    height: '52px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    background: '#2B2D42',
                    border: '1px solid #502428',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.coverUrl ? (
                    <img
                      src={item.coverUrl}
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        const target = e.currentTarget as HTMLElement;
                        target.style.display = 'none';
                        if (target.parentElement) {
                          const fallback = target.parentElement.querySelector('.img-fallback') as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div
                    className="img-fallback"
                    style={{
                      display: item.coverUrl ? 'none' : 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                      background: item.platform === 'mobile' ? '#EC4899' : '#3B82F6',
                      color: '#FFFFFF',
                      fontSize: '9px',
                      fontWeight: 900,
                      textAlign: 'center',
                      padding: '2px',
                    }}
                  >
                    <span style={{ fontSize: '14px', lineHeight: 1 }}>{item.platform === 'mobile' ? '📱' : '🎮'}</span>
                    <span style={{ marginTop: '2px', transform: 'scale(0.85)', whiteSpace: 'nowrap' }}>
                      {item.title.slice(0, 3)}
                    </span>
                  </div>
                </div>

                {/* 游戏名与平台 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 900,
                      color: '#502428',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontSize: '10.5px',
                      color: '#8A6D55',
                      fontWeight: 600,
                      marginTop: '2px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.developer || item.genre || (item.source === 'steam' ? 'Steam 精选' : '手游')}
                  </div>
                </div>

                {/* 录入指示按钮 */}
                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: '8px',
                    background: '#FFF0F5',
                    border: '1px solid #502428',
                    fontSize: '10px',
                    fontWeight: 900,
                    color: '#DB2777',
                    flexShrink: 0,
                  }}
                >
                  + 入库
                </span>
              </div>
            ))
          ) : hasSearched ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '20px 0',
                gap: '10px',
              }}
            >
              <div style={{ color: '#8A6D55', fontSize: '12px', fontWeight: 700 }}>
                未找到匹配游戏
              </div>
              {query.trim() && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectGame({
                      title: query.trim(),
                      platform: engine === 'mobile' ? 'mobile' : 'steam',
                    });
                  }}
                  style={{
                    padding: '7px 14px',
                    background: '#502428',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '11.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(80,36,40,0.2)',
                  }}
                >
                  ✨ 以「{query.trim()}」直接创建私藏卡带
                </button>
              )}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '24px 0',
                color: '#8A6D55',
                fontSize: '11.5px',
                lineHeight: 1.5,
              }}
            >
              输入游戏名（如《黑神话》、《星露谷》、《原神》），
              <br />
              即可一键提取超清海报与信息入库！
            </div>
          )}
        </div>

        {/* 底部手动录入按键 */}
        <div
          style={{
            padding: '8px 14px 12px',
            borderTop: '1.5px solid rgba(80, 36, 40, 0.1)',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={() => {
              onClose();
              onOpenManual();
            }}
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #502428',
              borderRadius: '10px',
              padding: '5px 12px',
              fontSize: '11px',
              fontWeight: 800,
              color: '#502428',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 0 #502428',
            }}
          >
            <Plus size={13} />
            <span>搜不到？手动自定义录入</span>
          </button>
        </div>
      </div>
    </div>
  );
};
