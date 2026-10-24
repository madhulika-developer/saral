import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { i18n } = useTranslation();

  // Users State (Lakshmi Devi default)
  const [currentUser, setCurrentUser] = useState('user_1');
  const [userData, setUserData] = useState(null);
  const [allUsers, setAllUsers] = useState([]);

  // Utility Context (Electricity / Water)
  const [utility, setUtility] = useState('electricity');

  // Backend Health & Operational Mode
  const [health, setHealth] = useState({
    mode: 'offline_rule_engine',
    llm_configured: false,
    status: 'checking'
  });

  // Updates unread badge count
  const [unreadCount, setUnreadCount] = useState(0);

  // Dark Mode
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('saral_theme') === 'dark' ||
      (!('saral_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Toast System
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info', duration = 3500) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, duration);
  };

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('saral_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('saral_theme', 'light');
    }
  }, [darkMode]);

  // Load Initial Users & Health
  useEffect(() => {
    const initApp = async () => {
      try {
        const [users, h, updates] = await Promise.all([
          api.getUsers().catch(() => [
            { id: 'user_1', name: 'Lakshmi Devi', city: 'Vijayawada', primary_utility: 'electricity' },
            { id: 'user_2', name: 'Ravi Kumar', city: 'Vijayawada', primary_utility: 'water' }
          ]),
          api.getHealth(),
          api.getUpdates().catch(() => [])
        ]);

        setAllUsers(users);
        const active = users.find(u => u.id === currentUser) || users[0];
        setUserData(active);
        if (active) {
          setUtility(active.primary_utility || 'electricity');
        }
        setHealth(h);

        // Calculate unread updates
        if (Array.isArray(updates)) {
          const unread = updates.filter(u => !u.read_by?.includes(currentUser)).length;
          setUnreadCount(unread);
        }
      } catch (err) {
        console.warn('Initialization using local defaults:', err);
      }
    };

    initApp();
  }, [currentUser]);

  // Switch demo user
  const switchUser = (userId) => {
    setCurrentUser(userId);
    const selected = allUsers.find(u => u.id === userId);
    if (selected) {
      setUserData(selected);
      setUtility(selected.primary_utility || 'electricity');
      showToast(`Switched profile to ${selected.name}`, 'info');
    }
  };

  // Intl Formatter helpers respecting current locale
  const formatCurrency = (amount) => {
    try {
      return new Intl.NumberFormat(i18n.language || 'en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `₹${Number(amount).toFixed(2)}`;
    }
  };

  const formatNumber = (num) => {
    try {
      return new Intl.NumberFormat(i18n.language || 'en-IN').format(num);
    } catch {
      return String(num);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat(i18n.language || 'en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat(i18n.language || 'en-IN', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        userData,
        allUsers,
        switchUser,
        utility,
        setUtility,
        health,
        unreadCount,
        setUnreadCount,
        darkMode,
        setDarkMode,
        toast,
        showToast,
        formatCurrency,
        formatNumber,
        formatDate,
        formatTime,
      }}
    >
      {children}

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50 max-w-sm flex items-center gap-3 bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 animate-slide-up">
          <div className={`w-2.5 h-2.5 rounded-full ${
            toast.type === 'success' ? 'bg-emerald-400' :
            toast.type === 'error' ? 'bg-rose-400' : 'bg-teal-400'
          }`} />
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
