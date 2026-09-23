import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Plus,
  Image as ImageIcon,
  Shield,
  Layers,
  ShoppingBag,
  Activity,
  Award,
  Sparkles,
  Zap,
  Heart,
  ChevronDown,
} from 'lucide-react';
import { RPGProfile } from '../../../core/rpg/types';
import {
  loadRPGProfile,
  saveRPGProfile,
  RPG_CLASSES,
  getBeijingDateString,
} from '../../../core/rpg/rpgStorage';
import { AttributesSheet } from './components/AttributesSheet';
import { SkillTreeSheet } from './components/SkillTreeSheet';
import { StatusDebuffSheet } from './components/StatusDebuffSheet';
import { AchievementSheet } from './components/AchievementSheet';
import { InventorySheet } from './components/InventorySheet';
import { JobClassSheet } from './components/JobClassSheet';
import { AvatarUploadModal } from './components/AvatarUploadModal';
import { PetHouseIcon } from './components/PetHouseIcon';
import { RelationshipBoardModal } from './components/RelationshipBoardModal';
import { QuestBoardIcon } from './components/QuestBoardIcon';
import { QuestStageSheet } from './components/QuestStageSheet';
import { MealDiaryIcon } from './components/MealDiaryIcon';
import { MealDiarySheet } from './components/MealDiarySheet';
import { ProfileDossierSheet } from './components/ProfileDossierSheet';
import { LifeDaisyIcon } from './components/LifeDaisyIcon';
import { LifeJourneySheet } from './components/LifeJourneySheet';
import { SettingsVaultModal } from './components/SettingsVaultModal';
import { calculateFreeDays } from '../../../core/rpg/vaultStorage';
import {
  getCustomBackground,
  saveCustomBackground,
  deleteCustomBackground,
} from '../../../core/rpg/backgroundImageStorage';
import { ChestIcon } from './components/ChestIcon';
import { ActivityLogModal } from './components/ActivityLogModal';
import { DailySignInModal } from './components/DailySignInModal';
import { ExtremeChallengeModal } from './components/ExtremeChallengeModal';
import { DailySettlementModal } from './components/DailySettlementModal';
import { applyDailySettlement, getMaxExpForLevel } from '../../../core/rpg/dailySettlementEngine';

interface ProfileAppProps {
  onBack: () => void;
}

// 猫爪金币高精矢量图标（对齐用户参考图）
const PawCoinIcon: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 32 32" style={{ flexShrink: 0, marginLeft: '-3px' }}>
    <defs>
      <radialGradient id="pawCoinBody" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#FED766" />
        <stop offset="60%" stopColor="#F5BA38" />
        <stop offset="100%" stopColor="#D98218" />
      </radialGradient>
    </defs>
    {/* 外圈深色轮廓 */}
    <circle cx="16" cy="16" r="15" fill="#502428" />
    {/* 金币主盘 */}
    <circle cx="16" cy="16" r="13.2" fill="url(#pawCoinBody)" />
    {/* 内圈细压纹 */}
    <circle cx="16" cy="16" r="11" fill="none" stroke="#D98218" strokeWidth="1.2" />
    {/* 萌系肉球掌印 */}
    <ellipse cx="16" cy="18.5" rx="4.8" ry="3.8" fill="#87470E" opacity="0.9" />
    <circle cx="11.5" cy="13" r="2.1" fill="#87470E" opacity="0.9" />
    <circle cx="16" cy="11.2" r="2.2" fill="#87470E" opacity="0.9" />
    <circle cx="20.5" cy="13" r="2.1" fill="#87470E" opacity="0.9" />
  </svg>
);

// 粉红切面宝石高精矢量图标（对齐用户参考图）
const PinkGemIcon: React.FC = () => (
  <svg width="24" height="22" viewBox="0 0 36 32" style={{ flexShrink: 0, marginLeft: '-4px' }}>
    <defs>
      <linearGradient id="gemTopFacet" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFA6CC" />
        <stop offset="100%" stopColor="#F472B6" />
      </linearGradient>
      <linearGradient id="gemLeftFacet" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F472B6" />
        <stop offset="100%" stopColor="#BE185D" />
      </linearGradient>
      <linearGradient id="gemRightFacet" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#F472B6" />
        <stop offset="100%" stopColor="#9D174D" />
      </linearGradient>
    </defs>
    {/* 深酒红轮廓底壳 */}
    <polygon points="9,5 27,5 35,13 18,30 1,13" fill="#502428" />
    {/* 宝石顶面 */}
    <polygon points="10.5,6.5 25.5,6.5 31.5,12 4.5,12" fill="url(#gemTopFacet)" />
    {/* 宝石中左斜切面 */}
    <polygon points="4.5,13 18,13 18,28.5 2.5,13.5" fill="url(#gemLeftFacet)" />
    {/* 宝石中右斜切面 */}
    <polygon points="18,13 31.5,13 33.5,13.5 18,28.5" fill="url(#gemRightFacet)" />
    {/* 顶部高光微反光 */}
    <polygon points="12,7 18,7 16,10 9,10" fill="rgba(255,255,255,0.7)" />
    {/* 切面分割暗线 */}
    <line x1="18" y1="13" x2="18" y2="28.5" stroke="#502428" strokeWidth="1" opacity="0.6" />
  </svg>
);

