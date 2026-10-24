import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  FileText,
  Building2,
  Calendar,
  ExternalLink
} from 'lucide-react';

export const PaymentTracker = () => {
  const { t, i18n } = useTranslation();
  const { currentUser, userData, formatCurrency, formatDate, formatTime, showToast } = useApp();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedPaymentId, setCopiedPaymentId] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const res = await api.getPayments(currentUser, i18n.language);
        setPayments(res || []);
      } catch (err) {
        console.error('Error fetching payments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [currentUser, i18n.language]);

  const handleCopyComplaint = (payment) => {
    const draft = payment.complaint_draft;
    const textToCopy = draft?.body || (
      `Grievance for Consumer #${payment.consumer_number}\n` +
      `Amount: ₹${payment.amount}\n` +
      `UPI Ref: ${payment.upi_ref}\n` +
      `Gateway Txn: ${payment.transaction_ref}\n` +
      `Payment debited from bank account on ${payment.date} but not reflected on utility account. Kindly reconcile.`
    );

    navigator.clipboard.writeText(textToCopy);
    setCopiedPaymentId(payment.payment_id);
    showToast(t('payments.complaint_copied'), 'success');
    setTimeout(() => setCopiedPaymentId(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-teal-600" />
          {t('payments.title')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {t('payments.subtitle')}
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500">
          <div className="w-8 h-8 mx-auto border-3 border-teal-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm">{t('common.loading')}</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center text-slate-500">
          No payment history found.
        </div>
      ) : (
        <div className="space-y-6">
          {payments.map((p) => {
            const isUncertain = p.state_category === 'money_deducted_unpaid';
            const isSuccess = p.state_category === 'completed';
            const isFailed = p.state_category === 'failed_refunded';

            return (
              <div
                key={p.payment_id}
                className={`bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border shadow-sm transition-all ${
                  isUncertain
                    ? 'border-amber-300 dark:border-amber-700/80 bg-amber-50/20 dark:bg-amber-950/10'
                    : isFailed
                    ? 'border-rose-200 dark:border-rose-900/50'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                        {p.payment_id}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Consumer #{p.consumer_number}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        {p.method}
                      </span>
                      {p.upi_ref && (
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {p.upi_ref}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Badge & Amount */}
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Amount</span>
                      <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white">
                        {formatCurrency(p.amount)}
                      </span>
                    </div>

                    <div>
                      {isSuccess && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          {t('payments.status_completed')}
                        </span>
                      )}
                      {isUncertain && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 animate-pulse">
                          <Clock className="w-4 h-4 text-amber-600" />
                          {t('payments.status_processing')}
                        </span>
                      )}
                      {isFailed && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300">
                          <AlertTriangle className="w-4 h-4 text-rose-500" />
                          {t('payments.status_failed')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Vertical Timeline per Payment */}
                <div className="my-6 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {t('payments.timeline_title')}
                  </h4>

                  <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                    {p.stages.map((stage, sIdx) => {
                      const isCompleted = stage.completed;
                      const isPendingCurrent = !isCompleted && isUncertain && sIdx === 3;

                      return (
                        <div key={sIdx} className="relative group">
                          {/* Circle marker */}
                          <div
                            className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                              isCompleted
                                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                                : isPendingCurrent
                                ? 'bg-amber-500 text-white animate-ping'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                            }`}
                          >
                            {isCompleted ? (
                              <Check className="w-3 h-3 stroke-[3]" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span
                                className={`text-xs font-bold ${
                                  isCompleted
                                    ? 'text-slate-900 dark:text-white'
                                    : isPendingCurrent
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-slate-400'
                                }`}
                              >
                                {stage.name}
                              </span>
                              {stage.timestamp && (
                                <span className="text-[11px] font-mono text-slate-400">
                                  {formatDate(stage.timestamp)} • {formatTime(stage.timestamp)}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                              {stage.detail}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Localized Guidance Box for Uncertain or Delayed Transactions */}
                {isUncertain && (
                  <div className="mt-6 p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-3">
                    <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      {p.localized_guidance?.title || p.explanation?.status_title || t('payments.what_happening_title')}
                    </div>

                    <p className="text-xs text-amber-950 dark:text-amber-100 leading-relaxed font-normal">
                      {p.localized_guidance?.explanation || p.explanation?.summary}
                    </p>

                    <div className="p-3 rounded-xl bg-amber-100/60 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 text-xs font-semibold">
                      ⚠️ {p.localized_guidance?.do_not_repay || t('payments.do_not_repay')}
                    </div>

                    {/* Copy Complaint Button */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-[11px] text-amber-700 dark:text-amber-300">
                        {p.localized_guidance?.complaint_ready || "If not updated by deadline, use one-click complaint draft."}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleCopyComplaint(p)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-colors shadow-sm"
                      >
                        {copiedPaymentId === p.payment_id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            {t('payments.complaint_copied')}
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            {t('payments.copy_complaint')}
                          </>
                        )}
                      </button>
                    </div>
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
