import React, { useState, useEffect, useRef } from 'react';
import { X, Image as ImageIcon, Upload, RefreshCw, Check } from 'lucide-react';
import {
  ActivityBannerItem,
  getAllActivityBanners,
  saveActivityBanner,
  resetActivityBannerBg,
} from '../../../../core/rpg/activityBannerStorage';

interface ActivityLogModalProps {
  onClose: () => void;
  onToast: (text: string) => void;
  onOpenSignIn?: () => void;
  onOpenChallenge?: () => void;
}

export const ActivityLogModal: React.FC<ActivityLogModalProps> = ({
  onClose,
  onToast,
  onOpenSignIn,
  onOpenChallenge,
}) => {
  const [banners, setBanners] = useState<ActivityBannerItem[]>([]);
  const [editingBanner, setEditingBanner] = useState<ActivityBannerItem | null>(null);

  // 换背景弹窗状态
  const [previewBg, setPreviewBg] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    const list = await getAllActivityBanners();
    setBanners(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openEditModal = (banner: ActivityBannerItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingBanner(banner);
    setPreviewBg(banner.customBgUrl);
    setUrlInput('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreviewBg(result);
      setUrlInput('');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCustomBg = async () => {
    if (!editingBanner) return;
    const finalBg = previewBg || (urlInput.trim() ? urlInput.trim() : null);

    if (finalBg) {
      await saveActivityBanner({
        id: editingBanner.id,
        customBgUrl: finalBg,
      });
      onToast(`「${editingBanner.title}」背板已更新`);
    } else {
      await resetActivityBannerBg(editingBanner.id);
      onToast(`「${editingBanner.title}」已恢复默认背板`);
    }

    setEditingBanner(null);
    loadData();
  };

  const handleResetBg = () => {
    setPreviewBg(null);
    setUrlInput('');
  };

  // 边框与默认底色配置（100% 临摹图3红、黄、绿、紫明快卡通卡片）
  const getBannerThemeConfig = (themeColor: string) => {
    switch (themeColor) {
      case 'coral':
        return {
          borderColor: '#DE5948',
          bg: '#E45F4D',
          pillBg: 'linear-gradient(180deg, #62EAD6 0%, #39CEB9 100%)',
          pillBorder: '#237D70',
          pillTextColor: '#134F47',
        };
      case 'amber':
        return {
          borderColor: '#E6A734',
          bg: '#F3B845',
          pillBg: 'linear-gradient(180deg, #62EAD6 0%, #39CEB9 100%)',
          pillBorder: '#237D70',
          pillTextColor: '#134F47',
        };
      case 'emerald':
        return {
          borderColor: '#82C366',
          bg: '#98D27C',
          pillBg: 'linear-gradient(180deg, #3E7E70 0%, #285B50 100%)',
          pillBorder: '#1A433A',
          pillTextColor: '#FFFFFF',
        };
      case 'violet':
      default:
        return {
          borderColor: '#8C7ED5',
          bg: '#9E91E3',
          pillBg: 'linear-gradient(180deg, #62EAD6 0%, #39CEB9 100%)',
          pillBorder: '#237D70',
          pillTextColor: '#134F47',
        };
    }
  };

  // 100% 还原图3中的萌系卡通插画（狗狗群、小浣熊钱袋、小猫营地）
  const renderCardIllustration = (themeColor: string) => {
    switch (themeColor) {
      case 'coral':
        return (
          <div
            style={{
              position: 'absolute',
              right: '48px',
              bottom: '0px',
              display: 'flex',
              alignItems: 'flex-end',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            {/* 萌犬组合（哈士奇、柴犬、秋田） */}
            <svg width="150" height="76" viewBox="0 0 150 76" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="shibaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFA665" />
                  <stop offset="100%" stopColor="#E9803C" />
                </linearGradient>
                <linearGradient id="huskyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#7E8794" />
                  <stop offset="100%" stopColor="#555D6A" />
                </linearGradient>
                <linearGradient id="akitaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#8A5135" />
                  <stop offset="100%" stopColor="#6C3922" />
                </linearGradient>
              </defs>

              {/* 背景装饰淡波纹 */}
              <path
                d="M -30 20 Q -10 10, 10 25 T 50 20 T 90 25"
                fill="none"
                stroke="rgba(255, 255, 255, 0.22)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* 左侧小灰哈士奇 */}
              <g transform="translate(10, 18)">
                <ellipse cx="20" cy="28" rx="14" ry="16" fill="#3D1E16" />
                <ellipse cx="20" cy="28" rx="12" ry="14" fill="url(#huskyGrad)" />
                {/* 双耳 */}
                <polygon points="10,18 16,8 20,20" fill="#3D1E16" />
                <polygon points="11,18 16,10 19,20" fill="#FFAEC0" />
                <polygon points="30,18 24,8 20,20" fill="#3D1E16" />
                <polygon points="29,18 24,10 21,20" fill="#FFAEC0" />
                {/* 白脸与黑鼻眼 */}
                <ellipse cx="20" cy="33" rx="8" ry="7" fill="#FFFFFF" />
                <circle cx="15" cy="27" r="1.8" fill="#3D1E16" />
                <circle cx="25" cy="27" r="1.8" fill="#3D1E16" />
                <ellipse cx="20" cy="31" rx="2" ry="1.4" fill="#3D1E16" />
              </g>

              {/* 中间大柴犬 (挥舞小爪) */}
              <g transform="translate(48, 4)">
                {/* 双耳 */}
                <polygon points="12,20 18,6 26,20" fill="#3D1E16" />
                <polygon points="14,19 18,9 24,19" fill="#FFC7AA" />
                <polygon points="40,20 34,6 26,20" fill="#3D1E16" />
                <polygon points="38,19 34,9 28,19" fill="#FFC7AA" />
                {/* 头部底壳与主体 */}
                <ellipse cx="26" cy="35" rx="21" ry="20" fill="#3D1E16" />
                <ellipse cx="26" cy="35" rx="19" ry="18" fill="url(#shibaGrad)" />
                {/* 白脸颊 */}
                <path d="M 12 37 Q 26 50 40 37 Q 35 27 26 29 Q 17 27 12 37 Z" fill="#FFFFFF" />
                {/* 萌眼与腮红 */}
                <ellipse cx="18" cy="33" rx="2" ry="2.2" fill="#3D1E16" />
                <ellipse cx="34" cy="33" rx="2" ry="2.2" fill="#3D1E16" />
                <circle cx="13" cy="37" r="2.5" fill="#FF6987" opacity="0.75" />
                <circle cx="39" cy="37" r="2.5" fill="#FF6987" opacity="0.75" />
                {/* 鼻子与微笑小嘴 */}
                <ellipse cx="26" cy="36" rx="2.5" ry="1.8" fill="#3D1E16" />
                <path d="M 23 39 Q 26 42 29 39" fill="none" stroke="#3D1E16" strokeWidth="1.5" strokeLinecap="round" />
                {/* 前爪持木棒/打狗棒 */}
                <rect x="42" y="38" width="6" height="26" rx="3" fill="#D7A15C" stroke="#3D1E16" strokeWidth="1.5" transform="rotate(-20 42 38)" />
              </g>

              {/* 右侧棕色秋田犬 */}
              <g transform="translate(92, 10)">
                <ellipse cx="24" cy="32" rx="18" ry="18" fill="#3D1E16" />
                <ellipse cx="24" cy="32" rx="16" ry="16" fill="url(#akitaGrad)" />
                {/* 双耳 */}
                <polygon points="12,18 16,8 23,20" fill="#3D1E16" />
                <polygon points="13,17 16,10 21,19" fill="#FFAEC0" />
                <polygon points="36,18 32,8 25,20" fill="#3D1E16" />
                <polygon points="35,17 32,10 27,19" fill="#FFAEC0" />
                {/* 白额白下巴 */}
                <path d="M 14 34 Q 24 45 34 34 Q 30 26 24 28 Q 18 26 14 34 Z" fill="#FFFFFF" />
                <circle cx="18" cy="31" r="2" fill="#3D1E16" />
                <circle cx="30" cy="31" r="2" fill="#3D1E16" />
                <ellipse cx="24" cy="34" rx="2.2" ry="1.6" fill="#3D1E16" />
                {/* 吐舌小嘴 */}
                <path d="M 22 36 Q 24 40 26 36" fill="#FF6987" stroke="#3D1E16" strokeWidth="1.2" />
                <circle cx="13" cy="35" r="2.2" fill="#FF6987" opacity="0.65" />
                <circle cx="35" cy="35" r="2.2" fill="#FF6987" opacity="0.65" />
              </g>
            </svg>
          </div>
        );

      case 'amber':
        return (
          <div
            style={{
              position: 'absolute',
              right: '48px',
              bottom: '0px',
              display: 'flex',
              alignItems: 'flex-end',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            {/* 小浣熊与金币大包裹 */}
            <svg width="150" height="76" viewBox="0 0 150 76" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="sackGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#C9753F" />
                  <stop offset="100%" stopColor="#A45524" />
                </linearGradient>
                <linearGradient id="coinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF4A3" />
                  <stop offset="50%" stopColor="#FFD13B" />
                  <stop offset="100%" stopColor="#E29E1B" />
                </linearGradient>
              </defs>

              {/* 背景散落的小金币 */}
              <circle cx="18" cy="48" r="6" fill="url(#coinGrad)" stroke="#3D1E16" strokeWidth="1.5" />
              <circle cx="28" cy="62" r="7" fill="url(#coinGrad)" stroke="#3D1E16" strokeWidth="1.5" />
              <circle cx="42" cy="56" r="6.5" fill="url(#coinGrad)" stroke="#3D1E16" strokeWidth="1.5" />

              {/* 大包裹 (褐色布袋溢出金币) */}
              <g transform="translate(36, 12)">
                <ellipse cx="25" cy="34" rx="24" ry="22" fill="#3D1E16" />
                <ellipse cx="25" cy="34" rx="22" ry="20" fill="url(#sackGrad)" />
                {/* 裂开露出的金币 */}
                <circle cx="19" cy="34" r="5" fill="url(#coinGrad)" stroke="#3D1E16" strokeWidth="1.2" />
                <circle cx="26" cy="38" r="5.5" fill="url(#coinGrad)" stroke="#3D1E16" strokeWidth="1.2" />
              </g>

              {/* 活泼小浣熊 */}
              <g transform="translate(80, 8)">
                {/* 圆耳 */}
                <circle cx="14" cy="18" r="7" fill="#3D1E16" />
                <circle cx="14" cy="18" r="5" fill="#FFFFFF" />
                <circle cx="34" cy="18" r="7" fill="#3D1E16" />
                <circle cx="34" cy="18" r="5" fill="#FFFFFF" />
                {/* 头部底壳 */}
                <ellipse cx="24" cy="32" rx="19" ry="17" fill="#3D1E16" />
                <ellipse cx="24" cy="32" rx="17" ry="15" fill="#6A6F7B" />
                {/* 浣熊经典黑色眼罩 */}
                <path d="M 8 28 C 14 24, 20 28, 24 28 C 28 28, 34 24, 40 28 C 42 37, 32 37, 24 33 C 16 37, 6 37, 8 28 Z" fill="#3D1E16" />
                {/* 眼珠 */}
                <circle cx="16" cy="30" r="2.2" fill="#FFFFFF" />
                <circle cx="16" cy="30" r="1.2" fill="#000000" />
                <circle cx="32" cy="30" r="2.2" fill="#FFFFFF" />
                <circle cx="32" cy="30" r="1.2" fill="#000000" />
                {/* 嘴部白绒毛与吐舌大笑 */}
                <ellipse cx="24" cy="36" rx="8" ry="6" fill="#FFFFFF" />
                <ellipse cx="24" cy="33" rx="2" ry="1.5" fill="#3D1E16" />
                <path d="M 21 36 Q 24 41 27 36 Z" fill="#FF4D6D" stroke="#3D1E16" strokeWidth="1" />
                <circle cx="12" cy="36" r="2.5" fill="#FF7B95" opacity="0.8" />
                <circle cx="36" cy="36" r="2.5" fill="#FF7B95" opacity="0.8" />
              </g>

              {/* 右侧地上的金币 */}
              <circle cx="132" cy="58" r="6" fill="url(#coinGrad)" stroke="#3D1E16" strokeWidth="1.5" />
              <circle cx="142" cy="64" r="6" fill="url(#coinGrad)" stroke="#3D1E16" strokeWidth="1.5" />
            </svg>
          </div>
        );

      case 'emerald':
        return (
          <div
            style={{
              position: 'absolute',
              right: '48px',
              bottom: '0px',
              display: 'flex',
              alignItems: 'flex-end',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            {/* 萌猫侦探三兄弟（咖啡暹罗、霸气橘猫、粉耳三花） */}
            <svg width="150" height="76" viewBox="0 0 150 76" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="orangeCat" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFA654" />
                  <stop offset="100%" stopColor="#EB7E23" />
                </linearGradient>
                <linearGradient id="siameseCat" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ECD5B8" />
                  <stop offset="100%" stopColor="#CFB18C" />
                </linearGradient>
                <linearGradient id="calicoCat" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFF0F5" />
                  <stop offset="100%" stopColor="#F5D0E0" />
                </linearGradient>
              </defs>

              {/* 背景远山小尖角 */}
              <polygon points="10,40 30,12 50,40" fill="rgba(255,255,255,0.25)" />
              <polygon points="40,40 65,16 90,40" fill="rgba(255,255,255,0.2)" />
              <polygon points="80,40 105,10 130,40" fill="rgba(255,255,255,0.25)" />

              {/* 左侧呆萌暹罗猫 */}
              <g transform="translate(10, 16)">
                <polygon points="8,16 12,6 18,17" fill="#3D1E16" />
                <polygon points="26,16 22,6 16,17" fill="#3D1E16" />
                <ellipse cx="17" cy="27" rx="14" ry="14" fill="#3D1E16" />
                <ellipse cx="17" cy="27" rx="12" ry="12" fill="url(#siameseCat)" />
                {/* 暹罗猫深棕焦脸 */}
                <ellipse cx="17" cy="27" rx="7" ry="6" fill="#6A4535" />
                <circle cx="14" cy="26" r="1.5" fill="#3D1E16" />
                <circle cx="20" cy="26" r="1.5" fill="#3D1E16" />
                <circle cx="17" cy="29" r="1.2" fill="#3D1E16" />
              </g>

              {/* 中间领头傲娇橘猫 (霸气小眼神) */}
              <g transform="translate(50, 4)">
                {/* 尖耳 */}
                <polygon points="12,18 16,4 25,18" fill="#3D1E16" />
                <polygon points="14,17 17,7 23,17" fill="#FFAEC0" />
                <polygon points="38,18 34,4 25,18" fill="#3D1E16" />
                <polygon points="36,17 33,7 27,17" fill="#FFAEC0" />
                {/* 头部底壳 */}
                <ellipse cx="25" cy="33" rx="20" ry="18" fill="#3D1E16" />
                <ellipse cx="25" cy="33" rx="18" ry="16" fill="url(#orangeCat)" />
                {/* 额头虎斑纹 */}
                <path d="M 25 18 L 25 24 M 21 20 L 23 25 M 29 20 L 27 25" stroke="#9E4D12" strokeWidth="1.5" strokeLinecap="round" />
                {/* 眼神坚毅的倒八字眼 */}
                <path d="M 16 30 L 21 32" stroke="#3D1E16" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M 34 30 L 29 32" stroke="#3D1E16" strokeWidth="2.2" strokeLinecap="round" />
                {/* 骄傲小猫嘴 :3 */}
                <ellipse cx="25" cy="34" rx="2" ry="1.4" fill="#E25471" />
                <path d="M 22 36 Q 25 38 28 36" fill="none" stroke="#3D1E16" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="14" cy="35" r="2.2" fill="#FF6987" opacity="0.65" />
                <circle cx="36" cy="35" r="2.2" fill="#FF6987" opacity="0.65" />
              </g>

              {/* 右侧可爱粉白猫 */}
              <g transform="translate(94, 14)">
                <polygon points="10,16 15,6 20,18" fill="#3D1E16" />
                <polygon points="11,15 15,9 18,17" fill="#FFAEC0" />
                <polygon points="30,16 25,6 20,18" fill="#3D1E16" />
                <polygon points="29,15 25,9 22,17" fill="#FFAEC0" />
                <ellipse cx="20" cy="28" rx="15" ry="14" fill="#3D1E16" />
                <ellipse cx="20" cy="28" rx="13" ry="12" fill="url(#calicoCat)" />
                {/* 头顶斑纹 */}
                <path d="M 12 18 Q 20 22 24 16" fill="#C986A8" />
                <circle cx="16" cy="27" r="1.8" fill="#3D1E16" />
                <circle cx="24" cy="27" r="1.8" fill="#3D1E16" />
                <ellipse cx="20" cy="30" rx="1.5" ry="1.2" fill="#FF5E89" />
              </g>
            </svg>
          </div>
        );

      case 'violet':
      default:
        return (
          <div
            style={{
              position: 'absolute',
              right: '48px',
              bottom: '0px',
              display: 'flex',
              alignItems: 'flex-end',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            {/* 梦幻魔法星夜猫猫 */}
            <svg width="150" height="76" viewBox="0 0 150 76" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="magicCat" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#D9D4FF" />
                  <stop offset="100%" stopColor="#ABA1F0" />
                </linearGradient>
              </defs>
              {/* 星芒闪烁 */}
              <path d="M 25 20 L 27 25 L 32 27 L 27 29 L 25 34 L 23 29 L 18 27 L 23 25 Z" fill="#FFE27A" />
              <path d="M 50 12 L 51 15 L 54 16 L 51 17 L 50 20 L 49 17 L 46 16 L 49 15 Z" fill="#FFFFFF" opacity="0.9" />

              {/* 戴着巫师帽的萌猫 */}
              <g transform="translate(70, 8)">
                <ellipse cx="26" cy="34" rx="18" ry="16" fill="#3D1E16" />
                <ellipse cx="26" cy="34" rx="16" ry="14" fill="url(#magicCat)" />
                {/* 尖耳 */}
                <polygon points="12,24 16,12 24,24" fill="#3D1E16" />
                <polygon points="40,24 36,12 28,24" fill="#3D1E16" />
                {/* 紫色巫师尖帽 */}
                <polygon points="16,22 26,0 36,22" fill="#5848A6" stroke="#3D1E16" strokeWidth="1.5" />
                <ellipse cx="26" cy="22" rx="14" ry="4" fill="#FED136" stroke="#3D1E16" strokeWidth="1.2" />
                {/* 亮晶晶大圆眼 */}
                <circle cx="20" cy="33" r="2.5" fill="#3D1E16" />
                <circle cx="32" cy="33" r="2.5" fill="#3D1E16" />
                <circle cx="21" cy="32" r="0.9" fill="#FFFFFF" />
                <circle cx="33" cy="32" r="0.9" fill="#FFFFFF" />
                <ellipse cx="26" cy="36" rx="1.8" ry="1.3" fill="#FF7B95" />
              </g>
            </svg>
          </div>
        );
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 90,
        background: 'rgba(10, 25, 38, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      {/* ================= 主弹窗容器：100% 临摹图3深青色地砖网格游戏面板 ================= */}
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          maxHeight: '92vh',
          borderRadius: '24px',
          border: '3px solid #0E3547',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#195B77',
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px)
          `,
          backgroundSize: '28px 28px',
          animation: 'modalSlideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* ================= 1. 顶部标题栏（对齐图3顶部深青色条形板） ================= */}
        <div
          style={{
            padding: '14px 18px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, #3A7F8B 0%, #286A76 100%)',
            borderBottom: '3px solid #134650',
            borderTop: '3px dashed rgba(255, 255, 255, 0.35)',
            boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.35)',
          }}
        >
          <div
            style={{
              fontSize: '18px',
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '1px',
              fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", "幼圆", cursive, sans-serif',
              textShadow: `
                -1.5px -1.5px 0 #18424B,
                 1.5px -1.5px 0 #18424B,
                -1.5px  1.5px 0 #18424B,
                 1.5px  1.5px 0 #18424B,
                 0      2.5px 0 #18424B,
                 0      3px 4px rgba(0, 0, 0, 0.4)
              `,
            }}
          >
            活动日志
          </div>

          <button
            onClick={onClose}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(180deg, #FFE8D6 0%, #F5C6A5 100%)',
              border: '2.5px solid #3E1F1A',
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.35)',
              color: '#3E1F1A',
              cursor: 'pointer',
              fontWeight: 900,
            }}
          >
            <X size={16} strokeWidth={3} />
          </button>
        </div>

        {/* ================= 2. 四个大横幅列表（100% 临摹图3） ================= */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 14px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {banners.map((item) => {
            const hasCustomBg = Boolean(item.customBgUrl);
            const theme = getBannerThemeConfig(item.themeColor);

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (item.id === 'signin_7d' && onOpenSignIn) {
                    onOpenSignIn();
                  } else if (item.id === 'extreme_challenge' && onOpenChallenge) {
                    onOpenChallenge();
                  } else {
                    onToast(`「${item.title}」占位框 · 活动筹备中`);
                  }
                }}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '84px',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: `3.5px solid ${theme.borderColor}`,
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.35)',
                  backgroundColor: theme.bg,
                  flexShrink: 0,
                  transition: 'transform 0.12s ease',
                }}
              >
                {/* 用户自定义背景图（保存在 IndexedDB） */}
                {hasCustomBg ? (
                  <img
                    src={item.customBgUrl!}
                    alt={item.title}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      zIndex: 0,
                    }}
                  />
                ) : (
                  /* 默认图3卡通插画 */
                  renderCardIllustration(item.themeColor)
                )}

                {/* 仅保留标题：100% 还原图3白色带浓郁深褐描边的萌系大字 */}
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '16px',
                    zIndex: 2,
                    fontSize: '19px',
                    fontWeight: 900,
                    color: '#FFFFFF',
                    letterSpacing: '1px',
                    fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", "幼圆", cursive, sans-serif',
                    textShadow: `
                      -1.5px -1.5px 0 #3D1E16,
                       1.5px -1.5px 0 #3D1E16,
                      -1.5px  1.5px 0 #3D1E16,
                       1.5px  1.5px 0 #3D1E16,
                       0      2.5px 0 #3D1E16,
                       0      3px 4px rgba(0, 0, 0, 0.45)
                    `,
                  }}
                >
                  {item.title}
                </div>

                {/* 右侧胶囊形动作按钮（100% 临摹图3右侧贴附的青绿胶囊，点击换背板） */}
                <button
                  onClick={(e) => openEditModal(item, e)}
                  title="更换背板图片"
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '32px',
                    height: '56px',
                    borderRadius: '16px',
                    border: `2.5px solid ${theme.pillBorder}`,
                    background: theme.pillBg,
                    boxShadow: '0 3px 6px rgba(0, 0, 0, 0.35)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2px',
                    cursor: 'pointer',
                    zIndex: 4,
                  }}
                >
                  <ImageIcon size={14} color={theme.pillTextColor} strokeWidth={2.5} />
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: 900,
                      color: theme.pillTextColor,
                      lineHeight: 1,
                      fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", cursive, sans-serif',
                    }}
                  >
                    换图
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= 3. 更换单个横幅背板弹窗（也对齐图3游戏面板风格） ================= */}
      {editingBanner && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 99,
            background: 'rgba(10, 20, 30, 0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '320px',
              borderRadius: '22px',
              border: '3px solid #0E3547',
              backgroundColor: '#195B77',
              backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px)
              `,
              backgroundSize: '24px 24px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.55)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              animation: 'modalSlideUp 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* 弹窗顶栏 */}
            <div
              style={{
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(180deg, #3A7F8B 0%, #286A76 100%)',
                borderBottom: '2.5px solid #134650',
              }}
            >
              <div
                style={{
                  fontWeight: 900,
                  fontSize: '15px',
                  color: '#FFFFFF',
                  fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", cursive, sans-serif',
                  textShadow: '0 1.5px 2px #18424B',
                }}
              >
                更换「{editingBanner.title}」背板
              </div>
              <button
                onClick={() => setEditingBanner(null)}
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#FFE8D6',
                  border: '2px solid #3E1F1A',
                  color: '#3E1F1A',
                  cursor: 'pointer',
                  fontWeight: 900,
                }}
              >
                <X size={14} strokeWidth={3} />
              </button>
            </div>

            {/* 预览区域 */}
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: '100%',
                  height: '100px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                  border: `3px solid ${getBannerThemeConfig(editingBanner.themeColor).borderColor}`,
                  backgroundColor: getBannerThemeConfig(editingBanner.themeColor).bg,
                }}
              >
                {previewBg ? (
                  <img
                    src={previewBg}
                    alt="背板预览"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  renderCardIllustration(editingBanner.themeColor)
                )}

                {/* 标题字样预览 */}
                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '14px',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: '17px',
                    letterSpacing: '1px',
                    fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", cursive, sans-serif',
                    textShadow: `
                      -1.5px -1.5px 0 #3D1E16,
                       1.5px -1.5px 0 #3D1E16,
                      -1.5px  1.5px 0 #3D1E16,
                       1.5px  1.5px 0 #3D1E16,
                       0      2px 0 #3D1E16,
                       0      3px 4px rgba(0, 0, 0, 0.45)
                    `,
                  }}
                >
                  {editingBanner.title}
                </div>
              </div>

              {/* 本地上传按钮 */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              <div style={{ display: 'flex', gap: '8px', width: '100%', marginBottom: '10px' }}>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    borderRadius: '12px',
                    background: 'linear-gradient(180deg, #62EAD6 0%, #39CEB9 100%)',
                    border: '2px solid #237D70',
                    color: '#134F47',
                    fontWeight: 900,
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.25)',
                  }}
                >
                  <Upload size={14} strokeWidth={2.5} />
                  本地上传
                </button>

                <button
                  onClick={handleResetBg}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '2px solid rgba(255, 255, 255, 0.4)',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                  }}
                >
                  <RefreshCw size={13} strokeWidth={2.5} />
                  恢复默认
                </button>
              </div>

              {/* 图片直链输入框 */}
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '12px',
                  padding: '7px 10px',
                  gap: '6px',
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1.5px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <ImageIcon size={13} color="#94A3B8" />
                <input
                  type="text"
                  placeholder="或粘贴图片直链"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    setPreviewBg(e.target.value || null);
                  }}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '11px',
                    width: '100%',
                    color: '#FFFFFF',
                  }}
                />
              </div>
            </div>

            {/* 弹窗底栏 */}
            <div
              style={{
                padding: '10px 16px 14px',
                borderTop: '2px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                gap: '8px',
              }}
            >
              <button
                onClick={() => setEditingBanner(null)}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.18)',
                  border: '2px solid rgba(255, 255, 255, 0.35)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                取消
              </button>
              <button
                onClick={handleSaveCustomBg}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: '12px',
                  background: 'linear-gradient(180deg, #62EAD6 0%, #39CEB9 100%)',
                  border: '2px solid #237D70',
                  color: '#134F47',
                  fontWeight: 900,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  boxShadow: '0 3px 6px rgba(0, 0, 0, 0.3)',
                  cursor: 'pointer',
                }}
              >
                <Check size={14} strokeWidth={3} />
                保存背板
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
