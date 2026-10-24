/**
 * IndexedDB persistence layer for Saral Notifications.
 * Ensures notifications survive page reloads and are accessible while 100% offline.
 */

const DB_NAME = 'saral_notifications_db';
const DB_VERSION = 1;
const NOTIF_STORE = 'notifications';
const OFFLINE_QUEUE_STORE = 'offline_queue';
const META_STORE = 'sync_meta';

export const initDB = () => {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      console.warn('IndexedDB not supported, falling back to in-memory');
      resolve(null);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(NOTIF_STORE)) {
        const notifStore = db.createObjectStore(NOTIF_STORE, { keyPath: 'id' });
        notifStore.createIndex('user_id', 'user_id', { unique: false });
        notifStore.createIndex('created_at', 'created_at', { unique: false });
        notifStore.createIndex('event_id', 'event_id', { unique: false });
      }
      if (!db.objectStoreNames.contains(OFFLINE_QUEUE_STORE)) {
        db.createObjectStore(OFFLINE_QUEUE_STORE, { keyPath: 'queue_id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      console.warn('IndexedDB open error:', request.error);
      resolve(null);
    };
  });
};

export const saveNotificationsToDB = async (notifications) => {
  try {
    const db = await initDB();
    if (!db) return;

    const tx = db.transaction(NOTIF_STORE, 'readwrite');
    const store = tx.objectStore(NOTIF_STORE);

    for (const notif of notifications) {
      store.put(notif);
    }
  } catch (err) {
    console.warn('Error saving notifications to IndexedDB:', err);
  }
};

export const getCachedNotificationsFromDB = async (userId) => {
  try {
    const db = await initDB();
    if (!db) return [];

    return new Promise((resolve) => {
      const tx = db.transaction(NOTIF_STORE, 'readonly');
      const store = tx.objectStore(NOTIF_STORE);
      const userIndex = store.index('user_id');
      const request = userIndex.getAll(userId);

      request.onsuccess = () => {
        const list = request.result || [];
        list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        resolve(list);
      };
      request.onerror = () => resolve([]);
    });
  } catch (err) {
    console.warn('Error fetching from IndexedDB:', err);
    return [];
  }
};

export const markNotificationReadInDB = async (notifId) => {
  try {
    const db = await initDB();
    if (!db) return;

    const tx = db.transaction(NOTIF_STORE, 'readwrite');
    const store = tx.objectStore(NOTIF_STORE);
    const req = store.get(notifId);

    req.onsuccess = () => {
      if (req.result) {
        req.result.read = true;
        store.put(req.result);
      }
    };
  } catch (err) {
    console.warn('Error marking read in IndexedDB:', err);
  }
};

export const deleteNotificationFromDB = async (notifId) => {
  try {
    const db = await initDB();
    if (!db) return;

    const tx = db.transaction(NOTIF_STORE, 'readwrite');
    const store = tx.objectStore(NOTIF_STORE);
    store.delete(notifId);
  } catch (err) {
    console.warn('Error deleting from IndexedDB:', err);
  }
};

export const queueOfflineEventInDB = async (eventData) => {
  try {
    const db = await initDB();
    if (!db) return;

    const tx = db.transaction(OFFLINE_QUEUE_STORE, 'readwrite');
    const store = tx.objectStore(OFFLINE_QUEUE_STORE);
    store.add({
      ...eventData,
      queued_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Error queueing offline event in IndexedDB:', err);
  }
};

export const getOfflineQueueFromDB = async () => {
  try {
    const db = await initDB();
    if (!db) return [];

    return new Promise((resolve) => {
      const tx = db.transaction(OFFLINE_QUEUE_STORE, 'readonly');
      const store = tx.objectStore(OFFLINE_QUEUE_STORE);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch (err) {
    return [];
  }
};

export const clearOfflineQueueInDB = async () => {
  try {
    const db = await initDB();
    if (!db) return;

    const tx = db.transaction(OFFLINE_QUEUE_STORE, 'readwrite');
    const store = tx.objectStore(OFFLINE_QUEUE_STORE);
    store.clear();
  } catch (err) {
    console.warn('Error clearing offline queue in IndexedDB:', err);
  }
};