// 萌系粉红微笑心形豆豆心情图标（对齐用户参考图）
const HeartMoodIcon: React.FC = () => (
  <svg
    width="25"
    height="22"
    viewBox="0 0 32 28"
    style={{ flexShrink: 0, marginLeft: '-4px', marginTop: '-3px', overflow: 'visible' }}
  >
    <defs>
      <linearGradient id="moodBeanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFAEC2" />
        <stop offset="60%" stopColor="#FF8DAA" />
        <stop offset="100%" stopColor="#F46287" />
      </linearGradient>
    </defs>

    {/* 深褐厚边框底壳 */}
    <path
      d="M 16 9 C 12 4, 3 4, 2 12 C 1 19, 8 25, 16 25 C 24 25, 31 19, 30 12 C 29 4, 20 4, 16 9 Z"
      fill="#502428"
      stroke="#502428"
      strokeWidth="2.8"
      strokeLinejoin="round"
    />

    {/* 粉红饱满豆豆主体 */}
    <path
      d="M 16 9.5 C 12.2 4.8, 3.8 4.8, 3 12 C 2.2 18.5, 8.5 24, 16 24 C 23.5 24, 29.8 18.5, 29 12 C 28.2 4.8, 19.8 4.8, 16 9.5 Z"
      fill="url(#moodBeanGrad)"
    />

    {/* 脸颊微泛软萌腮红 */}
    <ellipse cx="8" cy="16.5" rx="1.8" ry="1.0" fill="#FF5E89" opacity="0.65" />
    <ellipse cx="24" cy="16.5" rx="1.8" ry="1.0" fill="#FF5E89" opacity="0.65" />

    {/* 萌萌黑豆双眼 */}
    <circle cx="10.5" cy="14" r="1.3" fill="#502428" />
    <circle cx="21.5" cy="14" r="1.3" fill="#502428" />

    {/* 治愈小嘴 (• ‿ •) */}
    <path
      d="M 14.2 16 Q 16 17.6 17.8 16"
      fill="none"
      stroke="#502428"
      strokeWidth="1.3"
      strokeLinecap="round"
    />

    {/* 头部左上角微弱高光 */}
    <path
      d="M 6.5 8 C 8.5 6, 11 6, 13 7"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="1.2"
      strokeOpacity="0.8"
      strokeLinecap="round"
    />
  </svg>
);

// 萌系圆角浅蓝五角星等级徽章（100% 还原用户参考图）
interface LevelStarBadgeProps {
  level: number;
  isOpen: boolean;
  onClick: () => void;
}

const LevelStarBadge: React.FC<LevelStarBadgeProps> = ({ level, isOpen, onClick }) => (
  <button
    onClick={onClick}
    style={{
      background: 'none',
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      filter: isOpen
        ? 'drop-shadow(0 1px 2px rgba(80, 36, 40, 0.45))'
        : 'drop-shadow(0 2.5px 5px rgba(80, 36, 40, 0.22))',
      transform: isOpen ? 'scale(0.94)' : 'scale(1)',
      transition: 'transform 0.15s ease, filter 0.15s ease',
      flexShrink: 0,
    }}
    title="等级详情"
  >
    <svg width="36" height="36" viewBox="0 0 40 40" style={{ overflow: 'visible' }}>
      <defs>
        {/* 浅蓝果冻主星盘渐变 */}
        <linearGradient id="starBlueGrad" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#E0F7FE" />
          <stop offset="40%" stopColor="#8BD8FE" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
      </defs>

      {/* 外层深酒红圆角轮廓底壳 */}
      <polygon
        points="20,4 25.5,12 35.5,14 29,22 30.5,32 20,28 9.5,32 11,22 4.5,14 14.5,12"
        fill="#502428"
        stroke="#502428"
        strokeWidth="6"
        strokeLinejoin="round"
      />

      {/* 浅蓝果冻主星盘 */}
      <polygon
        points="20,4 25.5,12 35.5,14 29,22 30.5,32 20,28 9.5,32 11,22 4.5,14 14.5,12"
        fill="url(#starBlueGrad)"
        stroke="url(#starBlueGrad)"
        strokeWidth="3.2"
        strokeLinejoin="round"
      />

      {/* 顶部顶点果冻高光反光 */}
      <ellipse cx="20" cy="8.5" rx="3.2" ry="1.8" fill="#FFFFFF" opacity="0.75" />

      {/* 中心粗圆立体纯白数字（带深酒红描边，对齐参考图） */}
      <text
        x="20"
        y="21"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#FFFFFF"
        stroke="#502428"
        strokeWidth="3.2"
        strokeLinejoin="round"
        paintOrder="stroke fill"
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: String(level).length >= 3 ? '12px' : String(level).length === 2 ? '14px' : '16px',
          fontWeight: 900,
        }}
      >
        {level}
      </text>
    </svg>
  </button>
);

// 萌系立绘更迭图标（100% 还原用户参考图：小白人偶 + 蓝色加号徽章）
interface AvatarChibiPlusIconProps {
  size?: number;
}

