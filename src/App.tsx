import React, { useState, useEffect } from 'react';
import { PhoneFrame } from './components/shell/PhoneFrame';
import { DesktopHome } from './components/desktop/DesktopHome';
import { SettingsApp } from './components/apps/settings/SettingsApp';
import { ChatApp } from './components/apps/chat/ChatApp';
import { PlaceholderApp } from './components/apps/PlaceholderApp';
import { CustomAppRunner } from './components/apps/custom/CustomAppRunner';
import { AppStoreApp } from './components/apps/store/AppStoreApp';
import { MemoriesApp } from './components/apps/memories/MemoriesApp';
import { PomodoroApp } from './components/apps/pomodoro/PomodoroApp';
import { BrowserApp } from './components/apps/browser/BrowserApp';
import { ProfileApp } from './components/apps/profile/ProfileApp';
import { MomentsApp } from './components/apps/moments/MomentsApp';
import { MemoApp } from './components/apps/memo/MemoApp';
import { ArcadeApp } from './components/apps/arcade/ArcadeApp';
import { CinemaApp } from './components/apps/cinema/CinemaApp';
import { PoetryApp } from './components/apps/poetry/PoetryApp';
import { BookVaultApp } from './components/apps/books/BookVaultApp';
import { StoryWordApp } from './components/apps/storyword/StoryWordApp';
import { CourseKanbanApp } from './components/apps/kanban/CourseKanbanApp';
import { SecurityApp } from './components/apps/security/SecurityApp';
import { CompassApp } from './components/apps/compass/CompassApp';
import { QuestJournalApp } from './components/apps/quest/QuestJournalApp';
import { RadioApp } from './components/apps/radio/RadioApp';
import { BookOfAnswersApp } from './components/apps/answers/BookOfAnswersApp';
import { CalculatorApp } from './components/apps/calculator/CalculatorApp';
import { PocketPadApp } from './components/apps/pocketpad/PocketPadApp';
import { GachaponApp } from './components/apps/gachapon/GachaponApp';
import { GameVaultApp } from './components/apps/gamevault/GameVaultApp';
import { FilesApp } from './components/apps/files/FilesApp';
import { PhotoAlbumApp } from './components/apps/camera/PhotoAlbumApp';
import { StarryAssistantApp } from './components/apps/assistant/StarryAssistantApp';
import { DailyPosterModal } from './components/modals/DailyPosterModal';
import { getCustomAppById } from './core/sdk/customAppRegistry';
import { initIdleMasterDetector, checkLateNightActivity } from './core/quest/easterEggEngine';

