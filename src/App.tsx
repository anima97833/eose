import React, { useState } from 'react';
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
import { CharacterStudioApp } from './components/apps/studio/CharacterStudioApp';
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
import { getCustomAppById } from './core/sdk/customAppRegistry';

export const App: React.FC = () => {
  const [activeApp, setActiveApp] = useState<string | null>(null);
  const [isOpeningApp, setIsOpeningApp] = useState<boolean>(false);

  const handleOpenApp = (appId: string) => {
    setIsOpeningApp(true);
    setActiveApp(appId);
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
    <PhoneFrame onHomeClick={handleHomeClick}>
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
          ) : activeApp === 'character_studio' ? (
            <CharacterStudioApp onBack={() => setActiveApp(null)} />
          ) : activeApp === 'profile' ? (
            <ProfileApp onBack={() => setActiveApp(null)} />
          ) : activeApp === 'moments' ? (
            <MomentsApp onBack={() => setActiveApp(null)} />
          ) : activeApp === 'memo' || activeApp === 'diary' ? (
            <MemoApp onBack={() => setActiveApp(null)} />
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
    </PhoneFrame>
  );
};
