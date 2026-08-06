'use client';

import React from 'react';
import { PortfolioSummary } from '../types/portfolio';
import { TrendingUp, TrendingDown, DollarSign, Wallet, PieChart, RefreshCw } from 'lucide-react';

interface KPICardsProps {
  summary: PortfolioSummary;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const KPICards: React.FC<KPICardsProps> = ({ summary, onRefresh, isLoading }) => {
  const isProfit = summary.netPnLAmount >= 0;

  const formatTHB = (val: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 2,
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Total Cost */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-700/80 hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Total Investment Cost
          </span>
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          {formatTHB(summary.totalCost)}
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 flex items-center gap-1">
          <span>Total capital deployed across {summary.assetCount} assets</span>
        </p>
      </div>

      {/* 2. Current Market Value */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-700/80 hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Current Market Value
          </span>
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
            <PieChart className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          {formatTHB(summary.totalMarketValue)}
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
          Live value synced from Google Sheet
        </p>
      </div>

      {/* 3. Net Unrealized P&L */}
      <div
        className={`rounded-2xl p-5 shadow-sm border-2 transition-all ${
          isProfit
            ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-700/80'
            : 'bg-rose-50 dark:bg-rose-950/70 border-rose-300 dark:border-rose-700/80'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span
            className={`text-sm font-bold tracking-wide ${
              isProfit
                ? 'text-emerald-900 dark:text-emerald-200'
                : 'text-rose-900 dark:text-rose-200'
            }`}
          >
            Net Unrealized P&L
          </span>
          <div
            className={`p-2.5 rounded-xl ${
              isProfit
                ? 'bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
                : 'bg-rose-200/60 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200'
            }`}
          >
            {isProfit ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          </div>
        </div>

        <div
          className={`text-2xl sm:text-3xl font-black tracking-tight ${
            isProfit ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'
          }`}
        >
          {isProfit ? '+' : ''}
          {formatTHB(summary.netPnLAmount)}
        </div>

        <div className="flex items-center gap-2 mt-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black shadow-xs ${
              isProfit
                ? 'bg-emerald-600 dark:bg-emerald-500 text-white'
                : 'bg-rose-600 dark:bg-rose-500 text-white'
            }`}
          >
            {isProfit ? '+' : ''}
            {summary.netPnLPercent.toFixed(2)}%
          </span>
          <span
            className={`text-xs font-semibold ${
              isProfit
                ? 'text-emerald-800 dark:text-emerald-300'
                : 'text-rose-800 dark:text-rose-300'
            }`}
          >
            Total Return
          </span>
        </div>
      </div>

      {/* 4. Reference USD/THB FX Rate */}
      <div className="bg-slate-900/90 dark:bg-slate-800 rounded-2xl p-5 shadow-sm border-2 border-indigo-500/40 dark:border-indigo-500/50 hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-indigo-300 dark:text-indigo-200">
            Reference FX Rate
          </span>
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 dark:text-indigo-300">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          ฿{summary.fxRateUSDTHB.toFixed(2)}{' '}
          <span className="text-sm font-semibold text-indigo-300/80">USD/THB</span>
        </div>
        <div className="flex items-center justify-between mt-2 pt-1 border-t border-indigo-500/20">
          <span className="text-[11px] font-medium text-slate-300 dark:text-slate-300 truncate max-w-[170px]" title={`ข้อมูลรอบ: ${summary.lastUpdated}`}>
            ข้อมูลรอบ: {summary.lastUpdated}
          </span>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 disabled:opacity-50 flex-shrink-0"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
