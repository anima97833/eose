import React from 'react';
import {
  Phone,
  Sparkles,
  BookOpen,
  UserRound,
  MessageSquareText,
  Image as ImageIcon,
  Search,
  Settings,
  ShoppingBag,
  Scroll,
  Calculator,
  Clock,
  Camera,
  Radio,
  Gamepad2,
  Folder,
  Compass,
  ShieldCheck,
  FileText,
  Globe,
  Package,
  Palette,
  Hourglass,
  Clapperboard,
  BookMarked,
  GraduationCap,
  Disc,
  Gift,
  GitBranch,
  Aperture,
  Joystick,
} from 'lucide-react';
import { getCustomAppById } from '../../core/sdk/customAppRegistry';
import { listStoreCatalog } from '../../core/sdk/appStoreCatalog';

export function getAppIcon(appId: string, size = 24): React.ReactNode {
  switch (appId) {
    // 基础系统快捷应用
    case 'phone': return <Phone size={size} strokeWidth={2.2} />;
    case 'assistant': return <Sparkles size={size} strokeWidth={2.2} />;
    case 'diary': return <GitBranch size={size} strokeWidth={2.2} />;
    case 'profile': return <UserRound size={size} strokeWidth={2.2} />;
    case 'chat': return <MessageSquareText size={size} strokeWidth={2.2} />;
    case 'moments': return <ImageIcon size={size} strokeWidth={2.2} />;
    case 'checkphone': return <Search size={size} strokeWidth={2.2} />;
    case 'settings': return <Settings size={size} strokeWidth={2.2} />;

    // 应用商店与精选微应用
    case 'appstore': return <ShoppingBag size={size} strokeWidth={2.2} />;
    case 'mood_fortune': return <BookOpen size={size} strokeWidth={2.2} />;
    case 'calculator': return <Calculator size={size} strokeWidth={2.2} />;
    case 'pomodoro': return <Clock size={size} strokeWidth={2.2} />;
    case 'camera': return <Aperture size={size} strokeWidth={2.2} />;
    case 'radio': return <Radio size={size} strokeWidth={2.2} />;
    case 'arcade':
    case 'games': return <Gamepad2 size={size} strokeWidth={2.2} />;
    case 'gamevault': return <Joystick size={size} strokeWidth={2.2} />;
    case 'files': return <Folder size={size} strokeWidth={2.2} />;
    case 'compass': return <Compass size={size} strokeWidth={2.2} />;
    case 'security': return <ShieldCheck size={size} strokeWidth={2.2} />;
    case 'memo': return <FileText size={size} strokeWidth={2.2} />;
    case 'browser': return <Globe size={size} strokeWidth={2.2} />;
    case 'memories': return <Hourglass size={size} strokeWidth={2.2} />;
    case 'cinema':
    case 'movie': return <Clapperboard size={size} strokeWidth={2.2} />;
    case 'poetry':
    case 'poet': return <Scroll size={size} strokeWidth={2.2} />;
    case 'books':
    case 'bookvault': return <BookMarked size={size} strokeWidth={2.2} />;
    case 'storyword': return <BookOpen size={size} strokeWidth={2.2} />;
    case 'course_kanban':
    case 'kanban': return <GraduationCap size={size} strokeWidth={2.2} />;
    case 'pocketpad': return <Disc size={size} strokeWidth={2.2} />;
    case 'gachapon': return <Gift size={size} strokeWidth={2.2} />;

    default:
      // 自定义应用：从商店或注册表中查找定义
      const storeItem = listStoreCatalog().find((item) => item.id === appId);
      if (storeItem?.iconName) {
        if (storeItem.iconName === 'Package') return <Package size={size} strokeWidth={2.2} />;
        if (storeItem.iconName === 'FileText') return <FileText size={size} strokeWidth={2.2} />;
        if (storeItem.iconName === 'Clock') return <Clock size={size} strokeWidth={2.2} />;
        if (storeItem.iconName === 'GitBranch') return <GitBranch size={size} strokeWidth={2.2} />;
        if (storeItem.iconName === 'Aperture') return <Aperture size={size} strokeWidth={2.2} />;
        if (storeItem.iconName === 'Joystick') return <Joystick size={size} strokeWidth={2.2} />;
      }
      return <Sparkles size={size} strokeWidth={2.2} />;
  }
}

export function getAppHasBadge(appId: string): boolean {
  if (appId === 'chat') return true; // 聊天默认未读提示
  const custom = getCustomAppById(appId);
  return (custom?.badgeCount ?? 0) > 0;
}

export function getAppTitle(appId: string): string {
  switch (appId) {
    case 'phone': return '电话';
    case 'assistant': return '小助手';
    case 'diary': return '世界线';
    case 'profile': return '我的';
    case 'chat': return '微聊';
    case 'moments': return '动态';
    case 'checkphone': return '查手机';
    case 'settings': return '设置';
    case 'appstore': return '应用商店';
    case 'mood_fortune': return '答案之书';
    case 'calculator': return '计算器';
    case 'pomodoro': return '番茄钟';
    case 'camera': return '刻时';
    case 'radio': return '电台';
    case 'arcade':
    case 'games': return '电玩';
    case 'files': return '文件';
    case 'compass': return '指南针';
    case 'security': return '隐私与安全';
    case 'memo': return '便签';
    case 'browser': return '网络探索';
    case 'memories': return '过往';
    case 'cinema':
    case 'movie': return '放映室';
    case 'poetry':
    case 'poet': return '诗阁';
    case 'books':
    case 'bookvault': return '书藏';
    case 'storyword': return '间词';
    case 'pocketpad': return 'Pocket Pad';
    case 'gachapon': return '扭蛋';
    case 'gamevault': return '游戏仓';
    default: {
      const storeItem = listStoreCatalog().find((item) => item.id === appId);
      if (storeItem) return storeItem.name;
      const custom = getCustomAppById(appId);
      if (custom) return custom.name;
      return appId;
    }
  }
}

