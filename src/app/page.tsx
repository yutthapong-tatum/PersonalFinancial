'use client';

import React, { useEffect, useState } from 'react';
import { fetchPortfolioData } from '../services/googleSheets';
import { AssetItem, PortfolioSummary } from '../types/portfolio';
import { Header } from '../components/Header';
import { KPICards } from '../components/KPICards';
import { SparkRecommendations } from '../components/SparkRecommendations';
import { AssetAllocationCharts } from '../components/AssetAllocationCharts';
import { AssetTable } from '../components/AssetTable';
import { RebalanceModal } from '../components/RebalanceModal';
import { AlertCircle, RefreshCw, Sparkles, CheckCircle, ShieldCheck } from 'lucide-react';

export default function DashboardPage() {
  const [items, setItems] = useState<AssetItem[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRebalanceModalOpen, setIsRebalanceModalOpen] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchPortfolioData();
      setItems(data.items);
      setSummary(data.summary);
    } catch (err: any) {
      console.error('Failed to load portfolio data:', err);
      setError(err.message || 'Failed to fetch data from Google Sheet');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-sync from Google Sheets every 30 seconds
    const interval = setInterval(() => {
      loadData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 1. Header */}
      <Header
        lastUpdated={summary?.lastUpdated}
        onRefresh={loadData}
        isLoading={isLoading}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Notification Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-bold">Google Sheet Connection Warning</h3>
                <p className="text-xs text-rose-300 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              onClick={loadData}
              className="px-3 py-1.5 rounded-xl bg-rose-800 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Sync
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && !summary ? (
          <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-slate-900 rounded-2xl border border-slate-800" />
              ))}
            </div>
            <div className="h-80 bg-slate-900 rounded-2xl border border-slate-800" />
            <div className="h-96 bg-slate-900 rounded-2xl border border-slate-800" />
          </div>
        ) : summary ? (
          <>
            {/* 2. Executive KPI Cards */}
            <KPICards summary={summary} onRefresh={loadData} isLoading={isLoading} />

            {/* Spark AI Executive Recommendation Briefing */}
            <SparkRecommendations
              items={items}
              summary={summary}
              onOpenRebalanceModal={() => setIsRebalanceModalOpen(true)}
            />

            {/* 3. Interactive Asset Allocation Charts */}
            <AssetAllocationCharts items={items} />

            {/* 4. Live Portfolio Asset Inventory Table */}
            <AssetTable
              items={items}
              onOpenRebalanceModal={() => setIsRebalanceModalOpen(true)}
            />

            {/* 5. Rebalancing Summary Modal */}
            <RebalanceModal
              isOpen={isRebalanceModalOpen}
              onClose={() => setIsRebalanceModalOpen(false)}
              items={items}
              summary={summary}
            />
          </>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Single Source of Truth: Google Sheet "Investment Portfolio Tracker"</span>
          </p>
          <p>© {new Date().getFullYear()} Personal Financial & Investment Management System</p>
        </div>
      </footer>
    </div>
  );
}
