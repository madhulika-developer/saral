import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid
} from 'recharts';
import {
  FileText,
  Volume2,
  VolumeX,
  Printer,
  ChevronDown,
  ChevronUp,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Zap,
  Droplets,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

export const BillExplainer = () => {
  const { t, i18n } = useTranslation();
  const { currentUser, userData, utility, formatCurrency, formatNumber, formatDate, showToast } = useApp();

  const [billData, setBillData] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHowCalculated, setShowHowCalculated] = useState(false);
  const [isReadingAloud, setIsReadingAloud] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [billRes, explainRes] = await Promise.all([
          api.getBill(currentUser, utility),
          api.getBillExplanation(currentUser, utility, i18n.language)
        ]);
        setBillData(billRes);
        setExplanation(explainRes);
      } catch (err) {
        console.error('Error fetching billing data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, utility, i18n.language]);

  const currentBill = billData?.current_bill;
  const history = billData?.history || [];
  const breakdown = billData?.breakdown;
  const localizedStory = explanation?.localized_story;

  // Voice Read Aloud handler
  const handleReadAloud = () => {
    if (!window.speechSynthesis) {
      showToast('Speech synthesis not supported in this browser', 'error');
      return;
    }

    if (isReadingAloud) {
      window.speechSynthesis.cancel();
      setIsReadingAloud(false);
      return;
    }

    window.speechSynthesis.cancel();

    // Prepare text to read aloud
    let textToSpeak = '';
    if (localizedStory) {
      textToSpeak = `${localizedStory.headline}. ${localizedStory.summary}. ${localizedStory.reasons.join('. ')}. ${localizedStory.advice}`;
    } else if (explanation) {
      textToSpeak = `Your bill increased by ${formatCurrency(explanation.amount_diff)} compared to last month due to higher slab rates and increased daily consumption.`;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak.replace(/[*#>`_-]/g, ''));
    const langMap = {
      te: 'te-IN',
      hi: 'hi-IN',
      ta: 'ta-IN',
      kn: 'kn-IN',
      ml: 'ml-IN',
      mr: 'mr-IN',
      bn: 'bn-IN',
      gu: 'gu-IN',
      pa: 'pa-IN',
      ur: 'ur-IN',
      en: 'en-IN'
    };
    utterance.lang = langMap[i18n.language] || 'en-IN';

    utterance.onend = () => setIsReadingAloud(false);
    utterance.onerror = () => setIsReadingAloud(false);

    setIsReadingAloud(true);
    window.speechSynthesis.speak(utterance);
  };

  const handlePrint = () => {
    window.print();
  };

  // Prepare chart data
  const chartData = history.map((item) => ({
    month: item.month,
    units: item.units,
    amount: item.amount,
    isCurrent: item.month === currentBill?.month,
  }));

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-500">
        <div className="w-8 h-8 mx-auto border-3 border-teal-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 print:p-0 print:m-0">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${
              utility === 'electricity'
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600'
                : 'bg-sky-100 dark:bg-sky-950/60 text-sky-600'
            }`}>
              {utility === 'electricity' ? <Zap className="w-5 h-5" /> : <Droplets className="w-5 h-5" />}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {t('bills.title')}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('bills.subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Print / Download Button */}
        <div className="flex items-center gap-2 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            {t('bills.print_bill')}
          </button>
        </div>
      </div>

      {/* Hero: "Why is my bill higher?" Card (Computed in Python code) */}
      {explanation && (
        <div className="bg-gradient-to-br from-teal-900 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-teal-500/20 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                {t('bills.why_higher_title')}
              </div>

              {/* Localized Story Headline */}
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-snug">
                {localizedStory?.headline || `Your bill increased by ${formatCurrency(explanation.amount_diff)} (+${explanation.amount_pct_change}%)`}
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                {localizedStory?.summary || `You consumed ${explanation.current_units} units this month compared to ${explanation.previous_units} units last month.`}
              </p>

              {/* Ranked Reasons Breakdown */}
              <div className="space-y-2.5 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400 block">
                  Ranked Reasons by Rupee Impact:
                </span>
                {(localizedStory?.reasons || explanation.reasons).map((reason, idx) => {
                  const title = typeof reason === 'string' ? reason : reason.title;
                  const explanationText = typeof reason === 'string' ? '' : reason.explanation;
                  const impact = typeof reason === 'string' ? null : reason.rupee_impact;

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-teal-500/30 text-teal-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-100">{title}</span>
                          {impact && (
                            <span className="text-xs font-mono font-bold text-amber-400 shrink-0">
                              +{formatCurrency(impact)}
                            </span>
                          )}
                        </div>
                        {explanationText && (
                          <p className="text-xs text-slate-400 mt-1">{explanationText}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Plain language advice tip */}
              {localizedStory?.advice && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs">
                  <strong>💡 Tip for next month:</strong> {localizedStory.advice}
                </div>
              )}
            </div>

            {/* Read Aloud Button & Stats Box */}
            <div className="flex flex-col gap-4 shrink-0 sm:min-w-[260px] print:hidden">
              <button
                type="button"
                onClick={handleReadAloud}
                className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all shadow-lg ${
                  isReadingAloud
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-teal-500 hover:bg-teal-400 text-slate-950'
                }`}
              >
                {isReadingAloud ? (
                  <>
                    <VolumeX className="w-4 h-4" />
                    {t('bills.stop_reading')}
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    {t('bills.read_aloud')}
                  </>
                )}
              </button>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-3 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Current Bill:</span>
                  <span className="font-bold text-white font-mono text-sm">
                    {formatCurrency(explanation.current_amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Previous Bill:</span>
                  <span className="font-medium text-slate-300 font-mono">
                    {formatCurrency(explanation.previous_amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Consumption Change:</span>
                  <span className="font-bold text-amber-400 font-mono">
                    +{explanation.unit_diff} units (+{explanation.unit_pct_change}%)
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>6-Month Average:</span>
                  <span className="font-medium text-slate-300 font-mono">
                    {explanation.six_month_avg_units} units
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 6-Month Consumption Trend Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {t('bills.six_month_trend')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Current billing month highlighted in teal
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="w-3 h-3 rounded-sm bg-slate-300 dark:bg-slate-700" />
              Past Months
            </span>
            <span className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400 font-bold">
              <span className="w-3 h-3 rounded-sm bg-teal-500" />
              Current Month
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value, name) => [
                  name === 'units' ? `${value} units` : `₹${value}`,
                  name === 'units' ? 'Units' : 'Amount'
                ]}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="units" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isCurrent ? '#0d9488' : '#94a3b8'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Itemised Breakdown with Exact Reconciliation */}
      {breakdown && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {t('bills.slabs_title')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Itemised calculations computed according to telescopic tariff slabs
              </p>
            </div>

            {/* Reconciliation Proof Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              {t('bills.exact_reconciled')}
            </div>
          </div>

          {/* Slabs Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Tariff Slab</th>
                  <th className="px-4 py-3">Units Billed</th>
                  <th className="px-4 py-3">Tariff Rate</th>
                  <th className="px-4 py-3">Explicit Formula</th>
                  <th className="px-4 py-3 text-right rounded-r-xl">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200 font-medium">
                {breakdown.slab_breakdown.map((sb, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      {sb.slab_name}
                    </td>
                    <td className="px-4 py-3 font-mono">{sb.units}</td>
                    <td className="px-4 py-3 font-mono">₹{sb.rate.toFixed(2)}</td>
                    <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-400">
                      {sb.formula}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold">
                      {formatCurrency(sb.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Comprehensive Line Items Table */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              {t('bills.line_items_title')}
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-2.5 rounded-l-xl">Charge Category</th>
                    <th className="px-4 py-2.5">Item Name</th>
                    <th className="px-4 py-2.5">Computation Formula</th>
                    <th className="px-4 py-2.5 text-right rounded-r-xl">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200 font-medium">
                  {breakdown.line_items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-2.5 font-semibold text-teal-700 dark:text-teal-400">
                        {item.category}
                      </td>
                      <td className="px-4 py-2.5 text-slate-900 dark:text-white">
                        {item.name}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-slate-500 dark:text-slate-400">
                        {item.formula}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                  {/* Total Line */}
                  <tr className="bg-teal-50 dark:bg-teal-950/60 font-bold text-sm text-teal-950 dark:text-teal-100">
                    <td className="px-4 py-3 rounded-l-xl" colSpan={3}>
                      Total Payable Amount (Reconciled)
                    </td>
                    <td className="px-4 py-3 text-right font-mono rounded-r-xl text-base">
                      {formatCurrency(breakdown.total_amount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-slate-400 dark:text-slate-500 italic mt-2">
              * {breakdown.disclaimer}
            </p>
          </div>

        </div>
      )}

      {/* Expandable "How was this calculated?" accordion */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setShowHowCalculated(!showHowCalculated)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-teal-500" />
            {t('bills.how_calculated')}
          </span>
          {showHowCalculated ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {showHowCalculated && (
          <div className="px-6 pb-6 text-xs text-slate-600 dark:text-slate-300 space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4 leading-relaxed">
            <p>
              Under telescopic slab billing, consumption is divided into successive blocks (slabs).
              The first 50 units are charged at the subsidized lifeline rate (₹2.65/unit). The next 50 units (51–100) are charged at ₹3.35/unit, units 101–200 are charged at ₹5.40/unit, and units 201–300 enter Slab 4 at ₹7.10/unit.
            </p>
            <p>
              In addition to energy charges, the bill includes:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Fixed Monthly Demand Charge:</strong> Standard connected load charge of ₹40.00.</li>
              <li><strong>Electricity Duty:</strong> Statutory state duty of 6% applied to energy charges.</li>
              <li><strong>Fuel Surcharge Adjustment (FSA):</strong> ₹0.25 per unit approved by the regulatory commission.</li>
            </ul>
          </div>
        )}
      </div>

    </div>
  );
};
