import React from 'react';
import { Sparkles, Trophy, Award, ArrowUpRight, Check, Flame, Star, ShieldCheck } from 'lucide-react';
import { DailySettlementSnapshot, RPGProfile } from '../../../../core/rpg/types';
import { ATTR_CHINESE_NAMES } from '../../../../core/rpg/dailySettlementEngine';
import { computeAttributeMax } from '../../../../core/rpg/rpgStorage';
import { WishWandIcon } from './WishWandIcon';

interface DailySettlementModalProps {
  snapshot: DailySettlementSnapshot;
  onClaim: () => void;
}

export const DailySettlementModal: React.FC<DailySettlementModalProps> = ({
  snapshot,
  onClaim,
}) => {
  const ratingBadgeStyles: Record<
    DailySettlementSnapshot['rating'],
    { bg: string; border: string; color: string; shadow: string }
  > = {
    S: {
      bg: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 50%, #D97706 100%)',
      border: '2px solid #78350F',
      color: '#451A03',
      shadow: '0 4px 14px rgba(245, 158, 11, 0.45)',
    },
    A: {
      bg: 'linear-gradient(135deg, #DDD6FE 0%, #A78BFA 50%, #7C3AED 100%)',
      border: '2px solid #4C1D95',
      color: '#2E1065',
      shadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
    },
    B: {
      bg: 'linear-gradient(135deg, #BAE6FD 0%, #38BDF8 50%, #0284C7 100%)',
      border: '2px solid #075985',
      color: '#082F49',
      shadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
    },
    C: {
      bg: 'linear-gradient(135deg, #F1F5F9 0%, #CBD5E1 50%, #94A3B8 100%)',
      border: '2px solid #475569',
      color: '#1E293B',
      shadow: '0 4px 10px rgba(148, 163, 184, 0.25)',
    },
  };

  const badgeStyle = ratingBadgeStyles[snapshot.rating];
  const newAttrCap = computeAttributeMax(snapshot.newLevel);
  const expPercent = Math.min(100, Math.round((snapshot.newExp / snapshot.maxExp) * 100));

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 120,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      {/* 战报羊皮纸主卡 */}
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          backgroundColor: '#FFFDF9',
          borderRadius: '26px',
          border: '3px solid #3E1F1A',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* 顶部封边木纹横梁 */}
        <div
          style={{
            height: '48px',
            background: 'linear-gradient(180deg, #F59E0B 0%, #D97706 70%, #B45309 100%)',
            borderBottom: '2.5px solid #78350F',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* 两侧皮带固定扣 */}
          <div
            style={{
              position: 'absolute',
              left: '18px',
              width: '10px',
              height: '18px',
              borderRadius: '4px',
              background: '#78350F',
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: '18px',
              width: '10px',
              height: '18px',
              borderRadius: '4px',
              background: '#78350F',
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4)',
            }}
          />

          <span
            style={{
              fontSize: '16px',
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '2px',
              textShadow: '0 1.5px 2px rgba(0, 0, 0, 0.4)',
              fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", "幼圆", cursive, sans-serif',
            }}
          >
            📜 昨日修行业报 · 每日结算
          </span>
        </div>

        {/* 内部内容区 */}
        <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* 评级大印章与日期 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FEF9C3',
              padding: '8px 12px',
              borderRadius: '16px',
              border: '1.5px dashed #F59E0B',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '11px', color: '#78350F', fontWeight: 600 }}>
                📅 统计周期: <b>{snapshot.dateStr}</b>
              </span>
              <span style={{ fontSize: '13px', color: '#92400E', fontWeight: 900 }}>
                昨日总评:「<b>{snapshot.ratingTitle}</b>」
              </span>
            </div>

            {/* 火漆印章风格评级徽章 */}
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: badgeStyle.bg,
                border: badgeStyle.border,
                boxShadow: badgeStyle.shadow,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: badgeStyle.color,
                fontSize: '22px',
                fontWeight: 900,
                fontFamily: '"ZCOOL KuaiLe", "Arial Black", sans-serif',
              }}
            >
              {snapshot.rating}
            </div>
          </div>

          {/* 六维属性表现网格 */}
          <div>
            <div
              style={{
                fontSize: '11.5px',
                fontWeight: 800,
                color: '#475569',
                marginBottom: '5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>📊 昨日六维修炼总计 ({snapshot.totalAttr} 点)</span>
              <span style={{ fontSize: '10px', color: '#D97706' }}>最高项: {ATTR_CHINESE_NAMES[snapshot.highestAttrKey]}</span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: '4px',
              }}
            >
              {(['STR', 'DEX', 'INT', 'SPI', 'CON', 'CHA'] as const).map((key) => {
                const val = snapshot.attributes[key] || 0;
                const isHighest = key === snapshot.highestAttrKey && val > 0;
                return (
                  <div
                    key={key}
                    style={{
                      padding: '5px 2px',
                      borderRadius: '10px',
                      backgroundColor: isHighest ? '#FEF3C7' : '#F8FAFC',
                      border: isHighest ? '1.5px solid #F59E0B' : '1px solid #E2E8F0',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative',
                    }}
                  >
                    {isHighest && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '-6px',
                          right: '-3px',
                          fontSize: '10px',
                        }}
                      >
                        🔥
                      </div>
                    )}
                    <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 700 }}>
                      {ATTR_CHINESE_NAMES[key]}
                    </span>
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 900,
                        color: isHighest ? '#B45309' : val > 0 ? '#1E293B' : '#94A3B8',
                      }}
                    >
                      {val > 0 ? `+${val}` : '0'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 经验转化计算明细 */}
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: '#F8FAFC',
              borderRadius: '14px',
              border: '1.5px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              fontSize: '11px',
              color: '#334155',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>基础六维经验转化 (1:1):</span>
              <b>+{snapshot.baseExp} EXP</b>
            </div>

            {snapshot.breakthroughBonusRate > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#B45309' }}>
                <span>🌟 专精突破加成 ({ATTR_CHINESE_NAMES[snapshot.highestAttrKey]} ≥ {snapshot.highestAttrVal >= 80 ? '80' : '50'}):</span>
                <b>+{Math.round(snapshot.breakthroughBonusRate * 100)}%</b>
              </div>
            )}

            {snapshot.harmonyBonusRate > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#7C3AED' }}>
                <span>✨ 均衡共鸣加成 (多维身心兼修):</span>
                <b>+{Math.round(snapshot.harmonyBonusRate * 100)}%</b>
              </div>
            )}

            <div
              style={{
                marginTop: '4px',
                paddingTop: '4px',
                borderTop: '1px dashed #CBD5E1',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '12px',
                color: '#059669',
                fontWeight: 900,
              }}
            >
              <span>今日沉淀总经验:</span>
              <span style={{ fontSize: '15px' }}>+{snapshot.totalExpEarned} EXP</span>
            </div>
          </div>

          {/* 升级特效横幅（若升级） */}
          {snapshot.leveledUp ? (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #FEF08A 0%, #F59E0B 100%)',
                border: '2px solid #78350F',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                color: '#451A03',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', fontWeight: 900 }}>
                <Trophy size={18} color="#78350F" />
                <span>LEVEL UP! 角色等级提升</span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 800 }}>
                Lv. {snapshot.oldLevel} ➔ <b>Lv. {snapshot.newLevel}</b>
              </div>
              <div style={{ fontSize: '10.5px', color: '#78350F', fontWeight: 600 }}>
                ⚡ 全六维属性上限已扩充至 <b>{newAttrCap}</b> 点！
              </div>
            </div>
          ) : (
            /* 未升级时的等级进度条 */
            <div
              style={{
                padding: '8px 12px',
                borderRadius: '12px',
                backgroundColor: '#F1F5F9',
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 800, color: '#334155' }}>
                <span>等级: Lv. {snapshot.newLevel}</span>
                <span>
                  {snapshot.newExp} / {snapshot.maxExp} EXP ({expPercent}%)
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '7px',
                  borderRadius: '4px',
                  backgroundColor: '#E2E8F0',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${expPercent}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #38BDF8 0%, #2563EB 100%)',
                    borderRadius: '4px',
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
            </div>
          )}

          {/* 额外物资奖励条（钻石 / 碎片 / 升级许愿券） */}
          {((snapshot.diamondReward && snapshot.diamondReward > 0) ||
            (snapshot.shardReward && snapshot.shardReward > 0) ||
            (snapshot.wishVoucherReward && snapshot.wishVoucherReward > 0)) && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 12px',
                backgroundColor: '#ECFDF5',
                borderRadius: '12px',
                border: '1.5px solid #6EE7B7',
                fontSize: '11px',
                color: '#065F46',
                fontWeight: 800,
              }}
            >
              <span>🎁 自律犒赏物资:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {snapshot.diamondReward && snapshot.diamondReward > 0 && (
                  <span>💎 完整钻石 +{snapshot.diamondReward}</span>
                )}
                {snapshot.shardReward && snapshot.shardReward > 0 && (
                  <span>✨ 钻石碎片 +{snapshot.shardReward}</span>
                )}
                {snapshot.wishVoucherReward && snapshot.wishVoucherReward > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#B45309' }}>
                    <WishWandIcon size={13} />
                    <span>许愿券 +{snapshot.wishVoucherReward}</span>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 底部一键确认领取胶囊大按钮 */}
          <button
            onClick={onClaim}
            style={{
              marginTop: '4px',
              width: '100%',
              height: '46px',
              borderRadius: '24px',
              border: '2.5px solid #14532D',
              background: 'linear-gradient(180deg, #86EFAC 0%, #22C55E 50%, #15803D 100%)',
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: 900,
              letterSpacing: '1.5px',
              fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", "幼圆", cursive, sans-serif',
              textShadow: '0 1.5px 2px rgba(0, 0, 0, 0.45)',
              cursor: 'pointer',
              boxShadow: '0 6px 14px rgba(34, 197, 94, 0.45), inset 0 2px 2px rgba(255, 255, 255, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* 果冻顶部反光条 */}
            <div
              style={{
                position: 'absolute',
                top: '2px',
                left: '10%',
                right: '10%',
                height: '14px',
                borderRadius: '10px',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 100%)',
                pointerEvents: 'none',
              }}
            />
            <Check size={18} strokeWidth={3} />
            <span>收下修行业报 · 开启新的一天</span>
          </button>
        </div>
      </div>
    </div>
  );
};
