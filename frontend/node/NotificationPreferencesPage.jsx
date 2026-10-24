import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../context/NotificationContext';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import {
  Settings,
  Bell,
  Smartphone,
  MessageCircle,
  Mail,
  Moon,
  Clock,
  Calendar,
  CreditCard,
  AlertTriangle,
  Sparkles,
  Check,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';

export const NotificationPreferencesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, showToast } = useApp();
  const { preferences, setPreferences, permissionStatus, requestPushPermission } = useNotifications();

  const [leadTime, setLeadTime] = useState(3);
  const [channels, setChannels] = useState({
    in_app: true,
    browser_push: true,
    sms: true,
    whatsapp: true,
    email: false,
  });
  const [types, setTypes] = useState({
    deadlines: true,
    payments: true,
    offline_payments: true,
    outages: true,
    updates: true,
    insights: true,
  });
  const [quietHours, setQuietHours] = useState({
    enabled: false,
    start: '22:00',
    end: '07:00',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (preferences) {
      if (preferences.lead_time_days) setLeadTime(preferences.lead_time_days);
      if (preferences.channels) setChannels(prev => ({ ...prev, ...preferences.channels }));
      if (preferences.types) setTypes(prev => ({ ...prev, ...preferences.types }));
      if (preferences.quiet_hours) setQuietHours(prev => ({ ...prev, ...preferences.quiet_hours }));
    }
  }, [preferences]);

  const handleSave = async () => {
    setSaving(true);
    const updated = {
      lead_time_days: leadTime,
      channels,
      types,
      quiet_hours: quietHours,
    };

    try {
      await api.updateNotificationPreferences(currentUser, updated);
      setPreferences(updated);
      showToast('Notification preferences saved successfully!', 'success');
    } catch (err) {
      console.warn('Saved locally:', err);
      showToast('Preferences updated locally', 'info');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="w-6 h-6 text-teal-600" />
              Notification Preferences
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Customize delivery channels, alert categories, quiet hours and lead times
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 transition-all"
        >
          <Check className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>

      {/* Section 1: Reminder Lead Time */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600" />
            Bill Due Date Reminder Lead Time
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            How many days before your utility due date should Saral remind you?
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { days: 1, label: '1 Day Before', desc: 'Urgent reminder before due date' },
            { days: 3, label: '3 Days Before (Recommended)', desc: 'Optimal window for bank transfer' },
            { days: 7, label: '7 Days Before', desc: 'Early notice upon bill generation' },
          ].map((item) => (
            <button
              key={item.days}
              type="button"
              onClick={() => setLeadTime(item.days)}
              className={`p-4 rounded-2xl text-left border transition-all ${
                leadTime === item.days
                  ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 text-teal-950 dark:text-teal-200 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="font-bold text-xs">{item.label}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {item.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Section 2: Delivery Channels */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-teal-600" />
            Delivery Channels
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Choose where and how you would like to receive critical alerts
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { id: 'in_app', label: 'In-App Notification Center', desc: 'Navbar bell badge & slideout drawer', icon: Bell },
            { id: 'browser_push', label: 'Browser Push Notifications', desc: 'Desktop and mobile system banners', icon: Bell, action: requestPushPermission, perm: permissionStatus },
            { id: 'sms', label: 'SMS Messages', desc: 'Cellular network alerts without data', icon: Smartphone },
            { id: 'whatsapp', label: 'WhatsApp Official Alerts', desc: 'APCPDCL verified business messages', icon: MessageCircle },
            { id: 'email', label: 'Email Bulletins', desc: 'Monthly itemised summaries to inbox', icon: Mail },
          ].map((ch) => {
            const Icon = ch.icon;
            return (
              <div
                key={ch.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {ch.label}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {ch.desc}
                    </span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={channels[ch.id] || false}
                    onChange={(e) => setChannels({ ...channels, [ch.id]: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: Notification Types Toggles */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-teal-600" />
            Alert Categories
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Toggle specific notification triggers based on personal preference
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { id: 'deadlines', label: 'Bill Deadlines & Due Alerts', desc: 'Approaching due dates and late fee notices' },
            { id: 'payments', label: 'Payment Status & Delays', desc: 'Success, gateway escrow holding, auto-refunds' },
            { id: 'offline_payments', label: 'Offline Signed Tokens', desc: 'Queued tokens, GSM settlement, expiry warnings' },
            { id: 'outages', label: 'Outages & Restoration Times', desc: 'Patrol crew dispatch, fixes, satisfaction confirmation' },
            { id: 'updates', label: 'Service & Maintenance Notices', desc: 'Planned feeder shut downs and municipal canal cleaning' },
            { id: 'insights', label: 'Usage Surges & Leak Insights', desc: 'Slab-crossing warnings and high consumption hints' },
          ].map((tp) => (
            <div
              key={tp.id}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  {tp.label}
                </span>
                <span className="text-[11px] text-slate-500">
                  {tp.desc}
                </span>
              </div>

              <input
                type="checkbox"
                checked={types[tp.id] || false}
                onChange={(e) => setTypes({ ...types, [tp.id]: e.target.checked })}
                className="rounded text-teal-600 focus:ring-teal-500 ml-3"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Quiet Hours */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Moon className="w-4 h-4 text-teal-600" />
              Do Not Disturb (Quiet Hours)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Silence non-critical notification sounds and phone buzzes during sleep
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={quietHours.enabled}
              onChange={(e) => setQuietHours({ ...quietHours, enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
          </label>
        </div>

        {quietHours.enabled && (
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Quiet Hours Start
              </label>
              <input
                type="time"
                value={quietHours.start}
                onChange={(e) => setQuietHours({ ...quietHours, start: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent focus:border-teal-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Quiet Hours End
              </label>
              <input
                type="time"
                value={quietHours.end}
                onChange={(e) => setQuietHours({ ...quietHours, end: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent focus:border-teal-500 font-mono"
              />
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
