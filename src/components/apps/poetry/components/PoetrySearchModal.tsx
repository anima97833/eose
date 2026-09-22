import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Sparkles, Plus, Check, Loader2 } from 'lucide-react';
import { PoetryOnlineItem, SavedPoemRecord } from '../../../../core/poetry/poetryTypes';
import { searchPoetryOnline, fetchRandomPoemOnline } from '../../../../core/poetry/poetryApi';

interface PoetrySearchModalProps {
  onClose: () => void;
  onAddPoem: (poem: SavedPoemRecord) => void;
  existingIds: Set<string>;
}

const HOT_TAGS = ['李白', '苏轼', '辛弃疾', '杜甫', '李清照', '王维', '白居易', '春江花月夜'];

export const PoetrySearchModal: React.FC<PoetrySearchModalProps> = ({
  onClose,
  onAddPoem,
  existingIds,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PoetryOnlineItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSearch = async (searchTerm: string) => {
    const text = searchTerm.trim();
    if (!text) {
      setResults([]);
      setErrorMsg(null);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const items = await searchPoetryOnline(text, controller.signal, 1, 15);
      setResults(items);
      if (items.length === 0) {
        setErrorMsg('未寻得对应诗篇，可换个诗名或诗人重试');
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        setErrorMsg('检索超时或暂不可达，请稍后重试');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 输入防抖 450ms
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      handleSearch(query);
    }, 450);

    return () => clearTimeout(timer);
  }, [query]);

  // 随机赐篇
  const handleRandomPoem = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const poem = await fetchRandomPoemOnline();
      if (poem) {
        setResults([poem]);
      } else {
        setErrorMsg('随机寻诗失败，请重试');
      }
    } catch {
      setErrorMsg('云端寻诗偶遇波动');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCollect = (item: PoetryOnlineItem) => {
    const recordId = `p_${item.id}`;
    const newRecord: SavedPoemRecord = {
      id: recordId,
      title: item.title,
      author: item.author?.name || '佚名',
      dynasty: item.dynasty?.name || '唐',
      type: item.type?.name || '诗',
      content: item.content,
      status: 'learning',
      isFavorite: false,
      quizPassCount: 0,
      createdAt: new Date().toISOString(),
    };

    onAddPoem(newRecord);
    setAddedIds((prev) => new Set([...prev, recordId]));
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(28, 22, 16, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#faf6ef',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          maxHeight: '88%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -10px 35px rgba(0, 0, 0, 0.3)',
          borderTop: '2px solid #b0894c',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部标题与关闭按钮 */}
        <div
          style={{
            padding: '16px 20px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #ebdfcd',
            background: 'linear-gradient(180deg, #f7f0e3 0%, #faf6ef 100%)',
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: '1.15rem',
                fontWeight: 700,
                color: '#2d2319',
                fontFamily: '"Songti SC", "SimSun", serif',
                letterSpacing: '0.04em',
              }}
            >
              寻觅典藏诗篇
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: '0.75rem', color: '#82715e' }}>
              云端汇聚 37 万首中华古诗词 · 随心搜录
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* 随机赐篇 */}
            <button
              type="button"
              onClick={handleRandomPoem}
              disabled={isLoading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 10px',
                borderRadius: 8,
                border: '1px solid #d8caa7',
                background: '#fffdf9',
                color: '#85632b',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Sparkles size={14} />
              <span>随缘赐篇</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                padding: 6,
                cursor: 'pointer',
                color: '#8a7966',
                borderRadius: '50%',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 搜索栏 */}
        <div style={{ padding: '12px 16px 8px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              border: '1.5px solid #d9cdb8',
              borderRadius: 12,
              padding: '8px 12px',
              gap: 8,
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <Search size={18} color="#9a8670" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜诗人/篇名/佳句，如 将进酒、苏轼…"
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '0.9rem',
                color: '#2a2016',
                fontFamily: '"Songti SC", "SimSun", serif',
              }}
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 2,
                  cursor: 'pointer',
                  color: '#aaa',
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* 快捷名家热词 */}
          <div
            style={{
              display: 'flex',
              gap: 6,
              overflowX: 'auto',
              paddingTop: 8,
              paddingBottom: 4,
              scrollbarWidth: 'none',
            }}
          >
            {HOT_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setQuery(tag)}
                style={{
                  whiteSpace: 'nowrap',
                  fontSize: '0.74rem',
                  padding: '3px 9px',
                  borderRadius: 6,
                  border: '1px solid #e1d6c3',
                  background: '#f4ede0',
                  color: '#6e5a42',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* 结果展示列表 */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px 16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
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
                color: '#8a755d',
                gap: 8,
              }}
            >
              <Loader2 size={24} className="animate-spin" />
              <span style={{ fontSize: '0.85rem' }}>墨香翻涌中…</span>
            </div>
          )}

          {!isLoading && errorMsg && (
            <div
              style={{
                textAlign: 'center',
                padding: '32px 16px',
                color: '#8b7965',
                fontSize: '0.86rem',
              }}
            >
              {errorMsg}
            </div>
          )}

          {!isLoading && results.length === 0 && !errorMsg && !query && (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 16px',
                color: '#9e8d7b',
                fontSize: '0.85rem',
              }}
            >
              输入诗题、词句或名家，即刻自海量诗海中撷取
            </div>
          )}

          {!isLoading &&
            results.map((item) => {
              const recordId = `p_${item.id}`;
              const isAlreadyIn = existingIds.has(recordId) || addedIds.has(recordId);

              return (
                <div
                  key={item.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e4d8c5',
                    borderRadius: 12,
                    padding: '12px 14px',
                    boxShadow: '0 2px 6px rgba(100, 80, 50, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '0.96rem',
                          color: '#292117',
                          fontFamily: '"Songti SC", "SimSun", serif',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '180px',
                        }}
                      >
                        {item.title}
                      </span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          padding: '1px 5px',
                          borderRadius: 4,
                          background: '#f2e8d7',
                          color: '#7a5a32',
                          fontWeight: 600,
                        }}
                      >
                        {item.dynasty?.name || '唐'}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#665747' }}>
                        {item.author?.name || '佚名'}
                      </span>
                    </div>

                    {/* 收录按钮 */}
                    <button
                      type="button"
                      disabled={isAlreadyIn}
                      onClick={() => handleCollect(item)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                        padding: '4px 10px',
                        borderRadius: 6,
                        border: isAlreadyIn ? '1px solid #d3c9b7' : '1px solid #b91c1c',
                        background: isAlreadyIn ? '#f5f0e6' : '#dc2626',
                        color: isAlreadyIn ? '#8c7b68' : '#ffffff',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: isAlreadyIn ? 'default' : 'pointer',
                      }}
                    >
                      {isAlreadyIn ? (
                        <>
                          <Check size={13} strokeWidth={2.4} />
                          <span>已收录</span>
                        </>
                      ) : (
                        <>
                          <Plus size={13} strokeWidth={2.4} />
                          <span>收录</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* 预览前两句诗 */}
                  <div
                    style={{
                      fontSize: '0.84rem',
                      color: '#4f4436',
                      lineHeight: 1.5,
                      fontFamily: '"Songti SC", "SimSun", serif',
                      background: '#fcfaf6',
                      padding: '6px 8px',
                      borderRadius: 6,
                      border: '1px dashed #ede3d3',
                    }}
                  >
                    {item.content.slice(0, 2).map((l, i) => (
                      <div key={i}>{l}</div>
                    ))}
                    {item.content.length > 2 && (
                      <div style={{ color: '#a08f7e', fontSize: '0.72rem', marginTop: 2 }}>
                        …… 篇幅共 {item.content.length} 行
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
