import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/index.css';
import './styles/neumorphism.css';
import { initThemeEngine } from './core/theme/themeEngine';
import { runLocalStorageMigration } from './core/storage/localStorageMigrator';
import { initStoragePersistence } from './core/storage/storagePersistence';

// 初始化轻拟物主题系统
initThemeEngine();

// 执行 LocalStorage 至 IndexedDB 平滑无感迁移
runLocalStorageMigration().catch(console.warn);

// 申请浏览器持久化存储保护（避免系统磁盘不足时静默清理 IndexedDB）
initStoragePersistence().catch(console.warn);

// 注册「雀」PWA 渐进式应用 Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('[PWA] Service Worker registration failed:', err);
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
