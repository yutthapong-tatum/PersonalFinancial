'use client';

import React from 'react';
import {
  PieChart,
  RefreshCw,
  FileSpreadsheet,
  ExternalLink,
  Zap,
} from 'lucide-react';

interface HeaderProps {
  lastUpdated?: string;
  onRefresh: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({ lastUpdated, onRefresh, isLoading }) => {
  const SHEET_URL =
    'https://docs.google.com/spreadsheets/d/1QEhVslOnEBrgdxZLa9v5tyTdBhlaPE-6ABN5sME5ZNA/edit';

  return (
    <header className="bg-[#2C3E50] text-white border-b border-slate-700/80 sticky top-0 z-40 backdrop-blur-md shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <PieChart className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-white">
                  Investment Portfolio Tracker
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  Live SSOT Sync
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-2">
                <span>Single Source of Truth: Google Sheet</span>
                <span className="text-slate-400">•</span>
                <a
                  href={SHEET_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-300 hover:text-white inline-flex items-center gap-1 hover:underline font-semibold"
                >
                  <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
                  Open Google Sheet
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            <div className="hidden sm:block text-right pr-2">
              <span className="text-[11px] text-slate-300 block font-semibold">Status: Connected Live</span>
              <span className="text-[10px] text-slate-400 font-mono">
                {lastUpdated ? `Last Sync: ${lastUpdated}` : 'Syncing...'}
              </span>
            </div>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs transition-all shadow-md shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Syncing...' : 'Sync Live Data'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
