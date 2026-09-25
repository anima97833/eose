import React, { useState } from 'react';
import { X, Sparkles, Check, Globe, RefreshCw } from 'lucide-react';
import { NM } from '../bookNeumorphism';
import { getCustomBookApiEndpoint, setCustomBookApiEndpoint } from '../../../../core/books/bookApi';

interface BookApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavedToast: (msg: string) => void;
}

export const BookApiSettingsModal: React.FC<BookApiSettingsModalProps> = ({
  isOpen,
  onClose,
  onSavedToast,
}) => {
  const [endpoint, setEndpoint] = useState<string>(() => getCustomBookApiEndpoint());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    setCustomBookApiEndpoint(endpoint);
    onSavedToast(endpoint.trim() ? '已保存专属接口' : '已重置为公共接口');
    onClose();
  };

  const handleTest = async () => {
    const clean = endpoint.trim();
    if (!clean) {
      setTestResult({ success: false, msg: '请先填入您的 Cloudflare Worker 网址' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const sep = clean.includes('?') ? '&' : '?';
      // 测试《活着》ISBN
      const testUrl = `${clean.replace(/\/+$/, '')}${sep}isbn=9787506365437`;
      const res = await fetch(testUrl, { signal: AbortSignal.timeout(6000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const book = json.data || json;
      if (book && (book.title || book.name)) {
        setTestResult({
          success: true,
          msg: `连通成功！识别到书籍：《${book.title || book.name}》· ${book.author || '余华'}`,
        });
      } else {
        setTestResult({
          success: false,
          msg: '接口返回格式异常，未包含有效的 title/name 字段',
        });
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        msg: `测试失败: ${e.message || '网络连接超时'}，请检查网址或跨域设置`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleClear = () => {
    setEndpoint('');
    setTestResult(null);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(233, 238, 245, 0.45)',
        backdropFilter: 'blur(8px)',
        zIndex: 1500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          backgroundColor: NM.cardBg,
          borderRadius: 24,
          padding: '22px 20px',
          boxShadow: NM.convex,
          border: NM.borderLight,
          boxSizing: 'border-box',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: NM.primary,
              }}
            >
              <Globe size={18} />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: NM.textMain }}>
                中文图书 API 配置
              </div>
              <div style={{ fontSize: '0.72rem', color: NM.textMuted }}>
                免云服务器 · 专属 Cloudflare Worker
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'rgba(0,0,0,0.04)',
              color: NM.textMuted,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* 说明介绍 */}
        <div
          style={{
            backgroundColor: NM.bgInset,
            borderRadius: 14,
            padding: '10px 12px',
            fontSize: '0.75rem',
            lineHeight: 1.55,
            color: NM.textSub,
            marginBottom: 14,
            boxShadow: NM.insetSm,
          }}
        >
          <div style={{ fontWeight: 700, color: NM.primary, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Sparkles size={12} /> 无需自建后端或买云服务器
          </div>
          粘贴您在 Cloudflare 免费部署的 Worker 网址，即可实现全网中文正版图书（书名、作者、出版社、高清封面）一扫即出。
        </div>

        {/* 输入框 */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: NM.textSub, marginBottom: 6 }}>
            Worker 接口网址 (URL)
          </div>
          <input
            type="text"
            placeholder="例如: https://my-book-api.workers.dev"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: NM.bgInset,
              boxShadow: NM.insetSm,
              border: '1px solid rgba(255,255,255,0.7)',
              borderRadius: 12,
              padding: '10px 12px',
              fontSize: '0.82rem',
              color: NM.textMain,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* 测试反馈结果 */}
        {testResult && (
          <div
            style={{
              padding: '8px 10px',
              borderRadius: 10,
              fontSize: '0.74rem',
              marginBottom: 12,
              backgroundColor: testResult.success ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              color: testResult.success ? '#059669' : '#DC2626',
              fontWeight: 600,
              lineHeight: 1.45,
            }}
          >
            {testResult.msg}
          </div>
        )}

        {/* 底部按钮栏 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 16 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              onClick={handleTest}
              disabled={testing}
              style={{
                padding: '7px 12px',
                borderRadius: 12,
                border: NM.borderLight,
                backgroundColor: NM.cardBg,
                color: NM.textMain,
                fontSize: '0.78rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                cursor: testing ? 'not-allowed' : 'pointer',
                boxShadow: NM.convexSm,
              }}
            >
              <RefreshCw size={12} className={testing ? 'animate-spin' : ''} />
              {testing ? '测试中...' : '测试连接'}
            </button>

            {endpoint && (
              <button
                type="button"
                onClick={handleClear}
                style={{
                  padding: '7px 10px',
                  borderRadius: 12,
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: NM.textMuted,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                }}
              >
                重置
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: '7px 18px',
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: '#FFFFFF',
              fontSize: '0.82rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(217, 119, 6, 0.35)',
            }}
          >
            <Check size={14} /> 保存配置
          </button>
        </div>
      </div>
    </div>
  );
};
