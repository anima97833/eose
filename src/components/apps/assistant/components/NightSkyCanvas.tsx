import React from 'react';
import {
  BookOpen,
  ScrollText,
  BookMarked,
  Feather,
  Zap,
  Clock,
  Save,
  HelpCircle,
  GitBranch,
  Sparkles,
  Camera,
  User,
  Image as ImageIcon,
  Film,
  Gift,
  Compass,
} from 'lucide-react';
import { ALL_STAR_APPS } from '../../../../core/assistant/appContextAggregator';
import { StarAppMeta } from '../../../../core/assistant/assistantTypes';
import { CharacterProfile } from '../../../../types/character';

interface NightSkyCanvasProps {
  selectedStarIds: string[];
  onToggleStar: (starId: string) => void;
  activeCharacter: CharacterProfile | null;
  customAvatarUrl: string | null;
  onOpenCharacterPicker: () => void;
  isCompactMode: boolean; // 自适应折叠模式：输入或长文时为 true (25% 高度)
}

export const NightSkyCanvas: React.FC<NightSkyCanvasProps> = ({
  selectedStarIds,
  onToggleStar,
  activeCharacter,
  customAvatarUrl,
  onOpenCharacterPicker,
  isCompactMode,
}) => {
  // 查找已选中的星星元数据，按天球横坐标排序后连接成自然星座星轨
  const selectedStars = ALL_STAR_APPS
    .filter((s) => selectedStarIds.includes(s.id))
    .sort((a, b) => a.x - b.x);

  // 图标渲染辅助
  const renderStarIcon = (iconName: string, color: string) => {
    const size = isCompactMode ? 11 : 13;
    switch (iconName) {
      case 'BookOpen': return <BookOpen size={size} color={color} />;
      case 'ScrollText': return <ScrollText size={size} color={color} />;
      case 'BookMarked': return <BookMarked size={size} color={color} />;
      case 'Feather': return <Feather size={size} color={color} />;
      case 'Zap': return <Zap size={size} color={color} />;
      case 'Clock': return <Clock size={size} color={color} />;
      case 'Save': return <Save size={size} color={color} />;
      case 'HelpCircle': return <HelpCircle size={size} color={color} />;
      case 'GitBranch': return <GitBranch size={size} color={color} />;
      case 'Sparkles': return <Sparkles size={size} color={color} />;
      case 'Camera': return <Camera size={size} color={color} />;
      case 'User': return <User size={size} color={color} />;
      case 'Image': return <ImageIcon size={size} color={color} />;
      case 'Film': return <Film size={size} color={color} />;
      case 'Gift': return <Gift size={size} color={color} />;
      case 'Compass': return <Compass size={size} color={color} />;
      default: return <Sparkles size={size} color={color} />;
    }
  };

  // 计算星宿在不同视野模式下的自适应天球坐标 (开启防重叠与密度平滑)
  const getStarY = (starY: number) => {
    if (!isCompactMode) return starY;
    // 紧凑模式：将 14%~58% 映射至 12%~54% 舒适紧凑高度，彻底避开底部草坡与角色
    return 12 + ((starY - 14) / 44) * 40;
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: isCompactMode ? '160px' : '52%',
        minHeight: isCompactMode ? '150px' : '320px',
        maxHeight: isCompactMode ? '180px' : '420px',
        transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.25, 1)',
        background: 'radial-gradient(ellipse at 80% 20%, #1e3a8a 0%, #0f172a 45%, #050b14 100%)',
        overflow: 'hidden',
        userSelect: 'none',
        flexShrink: 0,
        boxShadow: 'inset 0 -10px 25px rgba(0,0,0,0.5)',
      }}
    >
      {/* 1. 星空背景与静态小星尘 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: `
            radial-gradient(1px 1px at 20px 30px, #ffffff 100%, transparent),
            radial-gradient(1.5px 1.5px at 120px 80px, #fde047 100%, transparent),
            radial-gradient(1px 1px at 240px 40px, #ffffff 100%, transparent),
            radial-gradient(2px 2px at 310px 110px, #93c5fd 100%, transparent),
            radial-gradient(1.2px 1.2px at 70px 140px, #ffffff 100%, transparent),
            radial-gradient(1.5px 1.5px at 190px 170px, #fef08a 100%, transparent),
            radial-gradient(1px 1px at 280px 190px, #ffffff 100%, transparent),
            radial-gradient(1.2px 1.2px at 340px 60px, #ffffff 100%, transparent)
          `,
          backgroundSize: '360px 220px',
          opacity: 0.65,
        }}
      />

      {/* 2. 右上方金色彗星划过与绚丽花火粒子（参考用户原图的暖橙花火） */}
      <div
        style={{
          position: 'absolute',
          top: '-10px',
          right: '-20px',
          width: '260px',
          height: '180px',
          pointerEvents: 'none',
          zIndex: 2,
          opacity: isCompactMode ? 0.35 : 0.9,
          transition: 'opacity 0.4s ease',
        }}
      >
        {/* 第一道流星长轨迹 */}
        <div
          style={{
            position: 'absolute',
            top: '30px',
            right: '20px',
            width: '180px',
            height: '5px',
            background: 'linear-gradient(270deg, #fdba74 0%, #fb923c 40%, rgba(251, 146, 60, 0) 100%)',
            borderRadius: '999px',
            transform: 'rotate(-24deg)',
            boxShadow: '0 0 12px #fb923c, 0 0 20px rgba(254, 215, 170, 0.6)',
            animation: 'meteorPulse 3s ease-in-out infinite alternate',
          }}
        />

        {/* 第二道流星短轨迹 */}
        <div
          style={{
            position: 'absolute',
            top: '60px',
            right: '45px',
            width: '130px',
            height: '4px',
            background: 'linear-gradient(270deg, #fed7aa 0%, #f97316 45%, rgba(249, 115, 22, 0) 100%)',
            borderRadius: '999px',
            transform: 'rotate(-24deg)',
            boxShadow: '0 0 10px #f97316',
          }}
        />

        {/* 爆开的橙金花火大星芒 */}
        <div
          style={{
            position: 'absolute',
            top: '55px',
            right: '135px',
            width: '28px',
            height: '28px',
            background: 'radial-gradient(circle, #fffbeb 20%, #f59e0b 60%, rgba(245, 158, 11, 0) 100%)',
            borderRadius: '50%',
            filter: 'drop-shadow(0 0 8px #f59e0b)',
            animation: 'sparkBurst 2.5s ease-in-out infinite alternate',
          }}
        >
          {/* 花火十字光芒 */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '-8px',
              right: '-8px',
              height: '2px',
              backgroundColor: '#fef08a',
              borderRadius: '2px',
              transform: 'translateY(-50%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '-8px',
              bottom: '-8px',
              width: '2px',
              backgroundColor: '#fef08a',
              borderRadius: '2px',
              transform: 'translateX(-50%)',
            }}
          />
        </div>
      </div>

      {/* 3. 星轨星座连线 (SVG 柔光流动线条) */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 3,
        }}
      >
        <defs>
          <linearGradient id="constellationGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#f472b6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.8" />
          </linearGradient>
          <filter id="starGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {selectedStars.length >= 2 &&
          selectedStars.map((star, idx) => {
            if (idx === selectedStars.length - 1) return null;
            const nextStar = selectedStars[idx + 1];
            return (
              <line
                key={`constellation_${star.id}_${nextStar.id}`}
                x1={`${star.x}%`}
                y1={`${getStarY(star.y)}%`}
                x2={`${nextStar.x}%`}
                y2={`${getStarY(nextStar.y)}%`}
                stroke="url(#constellationGradient)"
                strokeWidth="1.8"
                strokeDasharray="4 3"
                filter="url(#starGlow)"
                style={{
                  animation: 'dashFlow 12s linear infinite',
                }}
              />
            );
          })}
      </svg>

      {/* 4. 繁星星宿节点（各应用微光漂浮） */}
      {ALL_STAR_APPS.map((star: StarAppMeta, index: number) => {
        const isSelected = selectedStarIds.includes(star.id);
        const topPos = getStarY(star.y);

        return (
          <div
            key={star.id}
            onClick={() => onToggleStar(star.id)}
            title={`点击${isSelected ? '取消选中' : '点亮并连结'}《${star.name}》数据`}
            style={{
              position: 'absolute',
              left: `${star.x}%`,
              top: `${topPos}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            {/* 星星实体粒子 */}
            <div
              style={{
                width: isSelected ? (isCompactMode ? 26 : 30) : (isCompactMode ? 18 : 22),
                height: isSelected ? (isCompactMode ? 26 : 30) : (isCompactMode ? 18 : 22),
                borderRadius: '50%',
                backgroundColor: isSelected ? '#ffffff' : 'rgba(255,255,255,0.22)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isSelected
                  ? `0 0 16px ${star.glowColor}, 0 0 28px ${star.glowColor}, inset 0 0 4px #ffffff`
                  : '0 0 6px rgba(255,255,255,0.2)',
                border: isSelected ? `2px solid ${star.themeColor}` : '1px solid rgba(255,255,255,0.35)',
                animation: isSelected ? 'none' : `floatStar ${3 + (index % 3)}s ease-in-out infinite alternate`,
                transition: 'all 0.3s ease',
              }}
            >
              {renderStarIcon(star.iconName, isSelected ? star.themeColor : 'rgba(255,255,255,0.85)')}
            </div>

            {/* 应用名称小胶囊 */}
            <span
              style={{
                marginTop: '4px',
                fontSize: isCompactMode ? '9px' : '10px',
                fontWeight: isSelected ? 800 : 500,
                color: isSelected ? '#ffffff' : 'rgba(255,255,255,0.65)',
                textShadow: isSelected ? `0 0 8px ${star.themeColor}` : '0 1px 3px rgba(0,0,0,0.8)',
                letterSpacing: '0.2px',
                backgroundColor: isSelected ? 'rgba(15, 23, 42, 0.75)' : 'transparent',
                padding: isSelected ? '1px 5px' : '0',
                borderRadius: '6px',
                border: isSelected ? `1px solid ${star.themeColor}` : 'none',
                whiteSpace: 'nowrap',
                transition: 'all 0.25s ease',
              }}
            >
              {star.name}
            </span>
          </div>
        );
      })}

      {/* 5. 绿色草坡背景（吉卜力草坡） */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: isCompactMode ? '35px' : '90px',
          background: 'linear-gradient(180deg, #1e453e 0%, #14352f 50%, #0d2420 100%)',
          borderTopLeftRadius: '60% 30px',
          borderTopRightRadius: '30% 20px',
          boxShadow: '0 -4px 16px rgba(0,0,0,0.4)',
          zIndex: 4,
          transition: 'height 0.4s ease',
          display: 'flex',
          alignItems: 'flex-end',
          paddingBottom: '6px',
          paddingLeft: '16px',
          paddingRight: '16px',
        }}
      >
        {/* 草地细纹提示 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, zIndex: 6, opacity: 0.85 }}>
          <span style={{ fontSize: '10px', color: '#86efac', fontWeight: 600 }}>
            {selectedStarIds.length > 0
              ? `✨ 已连结 ${selectedStarIds.length} 颗星宿知识库`
              : '🌟 轻触夜空星星，唤醒对应应用记忆'}
          </span>
        </div>
      </div>

      {/* 6. 坐在草坡上的可爱角色（背包小兔/微聊伴侣头像），支持点击切换或上传 */}
      <div
        onClick={onOpenCharacterPicker}
        title="点击切换微聊角色或上传专属草地形象"
        style={{
          position: 'absolute',
          bottom: isCompactMode ? '6px' : '14px',
          right: '28px',
          zIndex: 8,
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transition: 'all 0.3s ease',
        }}
      >
        {/* 角色形象本体 */}
        {customAvatarUrl ? (
          <div
            style={{
              width: isCompactMode ? '36px' : '58px',
              height: isCompactMode ? '36px' : '58px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid #fef08a',
              boxShadow: '0 4px 14px rgba(0,0,0,0.6), 0 0 12px rgba(254, 240, 138, 0.4)',
            }}
          >
            <img
              src={customAvatarUrl}
              alt="自定义学伴形象"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        ) : activeCharacter?.avatar ? (
          <div
            style={{
              width: isCompactMode ? '36px' : '58px',
              height: isCompactMode ? '36px' : '58px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid #fef08a',
              boxShadow: '0 4px 14px rgba(0,0,0,0.6), 0 0 12px rgba(254, 240, 138, 0.4)',
            }}
          >
            <img
              src={activeCharacter.avatar}
              alt={activeCharacter.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        ) : (
          /* 纯正原图背包小兔背影 SVG (圆润小兔体态 + 小耳朵 + 棕色背包) */
          <div
            style={{
              width: isCompactMode ? '40px' : '64px',
              height: isCompactMode ? '46px' : '72px',
              position: 'relative',
              filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))',
            }}
          >
            <svg viewBox="0 0 100 115" width="100%" height="100%">
              {/* 小兔耳朵 */}
              <ellipse cx="60" cy="22" rx="6" ry="18" fill="#e2e8f0" transform="rotate(18 60 22)" />
              <ellipse cx="70" cy="25" rx="5" ry="16" fill="#e2e8f0" transform="rotate(28 70 25)" />
              
              {/* 小兔圆圆脑袋 */}
              <ellipse cx="54" cy="50" rx="22" ry="20" fill="#f1f5f9" />
              
              {/* 身体背影 */}
              <ellipse cx="52" cy="85" rx="26" ry="24" fill="#f8fafc" />
              
              {/* 可爱小书包 */}
              <rect x="42" y="70" width="22" height="24" rx="6" fill="#9a3412" stroke="#7c2d12" strokeWidth="2" />
              {/* 书包盖子 */}
              <path d="M 40 76 Q 53 82 66 76" fill="none" stroke="#7c2d12" strokeWidth="2" />
              {/* 背带 */}
              <path d="M 46 68 Q 36 78 44 88" fill="none" stroke="#7c2d12" strokeWidth="2.5" />
            </svg>
          </div>
        )}

        {/* 角色名字徽章 */}
        <div
          style={{
            marginTop: '-2px',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(254, 240, 138, 0.4)',
            borderRadius: '999px',
            padding: '1px 7px',
            fontSize: '9px',
            color: '#fef08a',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
          }}
        >
          <span>{activeCharacter ? activeCharacter.name : '小学伴'}</span>
          <Sparkles size={8} color="#facc15" />
        </div>
      </div>

      <style>{`
        @keyframes floatStar {
          0% { transform: translateY(0px) scale(1); }
          100% { transform: translateY(-4px) scale(1.08); }
        }
        @keyframes meteorPulse {
          0% { opacity: 0.7; transform: rotate(-24deg) scaleX(0.95); }
          100% { opacity: 1; transform: rotate(-24deg) scaleX(1.05); }
        }
        @keyframes sparkBurst {
          0% { transform: scale(0.9) rotate(0deg); opacity: 0.75; }
          100% { transform: scale(1.15) rotate(15deg); opacity: 1; }
        }
        @keyframes dashFlow {
          to { stroke-dashoffset: -100; }
        }
      `}</style>
    </div>
  );
};
