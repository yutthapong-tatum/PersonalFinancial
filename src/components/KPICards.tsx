'use client';

import React from 'react';
import { PortfolioSummary } from '../types/portfolio';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  PieChart,
  RefreshCw,
  Coins,
  Activity,
  Globe,
  Layers,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

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
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-700/80 hover:shadow-md transition-all relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-blue-500" />
            Total Cost Basis
          </span>
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {formatTHB(summary.totalCost)}
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1 font-semibold">
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            {summary.assetCount} Assets Holdings
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 font-bold">
            THB Capital
          </span>
        </div>
      </div>

      {/* 2. Current Market Value */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-700/80 hover:shadow-md transition-all relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-indigo-500" />
            Market Net Valuation
          </span>
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
            <PieChart className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {formatTHB(summary.totalMarketValue)}
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Live Sync Verified
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 font-bold">
            Real-Time
          </span>
        </div>
      </div>

      {/* 3. Net Unrealized P&L */}
      <div
        className={`rounded-2xl p-5 shadow-sm border-2 transition-all relative overflow-hidden group ${
          isProfit
            ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-700/80'
            : 'bg-rose-50 dark:bg-rose-950/70 border-rose-300 dark:border-rose-700/80'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span
            className={`text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${
              isProfit
                ? 'text-emerald-900 dark:text-emerald-200'
                : 'text-rose-900 dark:text-rose-200'
            }`}
          >
            {isProfit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            Net Unrealized P&L
          </span>
          <div
            className={`p-2.5 rounded-xl group-hover:scale-110 transition-transform ${
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

        <div className="mt-2.5 pt-2 border-t border-emerald-200/60 dark:border-rose-900/40 flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black shadow-xs ${
              isProfit
                ? 'bg-emerald-600 dark:bg-emerald-500 text-white'
                : 'bg-rose-600 dark:bg-rose-500 text-white'
            }`}
          >
            {isProfit ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {isProfit ? '+' : ''}
            {summary.netPnLPercent.toFixed(2)}%
          </span>
          <span
            className={`text-xs font-extrabold ${
              isProfit
                ? 'text-emerald-900 dark:text-emerald-200'
                : 'text-rose-900 dark:text-rose-200'
            }`}
          >
            Total Return
          </span>
        </div>
      </div>

      {/* 4. Reference USD/THB FX Rate */}
      <div className="bg-slate-900/95 dark:bg-slate-800 rounded-2xl p-5 shadow-sm border-2 border-indigo-500/40 dark:border-indigo-500/50 hover:shadow-md transition-all group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-300 dark:text-indigo-200 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-indigo-400" />
            FX Benchmark (USD/THB)
          </span>
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 dark:text-indigo-300 group-hover:scale-110 transition-transform">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          ฿{summary.fxRateUSDTHB.toFixed(2)}{' '}
          <span className="text-sm font-bold text-indigo-300/80">USD/THB</span>
        </div>
        <div className="mt-2.5 pt-2 border-t border-indigo-500/20 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1 truncate max-w-[170px]" title={`ข้อมูลรอบ: ${summary.lastUpdated}`}>
            <Clock className="w-3 h-3 text-indigo-400 flex-shrink-0" />
            {summary.lastUpdated}
          </span>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="text-xs font-black text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 disabled:opacity-50 flex-shrink-0"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              Sync
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
