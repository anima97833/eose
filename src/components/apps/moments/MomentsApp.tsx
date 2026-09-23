import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Star,
  Plus,
  X,
  RefreshCw,
  Heart,
} from 'lucide-react';
import { MomentItem } from '../../../core/moments/momentsTypes';
import {
  loadMomentsFromDB,
  saveMomentToDB,
  toggleStarMomentInDB,
  deleteMomentFromDB,
  loadBannerUrlFromDB,
  saveBannerUrlToDB,
  rewardMomentPublishToRPG,
} from '../../../core/moments/momentsStorage';
import { MomentCard } from './components/MomentCard';
import { PublishMomentSheet } from './components/PublishMomentSheet';
import { BannerUploadModal } from './components/BannerUploadModal';
import { recordMomentLike } from '../../../core/quest/easterEggEngine';

interface MomentsAppProps {
  onBack: () => void;
}

export const MomentsApp: React.FC<MomentsAppProps> = ({ onBack }) => {
  // 分类 Tab：全部 (Character) vs 星标 (Collection)
  const [activeTab, setActiveTab] = useState<'all' | 'starred'>('all');
  // 主题木标点击筛选状态 (null 表示不过滤木标)
  const [selectedThemeFilter, setSelectedThemeFilter] = useState<string | null>(null);

  // 动态列表
  const [moments, setMoments] = useState<MomentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 自定义背景横幅
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);

  // 弹窗状态
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // 挂载时间戳，防止从桌面打开应用时的幽灵穿透点击
  const mountedAtRef = useRef<number>(Date.now());

  // 吐司提示
  const [toastText, setToastText] = useState<string | null>(null);
  const showToast = (text: string) => {
    setToastText(text);
    setTimeout(() => setToastText(null), 2000);
  };

  // 挂载加载
  useEffect(() => {
    let isMounted = true;
    Promise.all([loadMomentsFromDB(), loadBannerUrlFromDB()]).then(([list, banner]) => {
      if (!isMounted) return;
      setMoments(list);
      setBannerUrl(banner);
      setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // 切换星标
  const handleToggleStar = async (id: string) => {
    const isNowStarred = await toggleStarMomentInDB(id);
    setMoments((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isStarred: isNowStarred } : m))
    );
    if (isNowStarred) {
      recordMomentLike();
    }
    showToast(isNowStarred ? '已加星标' : '已移出星标');
  };

  // 删除动态
  const handleDeleteMoment = async (id: string) => {
    await deleteMomentFromDB(id);
    setMoments((prev) => prev.filter((m) => m.id !== id));
    showToast('动态已删除');
  };

  // 发布新动态
  const handlePublishMoment = async (newMoment: MomentItem) => {
    await saveMomentToDB(newMoment);
    const reward = rewardMomentPublishToRPG(newMoment.attributeTag || 'SPI');
    setMoments((prev) => [newMoment, ...prev]);
    setShowPublishModal(false);
    showToast(`发布成功！获得 ${reward.message}`);
  };

  // 点击卡片木标切换筛选
  const handleSelectTheme = (theme: string) => {
    setSelectedThemeFilter((prev) => (prev === theme ? null : theme));
  };

  // 保存背景
  const handleSaveBanner = async (newBanner: string | null) => {
    await saveBannerUrlToDB(newBanner);
    setBannerUrl(newBanner);
    showToast('背景已保存');
  };

  // 过滤当前列表（星标 + 主题木标双重筛选）
  let displayedMoments =
    activeTab === 'starred'
      ? moments.filter((m) => m.isStarred)
      : moments;

  if (selectedThemeFilter) {
    displayedMoments = displayedMoments.filter(
      (m) => (m.themeTitle || '生活碎念') === selectedThemeFilter
    );
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        background: '#FAF5EE', // 温润原麦米黄背景
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
            top: '56px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            background: 'rgba(80, 36, 40, 0.92)',
            backdropFilter: 'blur(8px)',
            color: '#FFFFFF',
            fontSize: '12px',
            fontWeight: 800,
            padding: '5px 14px',
            borderRadius: '9999px',
            boxShadow: '0 4px 12px rgba(80, 36, 40, 0.28)',
            pointerEvents: 'none',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          {toastText}
        </div>
      )}

      {/* ================= 1. 顶部自定义全景大图横幅（点击可更换背景） ================= */}
      <div
        onClick={() => {
          if (Date.now() - mountedAtRef.current < 350) return;
          setShowBannerModal(true);
        }}
        style={{
          width: '100%',
          height: '190px',
          position: 'relative',
          flexShrink: 0,
          overflow: 'hidden',
          cursor: 'pointer',
        }}
        title="点击更换朋友圈背景"
      >
        {/* 背景渲染（支持用户自定义图片，默认提供原画蓝天白云草地彩虹） */}
        {bannerUrl ? (
          <img
            src={bannerUrl}
            alt="朋友圈背景"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(180deg, #38BDF8 0%, #7DD3FC 46%, #4ADE80 46%, #22C55E 100%)',
              position: 'relative',
            }}
          >
            {/* 原画彩虹拱门 */}
            <div
              style={{
                position: 'absolute',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '260px',
                height: '130px',
                borderRadius: '130px 130px 0 0',
                border: '10px solid #F87171',
                borderBottom: 'none',
                boxShadow: '0 -8px 0 #FB923C, 0 -16px 0 #FACC15',
                opacity: 0.85,
                pointerEvents: 'none',
              }}
            />

            {/* 原画漂浮白云 */}
            <div
              style={{
                position: 'absolute',
                top: '18px',
                left: '20px',
                width: '50px',
                height: '24px',
                background: '#FFFFFF',
                borderRadius: '20px',
                boxShadow: '10px -8px 0 6px #FFFFFF',
                opacity: 0.9,
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '28px',
                right: '28px',
                width: '45px',
                height: '20px',
                background: '#FFFFFF',
                borderRadius: '20px',
                boxShadow: '-8px -6px 0 5px #FFFFFF',
                opacity: 0.9,
              }}
            />

            {/* 原画背景远山小树丛 */}
            <div
              style={{
                position: 'absolute',
                top: '40px',
                left: '0',
                right: '0',
                height: '48px',
                display: 'flex',
                justifyContent: 'space-around',
                opacity: 0.95,
                pointerEvents: 'none',
              }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#16A34A', marginTop: '10px' }} />
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#15803D' }} />
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#166534', marginTop: '6px' }} />
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#15803D' }} />
            </div>
          </div>
        )}

        {/* 顶部操作按钮（左上角萌系蓝色返回圆钮） */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBack();
          }}
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #38BDF8 0%, #0284C7 100%)',
            border: '2px solid #502428',
            boxShadow: '0 2px 0 #502428, 0 4px 8px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
            zIndex: 10,
          }}
          title="返回"
        >
          <ArrowLeft size={16} color="#FFFFFF" strokeWidth={3.5} />
        </button>


        {/* ================= 2. 分类导航栏（对齐原图 Character / Collection，改为 全部 / 星标） ================= */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            bottom: 0,
            left: '12px',
            right: '12px',
            display: 'flex',
            gap: '8px',
            zIndex: 12,
            cursor: 'default',
          }}
        >
          {/* 全部 Tab（原画缝线毛呢棕色风格） */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab('all');
            }}
            style={{
              flex: 1,
              height: '34px',
              background: activeTab === 'all' ? '#B45309' : '#D97706',
              border: '2.5px solid #502428',
              borderBottom: 'none',
              borderRadius: '14px 14px 0 0',
              boxShadow: activeTab === 'all' ? '0 -2px 0 rgba(255,255,255,0.4)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 10px',
              position: 'relative',
            }}
          >
            {/* 内侧虚线缝线效果 */}
            <div
              style={{
                position: 'absolute',
                inset: '2.5px 4px 0 4px',
                border: '1.5px dashed rgba(255, 255, 255, 0.65)',
                borderBottom: 'none',
                borderRadius: '10px 10px 0 0',
                pointerEvents: 'none',
              }}
            />
            <span
              style={{
                fontSize: '13px',
                fontWeight: 900,
                color: '#FFFFFF',
                fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
                letterSpacing: '0.5px',
                textShadow: '1px 1px 0 #502428',
              }}
            >
              全部
            </span>
          </button>

          {/* 星标 Tab（原画亮金黄高亮风格） */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab('starred');
            }}
            style={{
              flex: 1,
              height: '34px',
              background: activeTab === 'starred' ? '#FBBF24' : '#FDE68A',
              border: '2.5px solid #502428',
              borderBottom: 'none',
              borderRadius: '14px 14px 0 0',
              boxShadow: activeTab === 'starred' ? '0 -2px 0 rgba(255,255,255,0.7)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '0 10px',
            }}
          >
            <Star
              size={13}
              fill={activeTab === 'starred' ? '#502428' : 'none'}
              color="#502428"
              strokeWidth={2.5}
            />
            <span
              style={{
                fontSize: '13px',
                fontWeight: 900,
                color: '#502428',
                fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
                letterSpacing: '0.5px',
              }}
            >
              星标
            </span>
          </button>
        </div>
      </div>

      {/* ================= 3. 动态列表滚动流（自适应手账卡片） ================= */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '12px 12px 60px',
          boxSizing: 'border-box',
        }}
      >
        {/* 当前主题木标筛选指示浮条 */}
        {selectedThemeFilter && (
          <div
            style={{
              padding: '6px 12px',
              marginBottom: '12px',
              borderRadius: '12px',
              background: 'linear-gradient(180deg, #FDE68A 0%, #F59E0B 100%)',
              border: '2px solid #502428',
              boxShadow: '0 2.5px 0 #B45309',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              animation: 'fadeIn 0.15s ease-out',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '14px' }}>🪵</span>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 900,
                  color: '#502428',
                  fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
                }}
              >
                木标筛选：{selectedThemeFilter} ({displayedMoments.length} 条)
              </span>
            </div>
            <button
              onClick={() => setSelectedThemeFilter(null)}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #502428',
                borderRadius: '8px',
                padding: '2px 8px',
                fontSize: '10.5px',
                fontWeight: 900,
                color: '#502428',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                boxShadow: '0 1px 0 #502428',
              }}
            >
              <span>清除</span>
              <span>✕</span>
            </button>
          </div>
        )}

        {loading ? (
          <div
            style={{
              paddingTop: '40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              color: '#87470E',
            }}
          >
            <RefreshCw size={24} className="animate-spin" />
            <span style={{ fontSize: '12px', fontWeight: 800 }}>翻开动态...</span>
          </div>
        ) : displayedMoments.length === 0 ? (
          <div
            style={{
              paddingTop: '48px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              color: '#87470E',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#F3EFE6',
                border: '2px solid #502428',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {activeTab === 'starred' ? (
                <Star size={30} color="#F59E0B" fill="#FDE68A" />
              ) : (
                <Heart size={30} color="#F472B6" />
              )}
            </div>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 900,
                fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
              }}
            >
              {selectedThemeFilter
                ? `木标「${selectedThemeFilter}」下暂无碎碎念`
                : activeTab === 'starred'
                ? '暂无星标碎碎念'
                : '快来写下第一条碎碎念吧～'}
            </span>
            {selectedThemeFilter && (
              <button
                onClick={() => setSelectedThemeFilter(null)}
                style={{
                  background: '#F59E0B',
                  border: '1.5px solid #502428',
                  borderRadius: '10px',
                  padding: '4px 12px',
                  color: '#502428',
                  fontSize: '11px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 1.5px 0 #B45309',
                }}
              >
                查看全部动态
              </button>
            )}
          </div>
        ) : (
          displayedMoments.map((moment) => (
            <MomentCard
              key={moment.id}
              moment={moment}
              onToggleStar={handleToggleStar}
              onDelete={handleDeleteMoment}
              onPreviewImage={(url) => setPreviewImageUrl(url)}
              onSelectTheme={handleSelectTheme}
            />
          ))
        )}
      </div>

      {/* 右下角写动态悬浮快捷按钮 */}
      <button
        onClick={() => setShowPublishModal(true)}
        style={{
          position: 'absolute',
          right: '16px',
          bottom: '20px',
          height: '40px',
          padding: '0 16px',
          borderRadius: '20px',
          background: 'linear-gradient(180deg, #FDE047 0%, #F59E0B 100%)',
          border: '2.5px solid #502428',
          boxShadow: '0 4px 0 #B45309, 0 6px 16px rgba(180, 83, 9, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          cursor: 'pointer',
          zIndex: 40,
        }}
        title="写碎碎念"
      >
        <Plus size={16} color="#502428" strokeWidth={3} />
        <span
          style={{
            fontSize: '12.5px',
            fontWeight: 900,
            color: '#502428',
            fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
          }}
        >
          写碎碎念
        </span>
      </button>

      {/* ================= 4. 写碎碎念弹窗 ================= */}
      {showPublishModal && (
        <PublishMomentSheet
          onPublish={handlePublishMoment}
          onClose={() => setShowPublishModal(false)}
        />
      )}

      {/* ================= 5. 更换背景大图弹窗 ================= */}
      {showBannerModal && (
        <BannerUploadModal
          currentBanner={bannerUrl}
          onSave={handleSaveBanner}
          onClose={() => setShowBannerModal(false)}
        />
      )}

      {/* ================= 6. 大图预览灯箱 ================= */}
      {previewImageUrl && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 110,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            animation: 'fadeIn 0.2s ease-out',
          }}
          onClick={() => setPreviewImageUrl(null)}
        >
          <img
            src={previewImageUrl}
            alt="大图预览"
            style={{
              maxWidth: '90%',
              maxHeight: '80%',
              borderRadius: '16px',
              border: '2px solid #FFFFFF',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              objectFit: 'contain',
            }}
          />
          <button
            onClick={() => setPreviewImageUrl(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#FFFFFF',
              border: '2px solid #502428',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} color="#502428" strokeWidth={3} />
          </button>
        </div>
      )}
    </div>
  );
};
