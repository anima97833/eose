import React, { useState, useEffect, useRef } from 'react';
import { db, MemoryBookRecord, MemoryBookMessage, GalgameCharacterAsset } from '../../../core/storage/db';
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
  Palette,
  Check,
  User,
  Smile,
  BookOpen,
  Tag
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

// 系统默认预置角色
const DEFAULT_PRESET_CHARACTERS: GalgameCharacterAsset[] = [
  {
    id: 'char_preset_demon',
    name: '弑君的惡魔',
    spriteUrl: '/galgame/demon.png',
    avatarUrl: '/galgame/demon.png',
    createdAt: 1000,
  },
  {
    id: 'char_preset_heroine',
    name: '我',
    spriteUrl: '/galgame/heroine.png',
    avatarUrl: '/galgame/heroine.png',
    createdAt: 2000,
  },
  {
    id: 'char_preset_narrator',
    name: '旁白',
    spriteUrl: '',
    avatarUrl: '',
    createdAt: 3000,
  },
];

export const GalgameReaderModal: React.FC<GalgameReaderModalProps> = ({
  book,
  onClose,
  onUpdateBook,
  onDeleteBook,
}) => {
  // 核心状态：当前模式 ('play' 演播 | 'edit' 剧本工坊)
  const [mode, setMode] = useState<'play' | 'edit'>('play');
  
  // 剧本数据状态（可编辑副本）
  const [currentBook, setCurrentBook] = useState<MemoryBookRecord>(book);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // 角色库状态（与 IndexedDB galgame_characters 同步）
  const [characterAssets, setCharacterAssets] = useState<GalgameCharacterAsset[]>([]);

  // 演播状态
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [showAssetModal, setShowAssetModal] = useState<boolean>(false); // 快速换装换景面板
  const [showSystemMenu, setShowSystemMenu] = useState<boolean>(false); // 点击 Menu 弹出的系统菜单
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 素材命名确认弹窗状态（用户上传素材后绑定角色名）
  const [namingModal, setNamingModal] = useState<{
    isOpen: boolean;
    pendingDataUrl: string;
    targetType: 'sprite' | 'avatar';
  }>({
    isOpen: false,
    pendingDataUrl: '',
    targetType: 'sprite',
  });
  const [inputCharName, setInputCharName] = useState<string>('');

  // 文件上传 Refs
  const bgUploadRef = useRef<HTMLInputElement>(null);
  const spriteUploadRef = useRef<HTMLInputElement>(null);
  const heroineUploadRef = useRef<HTMLInputElement>(null);

  // 打字机计时器
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2000);
  };

  // 1. 初始化加载 IndexedDB 中的角色资产表
  const loadCharacters = async () => {
    try {
      let stored = await db.galgame_characters.toArray();
      if (!stored || stored.length === 0) {
        for (const c of DEFAULT_PRESET_CHARACTERS) {
          await db.galgame_characters.put(c);
        }
        stored = await db.galgame_characters.toArray();
      }
      setCharacterAssets(stored);
    } catch (err) {
      console.error('Failed to load galgame_characters', err);
    }
  };

  useEffect(() => {
    loadCharacters();
  }, []);

  const messages = currentBook.messages || [];
  const currentMsg: MemoryBookMessage | undefined = messages[currentIndex];

  // 判断当前对白说话人
  const speakerName = currentMsg?.name || (currentMsg?.sender === 'user' ? '我' : currentBook.characterName || '弑君的惡魔');
  const isNarrator = speakerName === '旁白' || !currentMsg?.name;

  // 根据当前说话人，在已绑定角色资产库中动态匹配专属立绘与头像
  const matchedChar = characterAssets.find((c) => c.name === speakerName);
  const activeSpriteUrl = matchedChar?.spriteUrl || currentBook.characterSpriteUrl || '/galgame/demon.png';
  const activeAvatarUrl = matchedChar?.avatarUrl || matchedChar?.spriteUrl || currentBook.protagonistAvatarUrl || '/galgame/heroine.png';
  const bgImage = currentBook.bgUrl || '/galgame/bg.jpg';

  // 格式化文本输出：对话自动加「」，旁白不加引号保持纯粹描写
  const formatDialogueText = (raw: string, isNar: boolean) => {
    const trimmed = (raw || '').trim();
    if (!trimmed) return '……';
    if (isNar) {
      if (trimmed.startsWith('「') && trimmed.endsWith('」')) {
        return trimmed.slice(1, -1);
      }
      return trimmed;
    }
    if (trimmed.startsWith('「') && trimmed.endsWith('」')) {
      return trimmed;
    }
    return `「${trimmed}」`;
  };

  // 打字机逻辑
  useEffect(() => {
    if (mode !== 'play') return;
    if (!currentMsg) {
      setDisplayedText('（已完结）');
      setIsTyping(false);
      return;
    }

    const fullText = formatDialogueText(currentMsg.content || '', isNarrator);
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
    }, 30);

    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, [currentIndex, mode, currentBook]);

  // 点击推进台词
  const handleStageClick = (e: React.MouseEvent) => {
    if (
      (e.target as HTMLElement).closest('.quick-menu') ||
      (e.target as HTMLElement).closest('.log-modal') ||
      (e.target as HTMLElement).closest('.asset-modal') ||
      (e.target as HTMLElement).closest('.naming-modal') ||
      (e.target as HTMLElement).closest('.system-menu-pop')
    ) {
      return;
    }

    if (showSystemMenu) {
      setShowSystemMenu(false);
      return;
    }

    if (!currentMsg) {
      setCurrentIndex(0);
      return;
    }

    const fullText = formatDialogueText(currentMsg.content || '', isNarrator);

    if (isTyping) {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
      setDisplayedText(fullText);
      setIsTyping(false);
      return;
    }

    if (currentIndex < messages.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      showToast('本章演播完毕');
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
      showToast('剧本已保存');
    } catch (err: any) {
      alert('保存失败：' + err?.message);
    }
  };

  // 背景图片上传
  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      const nextBook = { ...currentBook, bgUrl: dataUrl };
      setCurrentBook(nextBook);
      await db.memory_books.put(nextBook);
      onUpdateBook(nextBook);
      showToast('背景已更新');
    } catch (err) {
      alert('图片加载失败');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  // 角色素材上传：去白底后调出命名绑定弹窗
  const handleSpriteFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      const cleanUrl = await removeWhiteBackground(dataUrl);
      // 调出命名绑定确认框，默认推荐文件名作为参考
      const defaultName = file.name.replace(/\.[^/.]+$/, '').slice(0, 10);
      setInputCharName(defaultName);
      setNamingModal({
        isOpen: true,
        pendingDataUrl: cleanUrl,
        targetType: 'sprite',
      });
    } catch (err) {
      alert('立绘加载失败');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  // 女主头像上传：去白底后调出命名绑定弹窗
  const handleHeroineFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      const cleanUrl = await removeWhiteBackground(dataUrl);
      setInputCharName('我');
      setNamingModal({
        isOpen: true,
        pendingDataUrl: cleanUrl,
        targetType: 'avatar',
      });
    } catch (err) {
      alert('头像加载失败');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  // 确认命名并将素材与角色名绑定保存入 IndexedDB
  const handleConfirmNaming = async () => {
    const trimmedName = inputCharName.trim();
    if (!trimmedName) {
      alert('请输入角色名称');
      return;
    }

    try {
      const existing = characterAssets.find((c) => c.name === trimmedName);
      let assetId = existing?.id || `char_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      
      const newCharAsset: GalgameCharacterAsset = {
        id: assetId,
        name: trimmedName,
        spriteUrl: namingModal.targetType === 'sprite' ? namingModal.pendingDataUrl : (existing?.spriteUrl || namingModal.pendingDataUrl),
        avatarUrl: namingModal.targetType === 'avatar' ? namingModal.pendingDataUrl : (existing?.avatarUrl || namingModal.pendingDataUrl),
        createdAt: existing?.createdAt || Date.now(),
      };

      await db.galgame_characters.put(newCharAsset);
      await loadCharacters();

      // 如果当前剧本的主角色与此同名，也一并同步更新剧本默认资产
      const nextBook = {
        ...currentBook,
        characterName: trimmedName,
        characterSpriteUrl: newCharAsset.spriteUrl,
        protagonistAvatarUrl: newCharAsset.avatarUrl,
      };
      setCurrentBook(nextBook);
      await db.memory_books.put(nextBook);
      onUpdateBook(nextBook);

      setNamingModal({ isOpen: false, pendingDataUrl: '', targetType: 'sprite' });
      showToast(`已绑定角色【${trimmedName}】`);
    } catch (err: any) {
      alert('保存角色资产失败：' + err?.message);
    }
  };

  // 删除某自定义角色
  const handleDeleteCharacter = async (charId: string, charName: string) => {
    if (['弑君的惡魔', '我', '旁白'].includes(charName)) {
      alert('系统默认角色不可删除');
      return;
    }
    if (window.confirm(`确定删除角色【${charName}】及其素材绑定吗？`)) {
      await db.galgame_characters.delete(charId);
      await loadCharacters();
      showToast(`已删除角色【${charName}】`);
    }
  };

  // 剧本工坊：增加一句对白
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

  // 剧本工坊：删除某句对白
  const handleDeleteMessage = (idx: number) => {
    if (currentBook.messages.length <= 1) {
      alert('至少保留一句台词');
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

  // 剧本工坊：上移/下移对白
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

  // 点击角色选择块直接赋予说话人（零输入）
  const handleAssignSpeaker = (msgIdx: number, charName: string) => {
    const nextMessages = [...currentBook.messages];
    const isHeroine = charName === '我' || charName === '女主';
    nextMessages[msgIdx] = {
      ...nextMessages[msgIdx],
      name: charName,
      sender: isHeroine ? 'user' : 'assistant',
    };
    setCurrentBook({
      ...currentBook,
      messages: nextMessages,
    });
  };

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
      {/* 隐藏的本地文件选择器 */}
      <input ref={bgUploadRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBgUpload} />
      <input ref={spriteUploadRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleSpriteFileSelect} />
      <input ref={heroineUploadRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleHeroineFileSelect} />

      {/* 顶部悬浮提示 Toast */}
      {toastMsg && (
        <div
          style={{
            position: 'absolute',
            top: '16px',
            backgroundColor: 'rgba(20, 24, 38, 0.95)',
            border: '1px solid rgba(165, 180, 252, 0.4)',
            color: '#E0E7FF',
            padding: '5px 14px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 6px 18px rgba(0,0,0,0.6)',
            zIndex: 100000,
            backdropFilter: 'blur(8px)',
          }}
        >
          <Check size={12} color="#85E3B3" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ================= 模式 1: 视觉小说演播舞台 (动态角色立绘感知驱动) ================= */}
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

          {/* Layer 2: 动态角色立绘层 (根据当前对白说话人自动切为广陵王/恶魔立绘；旁白时隐去) */}
          {!isNarrator && activeSpriteUrl && (
            <div
              style={{
                position: 'absolute',
                bottom: '150px',
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
                src={activeSpriteUrl}
                alt={speakerName}
                style={{
                  height: '100%',
                  maxWidth: '85vw',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 4px 16px rgba(0, 0, 0, 0.6))',
                  transition: 'opacity 0.25s ease',
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
              background: isNarrator
                ? 'linear-gradient(90deg, rgba(14, 18, 30, 0.88) 0%, rgba(18, 22, 36, 0.96) 50%, rgba(14, 18, 30, 0.88) 100%)'
                : 'linear-gradient(90deg, rgba(16, 20, 34, 0.82) 0%, rgba(20, 24, 40, 0.94) 20%, rgba(20, 24, 40, 0.94) 80%, rgba(16, 20, 34, 0.82) 100%)',
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

            {/* 说话者多边形姓名栏 (旁白时自动隐藏) */}
            {!isNarrator && (
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
                  paddingLeft: activeAvatarUrl ? '106px' : '24px',
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
                  {speakerName}
                </span>
              </div>
            )}

            {/* 角色专属头像徽章 (动态展示当前说话人的头像，旁白时隐去) */}
            {!isNarrator && activeAvatarUrl && (
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
                  src={activeAvatarUrl}
                  alt={speakerName}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'top center',
                  }}
                />
              </div>
            )}

            {/* 对话正文区 */}
            <div
              style={{
                marginLeft: !isNarrator && activeAvatarUrl ? '108px' : '24px',
                marginRight: '80px',
                paddingTop: isNarrator ? '22px' : '18px',
                paddingBottom: '20px',
                color: isNarrator ? '#E2E8F0' : '#FFFFFF',
                fontStyle: isNarrator ? 'italic' : 'normal',
                fontSize: isNarrator ? '14.5px' : '15px',
                lineHeight: 1.75,
                letterSpacing: isNarrator ? '0.08em' : '0.06em',
                textShadow: '0 1px 2px #000, 0 -1px 2px #000, 1px 0 2px #000, -1px 0 2px #000, 0 2px 6px rgba(0, 0, 0, 0.9)',
                minHeight: '64px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}
            >
              {displayedText}
            </div>

            {/* 右侧蜂巢六边形快捷按键 (Menu / Log / Jump) */}
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
                  setShowSystemMenu(!showSystemMenu);
                }}
                style={{
                  width: '46px',
                  height: '38px',
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  background: showSystemMenu ? '#4338CA' : 'rgba(140, 150, 180, 0.3)',
                  border: 'none',
                  color: '#CBD5E1',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="系统菜单"
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
                title="台词历史"
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

            {/* 打字完成后旋转星芒指示器 */}
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

            {/* 底部版权标识 */}
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

          {/* Menu 呼出的右侧极简毛玻璃卡片 */}
          {showSystemMenu && (
            <div
              className="system-menu-pop"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                right: '16px',
                bottom: '175px',
                backgroundColor: 'rgba(18, 22, 36, 0.94)',
                border: '1px solid rgba(165, 180, 252, 0.3)',
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.7)',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                zIndex: 50,
                backdropFilter: 'blur(12px)',
                minWidth: '110px',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setShowSystemMenu(false);
                  setMode('edit');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#E0E7FF',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <Edit3 size={13} color="#818CF8" />
                <span>剧本工坊</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSystemMenu(false);
                  setShowAssetModal(true);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#E0E7FF',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <Palette size={13} color="#A78BFA" />
                <span>更换图片</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSystemMenu(false);
                  setCurrentIndex(0);
                  showToast('已从头重播');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#E0E7FF',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <RotateCcw size={13} color="#6EE7B7" />
                <span>从头播放</span>
              </button>

              <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)', margin: '2px 0' }} />

              <button
                type="button"
                onClick={() => {
                  setShowSystemMenu(false);
                  onClose();
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#FCA5A5',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <ArrowLeft size={13} />
                <span>返回书架</span>
              </button>
            </div>
          )}

          {/* ================= 视觉资产设置弹窗 (支持素材命名与绑定管理) ================= */}
          {showAssetModal && (
            <div
              className="asset-modal"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(10, 14, 24, 0.94)',
                backdropFilter: 'blur(12px)',
                zIndex: 60,
                display: 'flex',
                flexDirection: 'column',
                padding: '20px',
                color: '#fff',
                overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Palette size={16} color="#A5B4FC" />
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#E0E7FF' }}>视觉资产设置</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAssetModal(false)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    color: '#fff',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '11px',
                  }}
                >
                  <X size={12} />
                </button>
              </div>

              {/* 1. 场景背景更换 */}
              <div style={{ backgroundColor: '#161C2C', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#C7D2FE' }}>场景背景</span>
                  <button
                    type="button"
                    onClick={() => bgUploadRef.current?.click()}
                    style={{
                      background: '#4F46E5',
                      border: 'none',
                      color: '#fff',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Upload size={11} />
                    <span>上传</span>
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                  {PRESET_BG_LIST.map((bg, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        const nextBook = { ...currentBook, bgUrl: bg.url };
                        setCurrentBook(nextBook);
                        db.memory_books.put(nextBook);
                        onUpdateBook(nextBook);
                        showToast(`已更换场景`);
                      }}
                      style={{
                        height: '50px',
                        borderRadius: '5px',
                        backgroundImage: `url(${bg.thumb})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        border: currentBook.bgUrl === bg.url ? '2px solid #818CF8' : '1px solid rgba(255, 255, 255, 0.1)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-end',
                        padding: '3px 5px',
                      }}
                    >
                      <span style={{ fontSize: '9px', background: 'rgba(0,0,0,0.7)', padding: '1px 4px', borderRadius: '2px' }}>
                        {bg.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. 角色立绘素材库 (展示所有已绑定名字的角色素材，可上传新立绘并命名) */}
              <div style={{ backgroundColor: '#161C2C', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#C7D2FE' }}>角色素材绑定库</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => spriteUploadRef.current?.click()}
                    style={{
                      background: '#4F46E5',
                      border: 'none',
                      color: '#fff',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    title="上传图片并绑定角色姓名"
                  >
                    <Plus size={11} />
                    <span>上传并绑定新角色</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {characterAssets.map((char) => {
                    const isSelected = currentBook.characterName === char.name;
                    return (
                      <div
                        key={char.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: isSelected ? '#4338CA' : 'rgba(255, 255, 255, 0.08)',
                          border: isSelected ? '1px solid #818CF8' : '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '6px',
                          padding: '4px 8px',
                        }}
                      >
                        {char.avatarUrl || char.spriteUrl ? (
                          <img
                            src={char.avatarUrl || char.spriteUrl}
                            alt={char.name}
                            style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                        ) : null}

                        <span
                          onClick={() => {
                            const nextBook = {
                              ...currentBook,
                              characterName: char.name,
                              characterSpriteUrl: char.spriteUrl || currentBook.characterSpriteUrl,
                              protagonistAvatarUrl: char.avatarUrl || currentBook.protagonistAvatarUrl,
                            };
                            setCurrentBook(nextBook);
                            db.memory_books.put(nextBook);
                            onUpdateBook(nextBook);
                            showToast(`当前主角色已切为: ${char.name}`);
                          }}
                          style={{ fontSize: '11px', cursor: 'pointer', color: '#fff', fontWeight: 500 }}
                        >
                          {char.name}
                        </span>

                        {!['弑君的惡魔', '我', '旁白'].includes(char.name) && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCharacter(char.id, char.name)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#F87171',
                              cursor: 'pointer',
                              padding: '0 2px',
                            }}
                            title="删除此角色"
                          >
                            <X size={11} />
                          </button>
                        )}
                      </div>
                    );
                  })}
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
                padding: '20px 24px',
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
                  paddingBottom: '8px',
                  marginBottom: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <History size={16} color="#C7D2FE" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#C7D2FE' }}>台词记录 (Log)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    color: '#fff',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '11px',
                  }}
                >
                  <X size={12} />
                </button>
              </div>

              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  paddingRight: '4px',
                }}
              >
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px',
                      borderBottom: '1px dashed rgba(255, 255, 255, 0.1)',
                      paddingBottom: '8px',
                      opacity: idx > currentIndex ? 0.4 : 1,
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', color: '#A5B4FC', fontWeight: 700 }}>
                      {m.name || (m.sender === 'user' ? '我' : currentBook.characterName)}
                      {idx === currentIndex && (
                        <span style={{ fontSize: '0.7rem', color: '#FCD34D', marginLeft: '6px' }}>
                          [当前]
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#E2E8F0' }}>
                      {formatDialogueText(m.content || '', m.name === '旁白')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= 模式 2: 剧本工坊 (角色快捷选择块联动) ================= */}
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
            marginTop: '10px',
          }}
        >
          {/* 编辑器极简顶部栏 */}
          <div
            style={{
              padding: '10px 16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: '#1E2330',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={16} color="#818CF8" />
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC' }}>剧本工坊</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={handleSaveScript}
                style={{
                  background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  padding: '5px 12px',
                  borderRadius: '14px',
                  fontSize: '11px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(79, 70, 229, 0.4)',
                }}
              >
                <Save size={12} />
                <span>保存</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('play')}
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  padding: '5px 12px',
                  borderRadius: '14px',
                  fontSize: '11px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)',
                }}
              >
                <Play size={12} />
                <span>演播</span>
              </button>
            </div>
          </div>

          {/* 剧本基础与图片资产设置区 */}
          <div
            style={{
              padding: '10px 16px',
              backgroundColor: '#191E2A',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              fontSize: '11px',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="text"
                value={currentBook.title}
                onChange={(e) => setCurrentBook({ ...currentBook, title: e.target.value })}
                placeholder="剧本名称"
                style={{
                  background: '#0F131C',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '4px',
                  color: '#F8FAFC',
                  padding: '3px 8px',
                  fontSize: '12px',
                  width: '140px',
                  outline: 'none',
                }}
              />

              <input
                type="text"
                value={currentBook.characterName}
                onChange={(e) => setCurrentBook({ ...currentBook, characterName: e.target.value })}
                placeholder="主角名称"
                style={{
                  background: '#0F131C',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '4px',
                  color: '#F8FAFC',
                  padding: '3px 8px',
                  fontSize: '12px',
                  width: '95px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={() => bgUploadRef.current?.click()}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#E2E8F0',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <ImageIcon size={11} />
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
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <User size={11} />
                <span>绑角色素材</span>
              </button>

              <button
                type="button"
                onClick={() => heroineUploadRef.current?.click()}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#E2E8F0',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Smile size={11} />
                <span>换女主头像</span>
              </button>
            </div>
          </div>

          {/* 剧本台词条目列表 (带角色小选择块 Chips，零手输直选) */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {currentBook.messages.map((m, idx) => {
              const currentName = m.name || (m.sender === 'user' ? '我' : currentBook.characterName);
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#1E2330',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
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
                    {/* 说话人动态小选择块 Chips 区域 */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '5px' }}>
                      <span
                        style={{
                          backgroundColor: '#2A3042',
                          color: '#A5B4FC',
                          padding: '1px 6px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '10px',
                        }}
                      >
                        #{idx + 1}
                      </span>

                      {/* 渲染所有已绑定的角色小选择块 (如 弑君的惡魔、广陵王、我、旁白) */}
                      {characterAssets.map((char) => {
                        const isMatch = currentName === char.name;
                        return (
                          <button
                            key={char.id}
                            type="button"
                            onClick={() => handleAssignSpeaker(idx, char.name)}
                            style={{
                              background: isMatch ? '#4F46E5' : 'rgba(255, 255, 255, 0.06)',
                              color: isMatch ? '#FFFFFF' : '#CBD5E1',
                              border: isMatch ? '1px solid #818CF8' : '1px solid rgba(255, 255, 255, 0.1)',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: isMatch ? 600 : 400,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <span>{char.name}</span>
                          </button>
                        );
                      })}

                      {/* + 角色 快速新增按钮 */}
                      <button
                        type="button"
                        onClick={() => spriteUploadRef.current?.click()}
                        style={{
                          background: 'rgba(255, 255, 255, 0.04)',
                          color: '#94A3B8',
                          border: '1px dashed rgba(255, 255, 255, 0.2)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                        }}
                        title="上传图片绑定新角色"
                      >
                        <Plus size={10} />
                        <span>新角色</span>
                      </button>
                    </div>

                    {/* 条目操作按钮 (纯图标干练) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                          padding: '3px 6px',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '10px',
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
                        title="删除"
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
                    placeholder="台词或旁白描写..."
                    style={{
                      width: '100%',
                      background: '#0F131C',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '4px',
                      color: '#F8FAFC',
                      padding: '5px 8px',
                      fontSize: '12px',
                      lineHeight: 1.5,
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
                padding: '8px',
                borderRadius: '6px',
                border: '1px dashed rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.02)',
                color: '#94A3B8',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                cursor: 'pointer',
              }}
            >
              <Plus size={13} />
              <span>添加台词</span>
            </button>
          </div>

          {/* 极简底部栏 */}
          <div
            style={{
              padding: '8px 16px',
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
                if (window.confirm(`确定删除《${currentBook.title}》？`)) {
                  onDeleteBook(currentBook.id);
                  onClose();
                }
              }}
              style={{
                background: 'transparent',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#F87171',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Trash2 size={11} />
              <span>删除剧本</span>
            </button>

            <span style={{ fontSize: '11px', color: '#64748B' }}>
              共 {currentBook.messages.length} 幕
            </span>
          </div>
        </div>
      )}

      {/* ================= 极简角色命名绑定小弹窗 ================= */}
      {namingModal.isOpen && (
        <div
          className="naming-modal"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 100010,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '300px',
              backgroundColor: '#1A1F2C',
              border: '1px solid rgba(165, 180, 252, 0.3)',
              borderRadius: '12px',
              boxShadow: '0 16px 36px rgba(0, 0, 0, 0.8)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tag size={16} color="#818CF8" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>
                命名角色素材
              </span>
            </div>

            {/* 素材缩略预览 */}
            <div
              style={{
                width: '100%',
                height: '110px',
                borderRadius: '8px',
                backgroundColor: '#0F131C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <img
                src={namingModal.pendingDataUrl}
                alt="素材预览"
                style={{ height: '100%', maxWidth: '100%', objectFit: 'contain' }}
              />
            </div>

            <input
              type="text"
              autoFocus
              value={inputCharName}
              onChange={(e) => setInputCharName(e.target.value)}
              placeholder="输入角色名，如 广陵王"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmNaming();
              }}
              style={{
                width: '100%',
                backgroundColor: '#0F131C',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '6px',
                color: '#fff',
                padding: '6px 10px',
                fontSize: '12px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setNamingModal({ isOpen: false, pendingDataUrl: '', targetType: 'sprite' })}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#CBD5E1',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmNaming}
                style={{
                  background: '#4F46E5',
                  border: 'none',
                  color: '#fff',
                  padding: '4px 14px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(79, 70, 229, 0.4)',
                }}
              >
                确定绑定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
