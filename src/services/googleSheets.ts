import Papa from 'papaparse';
import { AssetItem, PortfolioSummary } from '../types/portfolio';

const SPREADSHEET_ID = '1QEhVslOnEBrgdxZLa9v5tyTdBhlaPE-6ABN5sME5ZNA';
const GVIZ_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv`;

function parseNumber(val: any): number {
  if (val === undefined || val === null) return 0;
  const str = String(val).replace(/,/g, '').replace(/%/g, '').trim();
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

export async function fetchPortfolioData(): Promise<{
  items: AssetItem[];
  summary: PortfolioSummary;
}> {
  try {
    const res = await fetch(GVIZ_URL, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Failed to fetch Google Sheet data: ${res.statusText}`);
    }
    const csvText = await res.text();
    return parseGoogleSheetCSV(csvText);
  } catch (error) {
    console.error('Error fetching Google Sheet:', error);
    throw error;
  }
}

export function parseGoogleSheetCSV(csvText: string): {
  items: AssetItem[];
  summary: PortfolioSummary;
} {
  const parsed = Papa.parse<string[]>(csvText, { skipEmptyLines: false });
  const rows = parsed.data || [];

  let fxRate = 33.0; // default reference rate
  const items: AssetItem[] = [];

  let totalCostSum = 0;
  let totalMarketValueSum = 0;

  rows.forEach((row, index) => {
    if (!row || row.length === 0) return;

    // Check for FX Rate line
    const firstColStr = (row[0] || '').trim();
    if (firstColStr.includes('FX Rate')) {
      const val = parseNumber(row[1]);
      if (val > 0) fxRate = val;
      return;
    }

    // Skip Header rows and total summary row
    if (
      firstColStr.includes('Asset Class') ||
      firstColStr.includes('Investment Portfolio Tracker') ||
      firstColStr.includes('Total Portfolio')
    ) {
      return;
    }

    const assetClass = firstColStr;
    const assetName = (row[1] || '').trim();
    const broker = (row[2] || '').trim();

    // Skip empty asset rows
    if (!assetName || !assetClass) return;

    const units = parseNumber(row[3]);
    const costPrice = parseNumber(row[4]);
    const totalCost = parseNumber(row[5]);
    const currentPrice = parseNumber(row[6]);
    const marketValue = parseNumber(row[7]);
    const pnlPercent = parseNumber(row[8]);
    const currentWeight = parseNumber(row[9]);
    const targetWeight = parseNumber(row[10]);
    const weightVariance = parseNumber(row[11]);
    const rawAction = (row[12] || '').trim();
    const userConstraint = (row[13] || '').trim();

    // Standardize rebalance action
    let rebalanceAction: 'Buy' | 'Sell' | 'Hold' | string = 'Hold';
    const lowerAction = rawAction.toLowerCase();
    if (lowerAction.includes('buy')) rebalanceAction = 'Buy';
    else if (lowerAction.includes('sell')) rebalanceAction = 'Sell';
    else if (rawAction) rebalanceAction = rawAction;

    totalCostSum += totalCost;
    totalMarketValueSum += marketValue;

    items.push({
      id: `${assetName}-${broker}-${index}`,
      assetClass,
      assetName,
      broker,
      units,
      costPrice,
      totalCost,
      currentPrice,
      marketValue,
      pnlPercent,
      currentWeight,
      targetWeight,
      weightVariance,
      rebalanceAction,
      userConstraint: userConstraint || undefined,
    });
  });

  const netPnLAmount = totalMarketValueSum - totalCostSum;
  const netPnLPercent = totalCostSum > 0 ? (netPnLAmount / totalCostSum) * 100 : 0;

  const summary: PortfolioSummary = {
    totalCost: totalCostSum,
    totalMarketValue: totalMarketValueSum,
    netPnLAmount,
    netPnLPercent,
    fxRateUSDTHB: fxRate,
    lastUpdated: new Date().toLocaleString('th-TH', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    assetCount: items.length,
  };

  return { items, summary };
}
