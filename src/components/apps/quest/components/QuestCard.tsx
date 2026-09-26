import React from 'react';
import { QuestItem } from '../../../../core/quest/questTypes';
import { Check, Lock, CheckCircle2 } from 'lucide-react';

interface QuestCardProps {
  quest: QuestItem;
  palette: string[]; // 5 色 Colormind 调色盘
  onDone: (questId: string) => void;
  onDelete?: (questId: string) => void;
  onOpenDetail?: (quest: QuestItem) => void;
}

export const QuestCard: React.FC<QuestCardProps> = ({
  quest,
  palette,
  onDone,
  onDelete,
  onOpenDetail,
}) => {
  const isEasterEggLocked = quest.category === 'easter_egg' && quest.status === 'in_progress';

  // 从 Colormind 色盘提取对应角色色彩
  // palette: [0: 基底底色, 1: 卡片表面, 2: 拟物主色, 3: 正文主色, 4: 高亮点缀]
  const cardBg = palette[1] || '#E0F2FE';
  const primaryColor = palette[2] || '#38BDF8';
  const textColor = palette[3] || '#334155';
  const accentColor = palette[4] || '#F59E0B';

  // 1. 渲染参考“我的-背包”样式的大图拟物徽章 (带有光芒射线和立体质感)
  const renderBackpackStyleIcon = () => {
    if (isEasterEggLocked) {
      return (
        <div
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '15px',
            background: 'radial-gradient(circle, #F1F5F9 30%, #E2E8F0 100%)',
            border: '2px solid rgba(255, 255, 255, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 3px 8px rgba(0, 0, 0, 0.08), inset 0 2px 4px rgba(255, 255, 255, 0.8)',
            flexShrink: 0,
          }}
        >
          <Lock size={20} color="#94A3B8" />
        </div>
      );
    }

    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          onOpenDetail?.(quest);
        }}
        className="nm-rebound-btn"
        style={{
          cursor: 'pointer',
          position: 'relative',
          width: '52px',
          height: '52px',
          borderRadius: '15px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          background: quest.status === 'completed'
            ? 'radial-gradient(circle, #ECFDF5 30%, #D1FAE5 100%)'
            : `radial-gradient(circle, #FFFFFF 20%, ${cardBg} 100%)`,
          border: '2px solid rgba(255, 255, 255, 0.95)',
          boxShadow: '0 3px 10px rgba(0, 0, 0, 0.07), inset 0 2px 4px rgba(255, 255, 255, 0.85)',
          flexShrink: 0,
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        }}
        title="点击查看详细信息、配置六维或删除任务"
      >
        {/* 背景光芒射线纹理（复刻我的-背包 SVG 装饰） */}
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: 0.32,
            pointerEvents: 'none',
          }}
          viewBox="0 0 100 100"
        >
          <g fill={quest.status === 'completed' ? '#34D399' : primaryColor}>
            <polygon points="50,50 38,0 62,0" />
            <polygon points="50,50 100,38 100,62" />
            <polygon points="50,50 62,100 38,100" />
            <polygon points="50,50 0,62 0,38" />
            <polygon points="50,50 82,18 95,30" />
            <polygon points="50,50 95,70 82,82" />
            <polygon points="50,50 18,82 5,70" />
            <polygon points="50,50 5,30 18,18" />
          </g>
        </svg>

        {/* 居中大图标 (手绘大尺寸 Emoji，带立体投影) */}
        <span
          style={{
            fontSize: '26px',
            zIndex: 2,
            filter: 'drop-shadow(0 3px 5px rgba(0, 0, 0, 0.16))',
            userSelect: 'none',
            lineHeight: 1,
          }}
        >
          {quest.icon || '🎁'}
        </span>
      </div>
    );
  };

  // 2. 渲染操作按钮 (打卡完成 / 前往 / 已达成)
  const renderActionButton = () => {
    if (isEasterEggLocked) {
      return (
        <div
          style={{
            padding: '5px 10px',
            borderRadius: '10px',
            background: 'rgba(241, 245, 249, 0.8)',
            color: '#64748B',
            fontSize: '10.5px',
            fontWeight: 800,
            border: '1px solid #CBD5E1',
          }}
        >
          <span>等待偶遇</span>
        </div>
      );
    }

    if (quest.status === 'completed') {
      return (
        <div
          style={{
            padding: '6px 12px',
            borderRadius: '10px',
            background: '#F0FDF4',
            color: '#15803D',
            fontSize: '11px',
            fontWeight: 800,
            border: '1.5px solid #BBF7D0',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
          }}
        >
          <CheckCircle2 size={13} strokeWidth={2.5} />
          <span>已达成</span>
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={() => onDone(quest.id)}
        style={{
          padding: '7px 15px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #34D399 0%, #059669 100%)',
          color: '#FFFFFF',
          fontSize: '11.5px',
          fontWeight: 900,
          border: '1px solid rgba(255, 255, 255, 0.85)',
          boxShadow: '0 3px 8px rgba(5, 150, 105, 0.35)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          transition: 'transform 0.1s ease',
        }}
      >
        <Check size={13} strokeWidth={2.8} />
        <span>打卡</span>
      </button>
    );
  };

  return (
    <div
      style={{
        padding: '10px 12px',
        borderRadius: '18px',
        // Colormind 柔和协调条纹背景 (带有微渐变与轻拟物边框)
        background: isEasterEggLocked
          ? 'linear-gradient(145deg, #F8FAFC 0%, #F1F5F9 100%)'
          : quest.status === 'completed'
          ? 'linear-gradient(145deg, #F8FAFC 0%, #F0FDF4 100%)'
          : `linear-gradient(145deg, #FFFFFF 0%, ${cardBg}40 100%)`,
        border: quest.status === 'completed'
          ? '1.5px solid #DCFCE7'
          : `1.5px solid ${primaryColor}35`,
        boxShadow: quest.status === 'completed'
          ? '0 2px 5px rgba(0, 0, 0, 0.03)'
          : '0 3px 10px rgba(0, 0, 0, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        boxSizing: 'border-box',
        transition: 'all 0.15s ease',
        opacity: quest.status === 'completed' ? 0.82 : 1,
      }}
    >
      {/* 1. 左侧大图背包式徽章 */}
      {renderBackpackStyleIcon()}

      {/* 2. 中间文字内容 */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 900,
              color: isEasterEggLocked ? '#64748B' : textColor,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {isEasterEggLocked ? '【未解暗号 · 奇遇】' : quest.title}
          </span>

          {/* 六维维度 Tag (如 ⚡ 精力 / 📚 智力 / ⚔️ 力量) */}
          {!isEasterEggLocked && quest.tag && (
            <span
              style={{
                fontSize: '9.5px',
                fontWeight: 800,
                color: primaryColor,
                background: `${primaryColor}18`,
                border: `1px solid ${primaryColor}35`,
                padding: '1px 5px',
                borderRadius: '6px',
                flexShrink: 0,
                letterSpacing: '0.2px',
              }}
            >
              {quest.tag}
            </span>
          )}
        </div>

        {/* 描述或谜面暗号 */}
        <p
          style={{
            margin: 0,
            fontSize: '10.5px',
            color: isEasterEggLocked ? '#64748B' : '#64748B',
            fontStyle: isEasterEggLocked ? 'italic' : 'normal',
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {isEasterEggLocked ? quest.easterEggClue : quest.desc}
        </p>
      </div>

      {/* 3. 右侧操作区 */}
      <div style={{ flexShrink: 0 }}>{renderActionButton()}</div>
    </div>
  );
};
