import React, { useState, useEffect } from 'react';
import { StoryNovel, VocabLevel } from '../../../core/storyword/storyWordTypes';
import {
  getAllStoryNovels,
  saveStoryNovel,
  deleteStoryNovel,
  getUserSettings,
  saveUserSettings,
} from '../../../core/storyword/storyWordStorage';
import { loadRPGProfile } from '../../../core/rpg/rpgStorage';
import { StoryWordReader } from './components/StoryWordReader';
import { BookSourceModal } from './components/BookSourceModal';
import { MistakeVaultModal } from './components/MistakeVaultModal';
import { NM } from './storyWordNeumorphism';
import {
  BookOpen,
  Globe,
  Bookmark,
  Sparkles,
  Flame,
  Plus,
  Trash2,
  Trophy,
  Zap,
  ArrowLeft,
  Search,
} from 'lucide-react';

interface StoryWordAppProps {
  onBack?: () => void;
}

export const StoryWordApp: React.FC<StoryWordAppProps> = ({ onBack }) => {
  const [novels, setNovels] = useState<StoryNovel[]>([]);
  const [activeNovel, setActiveNovel] = useState<StoryNovel | null>(null);
  const [targetLevel, setTargetLevel] = useState<VocabLevel>('cet4');
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [isMistakeModalOpen, setIsMistakeModalOpen] = useState(false);
  const [rpgProfile, setRpgProfile] = useState<any>(null);

  const loadNovels = async () => {
    const list = await getAllStoryNovels();
    setNovels(list);
  };

  const loadProfile = () => {
    try {
      const p = loadRPGProfile();
      setRpgProfile(p);
    } catch (err) {
      console.warn('Failed to load RPG profile in StoryWordApp', err);
    }
  };

  useEffect(() => {
    loadNovels();
    loadProfile();
    const settings = getUserSettings();
    if (settings && settings.targetLevel) {
      setTargetLevel(settings.targetLevel);
    }
  }, []);

  const handleSelectLevel = (lvl: VocabLevel) => {
    setTargetLevel(lvl);
    saveUserSettings({ targetLevel: lvl });
  };

  const handleUpdateChapter = async (novelId: string, newIndex: number) => {
    const target = novels.find(n => n.id === novelId);
    if (target) {
      target.currentChapterIndex = newIndex;
      target.updatedAt = Date.now();
      await saveStoryNovel(target);
      await loadNovels();
    }
  };

  const handleDeleteNovel = async (e: React.MouseEvent, novelId: string) => {
    e.stopPropagation();
    await deleteStoryNovel(novelId);
    await loadNovels();
  };

  // 如果正在阅读小说，全屏显示阅读器
  if (activeNovel) {
    return (
      <StoryWordReader
        novel={activeNovel}
        onBack={() => {
          setActiveNovel(null);
          loadNovels();
          loadProfile();
        }}
        onUpdateChapterIndex={handleUpdateChapter}
      />
    );
  }

  const levelLabels: Record<VocabLevel, string> = {
    cet4: '大学四级',
    cet6: '大学六级',
    kaoyan: '考研必背',
    ielts: '雅思高频',
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: NM.bg,
        color: NM.textMain,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", sans-serif',
        overflowY: 'auto',
        boxSizing: 'border-box',
      }}
    >
      {/* 顶部应用栏 */}
      <div
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: NM.cardBg,
          boxShadow: NM.convexSm,
          borderBottom: NM.borderLight,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: NM.textMain,
                backgroundColor: NM.cardBg,
                boxShadow: NM.convexSm,
                border: NM.borderLight,
                cursor: 'pointer',
                padding: 0,
                marginRight: '4px',
              }}
              title="返回桌面"
            >
              <ArrowLeft size={17} />
            </button>
          )}
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              backgroundColor: NM.cardBg,
              boxShadow: NM.convexXs,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BookOpen size={20} color={NM.amber} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: NM.textMain }}>
              爽文背词
            </div>
            <div style={{ fontSize: '11px', color: NM.textMuted }}>
              网文剧情 · 互动通关 · 打脸背词
            </div>
          </div>
        </div>

        {/* 顶部快捷操作 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setIsMistakeModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              borderRadius: '10px',
              backgroundColor: NM.cardBg,
              boxShadow: NM.convexXs,
              border: NM.borderLight,
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 700,
              color: NM.textMain,
            }}
          >
            <Bookmark size={14} color={NM.rose} />
            <span>错词阁</span>
          </button>
        </div>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

        {/* 难度考级选择 Pill */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: NM.textSub }}>
            当前目标词库
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
            }}
          >
            {(['cet4', 'cet6', 'kaoyan', 'ielts'] as VocabLevel[]).map(lvl => {
              const isSelected = targetLevel === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => handleSelectLevel(lvl)}
                  style={{
                    padding: '8px 0',
                    borderRadius: '10px',
                    backgroundColor: isSelected ? NM.amber : NM.cardBg,
                    color: isSelected ? '#fff' : NM.textSub,
                    boxShadow: isSelected ? NM.insetXs : NM.convexXs,
                    border: isSelected ? 'none' : NM.borderLight,
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {levelLabels[lvl]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 书架列表 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flame size={16} color={NM.amber} />
              <span style={{ fontSize: '14px', fontWeight: 800, color: NM.textMain }}>
                精选爽文书架 ({novels.length})
              </span>
            </div>

            <button
              onClick={() => setIsSourceModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '8px',
                backgroundColor: NM.cardBg,
                boxShadow: NM.convexXs,
                border: NM.borderLight,
                fontSize: '11px',
                fontWeight: 700,
                color: NM.gold,
                cursor: 'pointer',
              }}
            >
              <Globe size={12} color={NM.gold} />
              <span>导入书源</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {novels.map(n => (
              <div
                key={n.id}
                onClick={() => setActiveNovel(n)}
                style={{
                  padding: '14px 16px',
                  borderRadius: '16px',
                  backgroundColor: NM.cardBg,
                  boxShadow: NM.convexSm,
                  border: NM.borderLight,
                  cursor: 'pointer',
                  display: 'flex',
                  gap: '12px',
                  transition: 'transform 0.15s ease',
                }}
              >
                {/* 拟物小说书脊 */}
                <div
                  style={{
                    width: '42px',
                    height: '58px',
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, #E6D5B8, #C9B28F)',
                    boxShadow: NM.convexXs,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    borderLeft: '3px solid #8B6E4E',
                  }}
                >
                  <BookOpen size={18} color="#5D4528" />
                </div>

                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontSize: '14px', fontWeight: 800, color: NM.textMain }}>
                      {n.title}
                    </span>
                    {!n.id.startsWith('novel_') && (
                      <button
                        onClick={e => handleDeleteNovel(e, n.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: NM.textMuted,
                          cursor: 'pointer',
                          padding: '2px',
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: '11px',
                      color: NM.textSub,
                      marginTop: '4px',
                      lineHeight: '1.4',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {n.intro || n.chapters[0]?.originalText.slice(0, 50)}...
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '6px',
                    }}
                  >
                    <span style={{ fontSize: '10px', color: NM.textMuted }}>
                      作者: {n.author} · {n.chapters.length} 章节
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        color: NM.amber,
                        backgroundColor: NM.bgInset,
                        padding: '1px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      读至第 {(n.currentChapterIndex || 0) + 1} 章
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 弹窗 */}
      <BookSourceModal
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
        onNovelAdded={newNovel => {
          loadNovels();
          setActiveNovel(newNovel);
        }}
      />

      <MistakeVaultModal
        isOpen={isMistakeModalOpen}
        onClose={() => setIsMistakeModalOpen(false)}
      />
    </div>
  );
};
