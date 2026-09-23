import React, { useState, useEffect } from 'react';
import { X, Check, Lock, Sparkles, MessageCircle, AlertTriangle } from 'lucide-react';
import { RPGProfile } from '../../../../core/rpg/types';
import {
  DAILY_SHARDS_REWARDS,
  checkSignInEligibility,
  executeSignIn,
  SignInEligibilityResult,
} from '../../../../core/rpg/signInStorage';
import { WishWandIcon } from './WishWandIcon';

interface DailySignInModalProps {
  profile: RPGProfile;
  onUpdateProfile: (updater: (prev: RPGProfile) => RPGProfile) => void;
  onClose: () => void;
  onToast: (text: string) => void;
}

export const DailySignInModal: React.FC<DailySignInModalProps> = ({
  profile,
  onUpdateProfile,
  onClose,
  onToast,
}) => {
  const [eligibility, setEligibility] = useState<SignInEligibilityResult>(() =>
    checkSignInEligibility(profile)
  );

  useEffect(() => {
    setEligibility(checkSignInEligibility(profile));
  }, [profile]);

  const state = profile.signInState || {
    currentRound: 1,
    currentDayIndex: 1,
    lastSignInDate: null,
    diamondShards: 0,
    claimedDays: [],
  };

  const handleClaim = () => {
    const result = executeSignIn(profile);
    if (!result.success) {
      onToast(result.message);
      return;
    }

    onUpdateProfile(() => result.updatedProfile);
    onToast(result.message);
  };

  // 100% 临摹图1：顶部紫波点睡帽萌宠与红飘带吉祥物
  const renderMascotHeader = () => (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '92px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '-6px',
        marginTop: '-18px',
        pointerEvents: 'none',
      }}
    >
      <svg width="240" height="96" viewBox="0 0 240 96" style={{ overflow: 'visible' }}>
        <defs>
          {/* 红飘带渐变 */}
          <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FA5C42" />
            <stop offset="50%" stopColor="#E23E26" />
            <stop offset="100%" stopColor="#BF2410" />
          </linearGradient>

          {/* 飘带金边渐变 */}
          <linearGradient id="ribbonGoldEdge" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFE066" />
            <stop offset="50%" stopColor="#FFF9D2" />
            <stop offset="100%" stopColor="#FFC72C" />
          </linearGradient>

          {/* 紫波点睡帽渐变 */}
          <linearGradient id="hoodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9C34C8" />
            <stop offset="100%" stopColor="#6C1E93" />
          </linearGradient>
        </defs>

        {/* 浮动闪烁金币与紫钻 */}
        <g transform="translate(10, 18)">
          <polygon points="12,4 16,10 12,16 8,10" fill="#CA38F5" stroke="#3D1812" strokeWidth="1.2" />
          <circle cx="28" cy="12" r="4.5" fill="#FFD23F" stroke="#3D1812" strokeWidth="1.2" />
        </g>
        <g transform="translate(195, 14)">
          <polygon points="12,4 16,10 12,16 8,10" fill="#CA38F5" stroke="#3D1812" strokeWidth="1.2" />
          <circle cx="28" cy="14" r="4.5" fill="#FFD23F" stroke="#3D1812" strokeWidth="1.2" />
        </g>

        {/* 顶部中央戴紫波点睡帽吃点心的小吉祥物 */}
        <g transform="translate(68, -4)">
          {/* 吉祥物圆白身体 */}
          <ellipse cx="26" cy="38" rx="19" ry="17" fill="#3D1812" />
          <ellipse cx="26" cy="38" rx="17" ry="15" fill="#FFFFFF" />

          {/* 紫色波点睡帽 */}
          <path
            d="M 12 34 C 10 16, 20 10, 32 14 C 42 18, 40 34, 38 36 Z"
            fill="#3D1812"
          />
          <path
            d="M 14 33 C 12 18, 21 12, 31 15 C 40 19, 38 33, 36 35 Z"
            fill="url(#hoodGrad)"
          />
          {/* 睡帽上的白波点 */}
          <circle cx="21" cy="22" r="2.2" fill="#FFFFFF" />
          <circle cx="30" cy="21" r="2.2" fill="#FFFFFF" />
          <circle cx="25" cy="28" r="2" fill="#FFFFFF" />
          <circle cx="34" cy="28" r="1.8" fill="#FFFFFF" />
          {/* 睡帽顶端小毛球 */}
          <circle cx="16" cy="13" r="3.5" fill="#FFFFFF" stroke="#3D1812" strokeWidth="1.2" />

          {/* 眯眼开心大笑脸 (• ‿ •) */}
          <path d="M 21 34 Q 24 32 26 34" fill="none" stroke="#3D1812" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M 31 34 Q 33 32 35 34" fill="none" stroke="#3D1812" strokeWidth="1.6" strokeLinecap="round" />
          {/* 吐舌/吃点心嘴巴 */}
          <ellipse cx="28.5" cy="38" rx="3.5" ry="3" fill="#E63956" stroke="#3D1812" strokeWidth="1.2" />
          {/* 腮红 */}
          <circle cx="18" cy="37" r="2" fill="#FF7597" opacity="0.8" />
          <circle cx="37" cy="37" r="2" fill="#FF7597" opacity="0.8" />
          {/* 小短爪持点心 */}
          <ellipse cx="28.5" cy="44" rx="4" ry="3" fill="#FFFFFF" stroke="#3D1812" strokeWidth="1.2" />
          <polygon points="34,42 38,44 34,46 32,44" fill="#FFD13B" stroke="#3D1812" strokeWidth="1" />
        </g>

        {/* 红色大弧形拱面飘带底壳（厚实深棕描边） */}
        <path
          d="M 12 56 
             L 34 44 
             L 30 62 
             C 70 42, 170 42, 210 62 
             L 206 44 
             L 228 56 
             C 180 82, 60 82, 12 56 Z"
          fill="#3D1812"
        />

        {/* 红色大弧形飘带主体 */}
        <path
          d="M 18 57 
             L 33 48 
             L 30 60 
             C 72 44, 168 44, 210 60 
             L 207 48 
             L 222 57 
             C 176 79, 64 79, 18 57 Z"
          fill="url(#ribbonGrad)"
        />

        {/* 飘带金边描边 */}
        <path
          d="M 30 59 C 72 44, 168 44, 210 59"
          fill="none"
          stroke="url(#ribbonGoldEdge)"
          strokeWidth="2.2"
        />
        <path
          d="M 30 68 C 72 82, 168 82, 210 68"
          fill="none"
          stroke="url(#ribbonGoldEdge)"
          strokeWidth="1.8"
        />

        {/* 飘带大文字：七日签到 / DAILY BONUS */}
        <text
          x="120"
          y="71"
          textAnchor="middle"
          fill="#FFFFFF"
          stroke="#3D1812"
          strokeWidth="3.5"
          paintOrder="stroke fill"
          style={{
            fontSize: '18px',
            fontWeight: 900,
            letterSpacing: '3px',
            fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", "幼圆", cursive, sans-serif',
          }}
        >
          七日签到
        </text>
        <text
          x="120"
          y="71"
          textAnchor="middle"
          fill="#FFF475"
          style={{
            fontSize: '18px',
            fontWeight: 900,
            letterSpacing: '3px',
            fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", "幼圆", cursive, sans-serif',
          }}
        >
          七日签到
        </text>
      </svg>
    </div>
  );

  // 钻石碎片专属图标
  const renderShardIcon = (count: number) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2px',
      }}
    >
      <svg width="34" height="28" viewBox="0 0 34 28" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="shardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#70D4FF" />
            <stop offset="50%" stopColor="#29B6F6" />
            <stop offset="100%" stopColor="#0288D1" />
          </linearGradient>
        </defs>
        {/* 多面体水晶碎片 */}
        <polygon
          points="17,2 29,8 24,24 10,24 5,8"
          fill="url(#shardGrad)"
          stroke="#1F3A52"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <polygon points="17,2 24,10 17,20 10,10" fill="#B3E5FC" opacity="0.8" />
        <polygon points="17,20 24,24 10,24" fill="#0277BD" opacity="0.6" />
        <circle cx="12" cy="7" r="1.2" fill="#FFFFFF" />
      </svg>
      <span
        style={{
          fontSize: '12px',
          fontWeight: 900,
          color: '#3D1812',
          letterSpacing: '-0.3px',
        }}
      >
        +{count}
      </span>
    </div>
  );

  // 第七天专属金色整钻图形（纯粹图标无文字）
  const renderWholeDiamondSvg = (size = 32) => (
    <svg width={size} height={(size * 34) / 42} viewBox="0 0 42 34" style={{ overflow: 'visible', flexShrink: 0 }}>
      <defs>
        <linearGradient id="wholeGemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF77BA" />
          <stop offset="45%" stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#BE123C" />
        </linearGradient>
      </defs>
      {/* 整颗大红钻/耀光钻 */}
      <polygon
        points="21,2 38,10 30,30 12,30 4,10"
        fill="url(#wholeGemGrad)"
        stroke="#3D1812"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <polygon points="21,2 30,11 21,24 12,11" fill="#FFC1E3" opacity="0.9" />
      <polygon points="21,24 30,30 12,30" fill="#9F1239" opacity="0.6" />
      {/* 闪烁十字星芒 */}
      <path d="M 33 4 L 34 8 L 38 9 L 34 10 L 33 14 L 32 10 L 28 9 L 32 8 Z" fill="#FFE066" />
    </svg>
  );

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 100,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      {/* 弹窗主体（100% 临摹图1：圆润白板底壳 + 萌系粗框） */}
      <div
        style={{
          width: '100%',
          maxWidth: '350px',
          background: '#FFFFFF',
          borderRadius: '28px',
          border: '3px solid #3D1812',
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '18px 16px 20px',
          position: 'relative',
          animation: 'modalSlideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* 右上角关闭按钮 */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '14px',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#F1F5F9',
            border: '2px solid #3D1812',
            color: '#3D1812',
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          <X size={15} strokeWidth={3} />
        </button>

        {/* 顶部吉祥物与飘带 */}
        {renderMascotHeader()}

        {/* ================= 7日卡牌矩阵 (对齐图1布局) ================= */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginTop: '8px',
          }}
        >
          {/* 第 1 行：第1~4天 (4等分) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {[1, 2, 3, 4].map((day) => {
              const isClaimed = (state.claimedDays || []).includes(day);
              const isCurrentDay = state.currentDayIndex === day && !eligibility.alreadySignedToday;
              const shards = DAILY_SHARDS_REWARDS[day - 1];

              return (
                <div
                  key={day}
                  style={{
                    position: 'relative',
                    height: '84px',
                    borderRadius: '16px',
                    background: isClaimed ? '#EDE7E3' : '#FFF0F4',
                    border: isCurrentDay
                      ? '2.5px solid #FF5E89'
                      : isClaimed
                      ? '2px solid #C4B9B4'
                      : '2px solid #FFC7D5',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isCurrentDay
                      ? '0 0 10px rgba(255, 94, 137, 0.45)'
                      : '0 2px 4px rgba(0, 0, 0, 0.06)',
                    opacity: isClaimed ? 0.75 : 1,
                  }}
                >
                  {/* 天数小胶囊 */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '4px',
                      left: '4px',
                      padding: '1px 6px',
                      borderRadius: '8px',
                      background: isClaimed ? '#A89E9A' : '#FF7597',
                      color: '#FFFFFF',
                      fontSize: '9px',
                      fontWeight: 900,
                      lineHeight: 1.2,
                    }}
                  >
                    {day} 日
                  </div>

                  {/* 奖励图标 */}
                  {renderShardIcon(shards)}

                  {/* 已签到绿色打对勾印章（对齐图1） */}
                  {isClaimed && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: '#22C55E',
                        border: '1.5px solid #14532D',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      }}
                    >
                      <Check size={13} strokeWidth={3.5} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 第 2 行：第5天、第6天、以及双倍宽幅的第7天 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {/* 第 5 天 */}
            {[5, 6].map((day) => {
              const isClaimed = (state.claimedDays || []).includes(day);
              const isCurrentDay = state.currentDayIndex === day && !eligibility.alreadySignedToday;
              const shards = DAILY_SHARDS_REWARDS[day - 1];

              return (
                <div
                  key={day}
                  style={{
                    position: 'relative',
                    height: '84px',
                    borderRadius: '16px',
                    background: isClaimed ? '#EDE7E3' : '#FFF0F4',
                    border: isCurrentDay
                      ? '2.5px solid #FF5E89'
                      : isClaimed
                      ? '2px solid #C4B9B4'
                      : '2px solid #FFC7D5',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isCurrentDay
                      ? '0 0 10px rgba(255, 94, 137, 0.45)'
                      : '0 2px 4px rgba(0, 0, 0, 0.06)',
                    opacity: isClaimed ? 0.75 : 1,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '4px',
                      left: '4px',
                      padding: '1px 6px',
                      borderRadius: '8px',
                      background: isClaimed ? '#A89E9A' : '#FF7597',
                      color: '#FFFFFF',
                      fontSize: '9px',
                      fontWeight: 900,
                      lineHeight: 1.2,
                    }}
                  >
                    {day} 日
                  </div>

                  {renderShardIcon(shards)}

                  {isClaimed && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: '#22C55E',
                        border: '1.5px solid #14532D',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      }}
                    >
                      <Check size={13} strokeWidth={3.5} />
                    </div>
                  )}
                </div>
              );
            })}

            {/* 第 7 天：双倍宽幅金色辐射爆破大奖卡（100% 临摹图1第七天金色大横幅） */}
            {(() => {
              const day = 7;
              const isClaimed = (state.claimedDays || []).includes(day);
              const isCurrentDay = state.currentDayIndex === day && !eligibility.alreadySignedToday;

              return (
                <div
                  style={{
                    gridColumn: 'span 2',
                    position: 'relative',
                    height: '84px',
                    borderRadius: '16px',
                    background: isClaimed
                      ? '#EDE7E3'
                      : 'radial-gradient(circle at center, #FFF9C4 0%, #FFEC66 50%, #F5C62C 100%)',
                    border: isCurrentDay
                      ? '2.5px solid #F59E0B'
                      : isClaimed
                      ? '2px solid #C4B9B4'
                      : '2.5px solid #EAB308',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isCurrentDay
                      ? '0 0 12px rgba(245, 158, 11, 0.55)'
                      : '0 2px 6px rgba(217, 119, 6, 0.25)',
                    opacity: isClaimed ? 0.75 : 1,
                    overflow: 'hidden',
                  }}
                >
                  {/* 第七天金色放射线条纹装饰 */}
                  {!isClaimed && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `repeating-conic-gradient(from 0deg, rgba(255,255,255,0.35) 0deg 15deg, transparent 15deg 30deg)`,
                        pointerEvents: 'none',
                      }}
                    />
                  )}

                  {/* 天数胶囊 */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '4px',
                      left: '6px',
                      padding: '1px 8px',
                      borderRadius: '8px',
                      background: isClaimed ? '#A89E9A' : '#D97706',
                      color: '#FFFFFF',
                      fontSize: '9.5px',
                      fontWeight: 900,
                      zIndex: 2,
                    }}
                  >
                    7 日 · 大奖
                  </div>

                  {/* 第7天大奖：两个图标并列，各自在旁边直接标记 +1 */}
                  <div
                    style={{
                      zIndex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      padding: '8px 4px 2px',
                    }}
                  >
                    {/* 钻石 +1 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      {renderWholeDiamondSvg(32)}
                      <span
                        style={{
                          fontSize: '15px',
                          fontWeight: 900,
                          color: '#7C2D12',
                          fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", "幼圆", cursive, sans-serif',
                          textShadow: '0 1px 1px rgba(255, 255, 255, 0.8)',
                          lineHeight: 1,
                        }}
                      >
                        +1
                      </span>
                    </div>

                    {/* 许愿券 +1 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <div style={{ transform: 'rotate(-8deg)', filter: 'drop-shadow(0 2px 4px rgba(245, 158, 11, 0.45))' }}>
                        <WishWandIcon size={26} />
                      </div>
                      <span
                        style={{
                          fontSize: '15px',
                          fontWeight: 900,
                          color: '#7C2D12',
                          fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", "幼圆", cursive, sans-serif',
                          textShadow: '0 1px 1px rgba(255, 255, 255, 0.8)',
                          lineHeight: 1,
                        }}
                      >
                        +1
                      </span>
                    </div>
                  </div>

                  {isClaimed && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '6px',
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: '#22C55E',
                        border: '1.5px solid #14532D',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        zIndex: 3,
                      }}
                    >
                      <Check size={14} strokeWidth={3.5} />
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* ================= 提示气泡框（对齐图1灰色圆角说明框） ================= */}
        <div
          style={{
            width: '100%',
            marginTop: '12px',
            padding: '8px 12px',
            borderRadius: '14px',
            background: '#F1F5F9',
            border: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {/* 六维门槛状态 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px' }}>💬</span>
            <div style={{ fontSize: '11px', color: '#334155', fontWeight: 800 }}>
              {eligibility.qualifiedCount >= 3 ? (
                <span style={{ color: '#16A34A' }}>
                  ✓ 六维属性已达标（已达成 {eligibility.qualifiedCount}/3 项 ≥ 50）
                </span>
              ) : (
                <span style={{ color: '#E11D48' }}>
                  ⚠ 需至少 3 项属性达到 50（当前仅达成 {eligibility.qualifiedCount}/3 项）
                </span>
              )}
            </div>
          </div>

          {/* 碎片进度与自由天数联动说明 */}
          <div
            style={{
              fontSize: '10.5px',
              color: '#64748B',
              fontWeight: 600,
              paddingLeft: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>
              💎 钻石碎片存量: <b>{state.diamondShards || 0} / 20</b>
            </span>
            <span style={{ color: '#0284C7', fontWeight: 700 }}>
              (满20自动合成+1天)
            </span>
          </div>

          {/* 第7天终极奖励 */}
          <div
            style={{
              fontSize: '10.5px',
              color: '#B45309',
              fontWeight: 700,
              paddingLeft: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>🌟 满 7 天大奖: <b>1 颗完整钻石 + 1 张许愿券</b></span>
          </div>
        </div>

        {/* ================= 底部果冻大按钮（对齐图1饱满橙色立体确认胶囊） ================= */}
        <div style={{ width: '100%', marginTop: '12px' }}>
          <button
            onClick={handleClaim}
            disabled={!eligibility.eligible}
            style={{
              width: '100%',
              height: '46px',
              borderRadius: '24px',
              border: '2.5px solid #842A12',
              background: !eligibility.eligible
                ? eligibility.alreadySignedToday
                  ? 'linear-gradient(180deg, #94A3B8 0%, #64748B 100%)'
                  : 'linear-gradient(180deg, #CBD5E1 0%, #94A3B8 100%)'
                : 'linear-gradient(180deg, #FF893B 0%, #F9571C 50%, #DD3602 100%)',
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: 900,
              letterSpacing: '2px',
              fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", "幼圆", cursive, sans-serif',
              textShadow: '0 1.5px 2px rgba(0, 0, 0, 0.45)',
              cursor: eligibility.eligible ? 'pointer' : 'not-allowed',
              boxShadow: eligibility.eligible
                ? '0 6px 14px rgba(249, 87, 28, 0.45), inset 0 2px 2px rgba(255, 255, 255, 0.5)'
                : 'none',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* 果冻顶部反光 */}
            <div
              style={{
                position: 'absolute',
                top: '2px',
                left: '10%',
                right: '10%',
                height: '14px',
                borderRadius: '10px',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 100%)',
                pointerEvents: 'none',
              }}
            />

            {eligibility.alreadySignedToday ? (
              '今日已签到'
            ) : eligibility.qualifiedCount < 3 ? (
              `六维未达标 (${eligibility.qualifiedCount}/3 项)`
            ) : (
              '领 取 奖 励'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
