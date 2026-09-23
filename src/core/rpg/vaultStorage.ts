// src/core/rpg/vaultStorage.ts

export type VaultLogType = 'deposit' | 'expense' | 'shield' | 'adjust';

export interface VaultLog {
  id: string;
  type: VaultLogType;
  amount: number; // 发生金额或校准值
  note: string;
  timestamp: number;
  dateStr: string;
}

const STORAGE_KEY = 'rpg_vault_transactions';

export const calculateFreeDays = (gold: number, dailyCost: number = 100, crystals: number = 0): number => {
  const cost = Math.max(1, dailyCost);
  return Math.max(0, Math.floor(gold / cost) + (crystals || 0));
};

export const getVaultLogs = (): VaultLog[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse vault logs:', err);
    return [];
  }
};

export const addVaultLog = (log: Omit<VaultLog, 'id' | 'timestamp' | 'dateStr'>): VaultLog => {
  const logs = getVaultLogs();
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const dateStr = `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

  const newLog: VaultLog = {
    id: `vlog_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    ...log,
    timestamp: Date.now(),
    dateStr,
  };

  // 保留最近 50 条流水
  const updated = [newLog, ...logs].slice(0, 50);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save vault logs:', e);
  }
  return newLog;
};
