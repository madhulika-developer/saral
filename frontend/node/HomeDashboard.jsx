import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import {
  Zap,
  Droplets,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  CreditCard,
  FileText,
  MessageSquare,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export const HomeDashboard = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const {
    currentUser,
    userData,
    utility,
    formatCurrency,
    formatNumber,
    formatDate,
    showToast
  } = useApp();

  const [billData, setBillData] = useState(null);
  const [paymentsData, setPaymentsData] = useState([]);
  const [activeOutage, setActiveOutage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const [billRes, paymentsRes, outagesRes] = await Promise.all([
          api.getBill(currentUser, utility).catch(() => null),
          api.getPayments(currentUser, i18n.language).catch(() => []),
          api.getOutages({ utility }).catch(() => [])
        ]);

        setBillData(billRes);
        setPaymentsData(paymentsRes || []);

        // Find if any outage matches user's locality
        if (userData?.locality && Array.isArray(outagesRes)) {
          const matching = outagesRes.find(
            o => o.locality.toLowerCase().includes(userData.locality.toLowerCase()) &&
                 o.status !== 'resolved'
          );
          setActiveOutage(matching || outagesRes[0] || null);
        } else {
          setActiveOutage(outagesRes?.[0] || null);
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [currentUser, utility, userData, i18n.language]);

  const currentBill = billData?.current_bill;
  const isPendingProcessing = paymentsData.some(p => p.state_category === 'money_deducted_unpaid');

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Top Welcome & Profile Card */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-teal-300 text-xs font-semibold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
              {userData?.city} • {userData?.locality}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              {t('dashboard.greeting')}, {userData?.name}!
            </h1>
            <p className="text-sm text-teal-100/90 mt-1 max-w-xl">
              {userData?.profile_summary}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-xs">
              <div className="text-teal-200/80 font-medium">{t('dashboard.consumer_no')}</div>
              <div className="font-mono font-bold text-sm tracking-wide mt-0.5">
                {userData?.consumer_numbers?.[utility] || 'APCPDCL-VJA-84920'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Outage Banner if disruption present */}
      {activeOutage && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-bold uppercase tracking-wider">
                  {activeOutage.type} Outage
                </span>
                <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                  {activeOutage.locality}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-1">
                {activeOutage.cause}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {activeOutage.reports_count} neighbours reported • Est. restoration: {formatDate(activeOutage.estimated_restoration)}
              </p>
            </div>
          </div>

          <Link
            to="/outages"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-colors shrink-0 shadow-sm"
          >
            {t('dashboard.view_outage')}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Main Grid: Current Bill Hero & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Current Bill Card (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${
                  utility === 'electricity'
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600'
                    : 'bg-sky-100 dark:bg-sky-950/60 text-sky-600'
                }`}>
                  {utility === 'electricity' ? <Zap className="w-5 h-5" /> : <Droplets className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="font-bold text-base text-slate-900 dark:text-white">
                    {currentBill?.month || 'June 2026'} {utility === 'electricity' ? t('app.electricity') : t('app.water')} Bill
                  </h2>
                  <p className="text-xs text-slate-500">
                    Billing cycle: {currentBill?.billing_period || '01 Jun 2026 - 30 Jun 2026'}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div>
                {isPendingProcessing ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    Payment In Transit (Safe)
                  </span>
                ) : currentBill?.status === 'paid' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Paid
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                    Due Soon
                  </span>
                )}
              </div>
            </div>

            {/* Bill Amount & Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-6">
              <div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  {t('dashboard.current_bill')}
                </span>
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {formatCurrency(currentBill?.amount || 1641)}
                </span>
                <div className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 font-semibold mt-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +97.5% vs previous month
                </div>
              </div>

              <div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  Consumption
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200">
                  {formatNumber(currentBill?.units || 285)}
                  <span className="text-sm font-normal text-slate-500 ml-1.5">
                    {utility === 'electricity' ? 'kWh units' : 'kL'}
                  </span>
                </span>
                <span className="text-xs text-slate-500 block mt-1">
                  Previous month: 175 units
                </span>
              </div>

              <div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  {t('dashboard.due_on')}
                </span>
                <span className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  {formatDate(currentBill?.due_date || '2026-07-15')}
                </span>
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium block mt-1">
                  5 days remaining
                </span>
              </div>
            </div>

            {/* Why it doubled highlight notice */}
            {currentUser === 'user_1' && utility === 'electricity' && (
              <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-900/60 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <div className="text-xs text-teal-950 dark:text-teal-200 space-y-1">
                  <span className="font-bold">Why did your bill double?</span>
                  <p className="text-slate-600 dark:text-slate-300">
                    You entered Slab 4 (₹7.10/unit) with 85 additional units due to 6-8 hrs daily summer AC usage.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
            <Link
              to="/bills"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white transition-colors shadow-md shadow-teal-600/20"
            >
              <FileText className="w-4 h-4" />
              {t('dashboard.view_breakdown')}
            </Link>

            {isPendingProcessing ? (
              <Link
                to="/payments"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/60 hover:bg-amber-200 transition-colors"
              >
                <Clock className="w-4 h-4" />
                Track Pending Payment
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => showToast('Redirecting to secure AP Online / VMC payment gateway...', 'info')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                {t('dashboard.pay_now')}
              </button>
            )}
          </div>
        </div>

        {/* Right Col: Quick Actions & Savings Insight */}
        <div className="space-y-6">
          
          {/* Quick Actions Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-slate-400">
              {t('dashboard.quick_actions')}
            </h3>

            <div className="space-y-2">
              <Link
                to="/bills"
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-teal-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold">{t('dashboard.action_explain')}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/payments"
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-teal-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold">{t('dashboard.action_payment')}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/outages"
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-teal-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold">{t('dashboard.action_report')}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/assistant"
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-teal-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold">{t('dashboard.action_chat')}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Energy / Water Saving Card */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm shrink-0">
                <Sparkles className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <h4 className="font-bold text-sm tracking-tight">
                  {t('dashboard.savings_card_title')}
                </h4>
                <p className="text-xs text-emerald-100/90 mt-1 leading-relaxed">
                  {t('dashboard.savings_card_desc')}
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
