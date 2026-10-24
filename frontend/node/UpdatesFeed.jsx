import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  FileText,
  Clock,
  MapPin,
  Check,
  Zap,
  Droplets,
  HelpCircle,
  ShieldAlert
} from 'lucide-react';

export const UpdatesFeed = () => {
  const { t, i18n } = useTranslation();
  const { currentUser, setUnreadCount, formatDate, formatTime, showToast } = useApp();

  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUtility, setSelectedUtility] = useState('all');
  const [unreadOnly, setUnreadOnly] = useState(false);

  useEffect(() => {
    fetchUpdates();
  }, [i18n.language]);

  const fetchUpdates = async () => {
    setLoading(true);
    try {
      const data = await api.getUpdates(i18n.language);
      setUpdates(data || []);
      const unread = (data || []).filter(u => !u.read_by?.includes(currentUser)).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Error fetching updates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (updateId) => {
    try {
      await api.markUpdateRead(updateId, currentUser);
      setUpdates(prev => prev.map(u => {
        if (u.id === updateId) {
          const newReadBy = [...(u.read_by || []), currentUser];
          return { ...u, read_by: newReadBy };
        }
        return u;
      }));

      setUnreadCount(prev => Math.max(0, prev - 1));
      showToast('Notice marked as read', 'info');
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      for (const u of updates) {
        if (!u.read_by?.includes(currentUser)) {
          await api.markUpdateRead(u.id, currentUser);
        }
      }
      setUpdates(prev => prev.map(u => ({
        ...u,
        read_by: [...(u.read_by || []), currentUser]
      })));
      setUnreadCount(0);
      showToast('All notices marked as read', 'success');
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const filteredUpdates = updates.filter(u => {
    if (selectedUtility !== 'all' && u.utility !== selectedUtility) return false;
    if (unreadOnly && u.read_by?.includes(currentUser)) return false;
    return true;
  });

  const getCategoryBadge = (category) => {
    switch (category) {
      case 'emergency':
        return { label: 'Emergency Disruption', bg: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300', icon: AlertTriangle };
      case 'maintenance':
        return { label: 'Scheduled Maintenance', bg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300', icon: Wrench };
      case 'restoration':
        return { label: 'Supply Restored', bg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300', icon: CheckCircle2 };
      default:
        return { label: 'Consumer Advisory', bg: 'bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300', icon: FileText };
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-teal-600" />
            {t('updates.title')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('updates.subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={handleMarkAllRead}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Check className="w-3.5 h-3.5 text-teal-600" />
          {t('updates.mark_all_read')}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
          {['all', 'electricity', 'water'].map((util) => (
            <button
              key={util}
              onClick={() => setSelectedUtility(util)}
              className={`px-3 py-1 rounded-md font-medium capitalize transition-colors ${
                selectedUtility === util
                  ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {util === 'all' ? 'All' : util === 'electricity' ? '⚡ ' + t('app.electricity') : '💧 ' + t('app.water')}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.value)}
            className="rounded text-teal-600 focus:ring-teal-500"
          />
          Show Unread Only
        </label>
      </div>

      {/* Updates Cards List */}
      {loading ? (
        <div className="py-12 text-center text-slate-500">
          <div className="w-8 h-8 mx-auto border-3 border-teal-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm">{t('common.loading')}</p>
        </div>
      ) : filteredUpdates.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center text-slate-500 border border-slate-200 dark:border-slate-800">
          No service notices match your active filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUpdates.map((u) => {
            const isRead = u.read_by?.includes(currentUser);
            const badge = getCategoryBadge(u.category);
            const BadgeIcon = badge.icon;

            return (
              <div
                key={u.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border shadow-sm transition-all space-y-4 ${
                  !isRead
                    ? 'border-teal-300 dark:border-teal-700/80 bg-teal-50/10 dark:bg-teal-950/10'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Notice Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${badge.bg}`}>
                        <BadgeIcon className="w-3 h-3" />
                        {badge.label}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {u.utility}
                      </span>
                      {!isRead && (
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                          {t('updates.unread_badge')}
                        </span>
                      )}
                    </div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                      {u.title}
                    </h2>
                  </div>

                  {/* Mark as read button */}
                  {!isRead && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(u.id)}
                      className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 transition-colors self-start"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {t('updates.mark_read')}
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {u.summary}
                </p>

                {/* Structured Breakdown: What, Who, Why, Expected End */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                    <span className="font-bold text-slate-500 dark:text-slate-400 block uppercase text-[10px]">
                      {t('updates.what')}
                    </span>
                    <p className="text-slate-800 dark:text-slate-200">{u.what}</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                    <span className="font-bold text-slate-500 dark:text-slate-400 block uppercase text-[10px]">
                      {t('updates.who')}
                    </span>
                    <p className="text-slate-800 dark:text-slate-200">{u.who}</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                    <span className="font-bold text-slate-500 dark:text-slate-400 block uppercase text-[10px]">
                      {t('updates.why')}
                    </span>
                    <p className="text-slate-800 dark:text-slate-200">{u.why}</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                    <span className="font-bold text-slate-500 dark:text-slate-400 block uppercase text-[10px]">
                      {t('updates.expected_end')}
                    </span>
                    <p className="text-teal-700 dark:text-teal-400 font-semibold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(u.expected_end)} • {formatTime(u.expected_end)}
                    </p>
                  </div>
                </div>

                {/* Relief Measures if present */}
                {u.relief_measures && (
                  <div className="p-3 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/50 dark:border-teal-900/50 text-xs text-teal-950 dark:text-teal-200">
                    <strong>{t('updates.relief')}:</strong> {u.relief_measures}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
