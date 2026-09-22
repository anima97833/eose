import { useEffect, useState } from 'react';

/**
 * 针对移动端主流浏览器（夸克、QQ浏览器、Via、Chrome、Safari等）的动态视口挂钩
 * 解决 100vh 在工具栏伸缩时被遮挡或裁切的问题
 */
export function useViewport() {
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 640;
  });

  useEffect(() => {
    const updateViewportHeight = () => {
      // 优先取 visualViewport，更精确地反映键盘和浏览器工具栏呼出后的实际可见高度
      const vh = window.visualViewport 
        ? window.visualViewport.height 
        : window.innerHeight;
      
      document.documentElement.style.setProperty('--real-vh', `${vh}px`);
      document.documentElement.style.setProperty('--app-height', `${vh}px`);
      
      setIsMobileScreen(window.innerWidth <= 640);
    };

    updateViewportHeight();

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewportHeight);
      window.visualViewport.addEventListener('scroll', updateViewportHeight);
    }
    window.addEventListener('resize', updateViewportHeight);
    window.addEventListener('orientationchange', updateViewportHeight);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateViewportHeight);
        window.visualViewport.removeEventListener('scroll', updateViewportHeight);
      }
      window.removeEventListener('resize', updateViewportHeight);
      window.removeEventListener('orientationchange', updateViewportHeight);
    };
  }, []);

  return { isMobileScreen };
}
