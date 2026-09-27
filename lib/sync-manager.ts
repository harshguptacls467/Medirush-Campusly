// ─── Offline-First Sync & Storage Manager ──────────────────────────────────────
// Manages client-side IndexedDB persistence, offline mutation queues,
// and automatic background synchronization when internet connectivity resumes.

export type SyncOperationType = 'ADD_INVOICE' | 'UPDATE_STOCK' | 'DISPATCH_ORDER' | 'CUSTOM_MUTATION';
export type SyncItemStatus = 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';

export interface SyncQueueItem {
  id: string;
  operation: SyncOperationType;
  entityType: 'INVOICE' | 'INVENTORY' | 'ORDER';
  entityId: string;
  payload: any;
  createdAt: string;
  retryCount: number;
  status: SyncItemStatus;
  errorMessage?: string;
}

const DB_NAME = 'medirush_offline_db';
const DB_VERSION = 1;

/**
 * Open or initialize the IndexedDB database
 */
export function openOfflineDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in current environment'));
      return;
    }

    const req = window.indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('shadow_inventory')) {
        const invStore = db.createObjectStore('shadow_inventory', { keyPath: 'id' });
        invStore.createIndex('pharmacy_id', 'pharmacy_id', { unique: false });
        invStore.createIndex('normalized_salt', 'normalized_salt', { unique: false });
      }

      if (!db.objectStoreNames.contains('invoices')) {
        db.createObjectStore('invoices', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('sync_queue')) {
        const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
        syncStore.createIndex('status', 'status', { unique: false });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Enqueue an operation into the offline sync queue
 */
export async function enqueueSyncOperation(
  operation: SyncOperationType,
  entityType: 'INVOICE' | 'INVENTORY' | 'ORDER',
  entityId: string,
  payload: any
): Promise<SyncQueueItem> {
  const item: SyncQueueItem = {
    id: `sync-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    operation,
    entityType,
    entityId,
    payload,
    createdAt: new Date().toISOString(),
    retryCount: 0,
    status: 'PENDING',
  };

  try {
    const db = await openOfflineDatabase();
    const tx = db.transaction('sync_queue', 'readwrite');
    const store = tx.objectStore('sync_queue');
    store.put(item);
  } catch (err) {
    console.warn('Fallback: IndexedDB unavailable, saving to memory/localStorage', err);
    if (typeof window !== 'undefined') {
      const existing = JSON.parse(localStorage.getItem('medirush_pending_sync') || '[]');
      existing.push(item);
      localStorage.setItem('medirush_pending_sync', JSON.stringify(existing));
    }
  }

  return item;
}

/**
 * Get all pending items in sync queue
 */
export async function getPendingSyncItems(): Promise<SyncQueueItem[]> {
  try {
    const db = await openOfflineDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction('sync_queue', 'readonly');
      const store = tx.objectStore('sync_queue');
      const req = store.getAll();
      req.onsuccess = () => {
        const all: SyncQueueItem[] = req.result || [];
        resolve(all.filter((i) => i.status === 'PENDING' || i.status === 'FAILED'));
      };
      req.onerror = () => resolve([]);
    });
  } catch (err) {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('medirush_pending_sync') || '[]');
    }
    return [];
  }
}

/**
 * Flush and replay sync queue against server API
 */
export async function flushSyncQueue(): Promise<{ syncedCount: number; failedCount: number }> {
  const pending = await getPendingSyncItems();
  if (pending.length === 0) return { syncedCount: 0, failedCount: 0 };

  let syncedCount = 0;
  let failedCount = 0;

  for (const item of pending) {
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });

      if (res.ok) {
        syncedCount++;
        // Remove from DB or mark synced
        try {
          const db = await openOfflineDatabase();
          const tx = db.transaction('sync_queue', 'readwrite');
          tx.objectStore('sync_queue').delete(item.id);
        } catch (e) {}
      } else {
        failedCount++;
      }
    } catch (err) {
      failedCount++;
    }
  }

  if (typeof window !== 'undefined' && syncedCount > 0) {
    const remaining = JSON.parse(localStorage.getItem('medirush_pending_sync') || '[]').filter(
      (i: any) => !pending.some((p) => p.id === i.id)
    );
    localStorage.setItem('medirush_pending_sync', JSON.stringify(remaining));
  }

  return { syncedCount, failedCount };
}
