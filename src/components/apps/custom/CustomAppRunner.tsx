import React, { useEffect, useRef, useState, useMemo } from 'react';
import { ArrowLeft, RotateCw } from 'lucide-react';
import { getCustomAppById, updateCustomAppBadge } from '../../../core/sdk/customAppRegistry';
import { AiPhoneBridge } from '../../../core/sdk/AiPhoneBridge';
import { AIPHONE_CLIENT_SDK_SCRIPT } from '../../../core/sdk/sdkScript';

interface CustomAppRunnerProps {
  appId: string;
  onBack: () => void;
  onBadgeChange?: (appId: string, count: number) => void;
}

export const CustomAppRunner: React.FC<CustomAppRunnerProps> = ({
  appId,
  onBack,
  onBadgeChange,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const bridgeRef = useRef<AiPhoneBridge | null>(null);

  const appMeta = useMemo(() => {
    return getCustomAppById(appId);
  }, [appId]);

  // 显示系统级轻拟物 Toast
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // 挂载 Host 侧 AiPhoneBridge 消息桥
  useEffect(() => {
    const bridge = new AiPhoneBridge({
      appId,
      manifest: appMeta?.manifest,
      onClose: onBack,
      onToast: showToast,
      onBadgeChange: (id, count) => {
        updateCustomAppBadge(id, count);
        onBadgeChange?.(id, count);
      },
    });

    bridgeRef.current = bridge;

    return () => {
      bridge.destroy();
    };
  }, [appId, appMeta, onBack, onBadgeChange]);

  // 生成内嵌 AiPhone SDK 的沙盒 HTML Blob URL
  const blobUrl = useMemo(() => {
    if (!appMeta?.htmlContent) return '';

    let html = appMeta.htmlContent;
    const injection = `<script>\n${AIPHONE_CLIENT_SDK_SCRIPT}\n</script>`;

    if (html.includes('<head>')) {
      html = html.replace('<head>', `<head>\n${injection}`);
    } else {
      html = injection + html;
    }

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    return URL.createObjectURL(blob);
  }, [appMeta, reloadKey]);

  // 释放 Blob 内存
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

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
      }}
    >
      {/* 顶部轻拟物控制栏 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          borderBottom: '1px solid rgba(166, 180, 200, 0.25)',
          backgroundColor: 'var(--nm-bg)',
          zIndex: 10,
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
            {appMeta?.name || '自定义应用'}
          </h2>
          <span style={{ fontSize: '10px', color: 'var(--nm-text-sub)', fontWeight: 600 }}>
            沙盒安全运行 v{appMeta?.version || '1.0'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setReloadKey((prev) => prev + 1)}
          className="nm-rebound-btn nm-btn-circle"
          style={{ width: '36px', height: '36px' }}
          title="重新加载"
        >
          <RotateCw size={16} strokeWidth={2.3} />
        </button>
      </div>

      {/* 沙盒执行 iframe */}
      <div style={{ flex: 1, width: '100%', position: 'relative', overflow: 'hidden' }}>
        {blobUrl ? (
          <iframe
            ref={iframeRef}
            src={blobUrl}
            title={appMeta?.name || 'custom-app'}
            sandbox="allow-scripts allow-forms allow-modals allow-same-origin"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block',
              backgroundColor: 'var(--nm-bg)',
            }}
          />
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'var(--nm-text-sub)',
              fontSize: '13px',
            }}
          >
            应用加载异常或未找到应用源码
          </div>
        )}
      </div>

      {/* 轻拟物浮动 Toast 弹窗通知 */}
      {toastMessage && (
        <div
          style={{
            position: 'absolute',
            top: '56px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(51, 66, 87, 0.92)',
            color: '#FFFFFF',
            padding: '8px 18px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 700,
            boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25)',
            zIndex: 100,
            animation: 'toastIn 0.25s ease-out',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {toastMessage}
        </div>
      )}

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translate(-50%, -10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
};
