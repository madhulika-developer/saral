import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import {
  X,
  MessageSquare,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';

export const MockSmsInboxModal = () => {
  const { smsInboxOpen, setSmsInboxOpen, simulateEventTrigger } = useNotifications();

  if (!smsInboxOpen) return null;

  const mockSmsMessages = [
    {
      sender: "VK-APCPDCL (51912)",
      time: "Today, 14:24",
      body: "APCPDCL Gateway Receipt: Token #OFF-TOK-88190 for ₹1,641 VERIFIED & SETTLED. Consumer #APCPDCL-VJA-84920 current dues: ₹0. Thank you for paying offline.",
      status: "verified",
      action: "offline_verified"
    },
    {
      sender: "VM-VMCWTR (51912)",
      time: "Yesterday, 10:30",
      body: "VMC Water Works: Emergency valve repair in progress at Benz Circle East Zone. Rapid Squad #4 deployed. Resumption expected by 16:00.",
      status: "info",
      action: "outage_crew_assigned"
    },
    {
      sender: "VK-APCPDCL (51912)",
      time: "10 Jul, 14:21",
      body: "Offline payment token received: Cryptographic signature verified against device ID SEC-4819. Queued for ledger settlement batch.",
      status: "queued",
      action: "offline_queued"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 animate-scale-up space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Mock Cellular SMS Inbox
              </h3>
              <p className="text-[11px] text-slate-500">
                Incoming gateway replies for offline tokens (GSM / 51912)
              </p>
            </div>
          </div>
          <button
            onClick={() => setSmsInboxOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SMS List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {mockSmsMessages.map((msg, i) => (
            <div
              key={i}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-700 dark:text-teal-400 font-mono text-[11px]">
                  {msg.sender}
                </span>
                <span className="text-[10px] text-slate-400">{msg.time}</span>
              </div>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                {msg.body}
              </p>
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Discom Gateway
                </span>
                <button
                  type="button"
                  onClick={() => {
                    simulateEventTrigger(msg.action);
                    setSmsInboxOpen(false);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 hover:underline"
                >
                  Sync to App <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
          💡 This simulates phone network SMS delivery, confirming token settlement even when the user has zero mobile internet.
        </div>

      </div>
    </div>
  );
};
