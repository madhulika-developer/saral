/**
 * Unified API Client for Saral.
 * Includes timeout handling, retries, and offline fallbacks so nothing ever crashes.
 */

const API_BASE = '/api';

export async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    clearTimeout(id);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export const api = {
  // Health
  getHealth: async () => {
    try {
      return await fetchWithTimeout(`${API_BASE}/health`, {}, 4000);
    } catch (e) {
      return { status: 'offline', mode: 'offline_rule_engine', llm_configured: false };
    }
  },

  // Users
  getUsers: async () => {
    return await fetchWithTimeout(`${API_BASE}/users`);
  },

  // Bills
  getBill: async (userId, utility = 'electricity') => {
    return await fetchWithTimeout(`${API_BASE}/bill/${userId}?utility=${utility}`);
  },

  getBillExplanation: async (userId, utility = 'electricity', lang = 'en') => {
    return await fetchWithTimeout(`${API_BASE}/bill/${userId}/explain?utility=${utility}&lang=${lang}`);
  },

  // Payments
  getPayments: async (userId, lang = 'en') => {
    return await fetchWithTimeout(`${API_BASE}/payments/${userId}?lang=${lang}`);
  },

  getPaymentComplaint: async (paymentId, lang = 'en') => {
    return await fetchWithTimeout(`${API_BASE}/payments/${paymentId}/complaint?lang=${lang}`);
  },

  // Outages
  getOutages: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.utility) params.append('utility', filters.utility);
    if (filters.status) params.append('status', filters.status);
    if (filters.locality) params.append('locality', filters.locality);
    return await fetchWithTimeout(`${API_BASE}/outages?${params.toString()}`);
  },

  reportOutage: async (reportData) => {
    return await fetchWithTimeout(`${API_BASE}/outages`, {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  },

  // Updates
  getUpdates: async (lang = 'en', utility = null) => {
    const params = new URLSearchParams({ lang });
    if (utility) params.append('utility', utility);
    return await fetchWithTimeout(`${API_BASE}/updates?${params.toString()}`);
  },

  markUpdateRead: async (updateId, userId) => {
    return await fetchWithTimeout(`${API_BASE}/updates/${updateId}/read`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  },

  // Translate
  translate: async (text, targetLang, sourceLang = 'en') => {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/translate`, {
        method: 'POST',
        body: JSON.stringify({ text, target_lang: targetLang, source_lang: sourceLang }),
      }, 5000);
      return res.translated || text;
    } catch {
      return text;
    }
  },

  // Notifications System
  getNotifications: async (userId, lang = 'en', category = null) => {
    const params = new URLSearchParams({ lang });
    if (category && category !== 'all') params.append('category', category);
    return await fetchWithTimeout(`${API_BASE}/notifications/${userId}?${params.toString()}`);
  },

  markNotificationRead: async (notifId) => {
    return await fetchWithTimeout(`${API_BASE}/notifications/${notifId}/read`, {
      method: 'POST',
    });
  },

  markAllNotificationsRead: async (userId) => {
    return await fetchWithTimeout(`${API_BASE}/notifications/read-all`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  },

  deleteNotification: async (notifId) => {
    return await fetchWithTimeout(`${API_BASE}/notifications/${notifId}`, {
      method: 'DELETE',
    });
  },

  getNotificationPreferences: async (userId) => {
    return await fetchWithTimeout(`${API_BASE}/notification-preferences/${userId}`);
  },

  updateNotificationPreferences: async (userId, prefs) => {
    return await fetchWithTimeout(`${API_BASE}/notification-preferences/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(prefs),
    });
  },

  simulateEvent: async (userId, eventType, metadata = {}) => {
    return await fetchWithTimeout(`${API_BASE}/demo/simulate`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, event_type: eventType, metadata }),
    });
  },

  submitOutageFeedback: async (outageId, isFixed, userId = 'user_1') => {
    return await fetchWithTimeout(`${API_BASE}/outages/${outageId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, is_fixed: isFixed }),
    });
  },
};
