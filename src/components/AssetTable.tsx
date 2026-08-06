'use client';

import React, { useState, useMemo } from 'react';
import { AssetItem } from '../types/portfolio';
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Lock,
  Layers,
  Building,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
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

export const AssetTable: React.FC<AssetTableProps> = ({ items, onOpenRebalanceModal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedBroker, setSelectedBroker] = useState<string>('ALL');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');

  const [sortField, setSortField] = useState<SortField>('marketValue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Categories list for filter dropdown
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => set.add(i.assetClass));
    return Array.from(set);
  }, [items]);

  // Brokers list for filter dropdown
  const brokers = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.broker) set.add(i.broker);
    });
    return Array.from(set);
  }, [items]);

  // Handle Sort Toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Search term matching asset name, class, or ticker
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          item.assetName.toLowerCase().includes(searchLower) ||
          item.assetClass.toLowerCase().includes(searchLower) ||
          item.broker.toLowerCase().includes(searchLower);

        // Category filter
        const matchesCategory = selectedCategory === 'ALL' || item.assetClass === selectedCategory;

        // Broker filter
        const matchesBroker = selectedBroker === 'ALL' || item.broker === selectedBroker;

        // Rebalance action filter
        const matchesAction =
          selectedAction === 'ALL' ||
          (selectedAction === 'Buy' && item.rebalanceAction.toLowerCase().includes('buy')) ||
          (selectedAction === 'Sell' && item.rebalanceAction.toLowerCase().includes('sell')) ||
          (selectedAction === 'Hold' && item.rebalanceAction.toLowerCase().includes('hold'));

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

  const getActionBadge = (actionStr: string, constraint?: string) => {
    const lower = actionStr.toLowerCase();
    const isTaxLock = constraint?.includes('Tax Lock') || constraint?.includes('ห้ามขาย');

    if (lower.includes('buy')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D1E7DD] text-[#0F5132] dark:bg-[#0F5132]/30 dark:text-emerald-300 border border-[#0F5132]/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          BUY
        </span>
      );
    }

    if (lower.includes('sell')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F8D7DA] text-[#842029] dark:bg-[#842029]/30 dark:text-rose-300 border border-[#842029]/30">
          <AlertCircle className="w-3.5 h-3.5" />
          SELL
        </span>
      );
    }

    if (isTaxLock) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
          <Lock className="w-3 h-3 text-amber-600" />
          Tax Lock
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E2E3E5] text-[#383D41] dark:bg-slate-700 dark:text-slate-300 border border-[#383D41]/20">
        <PauseCircle className="w-3.5 h-3.5" />
        HOLD
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700/80 overflow-hidden mb-8">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-700/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Live Portfolio Asset Inventory ({filteredItems.length} Assets)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive list with cost basis, current market prices, P&L, and target weights
            </p>
          </div>

          {onOpenRebalanceModal && (
            <button
              onClick={onOpenRebalanceModal}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2 self-start sm:self-auto"
            >
              <CheckCircle2 className="w-4 h-4" />
              View Rebalance Summary Modal
            </button>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 pt-1">
          {/* Search Box */}
          <div className="relative lg:col-span-4">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search ticker, asset name, or broker..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Category Filter */}
          <div className="lg:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="ALL">All Asset Categories ({categories.length})</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat.split('(')[0].trim()}
                </option>
              ))}
            </select>
          </div>

          {/* Broker Filter */}
          <div className="lg:col-span-3">
            <select
              value={selectedBroker}
              onChange={(e) => setSelectedBroker(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="ALL">All Brokers ({brokers.length})</option>
              {brokers.map((broker, idx) => (
                <option key={idx} value={broker}>
                  {broker}
                </option>
              ))}
            </select>
          </div>

          {/* Action Filter */}
          <div className="lg:col-span-2">
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-semibold"
            >
              <option value="ALL">All Actions</option>
              <option value="Buy">BUY Only</option>
              <option value="Sell">SELL Only</option>
              <option value="Hold">HOLD Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
              <th
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                onClick={() => handleSort('assetName')}
              >
                <div className="flex items-center gap-1">
                  Asset & Ticker
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                onClick={() => handleSort('broker')}
              >
                <div className="flex items-center gap-1">
                  Broker
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3.5 px-4 text-right">Units / Price</th>
              <th
                className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                onClick={() => handleSort('totalCost')}
              >
                <div className="flex items-center justify-end gap-1">
                  Total Cost
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                onClick={() => handleSort('marketValue')}
              >
                <div className="flex items-center justify-end gap-1">
                  Market Value
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                onClick={() => handleSort('pnlPercent')}
              >
                <div className="flex items-center justify-end gap-1">
                  Unrealized P&L
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-3.5 px-4 text-center cursor-pointer hover:text-slate-900 dark:hover:text-white"
                onClick={() => handleSort('currentWeight')}
              >
                <div className="flex items-center justify-center gap-1">
                  Current vs Target
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3.5 px-4 text-center">Action</th>
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
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors"
                  >
                    {/* Asset Name & Category */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{item.assetName}</span>
                        {item.userConstraint && (
                          <span
                            title={item.userConstraint}
                            className="p-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-500"
                          >
                            <Lock className="w-3 h-3 text-amber-500" />
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[200px]">
                        {item.assetClass.split('(')[0].trim()}
                      </div>
                    </td>

                    {/* Broker */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md font-semibold bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 text-[11px]">
                        <Building className="w-3 h-3 mr-1 text-slate-400" />
                        {item.broker || 'N/A'}
                      </span>
                    </td>

                    {/* Units & Price */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {item.units > 0 ? item.units.toLocaleString('en-US') : '-'}
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500">
                        {item.currentPrice > 0 ? `@ ฿${item.currentPrice.toLocaleString('en-US')}` : '-'}
                      </div>
                    </td>

                    {/* Total Cost */}
                    <td className="py-3.5 px-4 text-right font-medium text-slate-700 dark:text-slate-300">
                      {formatTHB(item.totalCost)}
                    </td>

                    {/* Market Value */}
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                      {formatTHB(item.marketValue)}
                    </td>

                    {/* P&L % and Amount */}
                    <td className="py-3.5 px-4 text-right">
                      <div
                        className={`font-bold inline-flex items-center gap-1 ${
                          isProfit
                            ? 'text-[#0F5132] dark:text-emerald-400'
                            : 'text-[#842029] dark:text-rose-400'
                        }`}
                      >
                        {isProfit ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        )}
                        {item.pnlPercent.toFixed(2)}%
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">
                        {formatTHB(item.marketValue - item.totalCost)}
                      </div>
                    </td>

                    {/* Current vs Target Weight */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 font-semibold">
                        <span className="text-slate-800 dark:text-slate-200">
                          {item.currentWeight.toFixed(2)}%
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">/</span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {item.targetWeight > 0 ? `${item.targetWeight.toFixed(2)}%` : '-'}
                        </span>
                      </div>
                      {item.targetWeight > 0 && (
                        <div
                          className={`text-[10px] font-medium ${
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

                    {/* Rebalance Action */}
                    <td className="py-3.5 px-4 text-center">
                      {getActionBadge(item.rebalanceAction, item.userConstraint)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
