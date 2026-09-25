import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Plus, Camera, Trash2, Heart, Sparkles, BookOpen } from 'lucide-react';
import { RPGProfile, ProfileStoryPage } from '../../../../core/rpg/types';
import { loadDossierFromDB, saveDossierToDB } from '../../../../core/rpg/dossierStorage';
import { compressImageFile } from '../../../../utils/imageCompressor';

interface ProfileDossierSheetProps {
  profile: RPGProfile;
  onUpdateProfile: (updated: Partial<RPGProfile>) => void;
  onClose: () => void;
}

// 12 星座列表 (<=4字)
const ZODIAC_OPTIONS = [
  '白羊座', '金牛座', '双子座', '巨蟹座',
  '狮子座', '处女座', '天秤座', '天蝎座',
  '射手座', '摩羯座', '水瓶座', '双鱼座',
];

// 16 型人格 MBTI 列表
const MBTI_OPTIONS = [
  'INFP', 'INFJ', 'ENFP', 'ENFJ',
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'ISFP', 'ISFJ', 'ESFP', 'ESFJ',
  'ISTP', 'ISTJ', 'ESTP', 'ESTJ',
];

// 性别选项 (<=2字)
const GENDER_OPTIONS = ['女生', '男生', '保密'];

export const ProfileDossierSheet: React.FC<ProfileDossierSheetProps> = ({
  profile,
  onUpdateProfile,
  onClose,
}) => {
  // 基础身份字段
  const [name, setName] = useState(profile.name || '旅行者');
  const [title, setTitle] = useState(profile.title || '初醒之人');
  const [zodiac, setZodiac] = useState(profile.zodiac || '双鱼座');
  const [mbti, setMbti] = useState(profile.mbti || 'INFP');
  const [gender, setGender] = useState(profile.gender || '保密');

  // 档案照片：独立于主界面全身立绘，保存于 IndexedDB，优先读取缓存
  const [photoUrl, setPhotoUrl] = useState<string | null>(profile.dossierPhotoUrl || null);

  // 多页故事手账
  const initialPages: ProfileStoryPage[] =
    profile.storyPages && profile.storyPages.length > 0
      ? profile.storyPages
      : [
          {
            id: `story_${Date.now()}`,
            pageIndex: 0,
            date: '2026.09.22',
            content: '初次翻开这本手账。我想在这里记录真实的自我、心境与成长轨迹。',
            updatedAt: Date.now(),
          },
        ];

  const [storyPages, setStoryPages] = useState<ProfileStoryPage[]>(initialPages);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);

  // 挂载时从 IndexedDB 读取全部档案数据
  useEffect(() => {
    let isMounted = true;
    loadDossierFromDB().then((data) => {
      if (!isMounted) return;
      if (data.name) setName(data.name);
      if (data.title) setTitle(data.title);
      if (data.zodiac) setZodiac(data.zodiac);
      if (data.mbti) setMbti(data.mbti);
      if (data.gender) setGender(data.gender);
      if (data.photoUrl) setPhotoUrl(data.photoUrl);
      if (data.storyPages && data.storyPages.length > 0) {
        setStoryPages(data.storyPages);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // 弹窗状态 (快选星座 / MBTI / 性别)
  const [activePicker, setActivePicker] = useState<'zodiac' | 'mbti' | 'gender' | null>(null);

  // 照片上传引用
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const albumInputRef = useRef<HTMLInputElement | null>(null);

  // Toast 提示
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2000);
  };

  const activePage = storyPages[currentPageIndex] || storyPages[0];
  const displayPhoto = photoUrl || profile.dossierPhotoUrl || profile.customAvatarUrl;

  // 更新当前页故事文本
  const handleContentChange = (text: string) => {
    const updated = storyPages.map((p, idx) => {
      if (idx === currentPageIndex) {
        return { ...p, content: text, updatedAt: Date.now() };
      }
      return p;
    });
    setStoryPages(updated);
    saveDossierToDB({ storyPages: updated });
    onUpdateProfile({ storyPages: updated });
  };

  // 添加新纸（添加新故事页，核心要求：写到头了点右键添加新纸）
  const handleAddNewPage = () => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(
      today.getDate()
    ).padStart(2, '0')}`;

    const newPage: ProfileStoryPage = {
      id: `story_${Date.now()}_${storyPages.length}`,
      pageIndex: storyPages.length,
      date: dateStr,
      content: '',
      updatedAt: Date.now(),
    };

    const nextPages = [...storyPages, newPage];
    setStoryPages(nextPages);
    setCurrentPageIndex(nextPages.length - 1);
    saveDossierToDB({ storyPages: nextPages });
    onUpdateProfile({ storyPages: nextPages });
    showToast('已加新纸');
  };

  // 删除当前纸页
  const handleDeleteCurrentPage = () => {
    if (storyPages.length <= 1) {
      showToast('至少留一页');
      return;
    }
    const nextPages = storyPages.filter((_, idx) => idx !== currentPageIndex);
    const reindexed = nextPages.map((p, idx) => ({ ...p, pageIndex: idx }));
    setStoryPages(reindexed);
    setCurrentPageIndex(Math.max(0, currentPageIndex - 1));
    saveDossierToDB({ storyPages: reindexed });
    onUpdateProfile({ storyPages: reindexed });
    showToast('已删此页');
  };

  // 翻页逻辑：右翻页如果到尾页则提示/自动加新纸
  const handleNextPage = () => {
    if (currentPageIndex < storyPages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    } else {
      // 最后一页时点右翻页，触发添加新纸
      handleAddNewPage();
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  // 用户点击照片更换档案照片（注意：强制客户端 WebP 高清压缩，存入 IndexedDB）
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await compressImageFile(file, {
        maxDimension: 1080,
        quality: 0.85,
        mimeType: 'image/webp',
      });
      setPhotoUrl(result);
      onUpdateProfile({ dossierPhotoUrl: result });
      try {
        await saveDossierToDB({ photoUrl: result });
      } catch (err) {
        console.warn('saveDossierToDB error:', err);
      }
      showToast('相片已优化并保存');
    } catch (err) {
      console.warn('[ProfileDossier] 相片压缩异常:', err);
    }
  };

  // 更新姓名
  const handleNameBlur = () => {
    const trimmed = name.trim().slice(0, 5) || '旅行者';
    setName(trimmed);
    saveDossierToDB({ name: trimmed });
    onUpdateProfile({ name: trimmed });
    showToast('已保存');
  };

  // 更新称号
  const handleTitleBlur = () => {
    const trimmed = title.trim().slice(0, 5) || '初醒之人';
    setTitle(trimmed);
    saveDossierToDB({ title: trimmed });
    onUpdateProfile({ title: trimmed });
    showToast('已保存');
  };

  // 快捷保存星座
  const handleSelectZodiac = (val: string) => {
    setZodiac(val);
    saveDossierToDB({ zodiac: val });
    onUpdateProfile({ zodiac: val });
    setActivePicker(null);
    showToast('已更新');
  };

  // 快捷保存 MBTI
  const handleSelectMbti = (val: string) => {
    setMbti(val);
    saveDossierToDB({ mbti: val });
    onUpdateProfile({ mbti: val });
    setActivePicker(null);
    showToast('已更新');
  };

  // 快捷保存性别
  const handleSelectGender = (val: string) => {
    setGender(val);
    saveDossierToDB({ gender: val });
    onUpdateProfile({ gender: val });
    setActivePicker(null);
    showToast('已更新');
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 65,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        background: 'rgba(25, 20, 20, 0.55)',
        backdropFilter: 'blur(6px)',
        paddingTop: '16px',
        paddingBottom: '16px',
        paddingLeft: '10px',
        paddingRight: '10px',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        boxSizing: 'border-box',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      {/* 手账画板外层（左右翻页大箭头居两侧，对齐原图） */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '364px',
          margin: 'auto 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 左翻页箭头标签 ◀ (对齐原图左侧白色圆角三角标) */}
        <button
          onClick={handlePrevPage}
          disabled={currentPageIndex === 0}
          style={{
            position: 'absolute',
            left: '-14px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '28px',
            height: '42px',
            borderRadius: '16px 4px 4px 16px',
            background: '#FFFFFF',
            border: '2.5px solid #502428',
            borderRight: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: currentPageIndex === 0 ? 'not-allowed' : 'pointer',
            opacity: currentPageIndex === 0 ? 0.35 : 1,
            boxShadow: '-3px 3px 0 rgba(80, 36, 40, 0.2)',
            zIndex: 40,
            padding: 0,
          }}
          title="上一页"
        >
          <ChevronLeft size={18} color="#502428" strokeWidth={3} />
        </button>

        {/* 右翻页箭头标签 ▶ (对齐原图右侧白色圆角三角标，末页点击自动加新纸) */}
        <button
          onClick={handleNextPage}
          style={{
            position: 'absolute',
            right: '-14px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '28px',
            height: '42px',
            borderRadius: '4px 16px 16px 4px',
            background: '#FFFFFF',
            border: '2.5px solid #502428',
            borderLeft: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '3px 3px 0 rgba(80, 36, 40, 0.2)',
            zIndex: 40,
            padding: 0,
          }}
          title={currentPageIndex === storyPages.length - 1 ? '加新纸' : '下一页'}
        >
          {currentPageIndex === storyPages.length - 1 ? (
            <Plus size={16} color="#DB2777" strokeWidth={3.2} />
          ) : (
            <ChevronRight size={18} color="#502428" strokeWidth={3} />
          )}
        </button>

        {/* 核心主看板纸体 (温润牛皮纸感 + 猫爪背景底纹 + 粗黑手绘边框) */}
        <div
          style={{
            width: '100%',
            background: '#F8EFDB', // 原图温润奶油手账卡底色
            borderRadius: '24px',
            border: '3px solid #502428',
            boxShadow: '0 10px 28px rgba(80, 36, 40, 0.32), inset 0 2px 0 rgba(255,255,255,0.8)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '16px 12px 14px',
            boxSizing: 'border-box',
          }}
        >
          {/* ================= 1. 顶部拱形索引标签 (对齐原图顶栏) ================= */}
          <div
            style={{
              position: 'absolute',
              top: '-14px',
              background: '#FFFFFF',
              border: '2.5px solid #502428',
              borderRadius: '12px',
              padding: '2px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 0 #502428',
              zIndex: 30,
            }}
          >
            <span
              style={{
                fontSize: '12px',
                fontWeight: 900,
                color: '#502428',
                fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
                letterSpacing: '0.5px',
              }}
            >
              个人档案
            </span>
          </div>

          {/* 右上角关闭圆纽 */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              right: '8px',
              top: '8px',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: '#FAF4E8',
              border: '2px solid #502428',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 0 #502428',
              zIndex: 35,
            }}
          >
            <X size={14} color="#502428" strokeWidth={3} />
          </button>

          {/* ================= 2. 上半部分：左侧拍立得照片卡 + 右侧四维属性标签 ================= */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              gap: '12px',
              marginTop: '4px',
              marginBottom: '10px',
            }}
          >
            {/* 左侧：档案照片卡 (区域放大，存储于 IndexedDB，与自身立绘完全解耦) */}
            <div
              style={{
                width: '142px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <label
                htmlFor="dossier-photo-input"
                style={{
                  width: '142px',
                  height: '148px',
                  background: '#FFFFFF',
                  border: '2.5px solid #502428',
                  borderRadius: '20px',
                  boxShadow: '0 3.5px 0 #502428',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  position: 'relative',
                  userSelect: 'none',
                }}
                title="点击更换档案相片"
                onClick={(e) => e.stopPropagation()}
              >
                {/* 隐藏文件输入，内嵌于 label 中原生触发，阻止冒泡，点击时重置以确保选同图也能触发 */}
                <input
                  id="dossier-photo-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    (e.target as HTMLInputElement).value = '';
                  }}
                  onChange={handleAvatarFileChange}
                />

                {displayPhoto ? (
                  <img
                    src={displayPhoto}
                    alt="档案照片"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
                  />
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#9C7A5B',
                      pointerEvents: 'none',
                    }}
                  >
                    <Camera size={32} color="#9C7A5B" />
                    <span style={{ fontSize: '11px', fontWeight: 800 }}>点此上传</span>
                  </div>
                )}

                {/* 悬浮小相机圆纽角标 (深度对齐原图截图) */}
                <div
                  style={{
                    position: 'absolute',
                    right: '6px',
                    bottom: '6px',
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    border: '2px solid #502428',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 0 rgba(80, 36, 40, 0.25)',
                    zIndex: 5,
                    pointerEvents: 'none',
                  }}
                >
                  <Camera size={13} color="#502428" strokeWidth={2.4} />
                </div>
              </label>

              {/* 照片下方称号胶囊 (对齐截图“初醒之人”) */}
              <div
                style={{
                  marginTop: '7px',
                  width: '100%',
                  height: '28px',
                  background: '#FFFFFF',
                  border: '2px solid #502428',
                  borderRadius: '999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 0 #502428',
                  boxSizing: 'border-box',
                  padding: '0 6px',
                }}
              >
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, 5))}
                  onBlur={handleTitleBlur}
                  placeholder="称号 (<=5字)"
                  maxLength={5}
                  title="点击编辑称号"
                  style={{
                    width: '100%',
                    height: '100%',
                    textAlign: 'center',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: '12px',
                    fontWeight: 900,
                    color: '#502428',
                    fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
                    letterSpacing: '0.5px',
                    cursor: 'text',
                    padding: 0,
                  }}
                />
              </div>
            </div>

            {/* 右侧：四大基础身份胶囊 (姓名 / 星座 / MBTI / 性别) */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                justifyContent: 'center',
              }}
            >
              {/* 1. 姓名 (Personality 对应槽位) */}
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 900,
                    color: '#EC4899',
                    letterSpacing: '0.2px',
                    marginBottom: '1px',
                  }}
                >
                  姓名
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 5))}
                  onBlur={handleNameBlur}
                  placeholder="姓名 (<=5字)"
                  maxLength={5}
                  style={{
                    width: '100%',
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    background: '#FFFFFF',
                    border: '1.8px solid #502428',
                    fontSize: '11.5px',
                    fontWeight: 800,
                    color: '#502428',
                    outline: 'none',
                    boxShadow: '0 1.5px 0 #502428',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* 2. 星座 (Power Lv. 对应槽位) */}
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 900,
                    color: '#3B82F6',
                    letterSpacing: '0.2px',
                    marginBottom: '1px',
                  }}
                >
                  星座
                </div>
                <div
                  onClick={() => setActivePicker('zodiac')}
                  style={{
                    width: '100%',
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    background: '#EFF7FE',
                    border: '1.8px solid #502428',
                    fontSize: '11.5px',
                    fontWeight: 800,
                    color: '#1D4ED8',
                    cursor: 'pointer',
                    boxShadow: '0 1.5px 0 #502428',
                    boxSizing: 'border-box',
                    textAlign: 'center',
                  }}
                >
                  {zodiac}
                </div>
              </div>

              {/* 3. MBTI */}
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 900,
                    color: '#8B5CF6',
                    letterSpacing: '0.2px',
                    marginBottom: '1px',
                  }}
                >
                  MBTI
                </div>
                <div
                  onClick={() => setActivePicker('mbti')}
                  style={{
                    width: '100%',
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    background: '#F5EEFD',
                    border: '1.8px solid #502428',
                    fontSize: '11.5px',
                    fontWeight: 800,
                    color: '#6D28D9',
                    cursor: 'pointer',
                    boxShadow: '0 1.5px 0 #502428',
                    boxSizing: 'border-box',
                    textAlign: 'center',
                  }}
                >
                  {mbti}
                </div>
              </div>

              {/* 4. 性别 (Visits 对应槽位) */}
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 900,
                    color: '#10B981',
                    letterSpacing: '0.2px',
                    marginBottom: '1px',
                  }}
                >
                  性别
                </div>
                <div
                  onClick={() => setActivePicker('gender')}
                  style={{
                    width: '100%',
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    background: '#ECFDF5',
                    border: '1.8px solid #502428',
                    fontSize: '11.5px',
                    fontWeight: 800,
                    color: '#047857',
                    cursor: 'pointer',
                    boxShadow: '0 1.5px 0 #502428',
                    boxSizing: 'border-box',
                    textAlign: 'center',
                  }}
                >
                  {gender}
                </div>
              </div>
            </div>
          </div>

          {/* ================= 3. 下半部分：横线活页纸故事区 + Album 萌猫相册 ================= */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
            }}
          >
            {/* 左侧：横线手账活页纸（支持连续书写自我故事与多页翻动） */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* 标题栏与页数指示 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '3px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 900,
                      color: '#B45309',
                      fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
                    }}
                  >
                    我的故事
                  </span>
                  <span
                    style={{
                      fontSize: '9.5px',
                      fontWeight: 800,
                      color: '#78350F',
                      background: '#FDF6B2',
                      padding: '1px 5px',
                      borderRadius: '5px',
                      border: '1px solid #502428',
                    }}
                  >
                    {activePage.date}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#502428' }}>
                    {currentPageIndex + 1}/{storyPages.length}
                  </span>

                  {/* 删此页 */}
                  {storyPages.length > 1 && (
                    <button
                      onClick={handleDeleteCurrentPage}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#DC2626',
                        padding: 0,
                      }}
                      title="删此页"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* 仿真横线信笺纸卡片 */}
              <div
                style={{
                  width: '100%',
                  height: '112px',
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  border: '2px solid #502428',
                  boxShadow: '0 2px 0 #502428',
                  padding: '6px 8px',
                  position: 'relative',
                  backgroundImage:
                    'repeating-linear-gradient(transparent, transparent 21px, #E5E7EB 21px, #E5E7EB 22px)',
                  boxSizing: 'border-box',
                }}
              >
                <textarea
                  value={activePage.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="写下你的真实故事、心境感悟与自我认知..."
                  style={{
                    width: '100%',
                    height: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    lineHeight: '22px',
                    color: '#451A03',
                    resize: 'none',
                    padding: 0,
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* 活页纸底部辅助操作 */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '4px',
                }}
              >
                <span style={{ fontSize: '9.5px', color: '#78350F', fontWeight: 700 }}>
                  右键翻页加新纸
                </span>
                <button
                  onClick={handleAddNewPage}
                  style={{
                    background: '#FFF0F5',
                    border: '1.5px solid #502428',
                    borderRadius: '8px',
                    padding: '2px 8px',
                    fontSize: '10px',
                    fontWeight: 900,
                    color: '#DB2777',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  <Plus size={11} strokeWidth={3} />
                  <span>加新纸</span>
                </button>
              </div>
            </div>

            {/* 右侧：Album 萌猫相册印章（深度对齐原图右下角猫咪相册，整体下移与信笺平齐） */}
            <div
              style={{
                width: '68px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flexShrink: 0,
                paddingTop: '20px',
              }}
            >
              {/* 橘色猫咪 Album 邮票框 */}
              <div
                onClick={() => albumInputRef.current?.click()}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '12px',
                  background: 'linear-gradient(180deg, #FDE68A 0%, #F59E0B 100%)',
                  border: '2px solid #502428',
                  boxShadow: '0 2px 0 #502428',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                title="相册"
              >
                {/* 手绘简笔小猫头像 */}
                <svg width="34" height="26" viewBox="0 0 36 28">
                  {/* 猫耳与头部轮廓 */}
                  <path
                    d="M 6 12 L 4 4 L 12 7 C 14 6 18 6 20 7 L 28 4 L 26 12 C 30 15 30 22 26 25 C 22 28 10 28 6 25 C 2 22 2 15 6 12 Z"
                    fill="#FFFFFF"
                    stroke="#502428"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  {/* 黑豆眼与小胡须 */}
                  <circle cx="11" cy="16" r="1.5" fill="#502428" />
                  <circle cx="21" cy="16" r="1.5" fill="#502428" />
                  {/* 猫咪三角小鼻嘴 */}
                  <path d="M 16 18 L 14 20 M 16 18 L 18 20" stroke="#502428" strokeWidth="1.5" strokeLinecap="round" />
                </svg>

                <span
                  style={{
                    fontSize: '9.5px',
                    fontWeight: 900,
                    color: '#78350F',
                    marginTop: '1px',
                    letterSpacing: '0.2px',
                  }}
                >
                  Album
                </span>
              </div>

              {/* 相册附属小框 */}
              <div
                style={{
                  width: '60px',
                  height: '46px',
                  marginTop: '4px',
                  borderRadius: '10px',
                  background: '#FFFFFF',
                  border: '1.5px solid #502428',
                  boxShadow: '0 1.5px 0 #502428',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Heart size={16} fill="#F472B6" color="#502428" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 4. 快选抽屉弹窗 (星座 / MBTI / 性别) ================= */}
      {activePicker && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 80,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setActivePicker(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '280px',
              background: '#FAF4E8',
              borderRadius: '20px',
              border: '2.5px solid #502428',
              padding: '14px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 900, color: '#502428' }}>
                {activePicker === 'zodiac' ? '挑选星座' : activePicker === 'mbti' ? '挑选MBTI' : '挑选性别'}
              </span>
              <button
                onClick={() => setActivePicker(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#502428' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* 星座选择网格 */}
            {activePicker === 'zodiac' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {ZODIAC_OPTIONS.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleSelectZodiac(item)}
                    style={{
                      padding: '6px 2px',
                      borderRadius: '8px',
                      border: '1.5px solid #502428',
                      background: zodiac === item ? '#3B82F6' : '#FFFFFF',
                      color: zodiac === item ? '#FFFFFF' : '#1E3A8A',
                      fontSize: '11px',
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}

            {/* MBTI 选择网格 */}
            {activePicker === 'mbti' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {MBTI_OPTIONS.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleSelectMbti(item)}
                    style={{
                      padding: '6px 2px',
                      borderRadius: '8px',
                      border: '1.5px solid #502428',
                      background: mbti === item ? '#8B5CF6' : '#FFFFFF',
                      color: mbti === item ? '#FFFFFF' : '#4C1D95',
                      fontSize: '11px',
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}

            {/* 性别选择网格 */}
            {activePicker === 'gender' && (
              <div style={{ display: 'flex', gap: '8px' }}>
                {GENDER_OPTIONS.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleSelectGender(item)}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      borderRadius: '10px',
                      border: '1.5px solid #502428',
                      background: gender === item ? '#10B981' : '#FFFFFF',
                      color: gender === item ? '#FFFFFF' : '#064E3B',
                      fontSize: '12px',
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 轻量 Toast 提示 */}
      {toastMsg && (
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            background: '#502428',
            color: '#FFFFFF',
            padding: '5px 14px',
            borderRadius: '12px',
            fontSize: '11.5px',
            fontWeight: 900,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 90,
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
};
