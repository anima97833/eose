import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ShoppingBag,
  Download,
  Trash2,
  PlusCircle,
  Play,
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
  Sparkles,
  Package,
  Phone,
  MessageSquareText,
  BookOpen,
  UserRound,
  Image as ImageIcon,
  Search,
  Settings,
  Hourglass,
  Disc,
} from 'lucide-react';
import {
  listStoreCatalog,
  installAppToDesktop,
  uninstallAppFromDesktop,
  createAndInstallCustomApp,
  AppStoreItem,
} from '../../../core/sdk/appStoreCatalog';

interface AppStoreAppProps {
  onBack: () => void;
  onOpenApp?: (appId: string) => void;
}

// 图标映射器
export function renderStoreIcon(iconName: string, size = 22) {
  switch (iconName) {
    case 'ShoppingBag': return <ShoppingBag size={size} strokeWidth={2.2} />;
    case 'Scroll': return <Scroll size={size} strokeWidth={2.2} />;
    case 'Calculator': return <Calculator size={size} strokeWidth={2.2} />;
    case 'Clock': return <Clock size={size} strokeWidth={2.2} />;
    case 'Camera': return <Camera size={size} strokeWidth={2.2} />;
    case 'Radio': return <Radio size={size} strokeWidth={2.2} />;
    case 'Gamepad2': return <Gamepad2 size={size} strokeWidth={2.2} />;
    case 'Folder': return <Folder size={size} strokeWidth={2.2} />;
    case 'Compass': return <Compass size={size} strokeWidth={2.2} />;
    case 'ShieldCheck': return <ShieldCheck size={size} strokeWidth={2.2} />;
    case 'FileText': return <FileText size={size} strokeWidth={2.2} />;
    case 'Globe': return <Globe size={size} strokeWidth={2.2} />;
    case 'Package': return <Package size={size} strokeWidth={2.2} />;
    case 'Phone': return <Phone size={size} strokeWidth={2.2} />;
    case 'MessageSquareText': return <MessageSquareText size={size} strokeWidth={2.2} />;
    case 'Sparkles': return <Sparkles size={size} strokeWidth={2.2} />;
    case 'BookOpen': return <BookOpen size={size} strokeWidth={2.2} />;
    case 'UserRound': return <UserRound size={size} strokeWidth={2.2} />;
    case 'Image': return <ImageIcon size={size} strokeWidth={2.2} />;
    case 'Search': return <Search size={size} strokeWidth={2.2} />;
    case 'Settings': return <Settings size={size} strokeWidth={2.2} />;
    case 'Hourglass': return <Hourglass size={size} strokeWidth={2.2} />;
    case 'Disc': return <Disc size={size} strokeWidth={2.2} />;
    default: return <Sparkles size={size} strokeWidth={2.2} />;
  }
}

