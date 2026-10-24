import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../context/NotificationContext';
import { useApp } from '../context/AppContext';
import {
  Bell,
  Check,
  Trash2,
  X,
  ExternalLink,
  Clock,
  Calendar,
  CreditCard,
  AlertTriangle,
  Wrench,
  Sparkles,
  ShieldAlert,
  Smartphone,
  MessageSquare,
  Settings,
  Sliders,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export const NotificationPanel = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { formatDate, formatTime } = useApp();
  const {
    notifications,
    unreadCount,
    activeCategory,
    setActiveCategory,
    panelOpen,
    setPanelOpen,
    setPreviewModal,
    setSmsInboxOpen,
    markRead,
    markAllRead,
    deleteNotif,
    confirmOutageFixed,
    loading,
    loadNotifications,
    permissionStatus,
    requestPushPermission
  } = useNotifications();

  if (!panelOpen) return null;

  // Filter notifications by category
  const filteredNotifs = notifications.filter((n) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'bill') return n.category === 'bill' || n.type === 'deadline';
    if (activeCategory === 'payment') return n.category === 'payment' || n.type.includes('payment') || n.type.includes('offline');
    if (activeCategory === 'outage') return n.category === 'outage' || n.type.includes('outage');
    if (activeCategory === 'update') return n.category === 'update' || n.type.includes('notice');
    if (activeCategory === 'insight') return n.category === 'insight';
    return true;
  });

  // Group notifications into "Today" vs "Earlier"
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const todayNotifs = filteredNotifs.filter(n => new Date(n.created_at) >= startOfToday);
  const earlierNotifs = filteredNotifs.filter(n => new Date(n.created_at) < startOfToday);

  const getNotifIcon = (n) => {
    const type = n.type || '';
    if (type.includes('deadline')) return { icon: Calendar, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/60' };
    if (type.includes('payment_success') || type.includes('verified')) return { icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60' };
    if (type.includes('payment_failed') || type.includes('rejected')) return { icon: AlertTriangle, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/60' };
    if (type.includes('offline') || type.includes('payment')) return { icon: CreditCard, color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/60' };
    if (type.includes('outage_escalated')) return { icon: ShieldAlert, color: 'text-rose-600 bg-rose-100 dark:bg-rose-950' };
    if (type.includes('outage')) return { icon: AlertTriangle, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/60' };
    if (type.includes('insight')) return { icon: Sparkles, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/60' };
    return { icon: Bell, color: 'text-slate-500 bg-slate-100 dark:bg-slate-800' };
  };

  const renderNotifItem = (n) => {
    const { icon: Icon, color } = getNotifIcon(n);
    const canConfirmOutage = n.metadata?.can_confirm_fixed && !n.metadata?.feedback_status;

    return (
      <div
        key={n.id}
        className={`p-4 rounded-2xl border transition-all ${
          !n.read
            ? 'bg-teal-50/20 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800/80'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl shrink-0 ${color}`}>
            <Icon className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                {n.title}
              </span>
              <span className="text-[10px] font-mono text-slate-400 shrink-0">
                {formatTime(n.created_at)}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              {n.localized_message || n.message}
            </p>

            {/* Outage Confirmation Yes/No buttons */}
            {canConfirmOutage && (
              <div className="p-3 rounded-xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-2 mt-2">
                <span className="text-xs font-bold text-teal-950 dark:text-teal-200 block">
                  {t('notifications.supply_check_title') || 'Is your supply working normally?'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => confirmOutageFixed(n.metadata?.outage_id, true)}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                  >
                    {t('notifications.restored_btn') || '✓ Yes, Restored'}
                  </button>
                  <button
                    type="button"
                    onClick={() => confirmOutageFixed(n.metadata?.outage_id, false)}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                  >
                    {t('notifications.disrupted_btn') || '✗ No, Still Disrupted'}
                  </button>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                {n.action_url && (
                  <button
                    type="button"
                    onClick={() => {
                      setPanelOpen(false);
                      navigate(n.action_url);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 text-teal-700 dark:text-teal-300 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {n.action_label || 'View'}
                  </button>
                )}

                {/* Simulated Phone Message Preview Button */}
                <button
                  type="button"
                  onClick={() => setPreviewModal({ open: true, notification: n, channel: 'sms' })}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Simulate SMS / WhatsApp Phone Preview"
                >
                  <Smartphone className="w-3 h-3 text-teal-500" />
                  {t('notifications.preview_sms') || 'Preview SMS'}
                </button>
              </div>

              <div className="flex items-center gap-1">
                {!n.read && (
                  <button
                    type="button"
                    onClick={() => markRead(n.id)}
                    className="p-1 rounded-md text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => deleteNotif(n.id)}
                  className="p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                  title="Delete notification"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full sm:max-w-md h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-slide-up">
        
        {/* Panel Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                  {t('notifications.title') || 'Notifications'}
                </h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                    {unreadCount} {t('notifications.unread') || 'unread'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {t('notifications.subtitle') || 'Deadlines, payments, outages & insights'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setPanelOpen(false);
                navigate('/preferences');
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
              title="Preferences"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setPanelOpen(false)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Browser Push Permission Banner if not enabled */}
        {permissionStatus !== 'granted' && (
          <div className="px-4 py-2.5 bg-teal-50 dark:bg-teal-950/60 border-b border-teal-200/60 dark:border-teal-800 flex items-center justify-between text-xs">
            <span className="text-teal-900 dark:text-teal-200 text-[11px]">
              {t('notifications.push_prompt') || 'Enable browser push for instant deadline alerts'}
            </span>
            <button
              type="button"
              onClick={requestPushPermission}
              className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-teal-600 hover:bg-teal-700 text-white shrink-0 shadow-xs"
            >
              {t('notifications.enable_btn') || 'Enable'}
            </button>
          </div>
        )}

        {/* Category Filters */}
        <div className="px-3 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: t('notifications.filter_all') || 'All' },
            { id: 'bill', label: t('notifications.filter_bills') || 'Bills' },
            { id: 'payment', label: t('notifications.filter_payments') || 'Payments' },
            { id: 'outage', label: t('notifications.filter_outages') || 'Outages' },
            { id: 'update', label: t('notifications.filter_updates') || 'Updates' },
            { id: 'insight', label: t('notifications.filter_insights') || 'Insights' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-colors ${
                activeCategory === cat.id
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Actions Bar */}
        <div className="px-4 py-2 bg-slate-50/60 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="text-teal-600 dark:text-teal-400 hover:underline font-semibold disabled:opacity-40"
          >
            {t('notifications.mark_all_read') || 'Mark all as read'}
          </button>

          <button
            type="button"
            onClick={() => setSmsInboxOpen(true)}
            className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
          >
            <Smartphone className="w-3.5 h-3.5 text-teal-600" />
            {t('notifications.mock_sms_inbox') || 'Mock SMS Inbox'}
          </button>
        </div>

        {/* Scrollable Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-500" />
              {t('common.loading') || 'Loading notifications...'}
            </div>
          ) : filteredNotifs.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Bell className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-semibold">{t('notifications.empty_title') || 'No notifications in this category'}</p>
              <p className="text-xs text-slate-500">{t('notifications.empty_desc') || 'You are all caught up!'}</p>
            </div>
          ) : (
            <>
              {/* Today Group */}
              {todayNotifs.length > 0 && (
                <div className="space-y-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                    {t('notifications.today') || 'Today'}
                  </span>
                  {todayNotifs.map(renderNotifItem)}
                </div>
              )}

              {/* Earlier Group */}
              {earlierNotifs.length > 0 && (
                <div className="space-y-2.5 pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                    {t('notifications.earlier') || 'Earlier'}
                  </span>
                  {earlierNotifs.map(renderNotifItem)}
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};
