import React, { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import {
  Sliders,
  Play,
  Wifi,
  WifiOff,
  Zap,
  CreditCard,
  AlertTriangle,
  Clock,
  CheckCircle2,
  X,
  ChevronUp,
  ChevronDown,
  Sparkles
} from 'lucide-react';

export const DemoControls = () => {
  const {
    demoControlsOpen,
    setDemoControlsOpen,
    simulateEventTrigger,
    isOnline,
    toggleManualOffline
  } = useNotifications();

  // Keyboard shortcut (Ctrl+Shift+D or `) to toggle demo controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') || e.key === '`') {
        setDemoControlsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const eventGroups = [
    {
      group: "1. Deadlines",
      items: [
        { label: "Due Tomorrow", event: "due_tomorrow", color: "bg-amber-600 hover:bg-amber-700" },
        { label: "Overdue (₹50 Late Fee)", event: "overdue", color: "bg-rose-600 hover:bg-rose-700" },
      ]
    },
    {
      group: "2. Online Payments",
      items: [
        { label: "Payment Success", event: "payment_success", color: "bg-emerald-600 hover:bg-emerald-700" },
        { label: "Payment Failed (Refund)", event: "payment_failed", color: "bg-rose-600 hover:bg-rose-700" },
        { label: "Pending (>10m)", event: "payment_pending", color: "bg-amber-500 hover:bg-amber-600" },
        { label: "Posted to Ledger", event: "payment_posted", color: "bg-teal-600 hover:bg-teal-700" },
      ]
    },
    {
      group: "3. Offline Tokens",
      items: [
        { label: "Offline Signed", event: "offline_signed", color: "bg-blue-600 hover:bg-blue-700" },
        { label: "SMS Queued", event: "offline_queued", color: "bg-sky-600 hover:bg-sky-700" },
        { label: "Offline Verified", event: "offline_verified", color: "bg-emerald-600 hover:bg-emerald-700" },
        { label: "Rejected (Expired)", event: "offline_rejected", color: "bg-rose-600 hover:bg-rose-700" },
        { label: "Expired Delivery", event: "offline_expired", color: "bg-orange-600 hover:bg-orange-700" },
      ]
    },
    {
      group: "4. Outages",
      items: [
        { label: "Acknowledged", event: "outage_acknowledged", color: "bg-amber-600 hover:bg-amber-700" },
        { label: "Crew Assigned", event: "outage_crew_assigned", color: "bg-teal-600 hover:bg-teal-700" },
        { label: "Resolved (Yes/No)", event: "outage_resolved", color: "bg-emerald-600 hover:bg-emerald-700" },
      ]
    },
    {
      group: "5. Updates & Insights",
      items: [
        { label: "Maintenance Notice", event: "maintenance_notice", color: "bg-slate-700 hover:bg-slate-800" },
        { label: "Usage Surge (+35%)", event: "usage_alert", color: "bg-purple-600 hover:bg-purple-700" },
      ]
    }
  ];

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 sm:left-6 z-50">
      {demoControlsOpen ? (
        <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-2xl border-2 border-teal-500 max-w-sm sm:max-w-md w-full animate-scale-up space-y-4">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-xs tracking-tight uppercase text-teal-400">
                  Presenter Demo Controls
                </h3>
                <span className="text-[10px] text-slate-400">Shortcut: [ ` ] or Ctrl+Shift+D</span>
              </div>
            </div>

            <button
              onClick={() => setDemoControlsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Network Mode Simulator Switch */}
          <div className="p-2.5 rounded-2xl bg-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              {isOnline ? <Wifi className="w-4 h-4 text-emerald-400" /> : <WifiOff className="w-4 h-4 text-amber-400" />}
              Network State: <span className="font-bold text-white">{isOnline ? 'Online' : 'Offline'}</span>
            </span>

            <button
              type="button"
              onClick={toggleManualOffline}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                isOnline
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
              }`}
            >
              {isOnline ? 'Go Offline' : 'Reconnect & Sync'}
            </button>
          </div>

          {/* Simulated Event Trigger Buttons */}
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {eventGroups.map((grp, gIdx) => (
              <div key={gIdx} className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300/80 block">
                  {grp.group}
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {grp.items.map((it, iIdx) => (
                    <button
                      key={iIdx}
                      type="button"
                      onClick={() => simulateEventTrigger(it.event)}
                      className={`text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold text-white shadow-xs transition-all transform active:scale-95 truncate ${it.color}`}
                    >
                      {it.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      ) : (
        <button
          type="button"
          onClick={() => setDemoControlsOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-900 text-teal-400 border border-teal-500/40 shadow-xl backdrop-blur-md transition-all text-xs font-bold group"
          title="Open Presenter Demo Controls [ ` ]"
        >
          <Sliders className="w-4 h-4 group-hover:rotate-45 transition-transform" />
          <span className="hidden sm:inline">Demo Controls</span>
        </button>
      )}
    </div>
  );
};
