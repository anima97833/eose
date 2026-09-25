import React from 'react';
import { useViewport } from '../../hooks/useViewport';
import { StatusBar } from './StatusBar';
import { HomeBar } from './HomeBar';
import { DynamicIslandBanner } from './DynamicIslandBanner';

interface PhoneFrameProps {
  children: React.ReactNode;
  isOnDesktop?: boolean;
  onOpenApp?: (appId: string) => void;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ 
  children, 
  isOnDesktop = true,
  onOpenApp = () => {},
}) => {
  const { isMobileScreen } = useViewport();

  // 1. 移动端真机（包含夸克/QQ/Via/Chrome等移动浏览器）：全屏沉浸贴合真实设备
  if (isMobileScreen) {
    return (
      <main
        style={{
          width: '100vw',
          height: 'var(--app-height)',
          backgroundColor: 'var(--nm-bg)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <DynamicIslandBanner isOnDesktop={isOnDesktop} onOpenApp={onOpenApp} />
        <StatusBar isMobileScreen={true} />
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {children}
        </div>
        <HomeBar />
      </main>
    );
  }

  // 2. 电脑/平板大屏端：展示精巧居中的轻拟物实体手机模型
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        padding: '20px',
      }}
    >
      {/* 手机实体外壳 */}
      <div
        style={{
          position: 'relative',
          width: '390px',
          height: 'min(844px, calc(100vh - 40px))',
          backgroundColor: 'var(--nm-bg)',
          borderRadius: '52px',
          boxShadow:
            '20px 20px 50px rgba(160, 175, 195, 0.6), -20px -20px 50px rgba(255, 255, 255, 0.95), inset 2px 2px 4px rgba(255, 255, 255, 0.8), inset -2px -2px 4px rgba(160, 175, 195, 0.4)',
          border: '10px solid #E3E8F0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* 左侧音量按键仿真 */}
        <div
          style={{
            position: 'absolute',
            left: '-14px',
            top: '120px',
            width: '4px',
            height: '42px',
            backgroundColor: '#D1D9E6',
            borderRadius: '2px 0 0 2px',
            boxShadow: '-2px 0 4px rgba(0,0,0,0.1)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '-14px',
            top: '175px',
            width: '4px',
            height: '42px',
            backgroundColor: '#D1D9E6',
            borderRadius: '2px 0 0 2px',
            boxShadow: '-2px 0 4px rgba(0,0,0,0.1)',
          }}
        />

        {/* 右侧电源按键仿真 */}
        <div
          style={{
            position: 'absolute',
            right: '-14px',
            top: '140px',
            width: '4px',
            height: '60px',
            backgroundColor: '#D1D9E6',
            borderRadius: '0 2px 2px 0',
            boxShadow: '2px 0 4px rgba(0,0,0,0.1)',
          }}
        />

        {/* 顶部听筒/灵动岛微孔动态横幅 */}
        <DynamicIslandBanner isOnDesktop={isOnDesktop} onOpenApp={onOpenApp} />

        {/* 屏幕内容区 */}
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <StatusBar isMobileScreen={false} />
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {children}
          </div>
          <HomeBar />
        </div>
      </div>
    </div>
  );
};
