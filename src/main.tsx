import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/index.css';
import './styles/neumorphism.css';
import { initThemeEngine } from './core/theme/themeEngine';

// 初始化轻拟物主题系统
initThemeEngine();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
