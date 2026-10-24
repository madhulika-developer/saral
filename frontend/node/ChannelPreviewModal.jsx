import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../context/NotificationContext';
import {
  X,
  Smartphone,
  MessageCircle,
  Mail,
  CheckCheck,
  Building2,
  ShieldCheck,
  Send
} from 'lucide-react';

export const ChannelPreviewModal = () => {
  const { previewModal, setPreviewModal } = useNotifications();
  const [selectedChannel, setSelectedChannel] = useState(previewModal.channel || 'sms');

  if (!previewModal.open || !previewModal.notification) return null;

  const notif = previewModal.notification;
  const messageBody = notif.localized_message || notif.message;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-sm w-full p-5 overflow-hidden animate-scale-up space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-teal-600" />
              Simulated Message Delivery Preview
            </h3>
            <p className="text-[11px] text-slate-500">
              Preview how citizen receives this message on mobile
            </p>
          </div>
          <button
            onClick={() => setPreviewModal({ open: false, notification: null, channel: 'sms' })}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channel Selector Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setSelectedChannel('sms')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-colors ${
              selectedChannel === 'sms'
                ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            SMS
          </button>
          <button
            type="button"
            onClick={() => setSelectedChannel('whatsapp')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-colors ${
              selectedChannel === 'whatsapp'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
            WhatsApp
          </button>
          <button
            type="button"
            onClick={() => setSelectedChannel('email')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-colors ${
              selectedChannel === 'email'
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-sky-500" />
            Email
          </button>
        </div>

        {/* Smartphone Mock Frame */}
        <div className="bg-slate-950 rounded-2xl p-3 border-2 border-slate-700 text-slate-100 shadow-inner">
          
          {/* SMS Channel View */}
          {selectedChannel === 'sms' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                <span className="font-mono font-bold text-slate-200">VK-APCPDCL</span>
                <span>Today, 14:22</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800 text-slate-100 text-xs leading-relaxed space-y-1.5 border border-slate-700">
                <p className="font-semibold">{notif.title}</p>
                <p>{messageBody}</p>
                <p className="text-[10px] text-teal-400 mt-1 font-mono">
                  saral.gov.in/app/{notif.id}
                </p>
              </div>
              <p className="text-[10px] text-slate-500 text-center">
                Standard SMS gateway (No mobile data required)
              </p>
            </div>
          )}

          {/* WhatsApp Channel View */}
          {selectedChannel === 'whatsapp' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-emerald-900/60 pb-2">
                <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] font-bold">
                  AP
                </div>
                <div>
                  <span className="font-bold text-xs text-white flex items-center gap-1">
                    APCPDCL Official
                    <ShieldCheck className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                  </span>
                  <span className="text-[9px] text-emerald-400 block leading-none">Verified Business</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-950/60 text-slate-100 text-xs leading-relaxed border border-emerald-800/80 space-y-1.5">
                <div className="font-bold text-emerald-300">{notif.title}</div>
                <p>{messageBody}</p>
                <div className="flex items-center justify-between pt-1 text-[9px] text-emerald-400/80">
                  <span>View in Saral App</span>
                  <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
                </div>
              </div>
            </div>
          )}

          {/* Email Channel View */}
          {selectedChannel === 'email' && (
            <div className="space-y-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <div className="border-b border-slate-800 pb-2 space-y-0.5 text-[11px]">
                <div className="text-slate-400"><strong>From:</strong> alerts@apcpdcl.gov.in</div>
                <div className="text-slate-200 font-semibold"><strong>Subj:</strong> {notif.title}</div>
              </div>
              <div className="text-xs text-slate-300 leading-relaxed pt-1 space-y-1">
                <p className="font-medium text-white">{messageBody}</p>
                <p className="text-[10px] text-slate-400 pt-1">
                  Vijayawada Circle Office, MG Road. Toll-Free: 1912.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
