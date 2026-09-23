import React, { useState } from 'react';
import { X, Search, Globe2, Radio as RadioIcon, Sparkles, RefreshCw } from 'lucide-react';
import {
  RadioStation,
  PRESET_STATIONS,
  fetchRadioBrowserChinaStations,
  searchRadioBrowser,
} from '../../../../core/radio/radioService';

interface RadioSourceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentStationId: string;
  onSelectStation: (station: RadioStation) => void;
  accentColor: string;
}

export const RadioSourceDrawer: React.FC<RadioSourceDrawerProps> = ({
  isOpen,
  onClose,
  currentStationId,
  onSelectStation,
  accentColor,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'china_online' | 'search'>('presets');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<RadioStation[]>([]);
  const [chinaStations, setChinaStations] = useState<RadioStation[]>([]);
  const [isLoadingChina, setIsLoadingChina] = useState(false);

  if (!isOpen) return null;

  // 加载国内 Radio Browser 在线台
  const handleLoadChina = async () => {
    setIsLoadingChina(true);
    const list = await fetchRadioBrowserChinaStations(25);
    setChinaStations(list);
    setIsLoadingChina(false);
  };

  // 搜索
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchKeyword.trim()) return;
    setIsSearching(true);
    const list = await searchRadioBrowser(searchKeyword.trim(), 20);
    setSearchResults(list);
    setIsSearching(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxHeight: '80vh',
          background: 'var(--nm-bg, #E9EEF5)',
          borderTopLeftRadius: '26px',
          borderTopRightRadius: '26px',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'drawerSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* 顶部标题与关闭 */}
        <div
          style={{
            padding: '14px 16px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(166, 180, 200, 0.25)',
            background: 'var(--nm-bg-lighter, #F2F6FB)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <Globe2 size={18} style={{ color: accentColor }} />
            <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--nm-text-main)' }}>
              电台换源与全球电台库
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="nm-rebound-btn nm-btn-circle"
            style={{ width: '32px', height: '32px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* 分类 Tab 切换 */}
        <div
          style={{
            display: 'flex',
            padding: '8px 14px',
            gap: '8px',
            background: 'var(--nm-bg)',
            borderBottom: '1px solid rgba(166, 180, 200, 0.15)',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            style={{
              flex: 1,
              padding: '7px 0',
              borderRadius: '12px',
              border: 'none',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeTab === 'presets' ? accentColor : 'rgba(255,255,255,0.6)',
              color: activeTab === 'presets' ? '#FFFFFF' : '#64748B',
              transition: 'all 0.2s ease',
            }}
          >
            📻 官方精选 ({PRESET_STATIONS.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('china_online');
              if (chinaStations.length === 0) handleLoadChina();
            }}
            style={{
              flex: 1,
              padding: '7px 0',
              borderRadius: '12px',
              border: 'none',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeTab === 'china_online' ? accentColor : 'rgba(255,255,255,0.6)',
              color: activeTab === 'china_online' ? '#FFFFFF' : '#64748B',
              transition: 'all 0.2s ease',
            }}
          >
            🇨🇳 国内在线源
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            style={{
              flex: 1,
              padding: '7px 0',
              borderRadius: '12px',
              border: 'none',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeTab === 'search' ? accentColor : 'rgba(255,255,255,0.6)',
              color: activeTab === 'search' ? '#FFFFFF' : '#64748B',
              transition: 'all 0.2s ease',
            }}
          >
            🔍 全球搜台
          </button>
        </div>

        {/* 搜索模式输入框 */}
        {activeTab === 'search' && (
          <form
            onSubmit={handleSearch}
            style={{
              padding: '10px 14px',
              display: 'flex',
              gap: '8px',
              borderBottom: '1px solid rgba(166, 180, 200, 0.15)',
            }}
          >
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0 10px',
                borderRadius: '12px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
              }}
            >
              <Search size={15} color="#94A3B8" />
              <input
                type="text"
                placeholder="搜索城市或电台（如 北京、香港、爵士、Lofi）"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '12px',
                  height: '34px',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              style={{
                padding: '0 14px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: accentColor,
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {isSearching ? '搜索中...' : '搜索'}
            </button>
          </form>
        )}

        {/* 列表渲染区 */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 14px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {activeTab === 'presets' &&
            PRESET_STATIONS.map((station) => renderStationCard(station))}

          {activeTab === 'china_online' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#64748B' }}>
                  从 Radio Browser 公共库实时聚合国内广播源
                </span>
                <button
                  type="button"
                  onClick={handleLoadChina}
                  disabled={isLoadingChina}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    background: 'none',
                    border: 'none',
                    color: accentColor,
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  <RefreshCw size={12} className={isLoadingChina ? 'animate-spin' : ''} />
                  <span>刷新源</span>
                </button>
              </div>
              {isLoadingChina ? (
                <div style={{ textAlign: 'center', padding: '30px 0', fontSize: '13px', color: '#64748B' }}>
                  正在连接 Radio Browser API 拉取国内电台...
                </div>
              ) : chinaStations.length > 0 ? (
                chinaStations.map((station) => renderStationCard(station))
              ) : (
                <div style={{ textAlign: 'center', padding: '30px 0', fontSize: '13px', color: '#64748B' }}>
                  点击右上角刷新拉取国内广播
                </div>
              )}
            </>
          )}

          {activeTab === 'search' && (
            <>
              {isSearching ? (
                <div style={{ textAlign: 'center', padding: '30px 0', fontSize: '13px', color: '#64748B' }}>
                  正在全球 90,000+ 电台库中检索...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((station) => renderStationCard(station))
              ) : (
                <div style={{ textAlign: 'center', padding: '30px 0', fontSize: '12px', color: '#94A3B8' }}>
                  输入关键词检索你想收听的国内或全球电台
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes drawerSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );

  function renderStationCard(station: RadioStation) {
    const isSelected = station.id === currentStationId;
    return (
      <div
        key={station.id}
        onClick={() => {
          onSelectStation(station);
          onClose();
        }}
        style={{
          padding: '10px 12px',
          borderRadius: '14px',
          background: isSelected ? 'var(--nm-bg-lighter, #FFFFFF)' : 'rgba(255, 255, 255, 0.65)',
          border: isSelected ? `1.5px solid ${accentColor}` : '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: isSelected ? `0 4px 12px ${accentColor}25` : '0 1px 3px rgba(0, 0, 0, 0.04)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.2s ease',
        }}
      >
        <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: isSelected ? accentColor : '#64748B',
                fontFamily: 'monospace',
              }}
            >
              {station.frequency}
            </span>
            <span
              style={{
                fontSize: '9.5px',
                padding: '1px 5px',
                borderRadius: '4px',
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                color: '#64748B',
              }}
            >
              {station.categoryLabel}
            </span>
            {station.bitrate && (
              <span style={{ fontSize: '9px', color: '#94A3B8' }}>{station.bitrate}</span>
            )}
          </div>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: isSelected ? 'var(--nm-text-main)' : '#334155',
              marginTop: '2px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {station.name}
          </div>
          <div
            style={{
              fontSize: '10px',
              color: '#94A3B8',
              marginTop: '1px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {station.description}
          </div>
        </div>

        <button
          type="button"
          style={{
            padding: '5px 10px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: isSelected ? accentColor : '#F1F5F9',
            color: isSelected ? '#FFFFFF' : '#475569',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          {isSelected ? '收听中' : '播放'}
        </button>
      </div>
    );
  }
};