const TEMPLATE_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { background: #E9EEF5; color: #334257; font-family: sans-serif; padding: 20px; text-align: center; }
    button { background: #5096C6; color: #fff; border: none; padding: 10px 20px; border-radius: 14px; font-weight: bold; cursor: pointer; }
  </style>
</head>
<body>
  <h2>✨ 我的自制微应用</h2>
  <p style="font-size: 13px; color: #7D8CA3; margin: 12px 0;">这是一个运行在小手机独立沙盒里的新应用！</p>
  <button onclick="window.AiPhone?.ui?.toast('恭喜！新应用运行成功！')">测试 SDK Toast</button>
  <br><br>
  <button style="background:#fff; color:#5096C6; box-shadow: 2px 2px 6px rgba(0,0,0,0.1);" onclick="window.AiPhone?.app?.close()">返回桌面</button>
</body>
</html>`;

export const AppStoreApp: React.FC<AppStoreAppProps> = ({ onBack, onOpenApp }) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'installed' | 'create'>('catalog');
  const [catalog, setCatalog] = useState<AppStoreItem[]>([]);
  const [toastText, setToastText] = useState<string | null>(null);

  // 新建应用表单状态
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newIcon, setNewIcon] = useState('Sparkles');
  const [newHtml, setNewHtml] = useState(TEMPLATE_HTML);

  const refreshCatalog = () => {
    setCatalog(listStoreCatalog());
  };

  useEffect(() => {
    refreshCatalog();
  }, []);

  const showToast = (msg: string) => {
    setToastText(msg);
    setTimeout(() => setToastText(null), 2500);
  };

  const handleInstall = (appId: string) => {
    installAppToDesktop(appId);
    refreshCatalog();
    showToast('已安装到小手机桌面！');
  };

  const handleUninstall = (appId: string) => {
    uninstallAppFromDesktop(appId);
    refreshCatalog();
    showToast('已从桌面移除并回收到应用商店！');
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      showToast('请输入应用名称');
      return;
    }
    const created = createAndInstallCustomApp({
      name: newName.trim(),
      iconName: newIcon,
      description: newDesc.trim() || '用户自定义微应用',
      htmlContent: newHtml,
    });
    refreshCatalog();
    setNewName('');
    setNewDesc('');
    showToast(`🎉 应用【${created.name}】已成功安装到桌面！`);
    setActiveTab('installed');
  };

  const installedApps = catalog.filter((item) => item.isInstalled);

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--nm-bg)',
        overflow: 'hidden',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      {/* 顶部轻拟物控制栏 */}
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
          style={{ width: '36px', height: '36px' }}
          title="返回桌面"
        >
          <ArrowLeft size={18} strokeWidth={2.3} />
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--nm-text-main)', margin: 0 }}>
            应用商店
          </h2>
          <span style={{ fontSize: '10px', color: 'var(--nm-text-sub)', fontWeight: 600 }}>
            已安装 {installedApps.length} 款应用
          </span>
        </div>

        <div style={{ width: '36px' }} />
      </div>

      {/* Tab 导航切换 */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          padding: '10px 16px',
        }}
      >
        {[
          { key: 'catalog', label: '🏪 精选货架' },
          { key: 'installed', label: `📱 桌面管理 (${installedApps.length})` },
          { key: 'create', label: '➕ 导入/新建' },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: '16px',
                border: 'none',
                backgroundColor: 'var(--nm-bg)',
                color: isActive ? 'var(--nm-primary)' : 'var(--nm-text-sub)',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: isActive
                  ? 'inset 3px 3px 6px rgba(150, 168, 190, 0.7), inset -3px -3px 6px rgba(255, 255, 255, 0.95)'
                  : '4px 4px 8px rgba(160, 175, 195, 0.45), -4px -4px 8px rgba(255, 255, 255, 0.95)',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 滚动内容区 */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '4px 16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {/* Tab 1: 精选货架 */}
        {activeTab === 'catalog' && (
          <>
            {catalog.map((app) => (
              <div
                key={app.id}
                className="nm-card-sm"
                style={{
                  padding: '12px 14px',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                {/* 图标 */}
                <div
                  className="nm-inset-sm"
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--nm-primary)',
                    flexShrink: 0,
                  }}
                >
                  {renderStoreIcon(app.iconName, 22)}
                </div>

                {/* 介绍 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--nm-text-main)' }}>
                      {app.name}
                    </span>
                    <span
                      style={{
                        fontSize: '9px',
                        color: 'var(--nm-text-sub)',
                        backgroundColor: 'rgba(166, 180, 200, 0.2)',
                        padding: '1px 5px',
                        borderRadius: '6px',
                      }}
                    >
                      {app.categoryLabel}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: '11px',
                      color: 'var(--nm-text-sub)',
                      margin: '2px 0 0',
                      lineHeight: 1.3,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {app.description}
                  </p>
                </div>

                {/* 操作按键 */}
                <div>
                  {app.isInstalled ? (
                    <button
                      type="button"
                      onClick={() => onOpenApp?.(app.id)}
                      className="nm-rebound-btn"
                      style={{
                        padding: '6px 12px',
                        borderRadius: '14px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#475971',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: 'var(--nm-bg)',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <Play size={12} fill="#475971" />
                      打开
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleInstall(app.id)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '14px',
                        fontSize: '11px',
                        fontWeight: 800,
                        color: '#FFFFFF',
                        background: 'linear-gradient(135deg, #5CA4D5 0%, #468EC0 100%)',
                        boxShadow: '0 3px 8px rgba(70, 142, 192, 0.4)',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Download size={12} />
                      安装
                    </button>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {/* Tab 2: 桌面已安装应用管理 */}
        {activeTab === 'installed' && (
          <>
            <div style={{ fontSize: '11px', color: 'var(--nm-text-sub)', padding: '2px 4px' }}>
              桌面已安装应用列表。不需要的应用可随时回收到商店，桌面将自动紧凑排布：
            </div>
            {installedApps.map((app) => (
              <div
                key={app.id}
                className="nm-card-sm"
                style={{
                  padding: '10px 14px',
                  borderRadius: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    className="nm-inset-sm"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--nm-primary)',
                    }}
                  >
                    {renderStoreIcon(app.iconName, 20)}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--nm-text-main)' }}>
                      {app.name}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--nm-text-sub)' }}>
                      {app.isSystem ? '🔒 核心系统应用（不可卸载）' : '可卸载回收至商店'}
                    </div>
                  </div>
                </div>

                {!app.isSystem && (
                  <button
                    type="button"
                    onClick={() => handleUninstall(app.id)}
                    className="nm-rebound-btn"
                    style={{
                      padding: '6px 12px',
                      borderRadius: '14px',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#E85A71',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    title="回收到商店"
                  >
                    <Trash2 size={12} />
                    回收卸载
                  </button>
                )}
              </div>
            ))}
          </>
        )}

        {/* Tab 3: 新建 / 导入应用 */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="nm-card-sm" style={{ padding: '14px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--nm-text-main)' }}>应用基本信息</label>
              
              <input
                type="text"
                placeholder="应用名称（如：每日心事盲盒）"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: 'var(--nm-bg)',
                  boxShadow: 'var(--nm-inset-sm)',
                  fontSize: '12px',
                  color: 'var(--nm-text-main)',
                  outline: 'none',
                }}
              />

              <input
                type="text"
                placeholder="应用一句话简介"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: 'var(--nm-bg)',
                  boxShadow: 'var(--nm-inset-sm)',
                  fontSize: '12px',
                  color: 'var(--nm-text-main)',
                  outline: 'none',
                }}
              />

              <div style={{ marginTop: '4px' }}>
                <span style={{ fontSize: '11px', color: 'var(--nm-text-sub)', fontWeight: 600 }}>选择图标：</span>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  {['Sparkles', 'Package', 'FileText', 'Gamepad2', 'Clock', 'Radio'].map((iconKey) => (
                    <button
                      key={iconKey}
                      type="button"
                      onClick={() => setNewIcon(iconKey)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'var(--nm-bg)',
                        color: newIcon === iconKey ? 'var(--nm-primary)' : 'var(--nm-text-sub)',
                        boxShadow: newIcon === iconKey ? 'var(--nm-inset-sm)' : 'var(--nm-convex-xs)',
                      }}
                    >
                      {renderStoreIcon(iconKey, 18)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* HTML 代码编辑框 */}
            <div className="nm-card-sm" style={{ padding: '14px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--nm-text-main)' }}>
                  HTML 沙盒源码
                </label>
                <span style={{ fontSize: '10px', color: 'var(--nm-primary)', fontWeight: 600 }}>
                  自动集成 window.AiPhone
                </span>
              </div>
              <textarea
                rows={7}
                value={newHtml}
                onChange={(e) => setNewHtml(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: 'var(--nm-bg)',
                  boxShadow: 'var(--nm-inset-sm)',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  color: 'var(--nm-text-main)',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                height: '46px',
                borderRadius: '23px',
                background: 'linear-gradient(135deg, #5CA4D5 0%, #468EC0 100%)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 800,
                border: 'none',
                boxShadow: '0 4px 12px rgba(70, 142, 192, 0.45)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginTop: '4px',
              }}
            >
              <PlusCircle size={16} />
              一键打包并安装到小手机桌面
            </button>
          </form>
        )}
      </div>

      {/* 浮动 Toast 提示 */}
      {toastText && (
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(51, 66, 87, 0.94)',
            color: '#FFFFFF',
            padding: '8px 18px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 700,
            boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25)',
            zIndex: 100,
            whiteSpace: 'nowrap',
          }}
        >
          {toastText}
        </div>
      )}
    </div>
  );
};
