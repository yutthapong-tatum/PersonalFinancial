'use client';

import React from 'react';
import { AssetItem, PortfolioSummary } from '../types/portfolio';
import { SPARK_MARKET_RESEARCH, SPARK_NEW_ASSETS } from '../services/googleSheets';
import {
  Sparkles,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Zap,
  Repeat,
  FileCheck,
  Scale,
  Newspaper,
  PlusCircle,
  ExternalLink,
  Coins,
} from 'lucide-react';

interface SparkRecommendationsProps {
  items: AssetItem[];
  summary: PortfolioSummary;
  onOpenRebalanceModal: () => void;
}

export const SparkRecommendations: React.FC<SparkRecommendationsProps> = ({
  items,
  summary,
  onOpenRebalanceModal,
}) => {
  const buyItems = items
    .filter((i) => i.rebalanceAction.toLowerCase().includes('buy'))
    .sort((a, b) => a.weightVariance - b.weightVariance);

  const sellItems = items
    .filter((i) => i.rebalanceAction.toLowerCase().includes('sell'))
    .sort((a, b) => b.weightVariance - a.weightVariance);

  const taxLockedCount = items.filter(
    (i) => i.userConstraint?.includes('Tax Lock') || i.userConstraint?.includes('ห้ามขาย')
  ).length;

  const formatTHB = (val: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900/50 via-slate-900 to-purple-900/40 rounded-2xl p-6 shadow-xl border border-indigo-500/30 mb-8 backdrop-blur-md relative overflow-hidden space-y-6">
      {/* Background Accent Glow */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-indigo-500/20">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-400 to-indigo-500 text-slate-950 font-black shadow-lg shadow-amber-500/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-tight">
                Spark Executive Rebalance Briefing (Morning Run)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-300" />
                AI Key Takeaways
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                📅 รอบวิเคราะห์: {summary.lastUpdated}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-2">
              <span>รายงานวิเคราะห์และแนะนำจัดพอร์ตเสมือนจริงตรงตามผลประมวลผลจาก Spark 100%</span>
              <span className="text-indigo-400 font-semibold">• FX Rate: ฿{summary.fxRateUSDTHB.toFixed(2)} USD/THB</span>
            </p>
          </div>
        </div>

        <button
          onClick={onOpenRebalanceModal}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 self-start md:self-auto hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>ดูตารางคำแนะนำรายตัวแบบละเอียด</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Key Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: All BUY Priority Items */}
        <div className="bg-slate-900/80 rounded-xl p-4 border border-emerald-500/40 hover:border-emerald-400 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                1. สินทรัพย์แนะนำซื้อเพิ่ม (BUY)
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {buyItems.length} รายการ
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Spark แนะนำสะสมในสินทรัพย์กลุ่มที่มีสัดส่วนต่ำกว่าเป้าหมาย
            </p>

            <div className="space-y-1.5 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 max-h-[180px] overflow-y-auto custom-scrollbar">
              {buyItems.map((item) => {
                const targetVal = (item.targetWeight / 100) * summary.totalMarketValue;
                const amount = item.recommendedAmountTHB ?? Math.max(0, targetVal - item.marketValue);
                return (
                  <div key={item.id} className="flex items-center justify-between text-xs py-0.5 border-b border-slate-900/60 last:border-0">
                    <div className="flex items-center gap-1 truncate max-w-[170px]">
                      <span className="font-bold text-slate-200 truncate">{item.assetName}</span>
                      {item.recommendedUnitsStr && (
                        <span className="text-[10px] text-slate-400 font-normal flex-shrink-0">({item.recommendedUnitsStr})</span>
                      )}
                    </div>
                    <span className="font-black text-emerald-400 flex-shrink-0">
                      +{formatTHB(amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 text-[11px] text-emerald-300/90 font-semibold flex items-center gap-1">
            <span>💡 แสดงครบทั้ง {buyItems.length} รายการตรงตาม Badge</span>
          </div>
        </div>

        {/* Card 2: All SELL Priority Items */}
        <div className="bg-slate-900/80 rounded-xl p-4 border border-rose-500/40 hover:border-rose-400 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                2. สินทรัพย์แนะนำขายกระชับ (SELL)
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {sellItems.length} รายการ
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Spark แนะนำปรับลดสินทรัพย์ที่มีสัดส่วนล้นพอร์ตเกินเป้าหมาย
            </p>

            <div className="space-y-1.5 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 max-h-[180px] overflow-y-auto custom-scrollbar">
              {sellItems.map((item) => {
                const targetVal = (item.targetWeight / 100) * summary.totalMarketValue;
                const amount = item.recommendedAmountTHB ?? Math.max(0, item.marketValue - targetVal);
                return (
                  <div key={item.id} className="flex items-center justify-between text-xs py-0.5 border-b border-slate-900/60 last:border-0">
                    <div className="flex items-center gap-1 truncate max-w-[170px]">
                      <span className="font-bold text-slate-200 truncate">{item.assetName}</span>
                      {item.recommendedUnitsStr && (
                        <span className="text-[10px] text-slate-400 font-normal flex-shrink-0">({item.recommendedUnitsStr})</span>
                      )}
                    </div>
                    <span className="font-black text-rose-400 flex-shrink-0">
                      -{formatTHB(amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 text-[11px] text-rose-300/90 font-semibold flex items-center gap-1">
            <span>💡 แสดงครบทั้ง {sellItems.length} รายการตรงตาม Badge</span>
          </div>
        </div>

        {/* Card 3: New Asset & Tax Protection */}
        <div className="bg-slate-900/80 rounded-xl p-4 border border-amber-500/40 hover:border-amber-400 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4" />
                3. สินทรัพย์ใหม่แนะนำ (NEW ASSET)
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                1 สินทรัพย์
              </span>
            </div>

            <div className="space-y-2">
              {SPARK_NEW_ASSETS.map((asset, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/50 text-xs space-y-1">
                  <div className="flex items-center justify-between font-black text-amber-300">
                    <span>{asset.assetName}</span>
                    <span>+{formatTHB(asset.recommendedAmountTHB)}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium leading-normal">
                    {asset.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11px] text-amber-300/90 font-black flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5" />
              อ้างอิงบทวิเคราะห์ Yuanta Securities
            </span>
          </div>
        </div>
      </div>

      {/* Market & Research Highlights Banner */}
      <div className="bg-slate-950/70 rounded-xl p-4 border border-indigo-500/20 space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-indigo-400" />
          สรุปภาวะตลาดและบทวิเคราะห์อ้างอิงของ Spark (Market & Research Highlights)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SPARK_MARKET_RESEARCH.map((res, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1 text-xs">
              <div className="font-extrabold text-white flex items-center justify-between">
                <span>{res.title}</span>
                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-[11px] text-slate-400 font-medium leading-normal">
                {res.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
