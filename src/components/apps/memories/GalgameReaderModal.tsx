import React, { useState, useEffect, useRef } from 'react';
import { db, MemoryBookRecord, MemoryBookMessage } from '../../../core/storage/db';
import { removeWhiteBackground, fileToDataUrl } from './imageUtils';
import {
  ArrowLeft,
  Edit3,
  Play,
  RotateCcw,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Save,
  Sparkles,
  X,
  History,
  Image as ImageIcon,
  Upload,
  Eye,
  EyeOff,
  Palette,
  Check,
  Link
} from 'lucide-react';

interface GalgameReaderModalProps {
  book: MemoryBookRecord;
  onClose: () => void;
  onUpdateBook: (updated: MemoryBookRecord) => void;
  onDeleteBook: (bookId: string) => void;
}

// 预设背景库
const PRESET_BG_LIST = [
  { label: '废弃阳光礼拜堂', url: '/galgame/bg.jpg', thumb: '/galgame/bg.jpg' },
  { label: '暮色古典书房', url: 'https://images.unsplash.com/photo-1507842229451-7975ab938888?auto=format&fit=crop&w=1280&q=80', thumb: 'https://images.unsplash.com/photo-1507842229451-7975ab938888?auto=format&fit=crop&w=240&q=80' },
  { label: '欧式宫殿长廊', url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1280&q=80', thumb: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=240&q=80' },
  { label: '繁星夜空古堡', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1280&q=80', thumb: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=240&q=80' },
];

