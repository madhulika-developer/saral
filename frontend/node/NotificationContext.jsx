import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from './AppContext';
import { api } from '../api/client';
import {
  saveNotificationsToDB,
  getCachedNotificationsFromDB,
  markNotificationReadInDB,
  deleteNotificationFromDB
} from '../utils/indexedDB';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { t, i18n } = useTranslation();
  const { currentUser, showToast } = useApp();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeCategory, setActiveCategory] = useState('all');
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);

  // Network & Offline Status
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineChanges, setOfflineChanges] = useState([]);
  const [showOfflineSummary, setShowOfflineSummary] = useState(false);
  const wasOfflineRef = useRef(false);

  // UI Panels and Modals
  const [panelOpen, setPanelOpen] = useState(false);
  const [previewModal, setPreviewModal] = useState({ open: false, notification: null, channel: 'sms' });
  const [smsInboxOpen, setSmsInboxOpen] = useState(false);
  const [demoControlsOpen, setDemoControlsOpen] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  // Load initial notifications and preferences
  useEffect(() => {
    loadNotifications();
    loadPreferences();
  }, [currentUser, i18n.language]);

  // Network online/offline event listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOfflineRef.current) {
        handleReconnectSync();
        wasOfflineRef.current = false;
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      wasOfflineRef.current = true;
      showToast('You are now in offline mode. Notifications cached in IndexedDB.', 'info');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentUser]);

  // Server-Sent Events (SSE) Live Notifications Stream
  useEffect(() => {
    if (!isOnline) return;

    let eventSource = null;
    try {
      eventSource = new EventSource('/api/notifications/stream');

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'notification' && payload.data) {
            const notif = payload.data;
            if (notif.user_id === currentUser) {
              handleIncomingNotification(notif);
            }
          }
        } catch (e) {
          // ignore keepalive
        }
      };

      eventSource.onerror = () => {
        // SSE disconnected, fallback to quiet polling
        eventSource?.close();
      };
    } catch (e) {
      console.warn('SSE not supported or connection failed:', e);
    }

    return () => {
      eventSource?.close();
    };
  }, [currentUser, isOnline]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      let serverNotifs = [];
      if (isOnline) {
        try {
          serverNotifs = await api.getNotifications(currentUser, i18n.language);
          // Cache to IndexedDB
          await saveNotificationsToDB(serverNotifs);
        } catch (netErr) {
          console.warn('Backend unavailable, reading from IndexedDB:', netErr);
          serverNotifs = await getCachedNotificationsFromDB(currentUser);
        }
      } else {
        serverNotifs = await getCachedNotificationsFromDB(currentUser);
      }

      setNotifications(serverNotifs);
      setUnreadCount(serverNotifs.filter(n => !n.read).length);
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = async () => {
    try {
      const prefs = await api.getNotificationPreferences(currentUser);
      setPreferences(prefs);
    } catch (err) {
      console.warn('Preferences fallback:', err);
    }
  };

  const handleIncomingNotification = (notif) => {
    setNotifications((prev) => {
      // Deduplicate by event_id or id
      const filtered = prev.filter(n => n.id !== notif.id && (!notif.event_id || n.event_id !== notif.event_id));
      return [notif, ...filtered];
    });

    setUnreadCount((prev) => prev + 1);
    saveNotificationsToDB([notif]);

    // Show in-app toast
    showToast(`🔔 ${notif.title}`, notif.severity === 'critical' ? 'error' : 'info', 4000);

    // Trigger Browser Push if permitted
    if (permissionStatus === 'granted') {
      try {
        new Notification(notif.title, {
          body: notif.localized_message || notif.message,
          icon: '/favicon.ico',
        });
      } catch (err) {
        console.warn('Browser notification error:', err);
      }
    }
  };

  // Reconnect Sync handler: detects what changed while offline
  const handleReconnectSync = async () => {
    try {
      const cached = await getCachedNotificationsFromDB(currentUser);
      const latest = await api.getNotifications(currentUser, i18n.language);

      // Find new or updated notifications
      const cachedIds = new Set(cached.map(c => c.id));
      const newlyArrived = latest.filter(l => !cachedIds.has(l.id));

      if (newlyArrived.length > 0) {
        setOfflineChanges(newlyArrived);
        setShowOfflineSummary(true);
      }

      setNotifications(latest);
      setUnreadCount(latest.filter(n => !n.read).length);
      await saveNotificationsToDB(latest);
      showToast('Reconnected! Synced offline notifications with server.', 'success');
    } catch (err) {
      console.error('Error during reconnect sync:', err);
    }
  };

  const markRead = async (notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    await markNotificationReadInDB(notifId);

    if (isOnline) {
      try {
        await api.markNotificationRead(notifId);
      } catch (err) {
        console.warn('Failed to sync read status online:', err);
      }
    }
  };

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);

    for (const n of notifications) {
      await markNotificationReadInDB(n.id);
    }

    if (isOnline) {
      try {
        await api.markAllNotificationsRead(currentUser);
        showToast('All notifications marked as read', 'info');
      } catch (err) {
        console.warn('Failed to mark all read online:', err);
      }
    }
  };

  const deleteNotif = async (notifId) => {
    setNotifications(prev => prev.filter(n => n.id !== notifId));
    setUnreadCount(prev => {
      const item = notifications.find(n => n.id === notifId);
      return item && !item.read ? Math.max(0, prev - 1) : prev;
    });
    await deleteNotificationFromDB(notifId);

    if (isOnline) {
      try {
        await api.deleteNotification(notifId);
      } catch (err) {
        console.warn('Failed to delete online:', err);
      }
    }
    showToast('Notification removed', 'info');
  };

  const requestPushPermission = async () => {
    if (typeof Notification === 'undefined') {
      showToast('Browser notifications are not supported in this browser.', 'error');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      if (permission === 'granted') {
        showToast('Browser notifications enabled successfully!', 'success');
        new Notification('Saral Notifications Enabled', {
          body: 'You will now receive instant utility deadline and outage alerts.',
        });
      } else {
        showToast('Browser notifications were blocked or dismissed.', 'warning');
      }
    } catch (err) {
      console.warn('Permission error:', err);
    }
  };

  const simulateEventTrigger = async (eventType, metadata = {}) => {
    try {
      const res = await api.simulateEvent(currentUser, eventType, metadata);
      if (res?.notification) {
        handleIncomingNotification(res.notification);
      }
    } catch (err) {
      // Generate client-side offline mock if completely disconnected
      const fallbackNotif = {
        id: `NOTIF-OFF-${Date.now()}`,
        user_id: currentUser,
        type: eventType,
        category: 'bill',
        title: `Simulated: ${eventType.replace('_', ' ').toUpperCase()}`,
        message: 'Locally generated offline notification.',
        severity: 'info',
        action_label: 'View',
        action_url: '/',
        created_at: new Date().toISOString(),
        read: false,
        event_id: `LOCAL_${eventType}_${Date.now()}`
      };
      handleIncomingNotification(fallbackNotif);
    }
  };

  const confirmOutageFixed = async (outageId, isFixed) => {
    try {
      const res = await api.submitOutageFeedback(outageId, isFixed, currentUser);
      showToast(res.message, isFixed ? 'success' : 'error', 5000);
      loadNotifications();
    } catch (err) {
      showToast('Feedback submitted locally.', 'info');
    }
  };

  const toggleManualOffline = () => {
    if (isOnline) {
      setIsOnline(false);
      wasOfflineRef.current = true;
      showToast('Switched to Offline Mode (IndexedDB active)', 'warning');
    } else {
      setIsOnline(true);
      handleReconnectSync();
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        activeCategory,
        setActiveCategory,
        preferences,
        setPreferences,
        loading,
        isOnline,
        toggleManualOffline,
        offlineChanges,
        showOfflineSummary,
        setShowOfflineSummary,
        panelOpen,
        setPanelOpen,
        previewModal,
        setPreviewModal,
        smsInboxOpen,
        setSmsInboxOpen,
        demoControlsOpen,
        setDemoControlsOpen,
        permissionStatus,
        requestPushPermission,
        markRead,
        markAllRead,
        deleteNotif,
        simulateEventTrigger,
        confirmOutageFixed,
        loadNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
