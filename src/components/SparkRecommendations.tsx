'use client';

import React from 'react';
import { AssetItem, PortfolioSummary } from '../types/portfolio';
import { Sparkles, ArrowRight, ShieldAlert, CheckCircle2, TrendingUp, AlertCircle, RefreshCw, Zap, Repeat, FileCheck, Scale } from 'lucide-react';

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

  const switchCandidates = items.filter((i) => i.switchTarget);

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
    <div className="bg-gradient-to-br from-indigo-900/40 via-slate-900 to-purple-900/30 rounded-2xl p-6 shadow-xl border border-indigo-500/30 mb-8 backdrop-blur-md relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-indigo-500/20">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-400 to-indigo-500 text-slate-950 font-black shadow-lg shadow-amber-500/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-tight">
                Spark Executive Rebalance Briefing
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
              <span>วิเคราะห์สดทุกสินทรัพย์แบบเจาะลึก 100% พร้อมที่มาที่ไปและกฎหมายภาษี</span>
              <span className="text-indigo-400 font-semibold">• อัปเดตล่าสุด: {summary.lastUpdated}</span>
            </p>
          </div>
        </div>

        <button
          onClick={onOpenRebalanceModal}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 self-start md:self-auto hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>ดูคำอธิบายและเหตุผลเจาะลึกแบบเต็ม</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Key Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Top BUY Priority */}
        <div className="bg-slate-900/80 rounded-xl p-4 border border-emerald-500/40 hover:border-emerald-400 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                1. สินทรัพย์ที่ควรซื้อเพิ่ม (BUY)
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {buyItems.length} รายการ
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              พอร์ตยังขาดน้ำหนักใน <strong className="text-white">Foreign ETFs (VOO, QQQM)</strong> และ <strong className="text-white">Crypto (BTC)</strong> ต่ำกว่าเป้าหมาย
            </p>

            <div className="space-y-1.5 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              {buyItems.slice(0, 3).map((item) => {
                const targetVal = (item.targetWeight / 100) * summary.totalMarketValue;
                const buyAmount = Math.max(0, targetVal - item.marketValue);

                return (
                  <div key={item.id} className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">{item.assetName}</span>
                    <span className="font-black text-emerald-400">
                      +{formatTHB(buyAmount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 text-[11px] text-emerald-300/90 font-semibold flex items-center gap-1">
            <span>💡 เหตุผล: เติมน้ำหนักส่วนขาดเพื่อ Rebalance ให้ตรง Target %</span>
          </div>
        </div>

        {/* Card 2: Top SELL Priority */}
        <div className="bg-slate-900/80 rounded-xl p-4 border border-rose-500/40 hover:border-rose-400 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                2. สินทรัพย์ที่ควรกระชับ (TRIM / SELL)
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {sellItems.length} รายการ
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              สินทรัพย์ที่มีสัดส่วนล้นพอร์ตเกินเป้าหมาย เช่น <strong className="text-white">SGOV (Short Treasury ETF)</strong> ถืออยู่ 3.60% (เป้าหมาย 1.00%)
            </p>

            <div className="space-y-1.5 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              {sellItems.length > 0 ? (
                sellItems.slice(0, 3).map((item) => {
                  const targetVal = (item.targetWeight / 100) * summary.totalMarketValue;
                  const sellAmount = Math.max(0, item.marketValue - targetVal);

                  return (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200">{item.assetName}</span>
                      <span className="font-black text-rose-400">
                        -{formatTHB(sellAmount)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-slate-400 py-1">ไม่มีสินทรัพย์ที่ต้องขายออกในรอบนี้</div>
              )}
            </div>
          </div>

          <div className="mt-3 text-[11px] text-rose-300/90 font-semibold flex items-center gap-1">
            <span>💡 เหตุผล: ดึงเงินทุนจากส่วนเกินไปเติมสินทรัพย์ส่วนที่ขาด</span>
          </div>
        </div>

        {/* Card 3: Tax Fund Switching & Protection */}
        <div className="bg-slate-900/80 rounded-xl p-4 border border-amber-500/40 hover:border-amber-400 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Repeat className="w-4 h-4" />
                3. สับเปลี่ยนกองทุนภาษี (FUND SWITCHING)
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {taxLockedCount} รายการ
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              กองทุนกลุ่ม <strong className="text-white">PVD, SSF, RMF, ThaiESG</strong> ห้ามขายเป็นเงินสด แต่อนุญาตให้ <strong className="text-amber-300">สับเปลี่ยนกองทุน (Fund Switching)</strong> ได้ 100%
            </p>

            <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/50 text-[11px] text-amber-200 font-semibold leading-normal space-y-1">
              <div className="flex items-center gap-1 text-amber-300 font-black">
                <Scale className="w-3.5 h-3.5" />
                <span>ถูกต้องตามกฎหมายภาษีสรรพากร:</span>
              </div>
              <p className="text-slate-300 font-medium">
                แนะนำสับเปลี่ยนกองทุน RMF/SSF/ThaiESG ที่ชะลอตัว ไปยังกองทุนดัชนีสหรัฐฯ หรือหุ้นเติบโตในกลุ่มภาษีเดียวกัน โดยไม่เสียสิทธิประโยชน์ภาษี
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11px] text-amber-300/90 font-black flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5" />
              พร้อมวิเคราะห์แนวทางสับเปลี่ยนรายตัว
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
