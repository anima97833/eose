import React, { useState, useEffect } from 'react';
import { HoroscopeData, getTodayHoroscope, getUserZodiacName } from '../../../core/horoscope/horoscopeService';
import { HoroscopeModal } from './HoroscopeModal';
import { Sparkles, ChevronRight } from 'lucide-react';

interface HoroscopeWidgetProps {
  onOpenModal?: (data: HoroscopeData) => void;
}

export const HoroscopeWidget: React.FC<HoroscopeWidgetProps> = ({ onOpenModal }) => {
  const [data, setData] = useState<HoroscopeData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 初始化加载今日运势
  useEffect(() => {
    let isMounted = true;
    getTodayHoroscope().then((res) => {
      if (isMounted) {
        setData(res);
      }
    });

    // 监听 RPG 用户档案更新（若在个人中心切换了星座，主页运势即刻同步响应）
    const handleProfileUpdate = () => {
      getTodayHoroscope(getUserZodiacName()).then((res) => {
        if (isMounted) {
          setData(res);
        }
      });
    };

    window.addEventListener('cloudfly_rpg_updated', handleProfileUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('cloudfly_rpg_updated', handleProfileUpdate);
    };
  }, []);

  if (!data) {
    return (
      <div
        className="nm-card-sm"
        style={{
          borderRadius: '16px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FFFFFF',
        }}
      >
        <Sparkles size={16} className="animate-spin" color="#818CF8" />
      </div>
    );
  }

  return (
    <>
      <div
        onClick={() => {
          if (onOpenModal) {
            onOpenModal(data);
          } else {
            setIsModalOpen(true);
          }
        }}
        className="nm-card-sm"
        title="点击查看今日完整星盘手账"
        style={{
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRadius: '16px',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box',
          background: '#FFFFFF',
          cursor: 'pointer',
          transition: 'transform 0.12s ease',
        }}
      >
        {/* 顶部 Header: 星座符号/名称 + 综合星级 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 900,
                color: '#6366F1',
                lineHeight: 1,
              }}
            >
              {data.signSymbol}
            </span>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 900,
                color: '#334155',
                letterSpacing: '0.3px',
                fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
              }}
            >
              {data.title}
            </span>
          </div>

          {/* 综合星级 */}
          <div style={{ display: 'flex', gap: '1px', color: '#F59E0B' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} style={{ fontSize: '10px', lineHeight: 1 }}>
                {i < data.fortuneStar ? '★' : '☆'}
              </span>
            ))}
          </div>
        </div>

        {/* 中间短评区: 一句短评 */}
        <div
          style={{
            margin: '3px 0',
            padding: '6px 8px',
            borderRadius: '10px',
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            minHeight: '46px',
            boxSizing: 'border-box',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#334155',
              lineHeight: '1.35',
            }}
          >
            “ {data.shortComment} ”
          </span>
        </div>

        {/* 底部微标: 今日宜 / 忌 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '6px',
            width: '100%',
          }}
        >
          <span
            style={{
              flex: 1,
              padding: '3px 4px',
              borderRadius: '8px',
              background: '#F0FDF4',
              color: '#15803D',
              border: '1px solid #BBF7D0',
              fontSize: '9.5px',
              fontWeight: 800,
              textAlign: 'center',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {data.todo.yi}
          </span>
          <span
            style={{
              flex: 1,
              padding: '3px 4px',
              borderRadius: '8px',
              background: '#FEF2F2',
              color: '#B91C1C',
              border: '1px solid #FECACA',
              fontSize: '9.5px',
              fontWeight: 800,
              textAlign: 'center',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {data.todo.ji}
          </span>
        </div>
      </div>

      {/* 完整运势手账浮窗（作为独立嵌入时的 fallback） */}
      {!onOpenModal && isModalOpen && (
        <HoroscopeModal data={data} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
};
