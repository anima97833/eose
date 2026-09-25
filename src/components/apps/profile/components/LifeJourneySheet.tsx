import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Camera,
  Trash2,
  Edit3,
  Calendar,
  Sparkles,
  ArrowUpDown,
  Download,
  Share2,
  ChevronRight,
  Heart,
  Image as ImageIcon,
  Check,
  RefreshCw,
} from 'lucide-react';
import { RPGLifeStoryRecord } from '../../../../core/storage/db';
import {
  getAllLifeStories,
  saveLifeStory,
  deleteLifeStory,
  resetLifeStories,
  determineLifeStage,
} from '../../../../core/rpg/lifeStorage';
import { compressImageFile } from '../../../../utils/imageCompressor';
import { LifeDaisyIcon } from './LifeDaisyIcon';
import { PRESET_STICKERS, renderLifeIllustration } from './LifeIllustrations';

interface LifeJourneySheetProps {
  onClose: () => void;
}

type StageFilter = 'all' | 'childhood' | 'youth' | 'adult' | 'later';

export const LifeJourneySheet: React.FC<LifeJourneySheetProps> = ({ onClose }) => {
  const [stories, setStories] = useState<RPGLifeStoryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [stageFilter, setStageFilter] = useState<StageFilter>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // asc: 年龄从小到大；desc: 从大到小
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 编辑 / 新增对话框状态
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formAge, setFormAge] = useState<number>(11);
  const [formLocation, setFormLocation] = useState<string>('蓝天学校');
  const [formYear, setFormYear] = useState<string>('2015年夏');
  const [formContent, setFormContent] = useState<string>('被罚站一天，中暑晕倒');
  const [formTag, setFormTag] = useState<string>('罚站中暑');
  const [formMoodTag, setFormMoodTag] = useState<string>('尴尬');
  const [formBadgeKey, setFormBadgeKey] = useState<string>('school');
  const [formImageData, setFormImageData] = useState<string | null>(null);
  const [formColor, setFormColor] = useState<'yellow' | 'pink'>('yellow');

  // 长图票根预览与下载状态
  const [showReceiptExportModal, setShowReceiptExportModal] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const modalFileInputRef = useRef<HTMLInputElement | null>(null);
  const cardFileInputRef = useRef<HTMLInputElement | null>(null);
  const activeUploadStoryIdRef = useRef<string | null>(null);
  const receiptScrollRef = useRef<HTMLDivElement | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2000);
  };

  // 初始化加载 IndexedDB
  const refreshStories = async () => {
    setLoading(true);
    const list = await getAllLifeStories();
    setStories(list);
    setLoading(false);
  };

  useEffect(() => {
    refreshStories();
  }, []);

  // 阶段过滤与排序
  const filteredStories = stories.filter((s) => {
    if (stageFilter === 'all') return true;
    return s.stage === stageFilter;
  });

  const sortedStories = [...filteredStories].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.age - b.age;
    }
    return b.age - a.age;
  });

  // 触发图片选择（严格阻止事件冒泡到外层 onClose 遮罩）
  const triggerUpload = (storyId?: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    activeUploadStoryIdRef.current = storyId || null;
    if (storyId) {
      if (cardFileInputRef.current) {
        cardFileInputRef.current.value = '';
        cardFileInputRef.current.click();
      }
    } else {
      if (modalFileInputRef.current) {
        modalFileInputRef.current.value = '';
        modalFileInputRef.current.click();
      }
    }
  };

  // 处理文件变更
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      showToast('图片请小于 15MB');
      return;
    }

    try {
      const dataUrl = await compressImageFile(file, {
        maxDimension: 1080,
        quality: 0.82,
        mimeType: 'image/webp',
      });
      const targetId = activeUploadStoryIdRef.current;
      if (targetId) {
        // 直接针对列表中的卡片更换图片并持久化到 IndexedDB
        const target = stories.find((s) => s.id === targetId);
        if (target) {
          const updated: RPGLifeStoryRecord = { ...target, imageData: dataUrl, updatedAt: Date.now() };
          await saveLifeStory(updated);
          await refreshStories();
          showToast('卡片照片已更换（已高清压缩）');
        }
      } else {
        // 在编辑/新增弹窗中更换照片
        setFormImageData(dataUrl);
        showToast('照片已上传并优化，点击保存');
      }
    } catch (err) {
      console.warn('[LifeJourney] 图片压缩异常:', err);
    }
    e.target.value = '';
  };

  // 打开新增对话框
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormAge(12);
    setFormLocation('学校操场');
    setFormYear('2016年');
    setFormContent('');
    setFormTag('成长琐事');
    setFormMoodTag('纯真');
    setFormBadgeKey('cat');
    setFormImageData(null);
    setFormColor(stories.length % 2 === 0 ? 'yellow' : 'pink');
    setShowEditModal(true);
  };

  // 打开编辑对话框
  const handleOpenEdit = (story: RPGLifeStoryRecord) => {
    setEditingId(story.id);
    setFormAge(story.age);
    const titleParts = story.title.split('-');
    const loc = titleParts[1]?.trim() || story.location || '';
    setFormLocation(loc);
    setFormYear(story.year || '');
    setFormContent(story.content);
    setFormTag(story.tag || '回忆');
    setFormMoodTag(story.moodTag || '纯真');
    setFormBadgeKey(story.badgeKey || 'cat');
    setFormImageData(story.imageData || null);
    setFormColor(story.ticketColor || 'yellow');
    setShowEditModal(true);
  };

  // 保存记录
  const handleSaveStory = async () => {
    if (!formContent.trim()) {
      showToast('请写下一两句具体事项');
      return;
    }

    const title = `${formAge}岁 - ${formLocation.trim() || '某地'}`;
    const id = editingId || `life_story_${Date.now()}`;
    const stage = determineLifeStage(formAge);

    const record: RPGLifeStoryRecord = {
      id,
      title,
      age: Number(formAge) || 0,
      year: formYear.trim() || `${formAge}岁时光`,
      location: formLocation.trim(),
      content: formContent.trim(),
      tag: formTag.trim() || '回忆',
      moodTag: formMoodTag.trim() || '留念',
      imageData: formImageData || undefined,
      badgeKey: formBadgeKey,
      stage,
      ticketColor: formColor,
      createdAt: editingId ? (stories.find((s) => s.id === editingId)?.createdAt || Date.now()) : Date.now(),
      updatedAt: Date.now(),
    };

    await saveLifeStory(record);
    setShowEditModal(false);
    showToast(editingId ? '回忆已更新' : '已载入半生手账');
    await refreshStories();
  };

  // 删除记录
  const handleDeleteStory = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm('确定要从半生手账中抹去这段回忆吗？')) {
      await deleteLifeStory(id);
      showToast('回忆已移除');
      await refreshStories();
    }
  };

  // 阶段标签配置
  const STAGE_TABS: Array<{ key: StageFilter; label: string; range: string }> = [
    { key: 'all', label: '全部', range: '所有岁月' },
    { key: 'childhood', label: '童年', range: '0~12岁' },
    { key: 'youth', label: '青葱', range: '13~18岁' },
    { key: 'adult', label: '青年', range: '19~25岁' },
    { key: 'later', label: '而立', range: '26岁+' },
  ];

  // ================= 一键下载长卷票根图片（基于原生 HTML5 Canvas 绘制高分辨率图） =================
  const handleDownloadReceipt = async () => {
    if (isExporting) return;
    setIsExporting(true);
    showToast('正在绘制并生成长卷票根...');

    try {
      const scale = 2; // 2x 高清
      const canvasWidth = 720;
      const cardHeight = 220;
      const headerHeight = 160;
      const footerHeight = 170;
      const totalHeight = headerHeight + sortedStories.length * (cardHeight + 20) + footerHeight;

      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth * scale;
      canvas.height = totalHeight * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        showToast('导出画板不可用');
        setIsExporting(false);
        return;
      }

      ctx.scale(scale, scale);

      // 1. 底纸背景
      ctx.fillStyle = '#F4EFE6';
      ctx.fillRect(0, 0, canvasWidth, totalHeight);

      // 2. 票据边缘虚线打孔装饰
      ctx.strokeStyle = '#9E9688';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.strokeRect(16, 16, canvasWidth - 32, totalHeight - 32);
      ctx.setLineDash([]);

      // 3. 头部标题框
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(32, 32, canvasWidth - 64, 100, 14);
      ctx.fill();
      ctx.strokeStyle = '#4A3525';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#35251C';
      ctx.font = 'bold 26px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('*** 半生回忆录 · 纪念票根 ***', canvasWidth / 2, 75);

      ctx.fillStyle = '#8C7B6D';
      ctx.font = '14px -apple-system, sans-serif';
      const todayStr = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
      ctx.fillText(`${todayStr} · 岁月留痕 · 每一站都有回甘`, canvasWidth / 2, 104);

      // 预加载所有有自定义图片的 Image 对象
      const loadedImages: Record<string, HTMLImageElement> = {};
      await Promise.all(
        sortedStories.map((story) => {
          if (!story.imageData) return Promise.resolve();
          return new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => {
              loadedImages[story.id] = img;
              resolve();
            };
            img.onerror = () => resolve();
            img.src = story.imageData!;
          });
        })
      );

      // 4. 循环绘制每个票据卡片
      let currentY = headerHeight;
      ctx.textAlign = 'left';

      for (let i = 0; i < sortedStories.length; i++) {
        const story = sortedStories[i];
        const isPink = story.ticketColor === 'pink';
        const cardX = 32;
        const cardW = canvasWidth - 64;
        const cardH = cardHeight;

        // 卡片底色
        ctx.fillStyle = isPink ? '#FCE4DC' : '#FDF2CA';
        ctx.beginPath();
        ctx.roundRect(cardX, currentY, cardW, cardH, 16);
        ctx.fill();
        ctx.strokeStyle = '#4A3525';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // 左右打孔双圆
        ctx.fillStyle = '#F4EFE6';
        ctx.beginPath();
        ctx.arc(cardX + 24, currentY + 36, 9, 0, Math.PI * 2);
        ctx.arc(cardX + 24, currentY + cardH - 36, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 主标题
        ctx.fillStyle = '#322116';
        ctx.font = 'bold 22px -apple-system, sans-serif';
        ctx.fillText(story.title, cardX + 54, currentY + 44);

        // 主标题手绘下划线
        ctx.fillStyle = isPink ? 'rgba(244, 63, 94, 0.4)' : 'rgba(245, 158, 11, 0.45)';
        ctx.fillRect(cardX + 54, currentY + 50, ctx.measureText(story.title).width, 3);

        // 年份胶囊
        const yearText = story.year || `${story.age}岁`;
        ctx.font = 'bold 14px -apple-system, sans-serif';
        const yearW = ctx.measureText(yearText).width + 24;
        ctx.fillStyle = isPink ? '#FCE7F3' : '#FEF3C7';
        ctx.beginPath();
        ctx.roundRect(cardX + cardW - yearW - 20, currentY + 24, yearW, 28, 14);
        ctx.fill();
        ctx.strokeStyle = isPink ? '#F43F5E' : '#F59E0B';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = isPink ? '#9F1239' : '#92400E';
        ctx.fillText(`♥ ${yearText}`, cardX + cardW - yearW - 10, currentY + 43);

        // 左侧缩略图
        const imgBoxX = cardX + 54;
        const imgBoxY = currentY + 68;
        const imgBoxSize = 110;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(imgBoxX, imgBoxY, imgBoxSize, imgBoxSize, 12);
        ctx.fill();
        ctx.strokeStyle = '#4A3525';
        ctx.lineWidth = 2;
        ctx.stroke();

        const imgObj = loadedImages[story.id];
        if (imgObj) {
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(imgBoxX, imgBoxY, imgBoxSize, imgBoxSize, 12);
          ctx.clip();
          ctx.drawImage(imgObj, imgBoxX, imgBoxY, imgBoxSize, imgBoxSize);
          ctx.restore();
        } else {
          ctx.fillStyle = '#8C7B6D';
          ctx.font = 'bold 36px sans-serif';
          ctx.textAlign = 'center';
          const emoji =
            story.badgeKey === 'cat'
              ? '🐱'
              : story.badgeKey === 'bicycle'
              ? '🚲'
              : story.badgeKey === 'medal'
              ? '🏅'
              : story.badgeKey === 'school'
              ? '🏫'
              : story.badgeKey === 'hospital'
              ? '🏥'
              : story.badgeKey === 'book'
              ? '📚'
              : '🌼';
          ctx.fillText(emoji, imgBoxX + imgBoxSize / 2, imgBoxY + imgBoxSize / 2 + 12);
          ctx.textAlign = 'left';
        }

        // 右侧文字排版
        const textX = imgBoxX + imgBoxSize + 18;
        const textMaxW = cardW - imgBoxSize - 100;

        // 标签
        ctx.fillStyle = '#6B5749';
        ctx.font = 'bold 15px -apple-system, sans-serif';
        ctx.fillText(`#${story.tag || '回忆'}`, textX, imgBoxY + 22);

        // 情绪徽章
        if (story.moodTag) {
          ctx.fillStyle = isPink ? '#BE185D' : '#0369A1';
          ctx.font = 'bold 13px -apple-system, sans-serif';
          ctx.fillText(`[ ${story.moodTag} ]`, textX + ctx.measureText(`#${story.tag || '回忆'}`).width + 12, imgBoxY + 22);
        }

        // 正文多行换行
        ctx.fillStyle = '#2B1C13';
        ctx.font = '16px -apple-system, sans-serif';
        const lines: string[] = [];
        let curLine = '';
        for (const char of story.content) {
          if (ctx.measureText(curLine + char).width > textMaxW) {
            lines.push(curLine);
            curLine = char;
          } else {
            curLine += char;
          }
        }
        if (curLine) lines.push(curLine);

        lines.slice(0, 3).forEach((line, lineIdx) => {
          ctx.fillText(line, textX, imgBoxY + 54 + lineIdx * 24);
        });

        // 底部定位与编号角标
        ctx.fillStyle = '#8C7B6D';
        ctx.font = '13px -apple-system, sans-serif';
        ctx.fillText(`📍 ${story.location || '时光深处'}`, textX, imgBoxY + imgBoxSize - 6);

        ctx.fillStyle = '#4A3525';
        ctx.font = 'bold 14px -apple-system, sans-serif';
        ctx.fillText(`#${String(i + 1).padStart(2, '0')}`, cardX + cardW - 48, imgBoxY + imgBoxSize - 6);

        currentY += cardHeight + 20;
      }

      // 5. 底部印章与结语
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(32, currentY, canvasWidth - 64, 90, 14);
      ctx.fill();
      ctx.strokeStyle = '#4A3525';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#35251C';
      ctx.font = 'bold 20px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('人生海海 · 每一站都有回甘', canvasWidth / 2, currentY + 42);

      ctx.fillStyle = '#9E9688';
      ctx.font = '13px -apple-system, sans-serif';
      ctx.fillText('— 半生手账回忆录 · 自动生成长卷 —', canvasWidth / 2, currentY + 68);

      // 6. 导出 Blob 并自动触发浏览器下载
      canvas.toBlob((blob) => {
        if (!blob) {
          showToast('生成图片数据失败');
          setIsExporting(false);
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const now = new Date();
        const dateTag = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
        a.download = `半生手账纪念票根_${dateTag}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsExporting(false);
        showToast('长卷票根已成功下载！');
      }, 'image/png');
    } catch (err) {
      console.error('Failed to export receipt image:', err);
      setIsExporting(false);
      showToast('导出图片失败，请重试');
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 88,
        background: 'rgba(38, 45, 42, 0.65)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        animation: 'backdropFadeIn 0.25s ease-out',
      }}
      onClick={onClose}
    >
      {/* 飘窗提示 */}
      {toastMsg && (
        <div
          style={{
            position: 'absolute',
            top: '32px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 140,
            background: 'rgba(36, 56, 50, 0.95)',
            color: '#FFFFFF',
            padding: '7px 20px',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: 800,
            boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25)',
            border: '1.5px solid rgba(255, 255, 255, 0.4)',
            letterSpacing: '0.5px',
          }}
        >
          {toastMsg}
        </div>
      )}

      {/* 主面板抽屉（对齐日式手账本：米灰深咖包边） */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxHeight: '88%',
          background: '#EAE6DD',
          borderTopLeftRadius: '26px',
          borderTopRightRadius: '26px',
          border: '3px solid #35251C',
          borderBottom: 'none',
          boxShadow: '0 -10px 35px rgba(28, 48, 44, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          animation: 'slideUpSpring 0.35s cubic-bezier(0.18, 0.9, 0.32, 1.25)',
        }}
      >
        {/* 卡片直传文件选择器（严格置于 stopPropagation 容器内，阻止冒泡到背景 onClose 遮罩） */}
        <input
          type="file"
          ref={cardFileInputRef}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
          onClick={(e) => e.stopPropagation()}
        />
        {/* ================= 1. 顶部手账横幅（已去除副标题） ================= */}
        <div
          style={{
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#35251C',
            borderTopLeftRadius: '23px',
            borderTopRightRadius: '23px',
            borderBottom: '2.5px solid #23160F',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#FAF4E8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid #F59E0B',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              <LifeDaisyIcon size={24} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontSize: '17px',
                  fontWeight: 900,
                  color: '#FFFDF8',
                  letterSpacing: '0.5px',
                  fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", cursive, sans-serif',
                }}
              >
                半生手账
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  color: '#35251C',
                  background: '#FDE68A',
                  padding: '1px 6px',
                  borderRadius: '8px',
                  border: '1px solid #F59E0B',
                }}
              >
                共 {stories.length} 幕
              </span>
            </div>
          </div>

          {/* 右侧动作组：生成长图票根 + 新增回忆 + 关闭按钮 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* 一键生成长图纪念票根按钮 */}
            <button
              onClick={() => setShowReceiptExportModal(true)}
              title="生成人生票根长图"
              style={{
                padding: '5px 9px',
                borderRadius: '12px',
                border: '1.8px solid #F59E0B',
                background: 'linear-gradient(180deg, #FEF3C7 0%, #FDE68A 100%)',
                color: '#502428',
                fontSize: '11px',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                cursor: 'pointer',
                boxShadow: '0 2px 0 #D97706',
              }}
            >
              <Sparkles size={12} color="#D97706" />
              <span>长卷票根</span>
            </button>

            {/* 新增回忆按钮 */}
            <button
              onClick={handleOpenAdd}
              title="添一笔回忆"
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                border: '2px solid #502428',
                background: '#FAF4E8',
                color: '#502428',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 0 #35251C',
              }}
            >
              <Plus size={16} strokeWidth={2.6} />
            </button>

            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                border: '2px solid #502428',
                background: '#FAF4E8',
                color: '#35251C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 0 #23160F',
              }}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ================= 2. 次级工具栏（人生阶段筛选 + 排序切换） ================= */}
        <div
          style={{
            padding: '8px 12px',
            background: '#DFD9CE',
            borderBottom: '2px solid #BCB4A5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          {/* 人生阶段选择 Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto' }}>
            {STAGE_TABS.map((tab) => {
              const active = stageFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setStageFilter(tab.key)}
                  style={{
                    padding: '3px 9px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: active ? 900 : 700,
                    border: active ? '1.5px solid #4A3525' : '1px solid #C4BCAC',
                    background: active ? '#FFFDF8' : '#ECE8E0',
                    color: active ? '#4A3525' : '#736B61',
                    boxShadow: active ? '0 2px 0 #4A3525' : 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.12s ease',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* 正序 / 倒序切换 */}
          <button
            onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              padding: '3px 8px',
              borderRadius: '10px',
              fontSize: '10px',
              fontWeight: 800,
              background: '#ECE8E0',
              border: '1px solid #C4BCAC',
              color: '#5C5449',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <ArrowUpDown size={11} />
            <span>{sortOrder === 'asc' ? '岁数正序' : '倒叙时光'}</span>
          </button>
        </div>

        {/* ================= 3. 核心卡片列表（精确对齐图 1 排布与图 2 轨道） ================= */}
        <div
          style={{
            padding: '14px 14px 28px',
            overflowY: 'auto',
            maxHeight: '68vh',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            position: 'relative',
          }}
        >
          {/* 岁月连贯虚线轨道 */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              bottom: '24px',
              left: '32px',
              width: '2px',
              borderLeft: '2px dashed #9E9688',
              zIndex: 1,
              pointerEvents: 'none',
            }}
          />

          {sortedStories.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 16px',
                color: '#8A8175',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <LifeDaisyIcon size={48} />
              <div style={{ fontSize: '13px', fontWeight: 800 }}>该阶段暂未记录往事</div>
              <div style={{ fontSize: '11px' }}>点击右上角「+」记下当年的第一段故事吧</div>
            </div>
          ) : (
            sortedStories.map((story, idx) => {
              const isPink = story.ticketColor === 'pink';
              const cardBg = isPink ? '#FCE4DC' : '#FDF2CA';
              const borderCol = '#4A3525';

              return (
                <div
                  key={story.id}
                  onClick={() => handleOpenEdit(story)}
                  style={{
                    position: 'relative',
                    background: cardBg,
                    borderRadius: '16px',
                    border: `2.4px solid ${borderCol}`,
                    boxShadow: 'inset 0 1.5px 0 rgba(255, 255, 255, 0.8), 0 3px 6px rgba(74, 53, 37, 0.12)',
                    padding: '12px 14px 12px 44px',
                    cursor: 'pointer',
                    transition: 'transform 0.12s ease',
                    zIndex: 2,
                  }}
                >
                  {/* 左侧双打孔 */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '18px',
                      left: '12px',
                      width: '15px',
                      height: '15px',
                      borderRadius: '50%',
                      background: '#EAE6DD',
                      border: `2px solid ${borderCol}`,
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.15)',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '18px',
                      left: '12px',
                      width: '15px',
                      height: '15px',
                      borderRadius: '50%',
                      background: '#EAE6DD',
                      border: `2px solid ${borderCol}`,
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.15)',
                    }}
                  />

                  {/* 顶部手写主标题 (几岁 - 在哪里) 带波浪手绘下划线 */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                      borderBottom: '1.8px dashed rgba(74, 53, 37, 0.25)',
                      paddingBottom: '5px',
                    }}
                  >
                    <div style={{ display: 'inline-block', position: 'relative' }}>
                      <span
                        style={{
                          fontSize: '15px',
                          fontWeight: 900,
                          color: '#322116',
                          fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", cursive, sans-serif',
                          letterSpacing: '0.4px',
                        }}
                      >
                        {story.title}
                      </span>
                      {/* 图1波浪手绘下划线细节 */}
                      <div
                        style={{
                          height: '3px',
                          background: isPink ? 'rgba(244, 63, 94, 0.35)' : 'rgba(245, 158, 11, 0.4)',
                          borderRadius: '2px',
                          marginTop: '1px',
                          width: '100%',
                        }}
                      />
                    </div>

                    {/* 右侧动作微按钮：编辑与删除 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(story);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#7A6B5D',
                          cursor: 'pointer',
                          padding: '2px',
                        }}
                        title="编辑"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteStory(story.id, e)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#A85A52',
                          cursor: 'pointer',
                          padding: '2px',
                        }}
                        title="删除"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* 左图右文结构 */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    {/* 左侧圆角贴纸相片（附带直接更换照片按钮） */}
                    <div
                      style={{
                        width: '66px',
                        height: '66px',
                        borderRadius: '12px',
                        border: `2px solid ${borderCol}`,
                        background: '#FFFFFF',
                        overflow: 'hidden',
                        flexShrink: 0,
                        boxShadow: '0 2px 4px rgba(74, 53, 37, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        cursor: 'pointer',
                      }}
                      onClick={(e) => triggerUpload(story.id, e)}
                      title="点击直接更换此回忆的照片"
                    >
                      {story.imageData ? (
                        <img
                          src={story.imageData}
                          alt={story.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        renderLifeIllustration(story.badgeKey, 66)
                      )}

                      {/* 卡片右下角微型相机浮钮，提示可直接换图 */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '2px',
                          right: '2px',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: '#FFFFFF',
                          border: '1.2px solid #4A3525',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#4A3525',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                        }}
                      >
                        <Camera size={10} />
                      </div>
                    </div>

                    {/* 右侧信息排布 */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {/* 首行：心形年份胶囊 + 标签 + 情绪 */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            padding: '1px 7px',
                            borderRadius: '9999px',
                            background: isPink ? '#FCE7F3' : '#FEF3C7',
                            border: `1.2px solid ${isPink ? '#F43F5E' : '#F59E0B'}`,
                            fontSize: '10px',
                            fontWeight: 900,
                            color: isPink ? '#9F1239' : '#92400E',
                          }}
                        >
                          <Heart size={10} fill={isPink ? '#F43F5E' : '#F59E0B'} color={isPink ? '#F43F5E' : '#F59E0B'} />
                          <span>{story.year || `${story.age}岁`}</span>
                        </div>

                        {story.tag && (
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 800,
                              color: '#6B5749',
                              letterSpacing: '-0.2px',
                            }}
                          >
                            #{story.tag}
                          </span>
                        )}

                        {story.moodTag && (
                          <span
                            style={{
                              fontSize: '9px',
                              fontWeight: 800,
                              color: isPink ? '#BE185D' : '#0369A1',
                              background: isPink ? '#FDF2F8' : '#E0F2FE',
                              border: `1px solid ${isPink ? '#F472B6' : '#7DD3FC'}`,
                              padding: '1px 5px',
                              borderRadius: '4px',
                            }}
                          >
                            {story.moodTag}
                          </span>
                        )}
                      </div>

                      {/* 具体事项正文描述 */}
                      <div
                        style={{
                          fontSize: '12px',
                          lineHeight: '1.45',
                          fontWeight: 700,
                          color: '#2B1C13',
                          wordBreak: 'break-word',
                          marginTop: '2px',
                        }}
                      >
                        {story.content}
                      </div>

                      {/* 底部定位与右下角打卡角标 */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: '3px',
                        }}
                      >
                        <span style={{ fontSize: '10px', color: '#8C7B6D', fontWeight: 600 }}>
                          📍 {story.location || '记忆深处'}
                        </span>

                        <div
                          style={{
                            padding: '1px 6px',
                            borderRadius: '4px',
                            border: `1.2px solid ${borderCol}`,
                            background: '#FFFFFF',
                            fontSize: '9px',
                            fontWeight: 900,
                            color: '#4A3525',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                          }}
                        >
                          #{String(idx + 1).padStart(2, '0')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ================= 4. 新增 / 编辑回忆弹窗（大幅增强图片更换与插画切换能力） ================= */}
      {showEditModal && (
        <div
          onClick={() => setShowEditModal(false)}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 110,
            background: 'rgba(38, 45, 42, 0.72)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '320px',
              background: '#FDFBF7',
              borderRadius: '22px',
              border: '3px solid #35251C',
              boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
              padding: '18px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '11px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* 弹窗专有文件选择器（严格置于弹窗内部，彻底杜绝冒泡到关闭逻辑） */}
            <input
              type="file"
              ref={modalFileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
              onClick={(e) => e.stopPropagation()}
            />
            {/* 弹窗头部 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <LifeDaisyIcon size={22} />
                <span style={{ fontSize: '15px', fontWeight: 900, color: '#35251C' }}>
                  {editingId ? '编辑往事' : '添一笔半生记忆'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                style={{ background: 'none', border: 'none', color: '#6B5749', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* 1. 年龄与地点（主标题核心） */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ width: '80px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#6B5749' }}>几岁</label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={formAge}
                  onChange={(e) => setFormAge(parseInt(e.target.value) || 0)}
                  style={{
                    padding: '6px 8px',
                    borderRadius: '10px',
                    border: '1.8px solid #35251C',
                    background: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 800,
                    outline: 'none',
                    textAlign: 'center',
                  }}
                />
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#6B5749' }}>在哪里 (地点)</label>
                <input
                  type="text"
                  placeholder="如: 蓝天学校 / 外婆家后院"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '10px',
                    border: '1.8px solid #35251C',
                    background: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 700,
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* 2. 自然年份与标签 */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#6B5749' }}>公元年份/季节</label>
                <input
                  type="text"
                  placeholder="如: 2015年夏"
                  value={formYear}
                  onChange={(e) => setFormYear(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '10px',
                    border: '1.8px solid #35251C',
                    background: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 700,
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ width: '100px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#6B5749' }}>情绪标签</label>
                <input
                  type="text"
                  placeholder="如: 尴尬/难忘"
                  value={formMoodTag}
                  onChange={(e) => setFormMoodTag(e.target.value)}
                  style={{
                    padding: '6px 8px',
                    borderRadius: '10px',
                    border: '1.8px solid #35251C',
                    background: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 700,
                    outline: 'none',
                    textAlign: 'center',
                  }}
                />
              </div>
            </div>

            {/* 3. 具体事项（长文本描述） */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#6B5749' }}>具体事项</label>
              <textarea
                rows={3}
                placeholder="如：自习课被罚站一天，大太阳底下中暑晕倒..."
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '12px',
                  border: '1.8px solid #35251C',
                  background: '#FFFFFF',
                  fontSize: '12px',
                  lineHeight: '1.4',
                  fontWeight: 600,
                  outline: 'none',
                  resize: 'none',
                }}
              />
            </div>

            {/* 4. 配图选择（支持直接点击预览框更换照片，或选用8款手绘小贴纸） */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#6B5749' }}>卡片配图 / 照片</label>
                <button
                  type="button"
                  onClick={(e) => triggerUpload(undefined, e)}
                  style={{
                    fontSize: '11px',
                    color: '#1D4ED8',
                    background: '#DBEAFE',
                    border: '1px solid #93C5FD',
                    borderRadius: '8px',
                    padding: '3px 8px',
                    cursor: 'pointer',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                  }}
                >
                  <Camera size={12} />
                  <span>{formImageData ? '更换照片' : '上传照片'}</span>
                </button>
              </div>

              {/* 大图预览与更换卡槽（点击即可直接打开文件选择器换图） */}
              <div
                onClick={(e) => triggerUpload(undefined, e)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px',
                  borderRadius: '12px',
                  background: '#F3EFE6',
                  border: '1.8px dashed #8C7B6D',
                  cursor: 'pointer',
                }}
                title="点击直接更换相片"
              >
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '10px',
                    border: '1.5px solid #35251C',
                    background: '#FFFFFF',
                    overflow: 'hidden',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  {formImageData ? (
                    <img src={formImageData} alt="预览" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    renderLifeIllustration(formBadgeKey, 52)
                  )}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.18)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                    }}
                  >
                    <Camera size={16} />
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ fontSize: '11px', color: '#35251C', fontWeight: 800 }}>
                    {formImageData ? '已选本地照片 (点击可更换)' : `当前手绘贴纸: ${PRESET_STICKERS.find((s) => s.key === formBadgeKey)?.label || '萌图'}`}
                  </div>
                  <div style={{ fontSize: '10px', color: '#6B7280' }}>
                    点击左侧方框上传新照片，或在下方任选插图
                  </div>
                </div>

                {formImageData && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormImageData(null);
                      showToast('已切回手绘贴纸');
                    }}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '8px',
                      border: '1px solid #F87171',
                      background: '#FEE2E2',
                      color: '#DC2626',
                      fontSize: '10px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    切回贴纸
                  </button>
                )}
              </div>

              {/* 8款预设萌系小贴纸（常驻展示，点击任一贴纸立刻生效并更新当前卡片） */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#8C7B6D' }}>
                  或点击选用内置复古手绘小贴纸：
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {PRESET_STICKERS.map((stk) => {
                    const isSelected = !formImageData && formBadgeKey === stk.key;
                    return (
                      <div
                        key={stk.key}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormImageData(null);
                          setFormBadgeKey(stk.key);
                          showToast(`已选【${stk.label}】贴纸`);
                        }}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '2px',
                          padding: '4px',
                          borderRadius: '10px',
                          border: isSelected ? '2px solid #F59E0B' : '1px solid #D4CCC0',
                          background: isSelected ? '#FEF3C7' : '#FFFFFF',
                          cursor: 'pointer',
                          boxShadow: isSelected ? '0 2px 4px rgba(245, 158, 11, 0.25)' : 'none',
                        }}
                      >
                        <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {stk.render(34)}
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: 800, color: isSelected ? '#92400E' : '#736B61' }}>
                          {stk.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 5. 票据卡片背景色选择 (奶油黄 / 蜜桃粉) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#6B5749' }}>票据底色</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setFormColor('yellow')}
                  style={{
                    padding: '3px 10px',
                    borderRadius: '8px',
                    border: formColor === 'yellow' ? '2px solid #35251C' : '1px solid #D4CCC0',
                    background: '#FDF2CA',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#35251C',
                    cursor: 'pointer',
                  }}
                >
                  奶油黄
                </button>
                <button
                  type="button"
                  onClick={() => setFormColor('pink')}
                  style={{
                    padding: '3px 10px',
                    borderRadius: '8px',
                    border: formColor === 'pink' ? '2px solid #35251C' : '1px solid #D4CCC0',
                    background: '#FCE4DC',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#35251C',
                    cursor: 'pointer',
                  }}
                >
                  蜜桃粉
                </button>
              </div>
            </div>

            {/* 保存按钮 */}
            <button
              type="button"
              onClick={handleSaveStory}
              style={{
                marginTop: '4px',
                width: '100%',
                padding: '10px',
                borderRadius: '14px',
                border: '2px solid #35251C',
                background: 'linear-gradient(180deg, #FDE68A 0%, #F59E0B 100%)',
                color: '#35251C',
                fontSize: '13px',
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 3px 0 #35251C',
              }}
            >
              保存回忆到手账
            </button>
          </div>
        </div>
      )}

      {/* ================= 5. 一键生成长图 / 人生纪念票根弹窗（支持直接下载 PNG 图片文件） ================= */}
      {showReceiptExportModal && (
        <div
          onClick={() => setShowReceiptExportModal(false)}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 120,
            background: 'rgba(26, 31, 29, 0.82)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px 14px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '340px',
              maxHeight: '92vh',
              background: '#FDFBF7',
              borderRadius: '22px',
              border: '3px solid #35251C',
              boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* 弹窗小标题栏 */}
            <div
              style={{
                padding: '10px 16px',
                background: '#35251C',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <LifeDaisyIcon size={20} />
                <span style={{ fontSize: '14px', fontWeight: 900 }}>半生纪念小票长卷</span>
              </div>
              <button
                type="button"
                onClick={() => setShowReceiptExportModal(false)}
                style={{ background: 'none', border: 'none', color: '#D4C4B5', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* 连续票据长卷主体 (可滚动浏览) */}
            <div
              ref={receiptScrollRef}
              style={{
                padding: '16px 14px',
                overflowY: 'auto',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                background: '#F4EFE6',
              }}
            >
              {/* 小票顶端齿孔锯齿花边装饰 */}
              <div
                style={{
                  textAlign: 'center',
                  padding: '8px 12px 12px',
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  border: '2px dashed #9E9688',
                }}
              >
                <div style={{ fontSize: '16px', fontWeight: 900, color: '#35251C', fontFamily: 'cursive' }}>
                  *** 半生回忆录 · 纪念票根 ***
                </div>
                <div style={{ fontSize: '10px', color: '#8C7B6D', marginTop: '3px' }}>
                  {new Date().toLocaleDateString('zh-CN')} · 岁月留痕
                </div>
              </div>

              {/* 循环拼接所有卡片 */}
              {sortedStories.map((story, i) => (
                <div
                  key={story.id}
                  style={{
                    background: story.ticketColor === 'pink' ? '#FCE4DC' : '#FDF2CA',
                    borderRadius: '12px',
                    border: '2px solid #4A3525',
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '13px', fontWeight: 900, color: '#322116' }}>
                      {story.title}
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#B45309' }}>
                      {story.year}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '8px',
                        border: '1.5px solid #4A3525',
                        background: '#FFFFFF',
                        overflow: 'hidden',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {story.imageData ? (
                        <img src={story.imageData} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        renderLifeIllustration(story.badgeKey, 42)
                      )}
                    </div>
                    <div style={{ flex: 1, fontSize: '11px', color: '#35251C', lineHeight: '1.4', fontWeight: 600 }}>
                      {story.content}
                    </div>
                  </div>
                </div>
              ))}

              {/* 小票底部盖印章 */}
              <div
                style={{
                  textAlign: 'center',
                  padding: '12px',
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  border: '2px dashed #9E9688',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 900, color: '#35251C' }}>
                  人生海海 · 每一站都有回甘
                </div>
                <div style={{ fontSize: '9px', color: '#9CA3AF' }}>
                  点击下方按钮可直接下载高清 PNG 图片文件保存到本地
                </div>
              </div>
            </div>

            {/* 底部按钮栏（直接支持一键下载 PNG 图片） */}
            <div
              style={{
                padding: '10px 14px',
                background: '#FAF4E8',
                borderTop: '2px solid #D4CCC0',
                display: 'flex',
                gap: '8px',
              }}
            >
              <button
                type="button"
                onClick={handleDownloadReceipt}
                disabled={isExporting}
                style={{
                  flex: 1,
                  padding: '9px',
                  borderRadius: '12px',
                  border: '2px solid #35251C',
                  background: isExporting
                    ? '#D1D5DB'
                    : 'linear-gradient(180deg, #FDE68A 0%, #F59E0B 100%)',
                  color: '#35251C',
                  fontSize: '12px',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  cursor: isExporting ? 'not-allowed' : 'pointer',
                  boxShadow: isExporting ? 'none' : '0 2px 0 #35251C',
                }}
              >
                {isExporting ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>生成中...</span>
                  </>
                ) : (
                  <>
                    <Download size={14} />
                    <span>直接下载长卷票根 (PNG)</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowReceiptExportModal(false)}
                style={{
                  padding: '9px 14px',
                  borderRadius: '12px',
                  border: '1.8px solid #9E9688',
                  background: '#FFFFFF',
                  color: '#5C5449',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
