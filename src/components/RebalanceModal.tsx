'use client';

import React from 'react';
import { AssetItem, PortfolioSummary } from '../types/portfolio';
import { X, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Lock, RefreshCw, Repeat, FileText, Info } from 'lucide-react';

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

  const buyItems = items.filter((i) => i.rebalanceAction.toLowerCase().includes('buy'));
  const sellItems = items.filter((i) => i.rebalanceAction.toLowerCase().includes('sell'));
  const taxItems = items.filter(
    (i) => i.userConstraint?.includes('Tax Lock') || i.userConstraint?.includes('ห้ามขาย') || i.assetClass.includes('Tax-Saving')
  );

  const formatTHB = (val: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                คำแนะนำและเหตุผลเจาะลึกแบบรายละเอียด (Columns O & P Integration)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                วิเคราะห์สดจาก Google Sheet ทุกสินทรัพย์ ไม่ละเว้น พร้อมแนวทางสับเปลี่ยนกองทุนภาษีถูกต้องตามกฎหมาย
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
          <div className="bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                Total Portfolio Value (มูลค่ารวมสดจาก Google Sheet)
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {formatTHB(summary.totalMarketValue)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 text-xs font-black flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {buyItems.length} BUY
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300 text-xs font-black flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                {sellItems.length} SELL
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-300 text-xs font-black flex items-center gap-1.5">
                <Repeat className="w-4 h-4" />
                {taxItems.length} Tax Locked
              </div>
            </div>
          </div>

          {/* Action Step 1: BUY Recommendations */}
          {buyItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-black text-[#0F5132] dark:text-emerald-400 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#D1E7DD] dark:bg-[#0F5132]/50 text-[#0F5132] dark:text-emerald-300 text-xs flex items-center justify-center font-black">
                  1
                </span>
                รายการที่แนะนำให้ซื้อเพิ่ม (BUY Actions) - พร้อมยอดแนะนำ Column O & เหตุผล Column P
              </h3>

              <div className="space-y-3">
                {buyItems.map((item) => {
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-[#D1E7DD]/40 dark:bg-[#0F5132]/15 border border-[#0F5132]/30 space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <span className="text-base">{item.assetName}</span>
                          <span className="text-xs px-2.5 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border">
                            {item.broker}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-black text-[#0F5132] dark:text-emerald-400 block uppercase">
                            ยอดเงินซื้อเพิ่มที่แนะนำ (Column O)
                          </span>
                          <span className="text-lg font-black text-[#0F5132] dark:text-emerald-300">
                            {item.suggestedActionAmount || '+BUY'}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/60 text-xs text-slate-700 dark:text-slate-300 border border-[#0F5132]/20 font-medium space-y-1">
                        <div className="font-extrabold text-[#0F5132] dark:text-emerald-300 flex items-center gap-1">
                          <Info className="w-3.5 h-3.5" />
                          เหตุผลประกอบคำแนะนำ (Column P):
                        </div>
                        <p>{item.recommendationRationale}</p>
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
              <h3 className="text-sm font-black text-[#842029] dark:text-rose-400 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#F8D7DA] dark:bg-[#842029]/50 text-[#842029] dark:text-rose-300 text-xs flex items-center justify-center font-black">
                  2
                </span>
                รายการที่แนะนำให้ทยอยขายกระชับสัดส่วน (SELL Actions) - พร้อมยอดแนะนำ Column O & เหตุผล Column P
              </h3>

              <div className="space-y-3">
                {sellItems.map((item) => {
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-[#F8D7DA]/40 dark:bg-[#842029]/15 border border-[#842029]/30 space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <span className="text-base">{item.assetName}</span>
                          <span className="text-xs px-2.5 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border">
                            {item.broker}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-black text-[#842029] dark:text-rose-400 block uppercase">
                            ยอดเงินขายออกที่แนะนำ (Column O)
                          </span>
                          <span className="text-lg font-black text-[#842029] dark:text-rose-300">
                            {item.suggestedActionAmount || '-SELL'}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/60 text-xs text-slate-700 dark:text-slate-300 border border-[#842029]/20 font-medium space-y-1">
                        <div className="font-extrabold text-[#842029] dark:text-rose-300 flex items-center gap-1">
                          <Info className="w-3.5 h-3.5" />
                          เหตุผลประกอบคำแนะนำ (Column P):
                        </div>
                        <p>{item.recommendationRationale}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Step 3: TAX FUND SWITCHING Strategy */}
          {taxItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-black text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300 text-xs flex items-center justify-center font-black">
                  3
                </span>
                แนวทางการสับเปลี่ยนกองทุนลดหย่อนภาษี (TAX FUND SWITCHING STRATEGY)
              </h3>

              <div className="space-y-2">
                {taxItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 space-y-1.5"
                  >
                    <div className="flex items-center justify-between font-extrabold text-xs text-slate-900 dark:text-white">
                      <span className="flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-amber-600" />
                        {item.assetName} ({item.broker})
                      </span>
                      <span className="text-amber-700 dark:text-amber-400 font-black">
                        {item.userConstraint || 'Tax Lock'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                      {item.recommendationRationale}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
          >
            ปิดหน้าต่างสรุปเหตุผล
          </button>
        </div>
      </div>
    </div>
  );
};
