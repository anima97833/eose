import { IStorageAdapter } from './types';
import { IndexedDBAdapter } from './IndexedDBAdapter';

export * from './types';
export * from './db';
export * from './IndexedDBAdapter';
export * from './RemoteCloudStorageAdapter';

let globalStorageInstance: IStorageAdapter | null = null;

export function getStorage(): IStorageAdapter {
  if (!globalStorageInstance) {
    globalStorageInstance = new IndexedDBAdapter();
  }
  return globalStorageInstance;
}
