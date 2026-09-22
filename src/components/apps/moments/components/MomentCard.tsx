import React from 'react';
import { Star, Trash2, Image as ImageIcon } from 'lucide-react';
import { MomentItem } from '../../../../core/moments/momentsTypes';

interface MomentCardProps {
  moment: MomentItem;
  onToggleStar: (id: string) => void;
  onDelete: (id: string) => void;
  onPreviewImage: (url: string) => void;
}

// 纯手工绘制绿叶装饰
const WoodLeaf: React.FC<{ flip?: boolean }> = ({ flip }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 20 20"
    style={{
      flexShrink: 0,
      transform: flip ? 'scaleX(-1)' : 'none',
    }}
  >
    <path
      d="M 3 17 C 3 9 10 3 17 3 C 17 10 11 17 3 17 Z"
      fill="#22C55E"
      stroke="#502428"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M 5 15 Q 11 11 15 5"
      stroke="#15803D"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

// 木桩切片底座相框（100% 深度复刻原画下层木墩展示台）
const WoodLogPodium: React.FC<{
  imageUrl: string;
  onClick: () => void;
}> = ({ imageUrl, onClick }) => (
  <div
    onClick={onClick}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      cursor: 'pointer',
      width: '72px',
      flexShrink: 0,
    }}
  >
    {/* 上层照片立牌（拍立得微投影） */}
    <div
      style={{
        width: '64px',
        height: '64px',
        borderRadius: '12px',
        background: '#FFFFFF',
        border: '2px solid #502428',
        boxShadow: '0 2.5px 0 #502428',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 2,
      }}
    >
      <img
        src={imageUrl}
        alt="动态相片"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>

    {/* 下层木桩切片椭圆底座（带小绿星标志，深度对齐原图） */}
    <div
      style={{
        position: 'relative',
        marginTop: '-8px',
        width: '70px',
        height: '18px',
        background: '#E29547',
        border: '2px solid #502428',
        borderRadius: '50%',
        boxShadow: '0 2px 0 #87470E',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
      }}
    >
      {/* 绿星微标 */}
      <div
        style={{
          position: 'absolute',
          bottom: '-3px',
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          background: '#22C55E',
          border: '1.2px solid #502428',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          fontSize: '9px',
          fontWeight: 900,
        }}
      >
        C
      </div>
    </div>
  </div>
);

export const MomentCard: React.FC<MomentCardProps> = ({
  moment,
  onToggleStar,
  onDelete,
  onPreviewImage,
}) => {
  return (
    <div
      style={{
        width: '100%',
        background: '#FFFDF7',
        border: '2.5px solid #502428',
        borderRadius: '18px',
        boxShadow: '0 4px 0 #502428',
        overflow: 'hidden',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '14px',
      }}
    >
      {/* ================= 1. 顶部木板抬头（对齐原图 Basic Theme 悬挂木牌） ================= */}
      <div
        style={{
          width: '100%',
          background: 'linear-gradient(180deg, #F5BA38 0%, #D97706 100%)',
          borderBottom: '2.5px solid #502428',
          padding: '4px 10px',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* 左侧绿叶 + 萌系主题名 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <WoodLeaf />
          <span
            style={{
              fontSize: '13px',
              fontWeight: 900,
              color: '#FFFFFF',
              textShadow: '1px 1px 0 #502428, -1px -1px 0 #502428, 1px -1px 0 #502428, -1px 1px 0 #502428',
              fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
              letterSpacing: '0.3px',
            }}
          >
            {moment.themeTitle || '生活碎念'}
          </span>
          <WoodLeaf flip />
        </div>

        {/* 右侧日期与删除键 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 800,
              color: '#FFFBEB',
              textShadow: '0 1px 1px rgba(80, 36, 40, 0.6)',
            }}
          >
            {moment.dateStr}
          </span>
          <button
            onClick={() => onDelete(moment.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#FFFBEB',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              opacity: 0.85,
            }}
            title="删除"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* ================= 2. 卡片核心区：左侧内容 + 右侧虚线奖励与星标 ================= */}
      <div
        style={{
          display: 'flex',
          width: '100%',
          alignItems: 'stretch',
        }}
      >
        {/* 左侧：碎碎念文字 + 树桩相框图片 */}
        <div
          style={{
            flex: 1,
            padding: '10px 10px 10px 12px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
          }}
        >
          {/* 碎碎念正文 */}
          <div
            style={{
              fontSize: '12.5px',
              lineHeight: '18px',
              fontWeight: 700,
              color: '#451A03',
              wordBreak: 'break-word',
              marginBottom: moment.images && moment.images.length > 0 ? '10px' : '4px',
            }}
          >
            {moment.content}
          </div>

          {/* 图片展示排版：木桩立牌展示台 */}
          {moment.images && moment.images.length > 0 && (
            <div
              style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                marginTop: '4px',
              }}
            >
              {moment.images.map((img, idx) => (
                <WoodLogPodium
                  key={idx}
                  imageUrl={img}
                  onClick={() => onPreviewImage(img)}
                />
              ))}
            </div>
          )}
        </div>

        {/* 右侧：纵向虚线分割线 + Reward 金币 + 星标 OK 键 (100% 对齐原图) */}
        <div
          style={{
            width: '68px',
            borderLeft: '2px dashed #CBB59D',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 4px',
            boxSizing: 'border-box',
            background: '#FFFBF2',
            flexShrink: 0,
          }}
        >
          {/* Reward 奖励字标 */}
          <span
            style={{
              fontSize: '11px',
              fontWeight: 900,
              color: '#87470E',
              fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
              marginBottom: '2px',
            }}
          >
            Reward
          </span>

          {/* 金币大图标 (对齐原图金币压纹) */}
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #FDE047 0%, #F59E0B 70%, #D97706 100%)',
              border: '2px solid #502428',
              boxShadow: '0 2px 0 #87470E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              marginBottom: '1px',
            }}
          >
            {/* 金币内双环凹槽 */}
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                border: '1.2px solid #D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '12px',
                color: '#87470E',
              }}
            >
              ★
            </div>
          </div>

          {/* 奖励数值 (如 5000) */}
          <span
            style={{
              fontSize: '11px',
              fontWeight: 900,
              color: '#502428',
              marginBottom: '6px',
            }}
          >
            {moment.rewardCoins || 5000}
          </span>

          {/* 星标 OK 交互键（深度对齐原画灰色/黄色圆角 OK 胶囊，点击点亮/收藏） */}
          <button
            onClick={() => onToggleStar(moment.id)}
            style={{
              width: '54px',
              height: '24px',
              borderRadius: '12px',
              background: moment.isStarred
                ? 'linear-gradient(180deg, #FBBF24 0%, #F59E0B 100%)'
                : 'linear-gradient(180deg, #E5E7EB 0%, #CBD5E1 100%)',
              border: '2px solid #502428',
              boxShadow: moment.isStarred ? '0 2px 0 #B45309' : '0 2px 0 #64748B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              padding: 0,
              transition: 'all 0.15s ease',
            }}
            title={moment.isStarred ? '已加入星标' : '点击星标'}
          >
            <Star
              size={11}
              fill={moment.isStarred ? '#FFFFFF' : 'none'}
              color={moment.isStarred ? '#FFFFFF' : '#502428'}
              strokeWidth={2.5}
            />
            <span
              style={{
                fontSize: '10px',
                fontWeight: 900,
                color: moment.isStarred ? '#FFFFFF' : '#502428',
                fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
              }}
            >
              {moment.isStarred ? '已星标' : 'OK'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
