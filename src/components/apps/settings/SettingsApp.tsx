import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Check,
  ShieldAlert,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Trash2,
  Bookmark,
  Layers,
  Network,
  RefreshCw,
  ChevronDown,
  Database,
  Download,
  Upload,
  Palette,
  Sparkles,
} from 'lucide-react';
import { ThemeStudioModal } from './components/ThemeStudioModal';
import { LLMTestResult } from '../../../core/llm/types';
import { createLLMAdapter, fetchEndpointModels } from '../../../core/llm';
import { getStorage } from '../../../core/storage';
import {
  exportFullDatabase,
  downloadBackupBlob,
  parseAndValidateBackup,
  importFullDatabase,
} from '../../../core/storage/databaseBackupService';
import {
  DualRouteSettings,
  RouteConfig,
  UserPreset,
  AVAILABLE_APPS_OPTIONS,
  loadStoredSettings,
  saveStoredSettings,
} from '../../../types/settings';

interface SettingsAppProps {
  onBack: () => void;
}

export const SettingsApp: React.FC<SettingsAppProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<DualRouteSettings>(loadStoredSettings);
  const [activeTab, setActiveTab] = useState<'primary' | 'branch'>(settings.activeTab || 'primary');
  const [showKey, setShowKey] = useState<boolean>(false);

  // 连通性测试状态
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<LLMTestResult | null>(null);

  // 端点模型拉取状态与缓存列表
  const [isFetchingModels, setIsFetchingModels] = useState<boolean>(false);
  const [fetchedModels, setFetchedModels] = useState<string[]>([]);
  const [modelFetchMsg, setModelFetchMsg] = useState<string | null>(null);

  // 新增自定义预设状态
  const [isAddingPreset, setIsAddingPreset] = useState<boolean>(false);
  const [newPresetName, setNewPresetName] = useState<string>('');

  const [showThemeStudio, setShowThemeStudio] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const storage = getStorage();

  useEffect(() => {
    storage.getSettings().then((stored) => {
      if (stored) {
        setSettings(stored);
      }
    });
  }, []);

  const currentRoute: RouteConfig = activeTab === 'primary' ? settings.primary : settings.branch;

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2200);
  };

  const updateCurrentRoute = (updates: Partial<RouteConfig>) => {
    const updatedRoute = { ...currentRoute, ...updates };
    const updatedSettings: DualRouteSettings = {
      ...settings,
      [activeTab]: updatedRoute,
    };
    setSettings(updatedSettings);
    saveStoredSettings(updatedSettings);
    storage.saveSettings(updatedSettings);
  };

  // 直接从端点拉取模型列表 (GET /models)
  const handleFetchModels = async () => {
    if (!currentRoute.baseUrl.trim()) {
      showNotification('请先填写 Base URL 接口地址');
      return;
    }
    setIsFetchingModels(true);
    setModelFetchMsg(null);
    try {
      const models = await fetchEndpointModels(currentRoute.baseUrl, currentRoute.apiKey);
      setFetchedModels(models);
      if (models.length > 0) {
        // 如果当前未选模型，自动选中第一个
        if (!currentRoute.model || !models.includes(currentRoute.model)) {
          updateCurrentRoute({ model: models[0] });
        }
        setModelFetchMsg(`已成功获取 ${models.length} 个可用模型`);
      } else {
        setModelFetchMsg('端点返回模型列表为空');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setModelFetchMsg(`拉取失败: ${msg}`);
    } finally {
      setIsFetchingModels(false);
    }
  };

  // 调入用户保存的本地预设
  const handleApplyPreset = (preset: UserPreset) => {
    updateCurrentRoute({
      baseUrl: preset.baseUrl,
      apiKey: preset.apiKey,
      model: preset.model,
    });
    setFetchedModels([]);
    setModelFetchMsg(null);
    showNotification(`已应用预设【${preset.name}】`);
  };

  // 保存当前配置为新预设（存至 LocalStorage）
  const handleSaveCurrentAsPreset = () => {
    if (!newPresetName.trim()) {
      showNotification('请输入预设名称');
      return;
    }
    const newPreset: UserPreset = {
      id: `preset_${Date.now()}`,
      name: newPresetName.trim(),
      baseUrl: currentRoute.baseUrl,
      apiKey: currentRoute.apiKey,
      model: currentRoute.model,
    };
    const updatedPresets = [...settings.presets, newPreset];
    const updatedSettings: DualRouteSettings = {
      ...settings,
      presets: updatedPresets,
    };
    setSettings(updatedSettings);
    saveStoredSettings(updatedSettings);
    storage.saveSettings(updatedSettings);
    setNewPresetName('');
    setIsAddingPreset(false);
    showNotification(`预设【${newPreset.name}】已保存`);
  };

  // 删除用户预设
  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedPresets = settings.presets.filter((p) => p.id !== id);
    const updatedSettings = { ...settings, presets: updatedPresets };
    setSettings(updatedSettings);
    saveStoredSettings(updatedSettings);
    storage.saveSettings(updatedSettings);
    showNotification('预设已删除');
  };

  // 导出 IndexedDB 完整全量备份 (JSON)
  const handleExportBackup = async () => {
    try {
      const res = await exportFullDatabase();
      downloadBackupBlob(res.blob, res.filename);
      showNotification(`全量备份导出成功，共 ${res.totalRecords} 条记录`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showNotification(`导出失败: ${msg}`);
    }
  };

  // 导入全量备份文件 (JSON)
  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const validation = parseAndValidateBackup(content);
        if (!validation.valid || !validation.payload) {
          showNotification(`备份文件校验失败: ${validation.error || '格式不符'}`);
          return;
        }
        const res = await importFullDatabase(validation.payload);
        showNotification(`全量数据恢复成功！共还原 ${res.restoredRecords} 条记录`);
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        showNotification(`导入失败: ${msg}`);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 一键测试连通性
  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const adapter = createLLMAdapter(currentRoute);
      const result = await adapter.testConnection();
      setTestResult(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTestResult({
        success: false,
        message: `请求异常: ${msg}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  // 勾选/反选当前线路绑定的应用
  const handleToggleBoundApp = (appId: string) => {
    const currentApps = currentRoute.boundApps || [];
    let updatedApps: string[];
    if (currentApps.includes(appId)) {
      updatedApps = currentApps.filter((a) => a !== appId);
    } else {
      updatedApps = [...currentApps, appId];
    }
    updateCurrentRoute({ boundApps: updatedApps });
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
        position: 'relative',
      }}
    >
      {/* 顶部标题栏 */}
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
          title="返回主屏"
        >
          <ArrowLeft size={18} strokeWidth={2.3} />
        </button>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--nm-text-main)', margin: 0 }}>
            系统与模型设置
          </h2>
          <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--nm-text-sub)' }}>
            双线路路由与预设配置
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setShowThemeStudio(true)}
            className="nm-rebound-btn nm-btn-circle"
            style={{ width: '38px', height: '38px', color: 'var(--nm-primary)' }}
            title="拟物色彩工坊 (Colormind AI 换肤)"
          >
            <Palette size={18} strokeWidth={2.3} />
          </button>

          <button
            type="button"
            onClick={() => showNotification('配置已保存')}
            className="nm-rebound-btn nm-btn-circle"
            style={{ width: '38px', height: '38px', color: 'var(--nm-primary)' }}
            title="保存全部"
          >
            <Check size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* 轻提示 Toast */}
      {toastMsg && (
        <div
          style={{
            position: 'absolute',
            top: '56px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--nm-bg)',
            boxShadow: 'var(--nm-convex-lg)',
            padding: '6px 14px',
            borderRadius: '16px',
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--nm-primary)',
            zIndex: 100,
            whiteSpace: 'nowrap',
          }}
        >
          {toastMsg}
        </div>
      )}

      {/* 拟物个性主题工坊快捷卡片 */}
      <div style={{ padding: '8px 16px 4px' }}>
        <button
          type="button"
          onClick={() => setShowThemeStudio(true)}
          className="nm-card-sm"
          style={{
            width: '100%',
            padding: '9px 12px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid rgba(255, 255, 255, 0.75)',
            background: 'var(--nm-bg-lighter)',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>🎨</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--nm-text-main)' }}>
                拟物色彩工坊 · AI 灵感换肤
              </div>
              <div style={{ fontSize: '9.5px', color: 'var(--nm-text-sub)' }}>
                由 Colormind 深度学习算法驱动，一键摇出全局个性主题
              </div>
            </div>
          </div>
          <Sparkles size={14} color="var(--nm-primary)" />
        </button>
      </div>

      {/* 1. 主区线路 vs 分支线路 双通道分段切换标签 */}
      <div style={{ padding: '4px 16px 2px' }}>
        <div
          className="nm-inset-sm"
          style={{
            padding: '3px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '6px',
            borderRadius: '16px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab('primary');
              setTestResult(null);
            }}
            className={`nm-rebound-btn ${activeTab === 'primary' ? 'nm-card-sm' : ''}`}
            style={{
              padding: '7px 0',
              borderRadius: '13px',
              fontSize: '12px',
              fontWeight: 800,
              backgroundColor: activeTab === 'primary' ? 'var(--nm-bg)' : 'transparent',
              boxShadow: activeTab === 'primary' ? 'var(--nm-convex-sm)' : 'none',
              color: activeTab === 'primary' ? 'var(--nm-primary)' : 'var(--nm-text-sub)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Layers size={14} />
            主区线路 (主力对话)
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('branch');
              setTestResult(null);
            }}
            className={`nm-rebound-btn ${activeTab === 'branch' ? 'nm-card-sm' : ''}`}
            style={{
              padding: '7px 0',
              borderRadius: '13px',
              fontSize: '12px',
              fontWeight: 800,
              backgroundColor: activeTab === 'branch' ? 'var(--nm-bg)' : 'transparent',
              boxShadow: activeTab === 'branch' ? 'var(--nm-convex-sm)' : 'none',
              color: activeTab === 'branch' ? 'var(--nm-accent-orange)' : 'var(--nm-text-sub)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Network size={14} />
            分支线路 (专职辅助)
          </button>
        </div>
      </div>

      {/* 表单内容滚动区 */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '6px 16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
        className="no-scrollbar"
      >
        {/* 2. 用户自建本地预设库（无任何硬编码第三方预设） */}
        <div
          className="nm-card-sm"
          style={{
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Bookmark size={13} color="var(--nm-primary)" />
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--nm-text-main)' }}>
                自定义本地预设库
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingPreset(!isAddingPreset)}
              className="nm-rebound-btn nm-card-sm"
              style={{
                padding: '3px 8px',
                fontSize: '10px',
                fontWeight: 700,
                color: 'var(--nm-primary)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
              }}
            >
              <Plus size={11} /> 保存当前
            </button>
          </div>

          {/* 新建预设输入条 */}
          {isAddingPreset && (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '2px' }}>
              <input
                type="text"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                placeholder="给当前配置起个名字(如:生图专线)"
                className="nm-input"
                style={{ fontSize: '11px', padding: '6px 10px', flex: 1 }}
              />
              <button
                type="button"
                onClick={handleSaveCurrentAsPreset}
                className="nm-rebound-btn nm-btn-primary"
                style={{ padding: '6px 12px', fontSize: '10px', borderRadius: '12px', whiteSpace: 'nowrap' }}
              >
                存入
              </button>
            </div>
          )}

          {/* 预设标签列表 */}
          {settings.presets.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
              {settings.presets.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  className="nm-rebound-btn nm-card-sm"
                  style={{
                    padding: '5px 10px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--nm-text-main)',
                  }}
                  title={`点击调入: ${preset.baseUrl} (${preset.model})`}
                >
                  <span>{preset.name}</span>
                  <button
                    type="button"
                    onClick={(e) => handleDeletePreset(preset.id, e)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--nm-text-muted)',
                      cursor: 'pointer',
                      padding: '0 2px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title="删除此预设"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '10px', color: 'var(--nm-text-muted)', textAlign: 'center', padding: '4px 0' }}>
              暂无保存的预设，填写下方端点后可点击「+ 保存当前」存入
            </div>
          )}
        </div>

        {/* 3. 线路参数配置（直接拉取端点模型） */}
        <div
          className="nm-card-sm"
          style={{
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {/* Base URL */}
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--nm-text-sub)' }}>
              接口地址 (Base URL)
            </span>
            <input
              type="text"
              value={currentRoute.baseUrl}
              onChange={(e) => updateCurrentRoute({ baseUrl: e.target.value })}
              className="nm-input"
              placeholder="例如: https://api.openai.com/v1 或中转端点"
              style={{ marginTop: '4px', fontSize: '11px', padding: '8px 12px' }}
            />
          </div>

          {/* API Key */}
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--nm-text-sub)' }}>
              API Key 密钥
            </span>
            <div style={{ position: 'relative', marginTop: '4px' }}>
              <input
                type={showKey ? 'text' : 'password'}
                value={currentRoute.apiKey}
                onChange={(e) => updateCurrentRoute({ apiKey: e.target.value })}
                className="nm-input"
                placeholder="sk-..."
                style={{ fontSize: '11px', padding: '8px 36px 8px 12px' }}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--nm-text-sub)',
                  cursor: 'pointer',
                }}
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* 模型选择：直接从端点拉取 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--nm-text-sub)' }}>
                模型选择 (从端点获取)
              </span>

              {/* 关键特性：直接拉取端点模型按钮 */}
              <button
                type="button"
                disabled={isFetchingModels}
                onClick={handleFetchModels}
                className="nm-rebound-btn nm-card-sm"
                style={{
                  padding: '3px 8px',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: 'var(--nm-primary)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <RefreshCw size={11} className={isFetchingModels ? 'spin-animation' : ''} />
                {isFetchingModels ? '拉取中...' : '拉取端点模型'}
              </button>
            </div>

            {/* 若已拉取到模型列表，提供轻拟物下拉选择框 */}
            {fetchedModels.length > 0 ? (
              <div style={{ position: 'relative' }}>
                <select
                  value={currentRoute.model}
                  onChange={(e) => updateCurrentRoute({ model: e.target.value })}
                  className="nm-input"
                  style={{
                    fontSize: '11px',
                    padding: '8px 28px 8px 12px',
                    appearance: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {fetchedModels.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <div
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: 'var(--nm-text-sub)',
                  }}
                >
                  <ChevronDown size={14} />
                </div>
              </div>
            ) : (
              /* 未拉取时支持手动填写或显示占位，点击上方按钮即可拉取 */
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  value={currentRoute.model}
                  onChange={(e) => updateCurrentRoute({ model: e.target.value })}
                  className="nm-input"
                  placeholder="可点击右上角「拉取端点模型」或手动输入"
                  style={{ fontSize: '11px', padding: '8px 12px', flex: 1 }}
                />
              </div>
            )}

            {/* 拉取反馈消息 */}
            {modelFetchMsg && (
              <div
                style={{
                  fontSize: '10px',
                  color: modelFetchMsg.includes('失败') ? 'var(--nm-accent-red)' : 'var(--nm-primary)',
                  marginTop: '4px',
                  fontWeight: 600,
                }}
              >
                {modelFetchMsg}
              </div>
            )}
          </div>

          {/* 创造力温度 Temperature */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700 }}>
              <span style={{ color: 'var(--nm-text-sub)' }}>创造力 (Temperature)</span>
              <span style={{ color: 'var(--nm-primary)' }}>{currentRoute.temperature}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.5"
              step="0.05"
              value={currentRoute.temperature}
              onChange={(e) => updateCurrentRoute({ temperature: parseFloat(e.target.value) })}
              style={{ width: '100%', marginTop: '6px', accentColor: 'var(--nm-primary)' }}
            />
          </div>
        </div>

        {/* 4. 一键连通性测试按钮 */}
        <button
          type="button"
          disabled={isTesting}
          onClick={handleTestConnection}
          className="nm-rebound-btn nm-btn-primary"
          style={{
            padding: '11px',
            width: '100%',
            fontSize: '12px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          {isTesting ? (
            <>
              <Loader2 size={14} className="spin-animation" />
              正在测试【{activeTab === 'primary' ? '主区线路' : '分支线路'}】连通性...
            </>
          ) : (
            `一键测试【${activeTab === 'primary' ? '主区线路' : '分支线路'}】连通性`
          )}
        </button>

        {/* 连通性测试反馈卡片 */}
        {testResult && (
          <div
            className="nm-card-sm"
            style={{
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              backgroundColor: testResult.success ? 'rgba(56, 211, 159, 0.08)' : 'rgba(255, 94, 126, 0.08)',
              border: `1px solid ${testResult.success ? 'rgba(56, 211, 159, 0.3)' : 'rgba(255, 94, 126, 0.3)'}`,
            }}
          >
            {testResult.success ? (
              <Check size={16} color="var(--nm-accent-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
            ) : (
              <ShieldAlert size={16} color="var(--nm-accent-red)" style={{ flexShrink: 0, marginTop: '2px' }} />
            )}
            <div style={{ fontSize: '11px', lineHeight: 1.4, color: 'var(--nm-text-main)' }}>
              <div style={{ fontWeight: 800, color: testResult.success ? 'var(--nm-accent-green)' : 'var(--nm-accent-red)' }}>
                {testResult.success ? '连通探测通过' : '探测未成功'}
              </div>
              <div style={{ marginTop: '2px', wordBreak: 'break-all' }}>{testResult.message}</div>
            </div>
          </div>
        )}

        {/* 5. 应用路线绑定勾选区（预留线路分配） */}
        <div
          className="nm-card-sm"
          style={{
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--nm-text-main)' }}>
              应用路线绑定勾选区
            </span>
            <span style={{ fontSize: '10px', color: 'var(--nm-text-sub)', fontWeight: 600 }}>
              选择走【{activeTab === 'primary' ? '主区' : '分支'}】的应用
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '6px', marginTop: '4px' }}>
            {AVAILABLE_APPS_OPTIONS.map((app) => {
              const isChecked = (currentRoute.boundApps || []).includes(app.id);
              return (
                <div
                  key={app.id}
                  onClick={() => handleToggleBoundApp(app.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '7px 10px',
                    borderRadius: '10px',
                    backgroundColor: isChecked ? 'rgba(80, 150, 198, 0.08)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: isChecked ? 'var(--nm-primary)' : 'var(--nm-text-main)',
                    }}
                  >
                    {app.label}
                  </span>

                  <div
                    className={isChecked ? 'nm-btn-primary' : 'nm-inset-sm'}
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '5px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isChecked && <Check size={12} strokeWidth={3} color="#FFFFFF" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6. 本地持久化 (IndexedDB) 与备份导出/导入 */}
        <div
          className="nm-card-sm"
          style={{
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Database size={13} color="var(--nm-primary)" />
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--nm-text-main)' }}>
                本地存储持久化与数据备份
              </span>
            </div>
            <span
              style={{
                fontSize: '9px',
                fontWeight: 700,
                color: 'var(--nm-accent-green)',
                backgroundColor: 'rgba(56, 211, 159, 0.12)',
                padding: '2px 6px',
                borderRadius: '6px',
              }}
            >
              IndexedDB 运行中
            </span>
          </div>

          <div style={{ fontSize: '10px', color: 'var(--nm-text-sub)', lineHeight: 1.4 }}>
            所有角色人设卡、聊天记录与路由设置均在本地 IndexedDB 安全持久保存，随时可导出离线备份或导入还原。
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '2px' }}>
            <button
              type="button"
              onClick={handleExportBackup}
              className="nm-rebound-btn nm-card-sm"
              style={{
                padding: '8px 10px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--nm-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Download size={13} />
              导出备份 (JSON)
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="nm-rebound-btn nm-card-sm"
              style={{
                padding: '8px 10px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--nm-text-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Upload size={13} />
              导入备份 (JSON)
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleImportBackup}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      </div>

      {/* 拟物主题工坊弹窗 (Colormind 换肤) */}
      {showThemeStudio && (
        <ThemeStudioModal
          onClose={() => setShowThemeStudio(false)}
          onToast={showNotification}
        />
      )}
    </div>
  );
};
