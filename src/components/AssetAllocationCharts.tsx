'use client';

import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { AssetItem } from '../types/portfolio';
import { PieChart as PieIcon, BarChart3, Building2, ShieldAlert } from 'lucide-react';

interface ChartsProps {
  items: AssetItem[];
}

const CATEGORY_COLORS: { [key: string]: string } = {
  'Domestic Thai Stocks (หุ้นไทยรายตัว)': '#3B82F6', // Blue
  'Foreign ETFs & DRs (ETF / DR ต่างประเทศ)': '#8B5CF6', // Purple
  'Mutual Funds (กองทุนรวม)': '#10B981', // Emerald
  'Tax-Saving Funds & PVD (กองทุนลดหย่อนภาษี SSF / RMF / ThaiESG & PVD)': '#F59E0B', // Amber
  'Insurance & Savings Policies (ประกันชีวิตออมทรัพย์ & ยูนิตลิงค์)': '#EC4899', // Pink
  'Fixed Income / Bonds (หุ้นกู้ / ตราสารหนี้)': '#06B6D4', // Cyan
  'Gold (ทองคำ)': '#EAB308', // Yellow
  'Crypto (คริปโต)': '#F97316', // Orange
};

const DEFAULT_COLOR = '#64748B';

export const AssetAllocationCharts: React.FC<ChartsProps> = ({ items }) => {
  const [activeTab, setActiveTab] = useState<'category' | 'broker' | 'rebalance'>('category');

  // 1. Group by Asset Class
  const categoryMap: { [key: string]: number } = {};
  items.forEach((item) => {
    const key = item.assetClass;
    categoryMap[key] = (categoryMap[key] || 0) + item.marketValue;
  });

  const totalMarketVal = Object.values(categoryMap).reduce((a, b) => a + b, 0);

  const categoryData = Object.keys(categoryMap)
    .map((cat) => ({
      name: cat.split('(')[0].trim(), // Short label
      fullName: cat,
      value: categoryMap[cat],
      percentage: totalMarketVal > 0 ? (categoryMap[cat] / totalMarketVal) * 100 : 0,
      color: CATEGORY_COLORS[cat] || DEFAULT_COLOR,
    }))
    .sort((a, b) => b.value - a.value);

  // 2. Group by Broker
  const brokerMap: { [key: string]: number } = {};
  items.forEach((item) => {
    const key = item.broker || 'Unspecified';
    brokerMap[key] = (brokerMap[key] || 0) + item.marketValue;
  });

  const brokerData = Object.keys(brokerMap)
    .map((broker) => ({
      name: broker,
      value: brokerMap[broker],
      percentage: totalMarketVal > 0 ? (brokerMap[broker] / totalMarketVal) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  // 3. Current vs Target Weight comparison data
  const rebalanceData = categoryData.map((cat) => {
    // Sum current and target weights for this category
    const catItems = items.filter((i) => i.assetClass === cat.fullName);
    const currentWeight = catItems.reduce((acc, curr) => acc + curr.currentWeight, 0);
    const targetWeight = catItems.reduce((acc, curr) => acc + curr.targetWeight, 0);
    return {
      name: cat.name,
      Current: parseFloat(currentWeight.toFixed(2)),
      Target: parseFloat(targetWeight.toFixed(2)),
    };
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-700">
          <p className="font-bold text-sm text-slate-100">{data.fullName || data.name}</p>
          <p className="text-emerald-400 font-semibold">{formatCurrency(data.value)}</p>
          <p className="text-slate-300">{data.percentage.toFixed(2)}% of total portfolio</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-700/80 mb-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Portfolio Allocation & Visual Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Interactive breakdown by Asset Class, Broker, and Target Rebalancing Variance
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl gap-1 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('category')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'category'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            Asset Class
          </button>
          <button
            onClick={() => setActiveTab('broker')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'broker'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Broker Account
          </button>
          <button
            onClick={() => setActiveTab('rebalance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'rebalance'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Weight vs Target
          </button>
        </div>
      </div>

      {/* Chart Render Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Side: Recharts Canvas */}
        <div className="lg:col-span-7 h-72 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === 'category' ? (
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={105}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            ) : activeTab === 'broker' ? (
              <PieChart>
                <Pie
                  data={brokerData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {brokerData.map((entry, index) => (
                    <Cell
                      key={`broker-cell-${index}`}
                      fill={`hsl(${(index * 55) % 360}, 70%, 55%)`}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            ) : (
              <BarChart data={rebalanceData} margin={{ top: 20, right: 20, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  angle={-20}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} unit="%" />
                <Tooltip
                  formatter={(val: number) => [`${val.toFixed(2)}%`, '']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Current" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Current Weight %" />
                <Bar dataKey="Target" fill="#10B981" radius={[4, 4, 0, 0]} name="Target Weight %" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Right Side: Data Breakdown Legend */}
        <div className="lg:col-span-5 space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
          <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            {activeTab === 'category'
              ? 'Category Breakdown'
              : activeTab === 'broker'
              ? 'Broker Account Distribution'
              : 'Category Target Summary'}
          </div>

          {(activeTab === 'category' ? categoryData : brokerData).map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor:
                      activeTab === 'category'
                        ? (item as any).color
                        : `hsl(${(idx * 55) % 360}, 70%, 55%)`,
                  }}
                />
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                  {item.name}
                </span>
              </div>

              <div className="text-right flex-shrink-0 pl-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  {formatCurrency(item.value)}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  {item.percentage.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
