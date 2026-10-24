import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import {
  Wifi,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  X,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const WhileOfflineSummaryModal = () => {
  const { showOfflineSummary, setShowOfflineSummary, offlineChanges, setPanelOpen } = useNotifications();
  const navigate = useNavigate();

  if (!showOfflineSummary || offlineChanges.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-teal-500/30 max-w-md w-full p-6 animate-scale-up space-y-4">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center">
              <Wifi className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-teal-600 dark:text-teal-400">
                Connection Restored
              </span>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                While you were offline...
              </h3>
            </div>
          </div>
          <button
            onClick={() => setShowOfflineSummary(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300">
          Here is a summary of utility events that occurred while your device was disconnected:
        </p>

        {/* Changes List with Deep Links */}
        <div className="space-y-2.5 max-h-72 overflow-y-auto">
          {offlineChanges.map((change, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">
                  {change.title}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 font-bold uppercase">
                  {change.category}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                {change.localized_message || change.message}
              </p>
              {change.action_url && (
                <button
                  type="button"
                  onClick={() => {
                    setShowOfflineSummary(false);
                    navigate(change.action_url);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline pt-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  {change.action_label || 'View Details'}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setShowOfflineSummary(false);
              setPanelOpen(true);
            }}
            className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all text-center"
          >
            Open All in Notification Center
          </button>
        </div>

      </div>
    </div>
  );
};
