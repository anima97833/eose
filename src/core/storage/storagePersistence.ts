import { formatBytes } from '../../utils/imageCompressor';

export interface StorageAuditResult {
  /** LocalStorage 占用字节数 */
  localStorageBytes: number;
  localStorageFormatted: string;
  /** LocalStorage 标称配额（5MB） */
  localStorageQuota: number;
  localStorageQuotaFormatted: string;
  /** LocalStorage 占用百分比（0 ~ 100） */
  localStoragePercent: number;

  /** IndexedDB / 浏览器存储当前占用字节数 */
  indexedDBBytes: number;
  indexedDBFormatted: string;
  /** 浏览器分配给当前域名的总配额 */
  indexedDBQuota: number;
  indexedDBQuotaFormatted: string;
  /** IndexedDB 占用百分比（0 ~ 100） */
  indexedDBPercent: number;

  /** 浏览器是否已授予持久化存储权限（防止被系统 LRU 静默清理） */
  isPersisted: boolean;
  /** 当前浏览器是否支持 Storage Persistence API */
  supportsPersistence: boolean;
}

/**
 * 计算当前域下 LocalStorage 的实际占用字节数 (UTF-16 字符每字符按 2 字节计)
 */
export function calculateLocalStorageBytes(): number {
  if (typeof window === 'undefined' || !window.localStorage) {
    return 0;
  }
  let totalBytes = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const val = localStorage.getItem(key) || '';
        totalBytes += (key.length + val.length) * 2;
      }
    }
  } catch (err) {
    console.warn('[Storage] 计算 LocalStorage 大小失败:', err);
  }
  return totalBytes;
}

/**
 * 检查当前浏览器是否支持持久化存储 API
 */
export function isPersistenceSupported(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.storage && typeof navigator.storage.persist === 'function';
}

/**
 * 查询当前网站是否已经被授权为持久化存储
 */
export async function checkIsPersisted(): Promise<boolean> {
  if (!isPersistenceSupported()) return false;
  try {
    return await navigator.storage.persisted();
  } catch (err) {
    console.warn('[Storage] 查询持久化状态失败:', err);
    return false;
  }
}

/**
 * 主动向浏览器申请永久存储权限
 */
export async function requestStoragePersistence(): Promise<boolean> {
  if (!isPersistenceSupported()) {
    console.warn('[Storage] 当前浏览器不支持 navigator.storage.persist');
    return false;
  }
  try {
    const isPersisted = await navigator.storage.persist();
    if (isPersisted) {
      console.log('%c[Storage] 永久存储保护已成功激活！浏览器不会在空间不足时清理本应用数据。', 'color: #059669; font-weight: bold;');
    } else {
      console.warn('[Storage] 浏览器未能授予永久持久化（可能受限于无痕模式或移动端策略）');
    }
    return isPersisted;
  } catch (err) {
    console.error('[Storage] 申请持久化权限异常:', err);
    return false;
  }
}

/**
 * 在应用入口启动时自动执行的持久化策略
 * 1. 检查持久化状态；
 * 2. 若未受保护，则静默发起申请；
 * 3. 记录日志便于排查。
 */
export async function initStoragePersistence(): Promise<{
  supported: boolean;
  persisted: boolean;
}> {
  if (!isPersistenceSupported()) {
    return { supported: false, persisted: false };
  }

  try {
    let persisted = await navigator.storage.persisted();
    if (!persisted) {
      // 尝试申请持久化保护
      persisted = await navigator.storage.persist();
    }
    return { supported: true, persisted };
  } catch (err) {
    console.warn('[Storage] 初始化持久化申请失败:', err);
    return { supported: true, persisted: false };
  }
}

/**
 * 获取 LocalStorage 与 IndexedDB 存储占用全量审计数据与百分比
 */
export async function getStorageAudit(): Promise<StorageAuditResult> {
  // 1. LocalStorage 计算 (标准上限 5MB)
  const lsBytes = calculateLocalStorageBytes();
  const lsQuota = 5 * 1024 * 1024; // 5 MB
  const lsPercent = Math.min(100, parseFloat(((lsBytes / lsQuota) * 100).toFixed(2)));

  // 2. IndexedDB / Browser Storage 计算
  let idbBytes = 0;
  let idbQuota = 1024 * 1024 * 1024; // 默认备用 1GB

  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      idbBytes = estimate.usage || 0;
      idbQuota = estimate.quota || idbQuota;
    } catch (err) {
      console.warn('[Storage] 获取 storage.estimate 失败:', err);
    }
  }

  const idbPercent = idbQuota > 0 ? Math.min(100, parseFloat(((idbBytes / idbQuota) * 100).toFixed(2))) : 0;
  const isPersisted = await checkIsPersisted();
  const supportsPersistence = isPersistenceSupported();

  return {
    localStorageBytes: lsBytes,
    localStorageFormatted: formatBytes(lsBytes),
    localStorageQuota: lsQuota,
    localStorageQuotaFormatted: formatBytes(lsQuota),
    localStoragePercent: lsPercent,

    indexedDBBytes: idbBytes,
    indexedDBFormatted: formatBytes(idbBytes),
    indexedDBQuota: idbQuota,
    indexedDBQuotaFormatted: formatBytes(idbQuota),
    indexedDBPercent: idbPercent,

    isPersisted,
    supportsPersistence,
  };
}
