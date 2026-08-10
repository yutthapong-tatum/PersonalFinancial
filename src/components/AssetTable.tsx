'use client';

import React, { useState, useMemo } from 'react';
import { AssetItem } from '../types/portfolio';
import {
  Search,
  ArrowUpDown,
  Lock,
  Layers,
  Building,
  Globe,
  Briefcase,
  HeartHandshake,
  Shield,
  Coins,
  Zap,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  ShoppingCart,
  Scissors,
  Landmark,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronUp,
  Info,
  Repeat,
  Tag,
  DollarSign,
  FileText,
} from 'lucide-react';

interface AssetTableProps {
  items: AssetItem[];
  onOpenRebalanceModal?: () => void;
}

type SortField =
  | 'assetName'
  | 'assetClass'
  | 'broker'
  | 'totalCost'
  | 'marketValue'
  | 'pnlPercent'
  | 'currentWeight'
  | 'weightVariance';

const renderCategoryIcon = (assetClass: string) => {
  if (assetClass.includes('Thai Stocks')) return <Building className="w-4 h-4 text-blue-500" />;
  if (assetClass.includes('Foreign ETFs')) return <Globe className="w-4 h-4 text-purple-500" />;
  if (assetClass.includes('Mutual Funds')) return <Briefcase className="w-4 h-4 text-emerald-500" />;
  if (assetClass.includes('Tax-Saving')) return <Lock className="w-4 h-4 text-amber-500" />;
  if (assetClass.includes('Insurance')) return <HeartHandshake className="w-4 h-4 text-pink-500" />;
  if (assetClass.includes('Fixed Income')) return <Shield className="w-4 h-4 text-cyan-500" />;
  if (assetClass.includes('Gold')) return <Coins className="w-4 h-4 text-yellow-500" />;
  if (assetClass.includes('Crypto')) return <Zap className="w-4 h-4 text-orange-500" />;
  return <Layers className="w-4 h-4 text-slate-400" />;
};

