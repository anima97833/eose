import React from 'react';
import { ArrowLeft, Clock } from 'lucide-react';

interface PlaceholderAppProps {
  appId: string;
  onBack: () => void;
}

const APP_TITLES: Record<string, { title: string; step: string; desc: string }> = {
  chat: {
    title: '微信通讯',
    step: '步骤 4',
    desc: '仿微信拟真即时通讯、打字机感知、波形语音条与动作协议即将于步骤 4 全面接入。',
  },
  moments: {
    title: '朋友圈动态',
    step: '步骤 4',
    desc: '角色图文动态、AI自主发圈与点赞评论互动即将载入。',
  },
  checkphone: {
    title: '查手机秘密',
    step: '待建设',
    desc: '偷看角色备忘录、私密相册与心情足迹正在规划研发中。',
  },
  profile: {
    title: '个人中心 / 我的',
    step: '待建设',
    desc: '个人账户设置、个性装扮、隐私设置与关于本机正在建设中，敬请期待。',
  },
  phone: {
    title: '拟真通话',
    step: '待建设',
    desc: '实时双向语音通话与即时连麦即将接入。',
  },
  assistant: {
    title: 'AI 灵感助手',
    step: '待建设',
    desc: '桌面智能体快速问答与灵感卡片正在规划中。',
  },
  diary: {
    title: '心事日记本',
    step: '待建设',
    desc: '记录专属心情日志与角色的日常心事絮语。',
  },
  camera: {
    title: '相册胶卷',
    step: '待建设',
    desc: '时光拍立得相册、AI 角色合影与生活写真馆正在建设中。',
  },
  clock: {
    title: '时钟闹铃',
    step: '待建设',
    desc: '专属伴侣叫醒闹钟、世界时钟与专注番茄钟即将上线。',
  },
  theme: {
    title: '拟物主题馆',
    step: '待建设',
    desc: '丰富光影质感主题、深色微拟物与定制外壳装扮即将到来。',
  },
  calculator: {
    title: '拟物计算器',
    step: '待建设',
    desc: '按键物理深凹陷回弹声效的复古经典计算器正在制作中。',
  },
  games: {
    title: '伴侣互动台',
    step: '待建设',
    desc: '双人桌面轻量互动、性格默契测试与摸鱼小游戏即将上线。',
  },
  files: {
    title: '文件管理',
    step: '待建设',
    desc: '虚拟小手机本地 IndexedDB 离线数据包与导出工具正在筹备中。',
  },
  radio: {
    title: '声音电台',
    step: '待建设',
    desc: '调频白噪音、环境声场与伴侣深夜广播正在制作中。',
  },
  compass: {
    title: '时空指南',
    step: '待建设',
    desc: '拟真机械指针指南针与地理方位感知即将开启。',
  },
  security: {
    title: '隐私安全',
    step: '待建设',
    desc: '本地沙盒加密、应用锁与私密空间即将上线。',
  },
  memo: {
    title: '备忘便签',
    step: '待建设',
    desc: '随手灵感速记与彩色微拟物便签纸功能正在规划中。',
  },
  tags: {
    title: '分类标签',
    step: '待建设',
    desc: '多维度人设关系标签与记忆碎片分类管理器。',
  },
  browser: {
    title: '网络探索',
    step: '待建设',
    desc: '虚拟小手机内置纯净浏览器与灵感冲浪窗口。',
  },
};

export const PlaceholderApp: React.FC<PlaceholderAppProps> = ({ appId, onBack }) => {
  const meta = APP_TITLES[appId] || {
    title: '虚拟应用',
    step: '规划中',
    desc: '该应用正在依照分步研发路线图制作中。',
  };

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--nm-bg)',
        overflow: 'hidden',
      }}
    >
      {/* 顶部导航栏 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px 8px',
          borderBottom: '1px solid rgba(166, 180, 200, 0.25)',
        }}
      >
        <button
          type="button"
          onClick={onBack}
          className="nm-rebound-btn nm-btn-circle"
          style={{ width: '38px', height: '38px' }}
          title="返回桌面"
        >
          <ArrowLeft size={18} strokeWidth={2.3} />
        </button>

        <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--nm-text-main)', margin: 0 }}>
          {meta.title}
        </h2>

        <div style={{ width: '38px' }} />
      </div>

      {/* 内容占位卡 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <div
          className="nm-inset"
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--nm-primary)',
            marginBottom: '16px',
          }}
        >
          <Clock size={28} />
        </div>

        <div
          style={{
            fontSize: '12px',
            fontWeight: 800,
            color: 'var(--nm-primary)',
            backgroundColor: 'rgba(80, 150, 198, 0.1)',
            padding: '3px 10px',
            borderRadius: '12px',
            marginBottom: '8px',
          }}
        >
          {meta.step} 计划交付
        </div>

        <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--nm-text-main)', marginBottom: '8px' }}>
          {meta.title} 视窗框架已联通
        </h3>

        <p style={{ fontSize: '12px', color: 'var(--nm-text-sub)', lineHeight: 1.6, maxWidth: '280px' }}>
          {meta.desc}
        </p>

        <button
          type="button"
          onClick={onBack}
          className="nm-rebound-btn nm-card-sm"
          style={{
            marginTop: '24px',
            padding: '10px 24px',
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--nm-primary)',
            borderRadius: '18px',
          }}
        >
          返回桌面主屏幕
        </button>
      </div>
    </div>
  );
};