const AvatarChibiPlusIcon: React.FC<AvatarChibiPlusIconProps> = ({ size = 28 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 36 36"
    style={{ overflow: 'visible', flexShrink: 0 }}
  >
    <defs>
      {/* 头部与身体软糯渐变：纯白到微紫粉柔和阴影 */}
      <linearGradient id="chibiBodyGrad" x1="20%" y1="10%" x2="80%" y2="90%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="65%" stopColor="#FAF8FC" />
        <stop offset="100%" stopColor="#E9DEEE" />
      </linearGradient>

      {/* 蓝色加号微亮质感渐变 */}
      <linearGradient id="chibiPlusGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#9DE5FE" />
        <stop offset="45%" stopColor="#60A5FA" />
        <stop offset="100%" stopColor="#3B82F6" />
      </linearGradient>
    </defs>

    {/* ================= 1. 人偶底壳深色厚描边 ================= */}
    {/* 身体底壳 */}
    <path
      d="M 12 21 C 9.5 23 8.5 26.5 10 29.5 C 11.5 32 16 32 18 29.5 C 19.5 27 18.5 24 16.5 22 Z"
      fill="#502428"
      stroke="#502428"
      strokeWidth="3.2"
      strokeLinejoin="round"
    />
    {/* 头部底壳 */}
    <circle
      cx="14"
      cy="13.5"
      r="10.5"
      fill="#502428"
      stroke="#502428"
      strokeWidth="2.8"
    />

    {/* ================= 2. 人偶主体填充 ================= */}
    {/* 身体主体 */}
    <path
      d="M 12.5 21 C 10.2 23 9.5 26 10.8 28.8 C 12 31 15.5 31 17.2 28.8 C 18.5 26.5 17.8 23.8 16 22 Z"
      fill="url(#chibiBodyGrad)"
    />
    {/* 头部主体 */}
    <circle
      cx="14"
      cy="13.5"
      r="9.5"
      fill="url(#chibiBodyGrad)"
    />

    {/* ================= 3. 萌萌面部五官 ================= */}
    {/* 左眼 */}
    <ellipse cx="10.8" cy="13.5" rx="1.3" ry="1.9" fill="#3D2028" />
    {/* 右眼 */}
    <ellipse cx="17.2" cy="13.5" rx="1.3" ry="1.9" fill="#3D2028" />
    {/* 萌系小嘴 */}
    <circle cx="14" cy="15.8" r="0.85" fill="#3D2028" />

    {/* 脸颊微泛微弱腮红 */}
    <ellipse cx="8.8" cy="15.2" rx="1.2" ry="0.8" fill="#F472B6" opacity="0.35" />
    <ellipse cx="19.2" cy="15.2" rx="1.2" ry="0.8" fill="#F472B6" opacity="0.35" />

    {/* ================= 4. 右下角圆角蓝色加号徽章 ================= */}
    {/* 加号底壳深色厚轮廓 */}
    <path
      d="M 22.5 19 h 4 a 2 2 0 0 1 2 2 v 1.5 h 1.5 a 2 2 0 0 1 2 2 v 4 a 2 2 0 0 1 -2 2 h -1.5 v 1.5 a 2 2 0 0 1 -2 2 h -4 a 2 2 0 0 1 -2 -2 v -1.5 h -1.5 a 2 2 0 0 1 -2 -2 v -4 a 2 2 0 0 1 2 -2 h 1.5 v -1.5 a 2 2 0 0 1 2 -2 z"
      fill="#502428"
      stroke="#502428"
      strokeWidth="2.8"
      strokeLinejoin="round"
    />
    {/* 加号蓝色渐变主体 */}
    <path
      d="M 22.5 19 h 4 a 2 2 0 0 1 2 2 v 1.5 h 1.5 a 2 2 0 0 1 2 2 v 4 a 2 2 0 0 1 -2 2 h -1.5 v 1.5 a 2 2 0 0 1 -2 2 h -4 a 2 2 0 0 1 -2 -2 v -1.5 h -1.5 a 2 2 0 0 1 -2 -2 v -4 a 2 2 0 0 1 2 -2 h 1.5 v -1.5 a 2 2 0 0 1 2 -2 z"
      fill="url(#chibiPlusGrad)"
      stroke="url(#chibiPlusGrad)"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    {/* 加号微弱顶部反光 */}
    <rect x="23" y="20" width="3" height="1.8" rx="0.9" fill="#FFFFFF" opacity="0.7" />
  </svg>
);

// 萌系悬挂票据夹（100% 还原用户参考图：金属夹口 + 挂孔）
const ClipboardClamp: React.FC = () => (
  <svg
    width="26"
    height="11"
    viewBox="0 0 26 11"
    style={{
      position: 'absolute',
      top: '-6.5px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 3,
      pointerEvents: 'none',
    }}
  >
    <defs>
      <linearGradient id="clampBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#C8BEB5" />
        <stop offset="50%" stopColor="#9C9289" />
        <stop offset="100%" stopColor="#756B62" />
      </linearGradient>
    </defs>
    {/* 夹子深色外轮廓底壳 */}
    <path
      d="M 2 10.5 L 4.8 3.5 C 5.5 1.5 7.5 0.8 10 0.8 L 16 0.8 C 18.5 0.8 20.5 1.5 21.2 3.5 L 24 10.5 Z"
      fill="#502428"
      stroke="#502428"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {/* 夹子金属质感主体 */}
    <path
      d="M 3 10.5 L 5.5 4 C 6.2 2.2 7.8 1.6 10 1.6 L 16 1.6 C 18.2 1.6 19.8 2.2 20.5 4 L 23 10.5 Z"
      fill="url(#clampBodyGrad)"
    />
    {/* 夹子挂孔铆钉 */}
    <circle cx="13" cy="5" r="1.8" fill="#502428" />
    <circle cx="13" cy="5" r="1" fill="#FAF4E8" />
  </svg>
);

// 便签夹式 Tab 按钮组件（100% 还原用户参考图：金黄木板边框 + 象牙白内芯 + 萌系胖胖艺术字）
interface ClipboardTabButtonProps {
  label: string;
  isActive: boolean;
  badge?: React.ReactNode;
  onClick: () => void;
}

const ClipboardTabButton: React.FC<ClipboardTabButtonProps> = ({
  label,
  isActive,
  badge,
  onClick,
}) => (
  <button
    onClick={onClick}
    style={{
      position: 'relative',
      flex: 1,
      maxWidth: '70px',
      height: '42px',
      background: isActive
        ? 'linear-gradient(180deg, #FDE047 0%, #F59E0B 100%)'
        : 'linear-gradient(180deg, #FED766 0%, #F5BA38 100%)',
      border: '2px solid #502428',
      borderRadius: '12px',
      padding: '2.5px',
      display: 'flex',
      alignItems: 'stretch',
      justifyContent: 'stretch',
      cursor: 'pointer',
      boxShadow: isActive
        ? '0 3px 0 #B45309, 0 6px 12px rgba(245, 158, 11, 0.4)'
        : '0 3px 0 #C98218, 0 3px 6px rgba(80, 36, 40, 0.14)',
      transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
      transition: 'all 0.15s ease',
      userSelect: 'none',
      flexShrink: 0,
    }}
    title={label}
  >
    {/* 顶部金属便签夹 */}
    <ClipboardClamp />

    {/* 便签内芯卡片 */}
    <div
      style={{
        flex: 1,
        background: isActive ? '#FFFFFF' : '#FAF4E8',
        borderRadius: '7px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: isActive
          ? 'inset 0 1px 2px rgba(245, 158, 11, 0.25)'
          : 'inset 0 1px 2px rgba(80, 36, 40, 0.08)',
        transition: 'background 0.15s ease',
      }}
    >
      <span
        style={{
          fontSize: '14px',
          fontWeight: 800,
          color: isActive ? '#381619' : '#502428',
          letterSpacing: '0.8px',
          fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", "幼圆", "Comfortaa", "Varela Round", cursive, sans-serif',
          lineHeight: 1,
        }}
      >
        {label}
      </span>
    </div>

    {/* 提示角标 */}
    {badge}
  </button>
);

export const ProfileApp: React.FC<ProfileAppProps> = ({ onBack }) => {
  const [profile, setProfile] = useState<RPGProfile>(loadRPGProfile);
  const [activeSheet, setActiveSheet] = useState<
    'attributes' | 'skills' | 'achievement' | 'status' | 'inventory' | 'class' | null
  >(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showLevelDetail, setShowLevelDetail] = useState(false);
  const [showRelationshipModal, setShowRelationshipModal] = useState(false);
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);
  const [showLifeModal, setShowLifeModal] = useState(false);
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [toastText, setToastText] = useState<string | null>(null);

  // 挂载时间戳，防止从桌面打开应用时的幽灵穿透点击
  const mountedAtRef = useRef<number>(Date.now());

  useEffect(() => {
    // 强制初始等级与历史超标溢出经验矫正
    if (profile.level !== 1 && (!profile.currentExp || profile.currentExp === 0)) {
      setProfile((prev) => {
        const fixed = { ...prev, level: 1, currentExp: 0, maxExp: getMaxExpForLevel(1) };
        saveRPGProfile(fixed);
        return fixed;
      });
    } else if (profile.currentExp >= profile.maxExp) {
      setProfile((prev) => {
        const safeLevel = Math.max(1, prev.level || 1);
        const fixed = { ...prev, level: safeLevel, currentExp: 0, maxExp: getMaxExpForLevel(safeLevel) };
        saveRPGProfile(fixed);
        return fixed;
      });
    }
    // 强制今日首次加载/跨日时心情初始重置为 100
    const today = getBeijingDateString();
    if (profile.lastMoodResetDate !== today || profile.mood !== 100) {
      setProfile((prev) => ({ ...prev, mood: 100, lastMoodResetDate: today }));
    }
    // 从 IndexedDB 异步加载舞台自定义背景
    getCustomBackground().then((bg) => {
      if (bg) {
        setProfile((prev) => ({ ...prev, customBgUrl: bg }));
      }
    });
  }, []);

  // 跨日检测：当用户切回标签页或应用恢复可见时，自动检测北京时间跨日重置
  useEffect(() => {
    const handleCheckDayChange = () => {
      const refreshed = loadRPGProfile();
      setProfile(refreshed);
    };
    window.addEventListener('focus', handleCheckDayChange);
    document.addEventListener('visibilitychange', handleCheckDayChange);
    return () => {
      window.removeEventListener('focus', handleCheckDayChange);
      document.removeEventListener('visibilitychange', handleCheckDayChange);
    };
  }, []);

  useEffect(() => {
    saveRPGProfile(profile);
  }, [profile]);

  const showToast = (text: string) => {
    setToastText(text);
    setTimeout(() => setToastText(null), 2000);
  };

  const currentClassList = profile.classes && profile.classes.length > 0 ? profile.classes : RPG_CLASSES;
  const currentClass =
    currentClassList.find((c) => c.id === profile.currentClassId) || currentClassList[0];

  // 职业增删
  const handleAddClass = (newClass: any) => {
    setProfile((prev) => ({
      ...prev,
      classes: [...(prev.classes || RPG_CLASSES), newClass],
    }));
    showToast('职业已新增');
  };

  const handleDeleteClass = (id: string) => {
    setProfile((prev) => {
      const list = (prev.classes || RPG_CLASSES).filter((c) => c.id !== id);
      const nextClassId = prev.currentClassId === id ? list[0]?.id || 'mage' : prev.currentClassId;
      return {
        ...prev,
        classes: list,
        currentClassId: nextClassId,
      };
    });
    showToast('职业已删除');
  };

  const handleUpdateClass = (updatedClass: any) => {
    setProfile((prev) => ({
      ...prev,
      classes: (prev.classes || RPG_CLASSES).map((c) => (c.id === updatedClass.id ? updatedClass : c)),
    }));
    showToast('职业已保存');
  };

  // 技能增删与切换
  const handleAddSkill = (skill: any) => {
    setProfile((prev) => ({
      ...prev,
      skills: [...prev.skills, skill],
    }));
    showToast('技能已新增');
  };

  const handleDeleteSkill = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.id !== id),
    }));
    showToast('技能已删除');
  };

  const handleToggleUnlockSkill = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.map((s) =>
        s.id === id ? { ...s, unlocked: !s.unlocked } : s
      ),
    }));
  };

  // 物品增删
  const handleAddItem = (item: any) => {
    setProfile((prev) => ({
      ...prev,
      items: [...prev.items, item],
    }));
    showToast('物品已新增');
  };

  const handleDeleteItem = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== id),
    }));
    showToast('物品已删除');
  };

  // 检查是否有活跃的 Debuff
  const activeDebuffCount = profile.debuffs.filter((d) => d.active).length;
  const isFatigued = profile.hp < 20;

  // 道具使用：回复体力或精力
  const handleUseConsumable = (itemId: string) => {
    setProfile((prev) => {
      const targetItem = prev.items.find((i) => i.id === itemId);
      if (!targetItem || !targetItem.count || targetItem.count <= 0) return prev;

      let newHp = prev.hp;
      let newMp = prev.mp;

      if (itemId === 'item_coffee') {
        newHp = Math.min(prev.maxHp, prev.hp + 25);
        showToast('体力 +25');
      } else if (itemId === 'item_mint') {
        newMp = Math.min(prev.maxMp, prev.mp + 15);
        showToast('精力 +15');
      } else if (itemId === 'item_book') {
        showToast('智力经验 +100');
      }

      const updatedItems = prev.items.map((i) =>
        i.id === itemId ? { ...i, count: i.count! - 1 } : i
      );

      return {
        ...prev,
        hp: newHp,
        mp: newMp,
        items: updatedItems,
      };
    });
  };

  // 穿戴/卸下装备
  const handleToggleEquip = (itemId: string) => {
    setProfile((prev) => {
      const updated = prev.items.map((item) => {
        if (item.id === itemId) {
          const nextEquipped = !item.equipped;
          showToast(nextEquipped ? '已穿戴' : '已卸下');
          return { ...item, equipped: nextEquipped };
        }
        return item;
      });
      return { ...prev, items: updated };
    });
  };

  // 切换/消除 Debuff
  const handleToggleDebuff = (debuffId: string) => {
    setProfile((prev) => {
      const updated = prev.debuffs.map((d) => {
        if (d.id === debuffId) {
          const nextActive = !d.active;
          showToast(nextActive ? '状态激活' : '状态已清除');
          return { ...d, active: nextActive };
        }
        return d;
      });
      return { ...prev, debuffs: updated };
    });
  };

  // 深度小憩恢复
  const handleRest = () => {
    setProfile((prev) => ({
      ...prev,
      hp: Math.min(prev.maxHp, prev.hp + 30),
      mp: Math.min(prev.maxMp, prev.mp + 20),
    }));
    showToast('小憩完成');
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(175deg, #F4F7FB 0%, #E9EEF5 50%, #DEE5F0 100%)',
        overflow: 'hidden',
        userSelect: 'none',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* 吐司提示 */}
      {toastText && (
        <div
          style={{
            position: 'absolute',
            top: '72px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            background: 'rgba(33, 48, 71, 0.88)',
            backdropFilter: 'blur(8px)',
            color: '#ffffff',
            padding: '6px 16px',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: 700,
            boxShadow: '0 4px 16px rgba(51, 66, 87, 0.25)',
            pointerEvents: 'none',
          }}
        >
          {toastText}
        </div>
      )}

      {/* ================= 1. 顶部轻拟物 HUD 状态栏 ================= */}
      <div
        style={{
          width: '100%',
          padding: '8px 12px 7px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(233, 238, 245, 0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.7)',
          zIndex: 35,
          boxShadow: '0 3px 10px rgba(166, 180, 200, 0.15)',
          position: 'relative',
        }}
      >
        {/* 左侧主组：返回键 + 等级(可展开) + 紧随等级右侧的猫爪金币与粉红钻石胶囊 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={onBack}
            className="nm-btn"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
              flexShrink: 0,
              border: '1px solid rgba(255, 255, 255, 0.8)',
            }}
          >
            <ArrowLeft size={16} />
          </button>

          {/* 萌系浅蓝圆角五角星等级徽章 (对齐参考图，点击展开详情，体力精力隐藏于此) */}
          <LevelStarBadge
            level={profile.level}
            isOpen={showLevelDetail}
            onClick={() => setShowLevelDetail((prev) => !prev)}
          />

          {/* 猫爪金币胶囊（现实存款 · 点击打开设置金库） */}
          <div
            onClick={() => setShowVaultModal(true)}
            title="现实存款 · 点击打开设置金库"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '2px 8px 2px 2px',
              borderRadius: '9999px',
              background: '#FAF4E8',
              border: '1.8px solid #502428',
              boxShadow: '0 2px 4px rgba(80, 36, 40, 0.15)',
              gap: '3px',
              flexShrink: 0,
              cursor: 'pointer',
              transition: 'transform 0.12s ease',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.94)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <PawCoinIcon />
            <span style={{ fontSize: '11px', fontWeight: 900, color: '#502428', letterSpacing: '-0.3px' }}>
              {profile.isPrivacyHidden ? '****' : profile.gold.toLocaleString()}
            </span>
          </div>

          {/* 粉红切面钻石胶囊（自由天数 FIRE · 点击打开设置金库） */}
          <div
            onClick={() => setShowVaultModal(true)}
            title="自由天数 (FIRE) · 点击打开设置金库"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '2px 8px 2px 2px',
              borderRadius: '9999px',
              background: '#FAF4E8',
              border: '1.8px solid #502428',
              boxShadow: '0 2px 4px rgba(80, 36, 40, 0.15)',
              gap: '3px',
              flexShrink: 0,
              cursor: 'pointer',
              transition: 'transform 0.12s ease',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.94)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <PinkGemIcon />
            <span style={{ fontSize: '11px', fontWeight: 900, color: '#502428', letterSpacing: '-0.3px' }}>
              {calculateFreeDays(profile.gold, profile.dailyCost || 100, profile.crystals || 0).toLocaleString()}
            </span>
          </div>

          {/* 萌萌心形心情数值胶囊（每天北京时间初始重置为 100，后续由系统联动） */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '2px 8px 2px 2px',
              borderRadius: '9999px',
              background: '#FAF4E8',
              border: '1.8px solid #502428',
              boxShadow: '0 2px 4px rgba(80, 36, 40, 0.15)',
              gap: '3px',
              flexShrink: 0,
              userSelect: 'none',
            }}
            title="心情数值 · 每日初始为 100 (由生活与学习状态自动联动)"
          >
            <HeartMoodIcon />
            <span style={{ fontSize: '11px', fontWeight: 900, color: '#502428', letterSpacing: '-0.3px', minWidth: '14px', textAlign: 'center' }}>
              {profile.mood ?? 100}
            </span>
          </div>
        </div>

        {/* 背景遮罩，点击外部自动收起等级详情 */}
        {showLevelDetail && (
          <div
            onClick={() => setShowLevelDetail(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 90,
              background: 'rgba(15, 23, 42, 0.25)',
              backdropFilter: 'blur(2px)',
            }}
          />
        )}

        {/* ================= 等级展开详情卡片 (体力、精力、升级进度) ================= */}
        {showLevelDetail && (
          <div
            className="nm-card"
            style={{
              position: 'absolute',
              top: '52px',
              left: '46px',
              width: '240px',
              padding: '14px',
              borderRadius: '18px',
              background: '#E9EEF5',
              border: '1px solid rgba(255, 255, 255, 0.95)',
              boxShadow: '0 10px 24px rgba(166, 180, 200, 0.5)',
              zIndex: 99,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {/* 卡片头部 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#334257' }}>
                  角色状态
                </span>
                <span
                  className="nm-inset-sm"
                  style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    color: '#5096C6',
                    padding: '1px 6px',
                    borderRadius: '4px',
                  }}
                >
                  Lv.{profile.level}
                </span>
              </div>
              <button
                onClick={() => setShowLevelDetail(false)}
                className="nm-btn"
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  color: '#7D8CA3',
                  border: 'none',
                }}
              >
                ✕
              </button>
            </div>

            {/* 1. 升级进度条 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                <span style={{ fontWeight: 700, color: '#7D8CA3' }}>升级进度</span>
                <span style={{ fontWeight: 800, color: '#334257' }}>
                  {profile.currentExp} / {profile.maxExp}
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '7px',
                  background: '#DFE5EF',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  boxShadow: 'inset 1.5px 1.5px 3px rgba(166, 180, 200, 0.6), inset -1px -1px 2px rgba(255, 255, 255, 0.9)',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, Math.round((profile.currentExp / profile.maxExp) * 100))}%`,
                    background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>

            {/* 2. 今日体力 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px' }}>
                <span style={{ fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Heart size={11} />
                  今日体力
                </span>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, color: '#334257' }}>
                    {profile.hp} / {profile.maxHp}
                  </span>
                </div>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '7px',
                  background: '#DFE5EF',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  boxShadow: 'inset 1.5px 1.5px 3px rgba(166, 180, 200, 0.6), inset -1px -1px 2px rgba(255, 255, 255, 0.9)',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, Math.round((profile.hp / profile.maxHp) * 100))}%`,
                    background: isFatigued
                      ? 'linear-gradient(90deg, #f87171, #ef4444)'
                      : 'linear-gradient(90deg, #34d399, #10b981)',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>

            {/* 3. 精神专注 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px' }}>
                <span style={{ fontWeight: 700, color: '#6366f1', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Zap size={11} />
                  精神专注
                </span>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, color: '#334257' }}>
                    {profile.mp} / {profile.maxMp}
                  </span>
                </div>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '7px',
                  background: '#DFE5EF',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  boxShadow: 'inset 1.5px 1.5px 3px rgba(166, 180, 200, 0.6), inset -1px -1px 2px rgba(255, 255, 255, 0.9)',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, Math.round((profile.mp / profile.maxMp) * 100))}%`,
                    background: 'linear-gradient(90deg, #818cf8, #6366f1)',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= 2. 中央大立绘展示舞台 ================= */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundImage: profile.customBgUrl ? `url(${profile.customBgUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          transition: 'background 0.35s ease',
        }}
      >
        {/* 自定义背景柔和氛围蒙层 */}
        {profile.customBgUrl && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(233,238,245,0.2) 0%, rgba(33,48,71,0.15) 100%)',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* 背景轻拟物柔和穹顶高光 */}
        <div
          style={{
            position: 'absolute',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            background: profile.customBgUrl
              ? 'radial-gradient(circle, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0) 70%)'
              : 'radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, rgba(233, 238, 245, 0) 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* 立绘渲染区 */}
        {profile.customAvatarUrl ? (
          <div
            onClick={() => {
              if (Date.now() - mountedAtRef.current < 350) return;
              setShowDossierModal(true);
            }}
            title="个人档案"
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              cursor: 'pointer',
              filter: isFatigued ? 'grayscale(45%) contrast(90%)' : 'none',
              transition: 'filter 0.4s ease',
            }}
          >
            <img
              src={profile.customAvatarUrl}
              alt="角色立绘"
              style={{
                maxWidth: '90%',
                maxHeight: '92%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 14px 28px rgba(100, 116, 139, 0.25))',
              }}
            />

            {/* 疲劳角标 */}
            {isFatigued && (
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  background: 'rgba(239, 68, 68, 0.9)',
                  color: '#ffffff',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
              >
                过度疲劳
              </div>
            )}
          </div>
        ) : (
          /* 未上传立绘时的优雅轻拟物引导卡片 */
          <div
            onClick={() => {
              if (Date.now() - mountedAtRef.current < 350) return;
              setShowDossierModal(true);
            }}
            title="个人档案"
            className="nm-card"
            style={{
              width: '190px',
              height: '270px',
              borderRadius: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              cursor: 'pointer',
              padding: '16px',
              border: '1px solid rgba(255, 255, 255, 0.9)',
            }}
          >
            <div
              className="nm-inset"
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AvatarChibiPlusIcon size={40} />
            </div>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#334257' }}>
              上传立绘
            </span>
            <span style={{ fontSize: '11px', color: '#7D8CA3', textAlign: 'center' }}>
              点击配置形象
            </span>
          </div>
        )}

        {/* 左上悬浮：更换立绘按钮（小白人偶+蓝色加号形态） */}
        <button
          onClick={() => setShowAvatarModal(true)}
          className="nm-btn"
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            borderRadius: '16px',
            padding: '4px 10px 4px 6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 800,
            color: '#334257',
            zIndex: 25,
            border: '1px solid rgba(255, 255, 255, 0.9)',
            background: 'linear-gradient(145deg, #FFFFFF, #E2E8F0)',
            boxShadow: '2px 2px 6px rgba(166, 180, 200, 0.35), -2px -2px 6px rgba(255, 255, 255, 0.95)',
          }}
          title="更换立绘"
        >
          <AvatarChibiPlusIcon size={22} />
          更换立绘
        </button>

        {/* 左上悬浮：宝箱按钮（对齐图1，位于更换立绘下方，点击进入活动日志） */}
        <button
          onClick={() => setShowActivityModal(true)}
          className="nm-btn"
          style={{
            position: 'absolute',
            top: '48px',
            left: '12px',
            borderRadius: '16px',
            padding: '4px 10px 4px 6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 800,
            color: '#334257',
            zIndex: 25,
            border: '1px solid rgba(255, 255, 255, 0.9)',
            background: 'linear-gradient(145deg, #FFFFFF, #E2E8F0)',
            boxShadow: '2px 2px 6px rgba(166, 180, 200, 0.35), -2px -2px 6px rgba(255, 255, 255, 0.95)',
          }}
          title="活动日志"
        >
          <ChestIcon size={22} />
          活动日志
        </button>

        {/* 界面右侧：立绘更换图标下方，新增亲缘看板图标（小木屋形态，对齐图1） */}
        <button
          onClick={() => setShowRelationshipModal(true)}
          className="nm-btn"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '42px',
            height: '42px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 25,
            padding: 0,
            border: '2px solid #502428',
            background: 'linear-gradient(180deg, #FAF4E8 0%, #EFE5D0 100%)',
            boxShadow: '0 3px 0 #C98218, 0 4px 8px rgba(80, 36, 40, 0.18)',
            transition: 'transform 0.15s ease',
          }}
          title="亲缘图谱"
        >
          <PetHouseIcon size={28} />
        </button>

        {/* 界面右侧：亲缘图谱下方，新增任务清单图标（对齐图1） */}
        <button
          onClick={() => setShowQuestModal(true)}
          className="nm-btn"
          style={{
            position: 'absolute',
            top: '64px',
            right: '12px',
            width: '42px',
            height: '42px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 25,
            padding: 0,
            border: '2px solid #502428',
            background: 'linear-gradient(180deg, #FAF4E8 0%, #EFE5D0 100%)',
            boxShadow: '0 3px 0 #C98218, 0 4px 8px rgba(80, 36, 40, 0.18)',
            transition: 'transform 0.15s ease',
          }}
          title="进阶任务"
        >
          <QuestBoardIcon size={28} hasNotification={true} />
        </button>

        {/* 界面右侧：任务清单下方，新增美食手账图标（兔兔和果子形态，对齐图1） */}
        <button
          onClick={() => setShowMealModal(true)}
          className="nm-btn"
          style={{
            position: 'absolute',
            top: '116px',
            right: '12px',
            width: '42px',
            height: '42px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 25,
            padding: 0,
            border: '2px solid #502428',
            background: 'linear-gradient(180deg, #FFF0F5 0%, #FCE7F3 100%)',
            boxShadow: '0 3px 0 #DB2777, 0 4px 8px rgba(219, 39, 119, 0.18)',
            transition: 'transform 0.15s ease',
          }}
          title="美食手账"
        >
          <MealDiaryIcon size={28} />
        </button>

        {/* 界面右侧：美食手账下方，新增半生手账图标（图2手绘太阳花/小雏菊形态） */}
        <button
          onClick={() => setShowLifeModal(true)}
          className="nm-btn"
          style={{
            position: 'absolute',
            top: '168px',
            right: '12px',
            width: '42px',
            height: '42px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 25,
            padding: 0,
            border: '2px solid #502428',
            background: 'linear-gradient(180deg, #FFFBEB 0%, #FEF3C7 100%)',
            boxShadow: '0 3px 0 #D97706, 0 4px 8px rgba(217, 119, 6, 0.22)',
            transition: 'transform 0.15s ease',
          }}
          title="半生手账"
        >
          <LifeDaisyIcon size={28} />
        </button>

        {/* 左下角：当前职业标牌 */}
        <div
          onClick={() => setActiveSheet('class')}
          className="nm-card"
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '14px',
            borderRadius: '14px',
            padding: '6px 12px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 25,
            border: '1px solid rgba(255, 255, 255, 0.8)',
          }}
        >
          <span style={{ fontSize: '10px', color: '#7D8CA3', fontWeight: 700 }}>
            当前职业
          </span>
          <span style={{ fontSize: '14px', fontWeight: 900, color: '#334257' }}>
            {currentClass.title}
          </span>
        </div>

      </div>

      {/* ================= 3. 底部便签夹 Tab 栏目（方案2：抹茶暖卡其治愈底座） ================= */}
      <div
        style={{
          width: '100%',
          padding: '12px 8px 10px',
          background: 'linear-gradient(180deg, #D5CDAA 0%, #C7BD96 100%)',
          borderTop: '2px solid rgba(80, 36, 40, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '5px',
          zIndex: 30,
          boxShadow: 'inset 0 1.5px 0 rgba(255, 255, 255, 0.5), 0 -4px 16px rgba(80, 36, 40, 0.12)',
        }}
      >
        {/* 1. 六维 */}
        <ClipboardTabButton
          label="六维"
          isActive={activeSheet === 'attributes'}
          onClick={() => setActiveSheet(activeSheet === 'attributes' ? null : 'attributes')}
        />

        {/* 2. 技能 */}
        <ClipboardTabButton
          label="技能"
          isActive={activeSheet === 'skills'}
          onClick={() => setActiveSheet(activeSheet === 'skills' ? null : 'skills')}
        />

        {/* 3. 背包 */}
        <ClipboardTabButton
          label="背包"
          isActive={activeSheet === 'inventory'}
          onClick={() => setActiveSheet(activeSheet === 'inventory' ? null : 'inventory')}
        />

        {/* 4. 成就 */}
        <ClipboardTabButton
          label="成就"
          isActive={activeSheet === 'achievement'}
          onClick={() => setActiveSheet(activeSheet === 'achievement' ? null : 'achievement')}
        />

        {/* 5. 职业 */}
        <ClipboardTabButton
          label="职业"
          isActive={activeSheet === 'class'}
          onClick={() => setActiveSheet(activeSheet === 'class' ? null : 'class')}
        />
      </div>

      {/* ================= 4. 弹出抽屉模态框 ================= */}
      {activeSheet === 'attributes' && (
        <AttributesSheet
          attributes={profile.attributes}
          onClose={() => setActiveSheet(null)}
        />
      )}

      {activeSheet === 'skills' && (
        <SkillTreeSheet
          skills={profile.skills}
          onToggleUnlock={handleToggleUnlockSkill}
          onAddSkill={handleAddSkill}
          onDeleteSkill={handleDeleteSkill}
          onClose={() => setActiveSheet(null)}
        />
      )}

      {activeSheet === 'achievement' && (
        <AchievementSheet
          onClose={() => setActiveSheet(null)}
          onRewardCoins={(coins) => {
            const exp = coins * 2;
            setProfile((prev) => ({ ...prev, currentExp: prev.currentExp + exp }));
            showToast(`经验 +${exp}`);
          }}
        />
      )}

      {activeSheet === 'inventory' && (
        <InventorySheet
          items={profile.items}
          onToggleEquip={handleToggleEquip}
          onUseConsumable={handleUseConsumable}
          onAddItem={handleAddItem}
          onDeleteItem={handleDeleteItem}
          onClose={() => setActiveSheet(null)}
        />
      )}

      {activeSheet === 'class' && (
        <JobClassSheet
          classes={currentClassList}
          currentClassId={profile.currentClassId}
          onSelectClass={(id) => {
            setProfile((p) => ({ ...p, currentClassId: id }));
            showToast('职业已切换');
          }}
          onAddClass={handleAddClass}
          onDeleteClass={handleDeleteClass}
          onUpdateClass={handleUpdateClass}
          onClose={() => setActiveSheet(null)}
        />
      )}

      {showAvatarModal && (
        <AvatarUploadModal
          currentUrl={profile.customAvatarUrl}
          currentBgUrl={profile.customBgUrl}
          onSave={(url) => {
            setProfile((p) => ({ ...p, customAvatarUrl: url }));
            showToast('立绘已更新');
          }}
          onSaveBg={async (bgUrl) => {
            if (bgUrl) {
              await saveCustomBackground(bgUrl);
              setProfile((p) => ({ ...p, customBgUrl: bgUrl }));
              showToast('舞台背景已更新并存入 IndexedDB');
            } else {
              await deleteCustomBackground();
              setProfile((p) => ({ ...p, customBgUrl: null }));
              showToast('已恢复默认背景');
            }
          }}
          onClose={() => setShowAvatarModal(false)}
        />
      )}

      {/* ================= 活动日志看板弹窗（对齐图2，宝箱进入） ================= */}
      {showActivityModal && (
        <ActivityLogModal
          onClose={() => setShowActivityModal(false)}
          onToast={showToast}
          onOpenSignIn={() => setShowSignInModal(true)}
          onOpenChallenge={() => setShowChallengeModal(true)}
        />
      )}

      {/* ================= 七日签到弹窗（100% 临摹图1） ================= */}
      {showSignInModal && (
        <DailySignInModal
          profile={profile}
          onUpdateProfile={setProfile}
          onClose={() => setShowSignInModal(false)}
          onToast={showToast}
        />
      )}

      {/* ================= 极限挑战挂历弹窗（100% 临摹挂历卡纸原型） ================= */}
      {showChallengeModal && (
        <ExtremeChallengeModal
          profile={profile}
          onUpdateProfile={setProfile}
          onClose={() => setShowChallengeModal(false)}
          onToast={showToast}
        />
      )}

      {/* ================= 昨日修行业报每日结算弹窗 ================= */}
      {profile.pendingDailySettlement && (
        <DailySettlementModal
          snapshot={profile.pendingDailySettlement}
          onClaim={() => {
            const settlement = profile.pendingDailySettlement;
            if (!settlement) return;
            const updated = applyDailySettlement(profile, settlement);
            setProfile(updated);
            saveRPGProfile(updated);
            showToast(
              settlement.leveledUp
                ? `🎉 恭喜升级至 Lv. ${settlement.newLevel}！属性上限已提升！`
                : `✨ 昨日修行业报已结算，获得 +${settlement.totalExpEarned} EXP！`
            );
          }}
        />
      )}

      {/* ================= 5. 亲缘图谱看板弹窗（D3.js 驱动，对齐图2） ================= */}
      {showRelationshipModal && (
        <RelationshipBoardModal onClose={() => setShowRelationshipModal(false)} />
      )}

      {/* ================= 6. 进阶关卡任务面板（对齐图2） ================= */}
      {showQuestModal && (
        <QuestStageSheet
          currentJobName={currentClass.title}
          onRewardCoins={(coins) => {
            const exp = coins * 2;
            setProfile((p) => ({ ...p, currentExp: p.currentExp + exp }));
            showToast(`经验 +${exp}`);
          }}
          onRewardExp={(exp) => {
            setProfile((p) => {
              let curExp = p.currentExp + exp;
              let curLevel = p.level;
              let curMaxExp = getMaxExpForLevel(curLevel);
              while (curExp >= curMaxExp) {
                curExp -= curMaxExp;
                curLevel += 1;
                curMaxExp = getMaxExpForLevel(curLevel);
              }
              return { ...p, level: curLevel, currentExp: curExp, maxExp: curMaxExp };
            });
            showToast(`经验 +${exp}`);
          }}
          onClose={() => setShowQuestModal(false)}
        />
      )}

      {/* ================= 7. 每日三餐美食手账（对齐图2） ================= */}
      {showMealModal && (
        <MealDiarySheet onClose={() => setShowMealModal(false)} />
      )}

      {/* ================= 8. 个人档案手账（点击正中立绘唤起，对齐参考图） ================= */}
      {showDossierModal && (
        <ProfileDossierSheet
          profile={profile}
          onUpdateProfile={(updated) => {
            setProfile((prev) => ({ ...prev, ...updated }));
          }}
          onClose={() => setShowDossierModal(false)}
        />
      )}

      {/* ================= 9. 半生手账回忆录（点击右侧小雏菊唤起，对齐图1双孔票据卡片） ================= */}
      {showLifeModal && (
        <LifeJourneySheet onClose={() => setShowLifeModal(false)} />
      )}

      {/* ================= 10. 设定与金库猫咪弹窗 (点击金币/钻石唤起，精确对齐用户参考图) ================= */}
      {showVaultModal && (
        <SettingsVaultModal
          profile={profile}
          onUpdateProfile={(updater) => setProfile(updater)}
          onClose={() => setShowVaultModal(false)}
          showToast={showToast}
        />
      )}
    </div>
  );
};
