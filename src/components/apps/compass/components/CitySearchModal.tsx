import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, MapPin, Sparkles, Navigation } from 'lucide-react';
import {
  searchPresetCities,
  searchOnlinePlaces,
  POPULAR_PRESET_CITIES,
  SearchResultItem,
} from '../../../../core/compass/citySearchService';

interface CitySearchModalProps {
  onClose: () => void;
  onSelectLocation: (lat: number, lng: number, zoom: number, name: string) => void;
}

export const CitySearchModal: React.FC<CitySearchModalProps> = ({
  onClose,
  onSelectLocation,
}) => {
  const [query, setQuery] = useState<string>('');
  const [onlineResults, setOnlineResults] = useState<SearchResultItem[]>([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState<boolean>(false);

  // 本地预置结果实时响应
  const localResults = useMemo(() => {
    return searchPresetCities(query);
  }, [query]);

  // 防抖在线搜索（针对用户搜索具体胡同、商场、学校等）
  useEffect(() => {
    const q = query.trim();
    if (!q || q.length < 2) {
      setOnlineResults([]);
      setIsSearchingOnline(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingOnline(true);
      const res = await searchOnlinePlaces(q);
      setOnlineResults(res);
      setIsSearchingOnline(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [query]);

  // 合并结果
  const combinedResults = useMemo(() => {
    const map = new Map<string, SearchResultItem>();
    localResults.forEach((item) => map.set(`${item.lat.toFixed(3)},${item.lng.toFixed(3)}`, item));
    onlineResults.forEach((item) => {
      const key = `${item.lat.toFixed(3)},${item.lng.toFixed(3)}`;
      if (!map.has(key)) map.set(key, item);
    });
    return Array.from(map.values());
  }, [localResults, onlineResults]);

  // 快捷热门地标
  const quickTags = [
    { label: '🔥 天津市', lat: 39.1256, lng: 117.1902, zoom: 14 },
    { label: '五大道', lat: 39.1098, lng: 117.1985, zoom: 16 },
    { label: '天津之眼', lat: 39.1528, lng: 117.1818, zoom: 16 },
    { label: '海河津湾', lat: 39.1315, lng: 117.2062, zoom: 16 },
    { label: '北京', lat: 39.9042, lng: 116.4074, zoom: 14 },
    { label: '上海', lat: 31.2304, lng: 121.4737, zoom: 14 },
    { label: '成都', lat: 30.5728, lng: 104.0668, zoom: 14 },
    { label: '杭州', lat: 30.2741, lng: 120.1551, zoom: 14 },
  ];

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(6px)',
        zIndex: 2500,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '16px 12px 12px',
        boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxHeight: '88%',
          backgroundColor: '#ebf1f8',
          borderRadius: '24px',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.28), inset 1px 1px 2px #ffffff',
          padding: '16px 14px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          animation: 'slideDownSearch 0.22s ease-out',
        }}
      >
        <style>{`
          @keyframes slideDownSearch {
            from { transform: translateY(-20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>

        {/* 搜索输入栏 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '16px',
              background: '#e0e9f4',
              boxShadow: 'inset 2px 2px 5px rgba(166, 180, 200, 0.6), inset -2px -2px 5px #ffffff',
            }}
          >
            <Search size={16} color="#5096C6" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索城市、街区或地名 (如: 天津, 五大道)"
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                fontSize: '13px',
                color: '#1a202c',
                outline: 'none',
              }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              background: '#e0e8f3',
              boxShadow: '2px 2px 5px rgba(166, 180, 200, 0.6), -2px -2px 5px #ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#718096',
              flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* 快捷热门标签 */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#718096', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={11} color="#e53935" />
            <span>直达街区 / 热门城市</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {quickTags.map((tag) => (
              <button
                key={tag.label}
                onClick={() => {
                  onSelectLocation(tag.lat, tag.lng, tag.zoom, tag.label);
                  onClose();
                }}
                style={{
                  padding: '5px 10px',
                  borderRadius: '12px',
                  border: 'none',
                  background: tag.label.includes('天津') ? '#e6f7ff' : '#e7edf6',
                  color: tag.label.includes('天津') ? '#096dd9' : '#4a5568',
                  boxShadow: '2px 2px 5px rgba(166, 180, 200, 0.5), -2px -2px 5px #ffffff',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <MapPin size={11} />
                <span>{tag.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 搜索结果列表 */}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: '140px', maxHeight: '280px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {isSearchingOnline && (
            <div style={{ fontSize: '11px', color: '#5096C6', padding: '6px', textAlign: 'center' }}>
              正在全国地图中检索地标街区...
            </div>
          )}

          {query && combinedResults.length === 0 && !isSearchingOnline && (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8', fontSize: '12px' }}>
              未找到匹配街区，试试搜索“天津”或具体城市名
            </div>
          )}

          {combinedResults.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                onSelectLocation(item.lat, item.lng, item.zoom, item.name);
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '14px',
                background: '#f1f5fa',
                boxShadow: '2px 2px 5px rgba(166, 180, 200, 0.4), -1px -1px 3px #ffffff',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: '#e0e9f4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#5096C6',
                  }}
                >
                  <MapPin size={14} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a202c' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '10px', color: '#718096', maxWidth: '210px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.detail}
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#5096C6',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                }}
              >
                <span>飞往</span>
                <Navigation size={12} />
              </div>
            </div>
          ))}

          {!query && (
            <div style={{ marginTop: '6px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#718096', marginBottom: '6px' }}>
                精选常探街区
              </div>
              {POPULAR_PRESET_CITIES.slice(0, 5).map((item) => (
                <div
                  key={item.name}
                  onClick={() => {
                    onSelectLocation(item.lat, item.lng, item.zoom, item.name);
                    onClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '12px',
                    background: '#eef3f9',
                    marginBottom: '5px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: '12px', color: '#2d3748', fontWeight: 600 }}>{item.name}</div>
                  <span style={{ fontSize: '10px', color: '#5096C6' }}>直达 →</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
