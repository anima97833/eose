import React, { useState, useEffect } from 'react';
import { X, Sparkles, Orbit, Compass, RotateCcw, ShieldCheck, Zap } from 'lucide-react';
import {
  MultiverseAgentCard,
  fetchRandomMultiverseAgent,
  saveDiscoveredAgent,
  PRESET_MULTIVERSE_AGENTS,
} from '../../../../core/quest/rickAndMortyService';
import { AwardedStatResult } from '../../../../core/quest/questTypes';

interface MultiverseAgentModalProps {
  palette: string[];
  onAwardStat: (stat: AwardedStatResult) => void;
  onClose: () => void;
}

export const MultiverseAgentModal: React.FC<MultiverseAgentModalProps> = ({
  palette,
  onAwardStat,
  onClose,
}) => {
  const [agent, setAgent] = useState<MultiverseAgentCard>(PRESET_MULTIVERSE_AGENTS[0]);
  const [isLoading, setIsLoading] = useState(false);

  // 初始化加载一位随机特工
  useEffect(() => {
    let isMounted = true;
    fetchRandomMultiverseAgent().then((data) => {
      if (isMounted) {
        setAgent(data);
        saveDiscoveredAgent(data);
        // 触发敏捷 +8 加成反馈
        onAwardStat({
          key: 'DEX',
          name: '敏捷',
          icon: '🏹',
          gain: 8,
        });
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleNextWarp = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const next = await fetchRandomMultiverseAgent();
      setAgent(next);
      saveDiscoveredAgent(next);
      // 连续跃迁再给精神加成
      onAwardStat({
        key: 'SPI',
        name: '精神',
        icon: '🧠',
        gain: 3,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 200,
        background: 'rgba(5, 12, 20, 0.75)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'backdropFadeIn 0.25s ease-out',
        boxSizing: 'border-box',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '340px',
          background: 'linear-gradient(160deg, #111827 0%, #0F172A 100%)',
          borderRadius: '26px',
          border: '1.5px solid rgba(34, 197, 94, 0.55)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(34, 197, 94, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'popInSpring 0.3s cubic-bezier(0.18, 0.9, 0.32, 1.2)',
          boxSizing: 'border-box',
          position: 'relative',
          color: '#F8FAFC',
        }}
      >
        {/* 顶部传送门呼吸微光条 */}
        <div
          style={{
            height: '3px',
            width: '100%',
            background: 'linear-gradient(90deg, #10B981, #22C55E, #38BDF8, #10B981)',
            backgroundSize: '200% 100%',
            animation: 'portalGlow 3s linear infinite',
          }}
        />

        {/* Header */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid rgba(34, 197, 94, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.7)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)',
              }}
            >
              <Zap size={16} strokeWidth={2.8} />
            </div>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 900, color: '#F1F5F9', letterSpacing: '0.4px' }}>
                多元宇宙特工证件
              </span>
              <div style={{ fontSize: '8.5px', fontWeight: 800, color: '#4ADE80', letterSpacing: '0.5px' }}>
                MULTIVERSE AGENT PASS · C-137
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* 主体证件卡内容 */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* 角色立绘与关键身份 */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* 300x300px 官方高清立绘 */}
            <div
              style={{
                position: 'relative',
                width: '92px',
                height: '92px',
                borderRadius: '18px',
                overflow: 'hidden',
                border: '2px solid rgba(34, 197, 94, 0.6)',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.4), 0 0 16px rgba(34, 197, 94, 0.3)',
                flexShrink: 0,
                background: '#1E293B',
              }}
            >
              <img
                src={agent.image}
                alt={agent.nameEn}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              {/* 角标存活脉冲点 */}
              <div
                style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  padding: '2px 5px',
                  borderRadius: '6px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(4px)',
                  fontSize: '9px',
                  fontWeight: 800,
                  color: agent.status === 'Alive' ? '#4ADE80' : '#F87171',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                }}
              >
                {agent.status === 'Alive' ? '🟢 存活' : agent.status === 'Dead' ? '💀 阵亡' : '❓ 未知'}
              </div>
            </div>

            {/* 身份元信息 */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '16px', fontWeight: 900, color: '#FFFFFF', lineHeight: 1.2 }}>
                {agent.nameZh}
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700 }}>
                {agent.nameEn}
              </div>

              {/* 物种胶囊 */}
              <div style={{ marginTop: '2px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                <span
                  style={{
                    fontSize: '9.5px',
                    fontWeight: 800,
                    color: '#38BDF8',
                    background: 'rgba(56, 189, 248, 0.15)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    padding: '2px 6px',
                    borderRadius: '6px',
                  }}
                >
                  {agent.speciesZh}
                </span>
              </div>
            </div>
          </div>

          {/* 维度归属地址框 */}
          <div
            style={{
              padding: '8px 12px',
              borderRadius: '12px',
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Orbit size={14} color="#34D399" />
              <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 700 }}>所属维度宇宙</span>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#F8FAFC' }}>
              {agent.dimensionZh}
            </span>
          </div>

          {/* 经典名台词中英金句气泡 */}
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '14px',
              background: 'linear-gradient(145deg, rgba(34, 197, 94, 0.08) 0%, rgba(15, 23, 42, 0.5) 100%)',
              border: '1px dashed rgba(34, 197, 94, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#E2E8F0', lineHeight: 1.4 }}>
              {agent.quoteZh}
            </div>
            <div style={{ fontSize: '9.5px', color: '#64748B', fontStyle: 'italic', lineHeight: 1.3 }}>
              {agent.quoteEn}
            </div>
          </div>

          {/* 奖励徽章微提示 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '4px',
              color: '#4ADE80',
              fontSize: '11px',
              fontWeight: 800,
            }}
          >
            <ShieldCheck size={14} />
            <span>跨维度穿梭达成 · 敏捷 +8 已入库</span>
          </div>

          {/* 底部操作按钮 */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
            <button
              type="button"
              onClick={handleNextWarp}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '9px 0',
                borderRadius: '13px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                background: 'rgba(30, 41, 59, 0.8)',
                color: '#CBD5E1',
                fontSize: '11.5px',
                fontWeight: 800,
                cursor: isLoading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
              }}
            >
              <RotateCcw size={12} className={isLoading ? 'spin-animation' : ''} />
              <span>换个维度跃迁</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1.3,
                padding: '9px 0',
                borderRadius: '13px',
                border: 'none',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 900,
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
              }}
            >
              <Sparkles size={13} />
              <span>收下特工证件</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
