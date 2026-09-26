import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Download,
  Upload,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  ChevronRight,
  FileJson,
  HardDrive,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import {
  getDatabaseStats,
  exportFullDatabase,
  downloadBackupBlob,
  parseAndValidateBackup,
  importFullDatabase,
  DatabaseStats,
  FullBackupPayload,
} from '../../../core/storage/databaseBackupService';
import {
  getStorageAudit,
  requestStoragePersistence,
  StorageAuditResult,
} from '../../../core/storage/storagePersistence';
import { runLocalStorageSlimming } from '../../../core/storage/localStorageMigrator';

interface SecurityAppProps {
  onBack: () => void;
}

export const SecurityApp: React.FC<SecurityAppProps> = ({ onBack }) => {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [storageAudit, setStorageAudit] = useState<StorageAuditResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [exporting, setExporting] = useState<boolean>(false);
  const [importing, setImporting] = useState<boolean>(false);
  const [requestingPersist, setRequestingPersist] = useState<boolean>(false);
  const [slimming, setSlimming] = useState<boolean>(false);
  const [showTablesDetail, setShowTablesDetail] = useState<boolean>(false);

  // 导入确认模态窗状态
  const [pendingBackup, setPendingBackup] = useState<{
    payload: FullBackupPayload;
    filename: string;
    summary: { tableCount: number; recordCount: number; exportedAt: string };
  } | null>(null);

  // Toast 提示
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [dbStats, audit] = await Promise.all([
        getDatabaseStats(),
        getStorageAudit(),
      ]);
      setStats(dbStats);
      setStorageAudit(audit);
    } catch (err) {
      console.error('获取数据库统计失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPersist = async () => {
    if (requestingPersist) return;
    setRequestingPersist(true);
    try {
      const success = await requestStoragePersistence();
      if (success) {
        showToast('永久存储保护已授权激活！');
      } else {
        showToast('浏览器暂未批准持久化（请检查是否在无痕模式）');
      }
      const updatedAudit = await getStorageAudit();
      setStorageAudit(updatedAudit);
    } catch (err: any) {
      showToast(`申请异常: ${err?.message || err}`);
    } finally {
      setRequestingPersist(false);
    }
  };

  const handleSlimStorage = async () => {
    if (slimming) return;
    setSlimming(true);
    try {
      const res = await runLocalStorageSlimming();
      await fetchStats();
      if (res.migratedCount > 0) {
        showToast(`瘦身成功！已将 ${res.migratedCount} 项臃肿数据迁移至 IndexedDB，释放 ${res.freedFormatted}`);
      } else {
        showToast('LocalStorage 当前非常轻盈健康，未发现冗余大体积数据');
      }
    } catch (err: any) {
      showToast(`瘦身失败: ${err?.message || err}`);
    } finally {
      setSlimming(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // 1. 导出全量数据库
  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const res = await exportFullDatabase();
      downloadBackupBlob(res.blob, res.filename);
      showToast(`已导出 ${res.totalRecords} 条记录至本地！`);
      fetchStats();
    } catch (err: any) {
      showToast(`导出失败: ${err?.message || err}`);
    } finally {
      setExporting(false);
    }
  };

  // 2. 选择导入文件
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const validation = parseAndValidateBackup(content);
      if (!validation.valid || !validation.payload || !validation.summary) {
        showToast(`校验失败: ${validation.error || '文件格式不符'}`);
        return;
      }

      setPendingBackup({
        payload: validation.payload,
        filename: file.name,
        summary: validation.summary,
      });
    };

    reader.readAsText(file);
    e.target.value = '';
  };

  // 3. 确认执行覆盖导入
  const handleConfirmImport = async () => {
    if (!pendingBackup) return;
    setImporting(true);
    try {
      const result = await importFullDatabase(pendingBackup.payload);
      setPendingBackup(null);
      showToast(`还原成功！恢复了 ${result.restoredRecords} 条记录`);
      
      // 1.2秒后自动刷新页面重载所有组件与状态
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      showToast(`导入失败: ${err?.message || err}`);
      setImporting(false);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        background: '#FFF0F3', // 浪漫温润奶粉色背景
        overflow: 'hidden',
        userSelect: 'none',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", sans-serif',
      }}
    >
      {/* 隐藏的文件输入框 */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        style={{ display: 'none' }}
      />

      {/* ================= 1. 顶部轻拟物粉色导航栏 ================= */}
      <div
        style={{
          padding: '12px 16px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 240, 243, 0.88)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(248, 180, 196, 0.35)',
          zIndex: 10,
        }}
      >
        <button
          onClick={onBack}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: '#FFF5F7',
            border: '1.5px solid rgba(255, 255, 255, 0.95)',
            boxShadow: '4px 4px 10px rgba(240, 185, 198, 0.45), -3px -3px 8px rgba(255, 255, 255, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#D84A6E',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.boxShadow =
              'inset 2px 2px 5px rgba(240, 185, 198, 0.45), inset -2px -2px 5px rgba(255, 255, 255, 0.95)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.boxShadow =
              '4px 4px 10px rgba(240, 185, 198, 0.45), -3px -3px 8px rgba(255, 255, 255, 0.95)';
          }}
        >
          <ArrowLeft size={18} strokeWidth={2.4} />
        </button>

        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: '16px',
              fontWeight: 800,
              color: '#4A2E35',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>隐私与安全</span>
            <span
              style={{
                fontSize: '10px',
                padding: '1px 6px',
                borderRadius: '8px',
                background: '#FFE0E8',
                color: '#D84A6E',
                fontWeight: 700,
              }}
            >
              本地沙盒
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#A06E7A', marginTop: '1px' }}>
            全量数据库备份与隐私保障
          </div>
        </div>

        <button
          onClick={fetchStats}
          disabled={loading}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: '#FFF5F7',
            border: '1.5px solid rgba(255, 255, 255, 0.95)',
            boxShadow: '4px 4px 10px rgba(240, 185, 198, 0.45), -3px -3px 8px rgba(255, 255, 255, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#D84A6E',
            cursor: 'pointer',
          }}
          title="刷新统计"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* ================= 2. 主滚动内容区 ================= */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          minHeight: 0,
          WebkitOverflowScrolling: 'touch',
          padding: '16px 14px 40px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* 卡片 1：核心数据引擎总览徽章 */}
        <div
          style={{
            flexShrink: 0,
            boxSizing: 'border-box',
            borderRadius: '24px',
            background: '#FFF5F7',
            border: '1.5px solid rgba(255, 255, 255, 0.95)',
            boxShadow:
              '8px 8px 22px rgba(240, 185, 198, 0.45), -8px -8px 22px rgba(255, 255, 255, 0.95)',
            padding: '18px 16px',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #FFB6C6 0%, #FA8CA4 100%)',
                boxShadow:
                  '0 8px 16px rgba(250, 140, 164, 0.35), inset 0 2px 2px rgba(255, 255, 255, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={28} strokeWidth={2.4} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#4A2E35' }}>
                小手机数据库沙盒
              </div>
              <div style={{ fontSize: '11px', color: '#9E6C78', marginTop: '3px', lineHeight: 1.4 }}>
                纯本地 Dexie IndexedDB 引擎，立绘与隐私离线持久化
              </div>
            </div>
          </div>

          {/* 拟物内凹槽统计面板 */}
          <div
            style={{
              marginTop: '14px',
              padding: '12px',
              borderRadius: '16px',
              background: '#FDF0F3',
              boxShadow:
                'inset 3px 3px 7px rgba(235, 180, 195, 0.35), inset -3px -3px 7px rgba(255, 255, 255, 0.95)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#D84A6E' }}>
                {loading ? '...' : stats?.totalRecords ?? 0}
              </div>
              <div style={{ fontSize: '10px', color: '#A06E7A', marginTop: '1px' }}>
                本地记录总数
              </div>
            </div>

            <div style={{ width: '1px', height: '24px', background: 'rgba(216, 74, 110, 0.15)' }} />

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#D84A6E' }}>
                {loading ? '...' : stats?.tableCount ?? 28}
              </div>
              <div style={{ fontSize: '10px', color: '#A06E7A', marginTop: '1px' }}>
                已构建数据表
              </div>
            </div>

            <div style={{ width: '1px', height: '24px', background: 'rgba(216, 74, 110, 0.15)' }} />

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#529676' }}>
                纯本地无云
              </div>
              <div style={{ fontSize: '10px', color: '#A06E7A', marginTop: '3px' }}>
                零云端泄露
              </div>
            </div>
          </div>

          {stats?.lastBackupDate && (
            <div
              style={{
                marginTop: '10px',
                fontSize: '10px',
                color: '#B0808C',
                textAlign: 'center',
              }}
            >
              上次全量备份时间：{stats.lastBackupDate}
            </div>
          )}
        </div>

        {/* 卡片 1.5：本地双轨存储配额与空间占比可视化 (LocalStorage vs IndexedDB) */}
        <div
          style={{
            flexShrink: 0,
            boxSizing: 'border-box',
            borderRadius: '24px',
            background: '#FFF5F7',
            border: '1.5px solid rgba(255, 255, 255, 0.95)',
            boxShadow:
              '8px 8px 22px rgba(240, 185, 198, 0.45), -8px -8px 22px rgba(255, 255, 255, 0.95)',
            padding: '18px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HardDrive size={16} color="#D84A6E" />
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#4A2E35' }}>
                存储配额与容量占比
              </span>
            </div>

            {/* 持久化保护状态徽章 */}
            {storageAudit && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {storageAudit.isPersisted ? (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      color: '#2E7D52',
                      background: '#E8F5E9',
                      border: '1px solid #C8E6C9',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <CheckCircle2 size={11} />
                    <span>永久保护中</span>
                  </span>
                ) : (
                  <button
                    onClick={handleRequestPersist}
                    disabled={requestingPersist}
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      color: '#C2410C',
                      background: '#FFF7ED',
                      border: '1px solid #FFEDD5',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                    }}
                    title="点击申请永久持久化授权，防止浏览器在磁盘不足时自动清理"
                  >
                    <ShieldAlert size={11} />
                    <span>{requestingPersist ? '申请中...' : '点击申请永久保护'}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div style={{ fontSize: '11px', color: '#8F5E6B', lineHeight: 1.5 }}>
            系统采用<strong>「双轨存储引擎」</strong>：IndexedDB 承载 30+ 张应用表与高频多媒体；LocalStorage 仅存放核心路由与极简配置，实现零白屏与容量无忧。
          </div>

          {/* 进度条 1：LocalStorage */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '16px',
              background: '#FDF0F3',
              boxShadow:
                'inset 2px 2px 6px rgba(235, 180, 195, 0.35), inset -2px -2px 6px rgba(255, 255, 255, 0.95)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#4A2E35' }}>
                LocalStorage（配置层）
              </span>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#D84A6E' }}>
                {storageAudit?.localStorageFormatted || '0 B'} / {storageAudit?.localStorageQuotaFormatted || '5 MB'}
              </span>
            </div>

            {/* 槽体进度条 */}
            <div
              style={{
                width: '100%',
                height: '7px',
                borderRadius: '6px',
                background: '#F0DCE2',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: `${Math.max(2, storageAudit?.localStoragePercent || 0)}%`,
                  height: '100%',
                  borderRadius: '6px',
                  background:
                    (storageAudit?.localStoragePercent || 0) > 80
                      ? 'linear-gradient(90deg, #F87171, #EF4444)'
                      : 'linear-gradient(90deg, #34D399, #10B981)',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#A06E7A' }}>
              <span>安全使用率: {storageAudit?.localStoragePercent || 0}%</span>
              <span>已受自动迁移守护（上限 5MB）</span>
            </div>
          </div>

          {/* 进度条 2：IndexedDB */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '16px',
              background: '#FDF0F3',
              boxShadow:
                'inset 2px 2px 6px rgba(235, 180, 195, 0.35), inset -2px -2px 6px rgba(255, 255, 255, 0.95)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#4A2E35' }}>
                IndexedDB（业务大库）
              </span>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#D84A6E' }}>
                {storageAudit?.indexedDBFormatted || '0 B'} / 预估配额 {storageAudit?.indexedDBQuotaFormatted || '动态分配'}
              </span>
            </div>

            {/* 槽体进度条 */}
            <div
              style={{
                width: '100%',
                height: '7px',
                borderRadius: '6px',
                background: '#F0DCE2',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: `${Math.max(2, Math.min(100, storageAudit?.indexedDBPercent || 0))}%`,
                  height: '100%',
                  borderRadius: '6px',
                  background: 'linear-gradient(90deg, #FFB4C5, #FA86A0)',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#A06E7A' }}>
              <span>当前占用配额比: {storageAudit?.indexedDBPercent || '<0.1'}%</span>
              <span>海量本地离线空间（极充裕）</span>
            </div>
          </div>

          {/* 一键瘦身到 IndexedDB 操作条 */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(255, 240, 245, 0.9), rgba(255, 248, 250, 0.95))',
              border: '1.5px solid rgba(255, 214, 226, 0.8)',
              boxShadow: '4px 4px 12px rgba(240, 185, 198, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #FFB4C5 0%, #FA86A0 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFF',
                    boxShadow: '0 4px 8px rgba(250, 134, 160, 0.3)',
                    flexShrink: 0,
                  }}
                >
                  <Zap size={16} strokeWidth={2.4} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#4A2E35' }}>
                    一键瘦身至 IndexedDB
                  </div>
                  <div style={{ fontSize: '10px', color: '#9E6C78', marginTop: '1px' }}>
                    无损迁移历史聊天、手账大体积数据，破除 5MB 限制
                  </div>
                </div>
              </div>

              <button
                onClick={handleSlimStorage}
                disabled={slimming}
                style={{
                  padding: '7px 14px',
                  borderRadius: '12px',
                  background: slimming
                    ? '#E0D0D5'
                    : 'linear-gradient(135deg, #FF94B0 0%, #E85A82 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                  boxShadow: slimming
                    ? 'none'
                    : '3px 3px 8px rgba(232, 90, 130, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: slimming ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                }}
                title="当 LocalStorage 爆满或偏高时，一键将冗余和大体积数据无损搬迁至 IndexedDB"
              >
                <Zap size={12} className={slimming ? 'animate-spin' : ''} />
                <span>{slimming ? '瘦身迁移中...' : '立即一键瘦身'}</span>
              </button>
            </div>

            {/* 爆满或偏高警示气泡 (超过 75% 时温馨高亮) */}
            {(storageAudit?.localStoragePercent || 0) > 75 && (
              <div
                style={{
                  padding: '6px 10px',
                  borderRadius: '10px',
                  background: '#FEF2F2',
                  border: '1px solid #FEE2E2',
                  fontSize: '10px',
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <AlertTriangle size={12} />
                <span>LocalStorage 占用已超警戒线，建议立即点击一键瘦身！</span>
              </div>
            )}
          </div>

          {/* 双引擎数据量相对占比对比条 */}
          {(() => {
            const ls = storageAudit?.localStorageBytes || 0;
            const idb = storageAudit?.indexedDBBytes || 0;
            const total = ls + idb;
            const idbRatio = total > 0 ? Math.max(5, Math.min(99, Math.round((idb / total) * 100))) : 95;
            const lsRatio = 100 - idbRatio;
            return (
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: '14px',
                  background: '#FFF5F7',
                  border: '1px dashed rgba(248, 180, 196, 0.7)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#8F5E6B' }}>
                  <span>
                    IndexedDB 业务占 <strong>{idbRatio}%</strong>
                  </span>
                  <span>
                    LocalStorage 启动占 <strong>{lsRatio}%</strong>
                  </span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: '4px',
                    display: 'flex',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ width: `${idbRatio}%`, background: '#FA86A0' }} title="IndexedDB 占比" />
                  <div style={{ width: `${lsRatio}%`, background: '#34D399' }} title="LocalStorage 占比" />
                </div>
              </div>
            );
          })()}
        </div>

        {/* 卡片 2：核心操作区（全量导入与导出按钮） */}
        <div
          style={{
            flexShrink: 0,
            boxSizing: 'border-box',
            borderRadius: '24px',
            background: '#FFF5F7',
            border: '1.5px solid rgba(255, 255, 255, 0.95)',
            boxShadow:
              '8px 8px 22px rgba(240, 185, 198, 0.45), -8px -8px 22px rgba(255, 255, 255, 0.95)',
            padding: '18px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={16} color="#D84A6E" />
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#4A2E35' }}>
              全量数据备份与还原
            </span>
          </div>

          <div style={{ fontSize: '11px', color: '#8F5E6B', lineHeight: 1.5 }}>
            打包导出当前手机的全部立绘、背景、聊天消息、角色卡、动态图片、美食手账、人生旅程胶囊及所有游戏配置为单个 JSON 文件。
          </div>

          {/* 导出按钮 (突出主要操作) */}
          <button
            onClick={handleExport}
            disabled={exporting}
            style={{
              width: '100%',
              padding: '14px 18px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #FFB4C5 0%, #FA86A0 100%)',
              border: 'none',
              boxShadow:
                '0 8px 20px rgba(250, 134, 160, 0.4), inset 0 2px 2px rgba(255, 255, 255, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(1px)';
              e.currentTarget.style.boxShadow =
                '0 4px 10px rgba(250, 134, 160, 0.4), inset 0 2px 4px rgba(0, 0, 0, 0.15)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow =
                '0 8px 20px rgba(250, 134, 160, 0.4), inset 0 2px 2px rgba(255, 255, 255, 0.65)';
            }}
          >
            <Download size={18} strokeWidth={2.4} />
            <span>{exporting ? '正在生成全量备份...' : '导出全量数据库 (JSON)'}</span>
          </button>

          {/* 导入按钮 (精致次级粉白拟物按钮) */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            style={{
              width: '100%',
              padding: '13px 18px',
              borderRadius: '18px',
              background: '#FFF5F7',
              border: '1.5px solid #F8B4C4',
              boxShadow:
                '5px 5px 14px rgba(240, 185, 198, 0.4), -4px -4px 12px rgba(255, 255, 255, 0.95)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              color: '#D84A6E',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.boxShadow =
                'inset 2px 2px 5px rgba(240, 185, 198, 0.45), inset -2px -2px 5px rgba(255, 255, 255, 0.95)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.boxShadow =
                '5px 5px 14px rgba(240, 185, 198, 0.4), -4px -4px 12px rgba(255, 255, 255, 0.95)';
            }}
          >
            <Upload size={18} strokeWidth={2.4} />
            <span>导入全量数据备份</span>
          </button>
        </div>

        {/* 卡片 3：全量数据表审计清单（可展开折叠） */}
        <div
          style={{
            flexShrink: 0,
            boxSizing: 'border-box',
            borderRadius: '24px',
            background: '#FFF5F7',
            border: '1.5px solid rgba(255, 255, 255, 0.95)',
            boxShadow:
              '8px 8px 22px rgba(240, 185, 198, 0.45), -8px -8px 22px rgba(255, 255, 255, 0.95)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            onClick={() => setShowTablesDetail(!showTablesDetail)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={16} color="#D84A6E" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#4A2E35' }}>
                已纳管数据表清单 ({stats?.tables.length || 0})
              </span>
            </div>
            <div
              style={{
                fontSize: '11px',
                color: '#D84A6E',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                fontWeight: 700,
              }}
            >
              <span>{showTablesDetail ? '收起' : '查看明细'}</span>
              <ChevronRight
                size={14}
                style={{
                  transform: showTablesDetail ? 'rotate(90deg)' : 'none',
                  transition: 'transform 0.2s ease',
                }}
              />
            </div>
          </div>

          {showTablesDetail && (
            <div
              style={{
                marginTop: '12px',
                paddingTop: '10px',
                borderTop: '1px dashed rgba(248, 180, 196, 0.4)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                maxHeight: '260px',
                overflowY: 'auto',
              }}
            >
              {stats?.tables.map((t) => (
                <div
                  key={t.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    background: '#FDF0F3',
                    fontSize: '11px',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 700, color: '#4A2E35' }}>{t.label}</span>
                    <span style={{ color: '#B0808C', marginLeft: '6px', fontSize: '10px' }}>
                      ({t.name})
                    </span>
                  </div>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: t.count > 0 ? '#FFE0E8' : 'rgba(0,0,0,0.04)',
                      color: t.count > 0 ? '#D84A6E' : '#B0808C',
                      fontWeight: 800,
                      fontSize: '10px',
                    }}
                  >
                    {t.count} 条
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ================= 3. 导入确认弹窗 (淡粉色轻拟物风格) ================= */}
      {pendingBackup && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 100,
            background: 'rgba(74, 46, 53, 0.45)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '18px',
            boxSizing: 'border-box',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '320px',
              borderRadius: '26px',
              background: '#FFF5F7',
              border: '2px solid rgba(255, 255, 255, 0.95)',
              boxShadow: '0 20px 45px rgba(180, 110, 125, 0.4)',
              padding: '22px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '14px',
                  background: '#FFE0E8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#D84A6E',
                }}
              >
                <FileJson size={22} strokeWidth={2.4} />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#4A2E35' }}>
                  确认还原数据库？
                </div>
                <div style={{ fontSize: '10px', color: '#B0808C' }}>
                  {pendingBackup.filename}
                </div>
              </div>
            </div>

            {/* 备份概览信息 */}
            <div
              style={{
                borderRadius: '16px',
                background: '#FDF0F3',
                padding: '12px',
                boxShadow:
                  'inset 2px 2px 5px rgba(235, 180, 195, 0.35), inset -2px -2px 5px rgba(255, 255, 255, 0.9)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                fontSize: '11px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8F5E6B' }}>导出时间</span>
                <span style={{ fontWeight: 700, color: '#4A2E35' }}>
                  {pendingBackup.summary.exportedAt}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8F5E6B' }}>包含数据表</span>
                <span style={{ fontWeight: 700, color: '#4A2E35' }}>
                  {pendingBackup.summary.tableCount} 张
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8F5E6B' }}>恢复记录条数</span>
                <span style={{ fontWeight: 800, color: '#D84A6E' }}>
                  {pendingBackup.summary.recordCount} 条
                </span>
              </div>
            </div>

            <div
              style={{
                fontSize: '11px',
                color: '#C2410C',
                background: '#FFF7ED',
                padding: '8px 10px',
                borderRadius: '12px',
                border: '1px solid #FFEDD5',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                lineHeight: 1.4,
              }}
            >
              <AlertTriangle size={15} style={{ flexShrink: 0 }} />
              <span>导入将覆盖当前小手机的数据，请确认已做好当前备份！</span>
            </div>

            {/* 弹窗底部操作 */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button
                onClick={() => setPendingBackup(null)}
                style={{
                  flex: 1,
                  padding: '11px 0',
                  borderRadius: '14px',
                  background: '#FFF5F7',
                  border: '1.5px solid #F8B4C4',
                  boxShadow:
                    '3px 3px 8px rgba(240, 185, 198, 0.35), -3px -3px 8px rgba(255, 255, 255, 0.95)',
                  color: '#8F5E6B',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                取消
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={importing}
                style={{
                  flex: 1.3,
                  padding: '11px 0',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #FFB4C5 0%, #FA86A0 100%)',
                  border: 'none',
                  boxShadow: '0 6px 16px rgba(250, 134, 160, 0.45)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                }}
              >
                {importing ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>恢复中...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    <span>确认覆盖恢复</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 4. Toast 轻提示 (粉色轻拟物浮雕) ================= */}
      {toastMsg && (
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#FFF5F7',
            border: '1.5px solid #F8B4C4',
            boxShadow:
              '6px 6px 18px rgba(240, 185, 198, 0.45), -4px -4px 12px rgba(255, 255, 255, 0.95)',
            color: '#D84A6E',
            padding: '9px 18px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 800,
            zIndex: 120,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            animation: 'fadeIn 0.2s ease-out',
            pointerEvents: 'none',
          }}
        >
          <Sparkles size={14} />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