export const App: React.FC = () => {
  const [activeApp, setActiveApp] = useState<string | null>(null);
  const [isOpeningApp, setIsOpeningApp] = useState<boolean>(false);

  // 初始化桌面 15 秒静止白日梦沉思侦听
  useEffect(() => {
    const cleanup = initIdleMasterDetector();
    return () => cleanup();
  }, []);

  const handleOpenApp = (appId: string) => {
    setIsOpeningApp(true);
    setActiveApp(appId);

    // 深夜 23:00 之后打开微聊触发夜雨寄语彩蛋
    if (appId === 'chat') {
      checkLateNightActivity();
    }

    // 300ms 内屏蔽桌面抬起带来的幽灵穿透点击
    window.setTimeout(() => {
      setIsOpeningApp(false);
    }, 300);
  };

  const handleHomeClick = () => {
    // 底部 Home 条手势：退出当前应用，平滑返回主屏幕
    setActiveApp(null);
  };

  const isCustomApp = activeApp ? !!getCustomAppById(activeApp) : false;

  return (
    <PhoneFrame
      onHomeClick={handleHomeClick}
      isOnDesktop={activeApp === null}
      onOpenApp={handleOpenApp}
    >
      {activeApp === null ? (
        <DesktopHome onOpenApp={handleOpenApp} />
      ) : (
        <div
          className="app-window-animate"
          style={{
            width: '100%',
            height: '100%',
            pointerEvents: isOpeningApp ? 'none' : 'auto',
          }}
        >
          {activeApp === 'settings' ? (
            <SettingsApp onBack={() => setActiveApp(null)} />
          ) : activeApp === 'chat' ? (
            <ChatApp
              onBack={() => setActiveApp(null)}
              onOpenSettings={() => setActiveApp('settings')}
            />
          ) : activeApp === 'appstore' ? (
            <AppStoreApp
              onBack={() => setActiveApp(null)}
              onOpenApp={(id) => setActiveApp(id)}
            />
          ) : activeApp === 'memories' ? (
            <MemoriesApp onBack={() => setActiveApp(null)} />
          ) : activeApp === 'pomodoro' ? (
            <PomodoroApp onBack={() => setActiveApp(null)} />
          ) : activeApp === 'browser' ? (
            <BrowserApp onBack={() => setActiveApp(null)} />
          ) : activeApp === 'profile' ? (
            <ProfileApp onBack={() => setActiveApp(null)} />
          ) : activeApp === 'moments' ? (
            <MomentsApp onBack={() => setActiveApp(null)} />
          ) : activeApp === 'memo' ? (
            <MemoApp onBack={() => setActiveApp(null)} />
          ) : activeApp === 'diary' ? (
            <QuestJournalApp
              onBack={() => setActiveApp(null)}
              onOpenApp={(id) => setActiveApp(id)}
            />
          ) : activeApp === 'arcade' || activeApp === 'games' ? (
            <ArcadeApp onBack={() => setActiveApp(null)} />
          ) : activeApp === 'cinema' || activeApp === 'movie' ? (
            <CinemaApp onBack={() => setActiveApp(null)} />
          ) : activeApp === 'poetry' || activeApp === 'poet' ? (
            <PoetryApp onBack={() => setActiveApp(null)} />
          ) : activeApp === 'books' || activeApp === 'bookvault' ? (
            <BookVaultApp onBack={() => setActiveApp(null)} />
          ) : activeApp === 'storyword' ? (
            <StoryWordApp onBack={() => setActiveApp(null)} />
          ) : activeApp === 'course_kanban' || activeApp === 'kanban' ? (
            <CourseKanbanApp onBack={() => setActiveApp(null)} />
          ) : activeApp === 'security' ? (
            <SecurityApp onBack={() => setActiveApp(null)} />
          ) : activeApp === 'compass' ? (
            <CompassApp onBack={() => setActiveApp(null)} />
          ) : activeApp === 'radio' ? (
            <RadioApp onBack={() => setActiveApp(null)} />
          ) : activeApp === 'mood_fortune' || activeApp === 'answers' || activeApp === 'book_of_answers' ? (
            <BookOfAnswersApp onBack={() => setActiveApp(null)} />
          ) : activeApp === 'calculator' ? (
            <CalculatorApp onBack={() => setActiveApp(null)} />
          ) : activeApp === 'pocketpad' ? (
            <PocketPadApp onBack={() => setActiveApp(null)} />
          ) : activeApp === 'gachapon' ? (
            <GachaponApp onBack={() => setActiveApp(null)} onOpenApp={(id) => setActiveApp(id)} />
          ) : activeApp === 'gamevault' ? (
            <GameVaultApp onBack={() => setActiveApp(null)} onOpenApp={(id) => setActiveApp(id)} />
          ) : activeApp === 'files' ? (
            <FilesApp onBack={() => setActiveApp(null)} onOpenApp={(id) => setActiveApp(id)} />
          ) : activeApp === 'camera' || activeApp === 'album' || activeApp === 'photo' ? (
            <PhotoAlbumApp onBack={() => setActiveApp(null)} />
          ) : activeApp === 'assistant' ? (
            <StarryAssistantApp
              onBack={() => setActiveApp(null)}
              onOpenSettings={() => setActiveApp('settings')}
            />
          ) : isCustomApp ? (
            <CustomAppRunner
              appId={activeApp!}
              onBack={() => setActiveApp(null)}
            />
          ) : (
            <PlaceholderApp appId={activeApp} onBack={() => setActiveApp(null)} />
          )}
        </div>
      )}

      {/* 每日晨间今日海报开屏展映 (每天自动唤醒一次，支持翻转看备忘打勾) */}
      <DailyPosterModal onOpenAlbum={() => setActiveApp('camera')} />
    </PhoneFrame>
  );
};
