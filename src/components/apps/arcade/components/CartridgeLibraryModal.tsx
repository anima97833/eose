import React, { useRef } from 'react';
import { X, Upload, Trash2, Play, Sparkles } from 'lucide-react';
import { SWFGame } from '../../../../core/arcade/arcadeTypes';

interface CartridgeLibraryModalProps {
  games: SWFGame[];
  activeGameId: string | null;
  onSelectGame: (game: SWFGame) => void;
  onImportFile: (file: File) => Promise<void>;
  onDeleteGame: (id: string) => Promise<void>;
  onClose: () => void;
}

export const CartridgeLibraryModal: React.FC<CartridgeLibraryModalProps> = ({
  games,
  activeGameId,
  onSelectGame,
  onImportFile,
  onDeleteGame,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await onImportFile(files[0]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 120,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '340px',
          maxHeight: '85%',
          background: '#E2E8F0',
          border: '3px solid #334155',
          borderRadius: '24px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 顶部标题条 */}
        <div
          style={{
            background: 'linear-gradient(180deg, #475569 0%, #334155 100%)',
            borderBottom: '2.5px solid #1E293B',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '16px' }}>📼</span>
            <span
              style={{
                fontSize: '15px',
                fontWeight: 900,
                color: '#F8FAFC',
                fontFamily: '"ZCOOL KuaiLe", sans-serif',
                letterSpacing: '0.5px',
              }}
            >
              卡带收纳盒（SWF游戏库）
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: '#FFFFFF',
              border: '2px solid #1E293B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <X size={14} color="#1E293B" strokeWidth={3} />
          </button>
        </div>

        {/* 隐藏的真实文件选取器 */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".swf"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {/* 卡带列表区 */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {/* 上传新卡带按钮 */}
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '16px',
              background: '#F1F5F9',
              border: '2px dashed #64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Upload size={16} color="#2563EB" strokeWidth={2.5} />
            <span
              style={{
                fontSize: '13px',
                fontWeight: 900,
                color: '#1E293B',
                fontFamily: '"ZCOOL KuaiLe", sans-serif',
              }}
            >
              + 导入本地 .swf 游戏
            </span>
          </button>

          <div
            style={{
              fontSize: '11px',
              color: '#64748B',
              textAlign: 'center',
              lineHeight: 1.4,
              padding: '2px 4px 4px',
            }}
          >
            ⚡ <strong>内存即开即玩</strong>：SWF游戏仅在当前网页会话中加载运行，不占用永久磁盘空间，零存储负担。
          </div>

          {/* 游戏卡带列表 */}
          {games.length === 0 ? (
            <div
              style={{
                padding: '30px 10px',
                textAlign: 'center',
                color: '#64748B',
                fontSize: '12px',
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>🕹️</div>
              卡带盒空空如也~
              <br />
              快点击上方按钮导入电脑中的 .swf 经典游戏吧！
            </div>
          ) : (
            games.map((g) => {
              const isSelected = g.id === activeGameId;
              return (
                <div
                  key={g.id}
                  onClick={() => onSelectGame(g)}
                  style={{
                    borderRadius: '14px',
                    background: '#FFFFFF',
                    border: isSelected ? '2.5px solid #2563EB' : '2px solid #CBD5E1',
                    boxShadow: isSelected
                      ? '0 4px 12px rgba(37,99,235,0.25), inset 0 0 0 2px #93C5FD'
                      : '0 2px 4px rgba(0,0,0,0.05)',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, overflow: 'hidden' }}>
                    {/* 卡带小图标 */}
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: g.color || '#60A5FA',
                        border: '2px solid #334155',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        boxShadow: '0 2px 0 #334155',
                        flexShrink: 0,
                      }}
                    >
                      {g.coverEmoji || '🎮'}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 800,
                          color: '#1E293B',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {g.title}
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                        大小: {formatSize(g.fileSize)}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectGame(g);
                      }}
                      title="插入运行"
                      style={{
                        padding: '4px 10px',
                        borderRadius: '10px',
                        background: isSelected ? '#2563EB' : '#10B981',
                        border: '1.5px solid #1E293B',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: 900,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        boxShadow: '0 1.5px 0 #1E293B',
                      }}
                    >
                      <Play size={10} fill="#FFFFFF" />
                      {isSelected ? '运行中' : '运行'}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteGame(g.id);
                      }}
                      title="删除卡带"
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '8px',
                        background: '#FEE2E2',
                        border: '1.5px solid #DC2626',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      <Trash2 size={13} color="#DC2626" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
