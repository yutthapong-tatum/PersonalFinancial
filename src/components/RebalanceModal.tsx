'use client';

import React from 'react';
import { AssetItem, PortfolioSummary } from '../types/portfolio';
import { X, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Lock, RefreshCw } from 'lucide-react';

interface RebalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: AssetItem[];
  summary: PortfolioSummary;
}

export const RebalanceModal: React.FC<RebalanceModalProps> = ({
  isOpen,
  onClose,
  items,
  summary,
}) => {
  if (!isOpen) return null;

  // Filter items that need action (Buy or Sell recommendations)
  const actionItems = items.filter(
    (item) =>
      item.rebalanceAction.toLowerCase().includes('buy') ||
      item.rebalanceAction.toLowerCase().includes('sell')
  );

  const buyItems = actionItems.filter((i) => i.rebalanceAction.toLowerCase().includes('buy'));
  const sellItems = actionItems.filter((i) => i.rebalanceAction.toLowerCase().includes('sell'));

  const formatTHB = (val: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Portfolio Rebalancing Strategy & Action Summary
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Step-by-step recommendations based on target weight variances
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* Executive Overview Banner */}
          <div className="bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                Total Portfolio Value
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {formatTHB(summary.totalMarketValue)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {buyItems.length} BUY Actions
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300 text-xs font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                {sellItems.length} SELL Actions
              </div>
            </div>
          </div>

          {/* Action Step 1: BUY Recommendations */}
          {buyItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#0F5132] dark:text-emerald-400 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#D1E7DD] dark:bg-[#0F5132]/40 text-[#0F5132] dark:text-emerald-300 text-xs flex items-center justify-center font-bold">
                  1
                </span>
                Recommended Asset Additions (Underweight Assets to BUY)
              </h3>

              <div className="space-y-2">
                {buyItems.map((item) => {
                  const targetVal = (item.targetWeight / 100) * summary.totalMarketValue;
                  const addAmount = Math.max(0, targetVal - item.marketValue);

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-[#D1E7DD]/30 dark:bg-[#0F5132]/10 border border-[#0F5132]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{item.assetName}</span>
                          <span className="text-xs px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border">
                            {item.broker}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          Current Weight: <span className="font-semibold">{item.currentWeight.toFixed(2)}%</span> → Target:{' '}
                          <span className="font-semibold">{item.targetWeight.toFixed(2)}%</span> (Variance:{' '}
                          <span className="text-emerald-600 font-bold">{item.weightVariance.toFixed(2)}%</span>)
                        </p>
                      </div>

                      <div className="text-right self-end sm:self-auto">
                        <span className="text-xs font-bold text-[#0F5132] dark:text-emerald-400 block uppercase">
                          Estimated Buy Amount
                        </span>
                        <span className="text-lg font-black text-[#0F5132] dark:text-emerald-300">
                          +{formatTHB(addAmount)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Step 2: SELL Recommendations */}
          {sellItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#842029] dark:text-rose-400 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#F8D7DA] dark:bg-[#842029]/40 text-[#842029] dark:text-rose-300 text-xs flex items-center justify-center font-bold">
                  2
                </span>
                Recommended Asset Trimming (Overweight Assets to SELL)
              </h3>

              <div className="space-y-2">
                {sellItems.map((item) => {
                  const targetVal = (item.targetWeight / 100) * summary.totalMarketValue;
                  const sellAmount = Math.max(0, item.marketValue - targetVal);

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-[#F8D7DA]/30 dark:bg-[#842029]/10 border border-[#842029]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{item.assetName}</span>
                          <span className="text-xs px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border">
                            {item.broker}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          Current Weight: <span className="font-semibold">{item.currentWeight.toFixed(2)}%</span> → Target:{' '}
                          <span className="font-semibold">{item.targetWeight.toFixed(2)}%</span> (Variance:{' '}
                          <span className="text-rose-600 font-bold">+{item.weightVariance.toFixed(2)}%</span>)
                        </p>
                      </div>

                      <div className="text-right self-end sm:self-auto">
                        <span className="text-xs font-bold text-[#842029] dark:text-rose-400 block uppercase">
                          Estimated Trim Amount
                        </span>
                        <span className="text-lg font-black text-[#842029] dark:text-rose-300">
                          -{formatTHB(sellAmount)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* User Constraints Note */}
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-300 space-y-1">
              <span className="font-bold block">Tax-Locked & Protected Assets Notice</span>
              <p>
                Certain assets like <strong>SSFs, RMFs, ThaiESGs, PVDs, Life Insurance, and Bonds</strong> carry tax lock conditions or hold-to-maturity preferences. Rebalance recommendations prioritize non-locked assets to prevent tax penalties.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
          >
            Close Summary
          </button>
        </div>
      </div>
    </div>
  );
};
