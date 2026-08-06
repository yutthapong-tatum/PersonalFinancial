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

  let fxRate = 33.0;
  const items: AssetItem[] = [];

  let totalCostSum = 0;
  let totalMarketValueSum = 0;

  rows.forEach((row, index) => {
    if (!row || row.length === 0) return;

    const firstColStr = (row[0] || '').trim();
    if (firstColStr.includes('FX Rate')) {
      const val = parseNumber(row[1]);
      if (val > 0) fxRate = val;
      return;
    }

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
    
    // Spark's exact analysis outputs from Google Sheet
    const rawAction = (row[12] || '').trim();
    const userConstraint = (row[13] || '').trim();
    const customSparkRationale = row[14] ? row[14].trim() : '';

    let rebalanceAction: 'Buy' | 'Sell' | 'Hold' | 'Switch' | string = 'Hold';
    const lowerAction = rawAction.toLowerCase();
    if (lowerAction.includes('buy')) rebalanceAction = 'Buy';
    else if (lowerAction.includes('sell')) rebalanceAction = 'Sell';
    else if (rawAction) rebalanceAction = rawAction;

    const isTaxLocked =
      userConstraint.includes('Tax Lock') ||
      userConstraint.includes('ห้ามขาย') ||
      assetClass.includes('Tax-Saving');

    let switchTarget: string | undefined = undefined;
    if (isTaxLocked && (pnlPercent < -20 || (marketValue === 0 && totalCost > 0))) {
      if (assetName.includes('RMF')) switchTarget = 'SCBRMS&P500 / SCBRMNDQ(A)';
      else if (assetName.includes('SSF')) switchTarget = 'SCBS&P500-SSF / SCBSE-SSF';
      else if (assetName.includes('ThaiESG')) switchTarget = 'K-ESGSI-ThaiESG / SCBTP(ThaiESGA)';
    }

    // Direct mapping of Spark's rationale or exact computed rationale matching Spark's analysis
    let detailedRationale = customSparkRationale;
    if (!detailedRationale) {
      const formatMoney = (n: number) => n.toLocaleString('th-TH', { maximumFractionDigits: 0 });

      if (rebalanceAction === 'Buy') {
        const buyAmt = targetWeight > 0 ? ((targetWeight - currentWeight) / 100) * totalMarketValueSum : 0;
        detailedRationale = `คำแนะนำจาก Spark (BUY): น้ำหนักปัจจุบัน (${currentWeight.toFixed(2)}%) ต่ำกว่าเป้าหมาย (${targetWeight.toFixed(2)}%) อยู่ ${Math.abs(weightVariance).toFixed(2)}% แนะนำสะสมเพิ่ม ฿${formatMoney(Math.max(0, buyAmt))} เพื่อปรับสมดุลพอร์ตตามเป้าหมาย`;
      } else if (rebalanceAction === 'Sell') {
        const sellAmt = targetWeight > 0 ? ((currentWeight - targetWeight) / 100) * totalMarketValueSum : totalCost;
        detailedRationale = `คำแนะนำจาก Spark (SELL/TRIM): น้ำหนักปัจจุบัน (${currentWeight.toFixed(2)}%) เกินกว่าเป้าหมาย (${targetWeight.toFixed(2)}%) อยู่ +${weightVariance.toFixed(2)}% แนะนำกระชับสัดส่วนออก ฿${formatMoney(Math.max(0, sellAmt))} แล้วหมุนเงินไปลงทุนในสินทรัพย์ส่วนที่ยังขาด`;
      } else if (isTaxLocked) {
        if (switchTarget) {
          detailedRationale = `คำแนะนำจาก Spark (TAX FUND SWITCHING): กองทุนติดเงื่อนไขภาษี (${userConstraint}) ห้ามขายเป็นเงินสด แต่เนื่องจากผลตอบแทนชะลอตัว (${pnlPercent.toFixed(2)}%) Spark แนะนำสับเปลี่ยนกองทุน (Fund Switch) ไปยัง ${switchTarget} ภายในกลุ่มภาษีเดียวกันได้อย่างถูกต้องตามกฎหมายสรรพากร`;
        } else {
          detailedRationale = `คำแนะนำจาก Spark (HOLD - TAX PROTECTED): กองทุนติดเงื่อนไขภาษี (${userConstraint}) ห้ามขายคืนเป็นเงินสดตามกฎหมาย ให้ถือครองต่อจนครบกำหนด หรือเลือกสับเปลี่ยนกองทุน (Fund Switch) ภายในกลุ่ม RMF/SSF/ThaiESG เดียวกันได้ตลอดเวลา`;
        }
      } else {
        detailedRationale = `คำแนะนำจาก Spark (HOLD): สัดส่วนปัจจุบัน (${currentWeight.toFixed(2)}%) สอดคล้องกับเป้าหมาย (${targetWeight.toFixed(2)}%) ผลตอบแทน ${pnlPercent.toFixed(2)}% อยู่ในกรอบ Rebalancing Band ไม่จำเป็นต้องทำรายการในรอบนี้`;
      }
    }

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
      detailedRationale,
      switchTarget,
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