// 预设立绘库
const PRESET_SPRITE_LIST = [
  { label: '弑君的惡魔·银发白军装', url: '/galgame/demon.png' },
  { label: '温润学者·长风衣', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80' },
  { label: '神秘骑士·深色制服', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80' },
];

// 预设女主头像库
const PRESET_HEROINE_LIST = [
  { label: '蓝斗篷少女', url: '/galgame/heroine.png' },
  { label: '圣洁白衣少女', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80' },
  { label: '星空学园魔女', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80' },
];

export const GalgameReaderModal: React.FC<GalgameReaderModalProps> = ({
  book,
  onClose,
  onUpdateBook,
  onDeleteBook,
}) => {
  // 核心状态：当前模式 ('play' 演播 | 'edit' 橙光剧本工坊)
  const [mode, setMode] = useState<'play' | 'edit'>('play');
  
  // 剧本数据状态（可编辑副本）
  const [currentBook, setCurrentBook] = useState<MemoryBookRecord>(book);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // 演播状态
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [showAssetModal, setShowAssetModal] = useState<boolean>(false); // 快速换装换景面板
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 显隐开关状态
  const [showSprite, setShowSprite] = useState<boolean>(true);
  const [showHeroine, setShowHeroine] = useState<boolean>(true);

  // 透明化处理后的立绘和头像缓存（消除白底）
  const [processedSprite, setProcessedSprite] = useState<string>(book.characterSpriteUrl || '/galgame/demon.png');
  const [processedHeroine, setProcessedHeroine] = useState<string>(book.protagonistAvatarUrl || '/galgame/heroine.png');

  // 文件上传 Refs
  const bgUploadRef = useRef<HTMLInputElement>(null);
  const spriteUploadRef = useRef<HTMLInputElement>(null);
  const heroineUploadRef = useRef<HTMLInputElement>(null);

  // 打字机计时器
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2400);
  };

  // 自动将图片去除白底，避免白色方块遮挡
  useEffect(() => {
    const rawSprite = currentBook.characterSpriteUrl || '/galgame/demon.png';
    removeWhiteBackground(rawSprite).then((cleanUrl) => {
      setProcessedSprite(cleanUrl);
    });
  }, [currentBook.characterSpriteUrl]);

  useEffect(() => {
    const rawHeroine = currentBook.protagonistAvatarUrl || '/galgame/heroine.png';
    removeWhiteBackground(rawHeroine).then((cleanUrl) => {
      setProcessedHeroine(cleanUrl);
    });
  }, [currentBook.protagonistAvatarUrl]);

  const messages = currentBook.messages || [];
  const currentMsg: MemoryBookMessage | undefined = messages[currentIndex];

  // 格式化文本输出（规范：自动加入竖双引号「」）
  const formatDialogueText = (raw: string) => {
    const trimmed = (raw || '').trim();
    if (!trimmed) return '……';
    if (trimmed.startsWith('「') && trimmed.endsWith('」')) {
      return trimmed;
    }
    return `「${trimmed}」`;
  };

  // 打字机逻辑
  useEffect(() => {
    if (mode !== 'play') return;
    if (!currentMsg) {
      setDisplayedText('（剧本已完结，可点击 Jump 重新演播）');
      setIsTyping(false);
      return;
    }

    const fullText = formatDialogueText(currentMsg.content || '');
    let charIdx = 0;
    setDisplayedText('');
    setIsTyping(true);

    if (typingTimerRef.current) clearInterval(typingTimerRef.current);

    typingTimerRef.current = setInterval(() => {
      charIdx++;
      setDisplayedText(fullText.slice(0, charIdx));
      if (charIdx >= fullText.length) {
        if (typingTimerRef.current) clearInterval(typingTimerRef.current);
        setIsTyping(false);
      }
    }, 32);

    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, [currentIndex, mode, currentBook]);

  // 点击推进台词
  const handleStageClick = (e: React.MouseEvent) => {
    // 避免点击功能按钮冒泡推进
    if (
      (e.target as HTMLElement).closest('.quick-menu') ||
      (e.target as HTMLElement).closest('.log-modal') ||
      (e.target as HTMLElement).closest('.asset-modal') ||
      (e.target as HTMLElement).closest('.top-nav-bar')
    ) {
      return;
    }

    if (!currentMsg) {
      setCurrentIndex(0);
      return;
    }

    const fullText = formatDialogueText(currentMsg.content || '');

    // 若打字中，点击立即补全本句
    if (isTyping) {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
      setDisplayedText(fullText);
      setIsTyping(false);
      return;
    }

    // 若已打完，点击切换下一句
    if (currentIndex < messages.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      showToast('本幕剧本已播完，可点击 Jump 重播或点击 Menu 编辑剧本');
    }
  };

  // 保存剧本到 IndexedDB
  const handleSaveScript = async () => {
    try {
      const updated: MemoryBookRecord = {
        ...currentBook,
        messageCount: currentBook.messages.length,
        totalWords: currentBook.messages.reduce((sum, m) => sum + (m.content?.length || 0), 0),
      };
      await db.memory_books.put(updated);
      setCurrentBook(updated);
      onUpdateBook(updated);
      showToast('剧本及角色资产已成功保存！');
    } catch (err: any) {
      alert('保存失败：' + err?.message);
    }
  };

  // 上传背景图片
  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      const nextBook = { ...currentBook, bgUrl: dataUrl };
      setCurrentBook(nextBook);
      await db.memory_books.put(nextBook);
      onUpdateBook(nextBook);
      showToast('场景背景已更新！');
    } catch (err) {
      alert('图片加载失败');
    }
  };

  // 上传角色立绘图片
  const handleSpriteUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      const cleanUrl = await removeWhiteBackground(dataUrl);
      const nextBook = { ...currentBook, characterSpriteUrl: cleanUrl };
      setCurrentBook(nextBook);
      setProcessedSprite(cleanUrl);
      await db.memory_books.put(nextBook);
      onUpdateBook(nextBook);
      showToast('角色立绘已更新并自动消除白底！');
    } catch (err) {
      alert('立绘加载失败');
    }
  };

  // 上传女主头像
  const handleHeroineUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      const cleanUrl = await removeWhiteBackground(dataUrl);
      const nextBook = { ...currentBook, protagonistAvatarUrl: cleanUrl };
      setCurrentBook(nextBook);
      setProcessedHeroine(cleanUrl);
      await db.memory_books.put(nextBook);
      onUpdateBook(nextBook);
      showToast('女主头像已更新！');
    } catch (err) {
      alert('头像加载失败');
    }
  };

  // 增加一句对白
  const handleAddMessage = (insertIndex?: number) => {
    const newMsg: MemoryBookMessage = {
      sender: 'assistant',
      name: currentBook.characterName || '弑君的惡魔',
      content: '「……」',
      timestamp: Date.now(),
    };

    const nextMessages = [...currentBook.messages];
    const targetIdx = insertIndex !== undefined ? insertIndex + 1 : nextMessages.length;
    nextMessages.splice(targetIdx, 0, newMsg);

    setCurrentBook({
      ...currentBook,
      messages: nextMessages,
    });
  };

  // 删除某句对白
  const handleDeleteMessage = (idx: number) => {
    if (currentBook.messages.length <= 1) {
      alert('剧本至少保留一句台词哦！');
      return;
    }
    const nextMessages = currentBook.messages.filter((_, i) => i !== idx);
    setCurrentBook({
      ...currentBook,
      messages: nextMessages,
    });
    if (currentIndex >= nextMessages.length) {
      setCurrentIndex(Math.max(0, nextMessages.length - 1));
    }
  };

  // 上移/下移对白
  const handleMoveMessage = (idx: number, direction: 'up' | 'down') => {
    const nextMessages = [...currentBook.messages];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= nextMessages.length) return;

    const temp = nextMessages[idx];
    nextMessages[idx] = nextMessages[targetIdx];
    nextMessages[targetIdx] = temp;

    setCurrentBook({
      ...currentBook,
      messages: nextMessages,
    });
  };

  // 修改单句对白内容
  const handleUpdateMessageContent = (idx: number, content: string) => {
    const nextMessages = [...currentBook.messages];
    nextMessages[idx] = { ...nextMessages[idx], content };
    setCurrentBook({
      ...currentBook,
      messages: nextMessages,
    });
  };

  // 修改单句说话人
  const handleUpdateMessageSpeaker = (idx: number, name: string) => {
    const nextMessages = [...currentBook.messages];
    const isHeroine = name === '我' || name === '女主';
    nextMessages[idx] = {
      ...nextMessages[idx],
      name,
      sender: isHeroine ? 'user' : 'assistant',
    };
    setCurrentBook({
      ...currentBook,
      messages: nextMessages,
    });
  };

  const quickSpeakers = [
    { name: currentBook.characterName || '弑君的惡魔', type: 'assistant' },
    { name: '我', type: 'user' },
    { name: '旁白', type: 'narrator' },
  ];

  const currentSpeaker = currentMsg?.name || (currentMsg?.sender === 'user' ? '我' : currentBook.characterName || '弑君的惡魔');
  const bgImage = currentBook.bgUrl || '/galgame/bg.jpg';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#0a0a0c',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        fontFamily: '"Noto Serif TC", "Source Han Serif TC", "Songti SC", "SimSun", "Times New Roman", serif',
        userSelect: 'none',
      }}
    >
      {/* 隐藏的本地图片选择器 */}
      <input ref={bgUploadRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBgUpload} />
      <input ref={spriteUploadRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleSpriteUpload} />
      <input ref={heroineUploadRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleHeroineUpload} />

      {/* 顶部悬浮提示 Toast */}
      {toastMsg && (
        <div
          style={{
            position: 'absolute',
            top: '20px',
            backgroundColor: 'rgba(25, 30, 48, 0.95)',
            border: '1px solid rgba(165, 180, 252, 0.4)',
            color: '#E0E7FF',
            padding: '7px 18px',
            borderRadius: '24px',
            fontSize: '12px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            zIndex: 100000,
            backdropFilter: 'blur(8px)',
          }}
        >
          <Check size={14} color="#85E3B3" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 顶部悬浮控制栏 */}
      <div
        className="top-nav-bar"
        style={{
          position: 'absolute',
          top: '12px',
          left: '14px',
          right: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 40,
          pointerEvents: 'auto',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'rgba(20, 24, 38, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#E2E8F0',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
          }}
        >
          <ArrowLeft size={14} />
          <span>返回书架</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* 演播模式下的换景换装快捷键 */}
          {mode === 'play' && (
            <button
              type="button"
              onClick={() => setShowAssetModal(true)}
              style={{
                background: 'rgba(20, 24, 38, 0.75)',
                border: '1px solid rgba(165, 180, 252, 0.35)',
                color: '#C7D2FE',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
              }}
              title="自定义更换背景、立绘与头像"
            >
              <Palette size={13} />
              <span>更换图片</span>
            </button>
          )}

          {mode === 'play' ? (
            <button
              type="button"
              onClick={() => setMode('edit')}
              style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%)',
                border: '1px solid rgba(199, 210, 254, 0.4)',
                color: '#FFFFFF',
                padding: '6px 15px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
              }}
            >
              <Edit3 size={13} />
              <span>剧本工坊</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setMode('play')}
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                border: '1px solid rgba(167, 243, 208, 0.4)',
                color: '#FFFFFF',
                padding: '6px 15px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
              }}
            >
              <Play size={13} />
              <span>回到演播</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= 模式 1: 视觉小说自适应演播舞台 ================= */}
      {mode === 'play' && (
        <div
          onClick={handleStageClick}
          style={{
            width: '100%',
            maxWidth: '920px',
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#05070A',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
        >
          {/* Layer 1: 场景背景层 */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              backgroundImage: `url(${bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: 'inset 0 0 100px rgba(0, 0, 0, 0.55)',
              transition: 'background-image 0.4s ease',
            }}
          />

          {/* Layer 2: 角色立绘层 (自适应居中，白底已消除，绝不遮盖文字) */}
          {showSprite && processedSprite && (
            <div
              style={{
                position: 'absolute',
                bottom: '150px', // 位于对话框上方
                left: '50%',
                transform: 'translateX(-50%)',
                height: '56%',
                maxHeight: '460px',
                zIndex: 2,
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
              }}
            >
              <img
                src={processedSprite}
                alt="角色立绘"
                style={{
                  height: '100%',
                  maxWidth: '85vw',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 4px 16px rgba(0, 0, 0, 0.6))',
                  transition: 'opacity 0.3s ease',
                }}
              />
            </div>
          )}

          {/* Layer 3: 对话框底框 (深蓝灰毛玻璃) */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              minHeight: '150px',
              height: '165px',
              background: 'linear-gradient(90deg, rgba(16, 20, 34, 0.82) 0%, rgba(20, 24, 40, 0.94) 20%, rgba(20, 24, 40, 0.94) 80%, rgba(16, 20, 34, 0.82) 100%)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              zIndex: 10,
              pointerEvents: 'auto',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* 顶部发光微蓝分割线 */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '2px',
                background: 'linear-gradient(90deg, transparent 2%, rgba(165, 180, 252, 0.8) 15%, rgba(165, 180, 252, 0.8) 85%, transparent 98%)',
                boxShadow: '0 0 10px rgba(165, 180, 252, 0.7), 0 0 2px rgba(255, 255, 255, 0.9)',
              }}
            />

            {/* 说话者尖角姓名栏 */}
            <div
              style={{
                position: 'absolute',
                top: '-32px',
                left: 0,
                height: '32px',
                minWidth: '220px',
                maxWidth: '60%',
                clipPath: 'polygon(0 0, 92% 0, 100% 50%, 92% 100%, 0 100%)',
                background: 'linear-gradient(90deg, rgba(35, 45, 80, 0.7) 0%, rgba(55, 68, 120, 0.92) 80%, rgba(75, 90, 150, 0.96) 100%)',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: showHeroine ? '106px' : '24px', // 避开头像
                borderTop: '1px solid rgba(190, 205, 255, 0.4)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              }}
            >
              <span
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  letterSpacing: '0.08em',
                  textShadow: '0 1px 3px rgba(0, 0, 0, 0.95)',
                  whiteSpace: 'nowrap',
                }}
              >
                {currentSpeaker}
              </span>
            </div>

            {/* 女主头像徽章 (尺寸严格限制为 78px x 78px 典雅圆形拟物徽章，绝不会挡住文字) */}
            {showHeroine && processedHeroine && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '24px',
                  left: '16px',
                  width: '78px',
                  height: '78px',
                  borderRadius: '50%',
                  border: '2px solid rgba(165, 180, 252, 0.8)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.7), 0 0 12px rgba(165, 180, 252, 0.4)',
                  overflow: 'hidden',
                  background: 'radial-gradient(circle, rgba(40, 50, 80, 0.85) 0%, rgba(15, 20, 35, 0.95) 100%)',
                  zIndex: 15,
                  pointerEvents: 'none',
                }}
              >
                <img
                  src={processedHeroine}
                  alt="女主头像"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'top center',
                  }}
                />
              </div>
            )}

            {/* 对话正文区 (左侧避开头像，右侧避开六边形按键，绝无重叠) */}
            <div
              style={{
                marginLeft: showHeroine ? '108px' : '22px',
                marginRight: '80px',
                paddingTop: '18px',
                paddingBottom: '20px',
                color: '#ffffff',
                fontSize: '15px',
                lineHeight: 1.7,
                letterSpacing: '0.06em',
                textShadow: '0 1px 2px #000, 0 -1px 2px #000, 1px 0 2px #000, -1px 0 2px #000, 0 2px 6px rgba(0, 0, 0, 0.9)',
                minHeight: '64px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}
            >
              {displayedText}
            </div>

            {/* 右侧六边形快捷按键 (蜂巢 Menu / Log / Jump) */}
            <div
              className="quick-menu"
              style={{
                position: 'absolute',
                right: '12px',
                bottom: '16px',
                zIndex: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                pointerEvents: 'auto',
              }}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMode('edit');
                }}
                style={{
                  width: '46px',
                  height: '38px',
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  background: 'rgba(140, 150, 180, 0.3)',
                  border: 'none',
                  color: '#CBD5E1',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="橙光剧本工坊"
              >
                Menu
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLogModal(true);
                }}
                style={{
                  width: '46px',
                  height: '38px',
                  marginLeft: '10px',
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  background: 'rgba(140, 150, 180, 0.3)',
                  border: 'none',
                  color: '#CBD5E1',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="台词历史记录"
              >
                Log
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentIndex < messages.length - 1) {
                    setCurrentIndex((prev) => prev + 1);
                  } else {
                    setCurrentIndex(0);
                    showToast('已从头重播');
                  }
                }}
                style={{
                  width: '46px',
                  height: '38px',
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  background: 'rgba(140, 150, 180, 0.3)',
                  border: 'none',
                  color: '#CBD5E1',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="下一幕 / 重播"
              >
                Jump
              </button>
            </div>

            {/* 等待点击旋转星芒指示器 */}
            {!isTyping && (
              <div
                style={{
                  position: 'absolute',
                  right: '65px',
                  bottom: '22px',
                  zIndex: 15,
                  pointerEvents: 'none',
                  animation: 'spin 3s linear infinite',
                }}
              >
                <Sparkles size={14} color="#A5B4FC" />
              </div>
            )}

            {/* 底部版权标识 (独立置底，不占空间，绝不挡台词) */}
            <div
              style={{
                position: 'absolute',
                bottom: '2px',
                width: '100%',
                textAlign: 'center',
                fontSize: '9px',
                color: 'rgba(255, 255, 255, 0.35)',
                letterSpacing: '0.5px',
                pointerEvents: 'none',
                zIndex: 11,
              }}
            >
              © G-MODE Corporation / © 2026 CLOUDFLY STUDIO / ALL RIGHTS RESERVED.
            </div>
          </div>

          {/* ================= 快捷换装换景弹窗 (Asset Modal) ================= */}
          {showAssetModal && (
            <div
              className="asset-modal"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(10, 14, 24, 0.92)',
                backdropFilter: 'blur(12px)',
                zIndex: 60,
                display: 'flex',
                flexDirection: 'column',
                padding: '24px 20px',
                color: '#fff',
                overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Palette size={18} color="#A5B4FC" />
                  <h3 style={{ fontSize: '15px', margin: 0, color: '#E0E7FF' }}>自定义视觉与角色资产</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAssetModal(false)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#fff',
                    padding: '3px 12px',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  关闭
                </button>
              </div>

              {/* 1. 背景更换 */}
              <div style={{ backgroundColor: '#161C2C', padding: '14px', borderRadius: '10px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#C7D2FE' }}>1. 场景背景</span>
                  <button
                    type="button"
                    onClick={() => bgUploadRef.current?.click()}
                    style={{
                      background: '#4F46E5',
                      border: 'none',
                      color: '#fff',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Upload size={12} />
                    <span>上传本地背景</span>
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {PRESET_BG_LIST.map((bg, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        const nextBook = { ...currentBook, bgUrl: bg.url };
                        setCurrentBook(nextBook);
                        db.memory_books.put(nextBook);
                        onUpdateBook(nextBook);
                        showToast(`已更换场景为: ${bg.label}`);
                      }}
                      style={{
                        height: '56px',
                        borderRadius: '6px',
                        backgroundImage: `url(${bg.thumb})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        border: currentBook.bgUrl === bg.url ? '2px solid #818CF8' : '1px solid rgba(255, 255, 255, 0.1)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-end',
                        padding: '4px 6px',
                      }}
                    >
                      <span style={{ fontSize: '10px', background: 'rgba(0,0,0,0.7)', padding: '1px 5px', borderRadius: '3px' }}>
                        {bg.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. 角色立绘更换 */}
              <div style={{ backgroundColor: '#161C2C', padding: '14px', borderRadius: '10px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#C7D2FE' }}>2. 角色立绘 (男主)</span>
                    <button
                      type="button"
                      onClick={() => setShowSprite(!showSprite)}
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: showSprite ? '#86EFAC' : '#94A3B8',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      {showSprite ? '立绘显示中' : '已隐藏立绘'}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => spriteUploadRef.current?.click()}
                    style={{
                      background: '#4F46E5',
                      border: 'none',
                      color: '#fff',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Upload size={12} />
                    <span>上传本地立绘</span>
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {PRESET_SPRITE_LIST.map((sp, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        const nextBook = { ...currentBook, characterSpriteUrl: sp.url };
                        setCurrentBook(nextBook);
                        db.memory_books.put(nextBook);
                        onUpdateBook(nextBook);
                        showToast(`已更换立绘为: ${sp.label}`);
                      }}
                      style={{
                        background: currentBook.characterSpriteUrl === sp.url ? '#4338CA' : 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#fff',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      {sp.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. 女主头像更换 */}
              <div style={{ backgroundColor: '#161C2C', padding: '14px', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#C7D2FE' }}>3. 女主胸像头像</span>
                    <button
                      type="button"
                      onClick={() => setShowHeroine(!showHeroine)}
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: showHeroine ? '#86EFAC' : '#94A3B8',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      {showHeroine ? '头像显示中' : '已隐藏头像'}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => heroineUploadRef.current?.click()}
                    style={{
                      background: '#4F46E5',
                      border: 'none',
                      color: '#fff',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Upload size={12} />
                    <span>上传本地头像</span>
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {PRESET_HEROINE_LIST.map((h, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        const nextBook = { ...currentBook, protagonistAvatarUrl: h.url };
                        setCurrentBook(nextBook);
                        db.memory_books.put(nextBook);
                        onUpdateBook(nextBook);
                        showToast(`已更换头像为: ${h.label}`);
                      }}
                      style={{
                        background: currentBook.protagonistAvatarUrl === h.url ? '#4338CA' : 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#fff',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= 历史回溯弹窗 (Log Modal) ================= */}
          {showLogModal && (
            <div
              className="log-modal"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(10, 15, 25, 0.94)',
                backdropFilter: 'blur(12px)',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                padding: '24px 28px',
                color: '#fff',
                pointerEvents: 'auto',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                  paddingBottom: '10px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <History size={18} color="#C7D2FE" />
                  <h2 style={{ fontSize: '1.15rem', color: '#C7D2FE', margin: 0 }}>
                    台词回溯记录 (Log)
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#fff',
                    padding: '3px 12px',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  关闭
                </button>
              </div>

              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  paddingRight: '6px',
                }}
              >
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      borderBottom: '1px dashed rgba(255, 255, 255, 0.1)',
                      paddingBottom: '10px',
                      opacity: idx > currentIndex ? 0.4 : 1,
                    }}
                  >
                    <div style={{ fontSize: '0.9rem', color: '#A5B4FC', fontWeight: 700 }}>
                      {m.name || (m.sender === 'user' ? '我' : currentBook.characterName)}
                      {idx === currentIndex && (
                        <span style={{ fontSize: '0.75rem', color: '#FCD34D', marginLeft: '6px' }}>
                          [当前]
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.95rem', lineHeight: 1.6, color: '#E2E8F0' }}>
                      {formatDialogueText(m.content || '')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= 模式 2: 橙光 / Galgame 剧本创作工坊 ================= */}
      {mode === 'edit' && (
        <div
          style={{
            width: '100%',
            maxWidth: '920px',
            height: '92vh',
            maxHeight: '740px',
            backgroundColor: '#161922',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '14px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            color: '#E2E8F0',
            marginTop: '16px',
          }}
        >
          {/* 编辑器顶部栏 */}
          <div
            style={{
              padding: '14px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: '#1E2330',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Edit3 size={18} color="#818CF8" />
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#F8FAFC', margin: 0 }}>
                  视觉小说剧本工坊
                </h2>
                <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>
                  支持自由编写对白、更换背景与角色立绘、打造属于你的故事
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={handleSaveScript}
                style={{
                  background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  padding: '6px 16px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)',
                }}
              >
                <Save size={13} />
                <span>保存剧本</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('play')}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  padding: '6px 14px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer',
                }}
              >
                <Play size={13} />
                <span>立即演播</span>
              </button>
            </div>
          </div>

          {/* 剧本基础与图片资产设置区 */}
          <div
            style={{
              padding: '12px 20px',
              backgroundColor: '#191E2A',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              fontSize: '12px',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px' }}>
              {/* 剧本标题 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#94A3B8' }}>剧本名称:</span>
                <input
                  type="text"
                  value={currentBook.title}
                  onChange={(e) => setCurrentBook({ ...currentBook, title: e.target.value })}
                  style={{
                    background: '#0F131C',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '5px',
                    color: '#F8FAFC',
                    padding: '3px 8px',
                    fontSize: '12px',
                    width: '160px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* 主要角色 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#94A3B8' }}>主要角色:</span>
                <input
                  type="text"
                  value={currentBook.characterName}
                  onChange={(e) => setCurrentBook({ ...currentBook, characterName: e.target.value })}
                  style={{
                    background: '#0F131C',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '5px',
                    color: '#F8FAFC',
                    padding: '3px 8px',
                    fontSize: '12px',
                    width: '110px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* 图片资产快捷操作 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => bgUploadRef.current?.click()}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#E2E8F0',
                    padding: '3px 8px',
                    borderRadius: '5px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Upload size={11} />
                  <span>换背景</span>
                </button>

                <button
                  type="button"
                  onClick={() => spriteUploadRef.current?.click()}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#E2E8F0',
                    padding: '3px 8px',
                    borderRadius: '5px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Upload size={11} />
                  <span>换立绘(去白底)</span>
                </button>

                <button
                  type="button"
                  onClick={() => heroineUploadRef.current?.click()}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#E2E8F0',
                    padding: '3px 8px',
                    borderRadius: '5px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Upload size={11} />
                  <span>换女主头像</span>
                </button>
              </div>
            </div>
          </div>

          {/* 剧本台词条目列表 */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {currentBook.messages.map((m, idx) => {
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#1E2330',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          backgroundColor: '#2A3042',
                          color: '#A5B4FC',
                          padding: '2px 7px',
                          borderRadius: '10px',
                          fontWeight: 700,
                        }}
                      >
                        #{idx + 1}
                      </span>

                      <span style={{ color: '#94A3B8' }}>说话人:</span>
                      <div style={{ display: 'flex', gap: '3px' }}>
                        {quickSpeakers.map((qs, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleUpdateMessageSpeaker(idx, qs.name)}
                            style={{
                              background: m.name === qs.name ? '#4F46E5' : 'rgba(255, 255, 255, 0.06)',
                              color: m.name === qs.name ? '#FFFFFF' : '#CBD5E1',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              padding: '2px 7px',
                              borderRadius: '3px',
                              fontSize: '11px',
                              cursor: 'pointer',
                            }}
                          >
                            {qs.name}
                          </button>
                        ))}
                      </div>

                      <input
                        type="text"
                        value={m.name || ''}
                        onChange={(e) => handleUpdateMessageSpeaker(idx, e.target.value)}
                        placeholder="自定义姓名"
                        style={{
                          background: '#0F131C',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '3px',
                          color: '#F8FAFC',
                          padding: '2px 6px',
                          fontSize: '11px',
                          width: '80px',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <button
                        type="button"
                        onClick={() => handleMoveMessage(idx, 'up')}
                        disabled={idx === 0}
                        title="上移"
                        style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: 'none',
                          color: idx === 0 ? '#475569' : '#CBD5E1',
                          padding: '3px',
                          borderRadius: '3px',
                          cursor: idx === 0 ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <ChevronUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveMessage(idx, 'down')}
                        disabled={idx === currentBook.messages.length - 1}
                        title="下移"
                        style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: 'none',
                          color: idx === currentBook.messages.length - 1 ? '#475569' : '#CBD5E1',
                          padding: '3px',
                          borderRadius: '3px',
                          cursor: idx === currentBook.messages.length - 1 ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <ChevronDown size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddMessage(idx)}
                        title="插入台词"
                        style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: 'none',
                          color: '#818CF8',
                          padding: '3px 7px',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                        }}
                      >
                        <Plus size={11} />
                        <span>插入</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(idx)}
                        title="删除台词"
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: 'none',
                          color: '#F87171',
                          padding: '3px',
                          borderRadius: '3px',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    value={m.content}
                    onChange={(e) => handleUpdateMessageContent(idx, e.target.value)}
                    placeholder="输入该角色的台词或剧情独白..."
                    style={{
                      width: '100%',
                      background: '#0F131C',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '5px',
                      color: '#F8FAFC',
                      padding: '6px 10px',
                      fontSize: '12px',
                      lineHeight: 1.6,
                      outline: 'none',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => handleAddMessage()}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px dashed rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.02)',
                color: '#94A3B8',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                cursor: 'pointer',
              }}
            >
              <Plus size={14} />
              <span>添加新一幕对白</span>
            </button>
          </div>

          {/* 底部信息条 */}
          <div
            style={{
              padding: '10px 20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: '#1E2330',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`确定要从书架彻底删除《${currentBook.title}》吗？`)) {
                  onDeleteBook(currentBook.id);
                  onClose();
                }
              }}
              style={{
                background: 'transparent',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#F87171',
                padding: '5px 12px',
                borderRadius: '14px',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Trash2 size={12} />
              <span>移出书架</span>
            </button>

            <span style={{ fontSize: '11px', color: '#64748B' }}>
              共 {currentBook.messages.length} 幕对白 · 演播时支持自由更换立绘与场景
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