export const AssetTable: React.FC<AssetTableProps> = ({ items, onOpenRebalanceModal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedBroker, setSelectedBroker] = useState<string>('ALL');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const [sortField, setSortField] = useState<SortField>('marketValue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => set.add(i.assetClass));
    return Array.from(set);
  }, [items]);

  const brokers = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.broker) set.add(i.broker);
    });
    return Array.from(set);
  }, [items]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const toggleRow = (id: string) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  };

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          item.assetName.toLowerCase().includes(searchLower) ||
          item.assetClass.toLowerCase().includes(searchLower) ||
          item.broker.toLowerCase().includes(searchLower);

        const matchesCategory = selectedCategory === 'ALL' || item.assetClass === selectedCategory;
        const matchesBroker = selectedBroker === 'ALL' || item.broker === selectedBroker;
        const matchesAction =
          selectedAction === 'ALL' ||
          (selectedAction === 'BUY' && item.rebalanceAction.toLowerCase().includes('buy')) ||
          (selectedAction === 'SELL' && item.rebalanceAction.toLowerCase().includes('sell')) ||
          (selectedAction === 'HOLD' && item.rebalanceAction.toLowerCase().includes('hold'));

        return matchesSearch && matchesCategory && matchesBroker && matchesAction;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === 'string') {
          return sortDirection === 'asc'
            ? (valA as string).localeCompare(valB as string)
            : (valB as string).localeCompare(valA as string);
        }

        return sortDirection === 'asc'
          ? (valA as number) - (valB as number)
          : (valB as number) - (valA as number);
      });
  }, [items, searchTerm, selectedCategory, selectedBroker, selectedAction, sortField, sortDirection]);

  const formatTHB = (val: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 2,
    }).format(val);
  };

  // High-Contrast Color Theme: Soft Green (#D1E7DD fill / #0F5132 text), Soft Red (#F8D7DA fill / #842029 text), Soft Gray (#E2E3E5 fill / #383D41 text)
  const getActionBadge = (actionStr: string, constraint?: string) => {
    const lower = actionStr.toLowerCase();
    const isTaxLock = constraint?.includes('Tax Lock') || constraint?.includes('ห้ามขาย');

    if (lower.includes('buy')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#D1E7DD] text-[#0F5132] dark:bg-[#0F5132]/40 dark:text-emerald-300 border border-[#0F5132]/40 shadow-xs">
          <ShoppingCart className="w-3.5 h-3.5 text-[#0F5132] dark:text-emerald-300" />
          BUY
        </span>
      );
    }

    if (lower.includes('sell')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#F8D7DA] text-[#842029] dark:bg-[#842029]/40 dark:text-rose-300 border border-[#842029]/40 shadow-xs">
          <Scissors className="w-3.5 h-3.5 text-[#842029] dark:text-rose-300" />
          SELL
        </span>
      );
    }

    if (isTaxLock) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 shadow-xs">
          <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          Tax Lock
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#E2E3E5] text-[#383D41] dark:bg-slate-700 dark:text-slate-300 border border-[#383D41]/30">
        <PauseCircle className="w-3.5 h-3.5" />
        HOLD
      </span>
    );
  };

  const getConstraintBadge = (constraint?: string) => {
    if (!constraint) return null;

    if (constraint.includes('ห้ามขาย') || constraint.includes('Tax Lock')) {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300/60 flex items-center gap-1">
          <Lock className="w-3 h-3" />
          {constraint}
        </span>
      );
    }

    if (constraint.includes('ห้ามซื้อเพิ่ม')) {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-300/60 flex items-center gap-1">
          <Scissors className="w-3 h-3" />
          {constraint}
        </span>
      );
    }

    return (
      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300/60">
        {constraint}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700/80 overflow-hidden mb-8">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-700/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Full Portfolio Asset Inventory (Columns A to P - {filteredItems.length} Assets)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ข้อมูลเชื่อมตรงจาก Google Sheet SSOT รวมข้อจำกัดส่วนบุคคล (Col N), ยอดปรับสัดส่วน (Col O) และเหตุผลประกอบ (Col P)
            </p>
          </div>

          {onOpenRebalanceModal && (
            <button
              onClick={onOpenRebalanceModal}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2 self-start sm:self-auto hover:scale-[1.02]"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ดูแผนปรับพอร์ตรายตัวทั้งหมด
            </button>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 pt-1">
          <div className="relative lg:col-span-4">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search ticker, asset name, or broker..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-semibold"
            />
          </div>

          <div className="lg:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-semibold"
            >
              <option value="ALL">📁 All Asset Categories ({categories.length})</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>
                  🏷️ {cat.split('(')[0].trim()}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-3">
            <select
              value={selectedBroker}
              onChange={(e) => setSelectedBroker(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-semibold"
            >
              <option value="ALL">🏦 All Brokers ({brokers.length})</option>
              {brokers.map((broker, idx) => (
                <option key={idx} value={broker}>
                  🏛️ {broker}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-black"
            >
              <option value="ALL">⚡ All Actions</option>
              <option value="BUY">🛒 BUY Only</option>
              <option value="SELL">✂️ SELL Only</option>
              <option value="HOLD">⏸️ HOLD Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 text-[11px] font-black uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
              <th
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                onClick={() => handleSort('assetName')}
              >
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-500" />
                  Asset & Constraint (A, B, N)
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                onClick={() => handleSort('broker')}
              >
                <div className="flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-indigo-500" />
                  Broker (C)
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3.5 px-4 text-right">Units & Cost (D, E, F)</th>
              <th
                className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                onClick={() => handleSort('marketValue')}
              >
                <div className="flex items-center justify-end gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                  Market Value (G, H)
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                onClick={() => handleSort('pnlPercent')}
              >
                <div className="flex items-center justify-end gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                  P&L % (I)
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-3.5 px-4 text-center cursor-pointer hover:text-slate-900 dark:hover:text-white"
                onClick={() => handleSort('currentWeight')}
              >
                <div className="flex items-center justify-center gap-1.5">
                  Weight vs Target (J, K, L)
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3.5 px-4 text-center">Action (M)</th>
              <th className="py-3.5 px-4 text-left">Suggested Action Amount (O)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400 dark:text-slate-500">
                  No investment assets found matching your filter criteria.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const isProfit = item.pnlPercent >= 0;
                const isExpanded = expandedRowId === item.id;

                return (
                  <React.Fragment key={item.id}>
                    <tr
                      onClick={() => toggleRow(item.id)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          {renderCategoryIcon(item.assetClass)}
                          <span>{item.assetName}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-indigo-500" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold">
                            {item.assetClass.split('(')[0].trim()}
                          </span>
                          {getConstraintBadge(item.userConstraint)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg font-bold bg-slate-100 dark:bg-slate-700/80 text-slate-800 dark:text-slate-200 text-[11px] border border-slate-200 dark:border-slate-600">
                          <Landmark className="w-3 h-3 mr-1.5 text-indigo-500" />
                          {item.broker || 'N/A'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="font-extrabold text-slate-900 dark:text-white">
                          {item.units > 0 ? item.units.toLocaleString('en-US') : '-'} units
                        </div>
                        <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                          Cost: {formatTHB(item.totalCost)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="font-black text-slate-900 dark:text-white">
                          {formatTHB(item.marketValue)}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                          {item.currentPrice > 0 ? `@ ฿${item.currentPrice.toLocaleString('en-US')}` : '-'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div
                          className={`font-black inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${
                            isProfit
                              ? 'bg-[#D1E7DD] text-[#0F5132] dark:bg-[#0F5132]/60 dark:text-emerald-200'
                              : 'bg-[#F8D7DA] text-[#842029] dark:bg-[#842029]/60 dark:text-rose-200'
                          }`}
                        >
                          {isProfit ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          )}
                          {item.pnlPercent.toFixed(2)}%
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">
                          {formatTHB(item.marketValue - item.totalCost)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 font-extrabold">
                          <span className="text-slate-900 dark:text-white">
                            {item.currentWeight.toFixed(2)}%
                          </span>
                          <span className="text-slate-300 dark:text-slate-600">/</span>
                          <span className="text-slate-500 dark:text-slate-400">
                            {item.targetWeight > 0 ? `${item.targetWeight.toFixed(2)}%` : '-'}
                          </span>
                        </div>
                        {item.targetWeight > 0 && (
                          <div
                            className={`text-[10px] font-bold ${
                              item.weightVariance > 0
                                ? 'text-amber-600 dark:text-amber-400'
                                : item.weightVariance < 0
                                ? 'text-indigo-600 dark:text-indigo-400'
                                : 'text-slate-400'
                            }`}
                          >
                            Var: {item.weightVariance > 0 ? '+' : ''}
                            {item.weightVariance.toFixed(2)}%
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {getActionBadge(item.rebalanceAction, item.userConstraint)}
                      </td>

                      <td className="py-3.5 px-4 text-left font-black text-slate-900 dark:text-white">
                        {item.suggestedActionAmount || '-'}
                      </td>
                    </tr>

                    {/* Expandable Rationale Row (Col P) */}
                    {isExpanded && (
                      <tr className="bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-indigo-200 dark:border-indigo-800">
                        <td colSpan={8} className="p-4">
                          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 space-y-2">
                            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs">
                              <Info className="w-4 h-4" />
                              <span>Column P - Recommendation Rationale ({item.assetName}):</span>
                            </div>

                            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                              {item.recommendationRationale}
                            </p>

                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              {item.lastReviewedTimestamp && (
                                <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-semibold border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                                  <span>🕒 Column Q:</span>
                                  <span>{item.lastReviewedTimestamp}</span>
                                </span>
                              )}
                              {item.updatedBy && (
                                <span className="px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-900 dark:bg-indigo-900/50 dark:text-indigo-300 text-[11px] font-black border border-indigo-200 dark:border-indigo-700 flex items-center gap-1">
                                  <span>🤖 Column R (Updated By):</span>
                                  <span>{item.updatedBy}</span>
                                </span>
                              )}
                            </div>

                            {item.switchTarget && (
                              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-300 font-bold flex items-center gap-2">
                                <Repeat className="w-4 h-4 text-amber-600" />
                                <span>เป้าหมายการสับเปลี่ยนกองทุนลดหย่อนภาษีที่แนะนำ: {item.switchTarget}</span>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
