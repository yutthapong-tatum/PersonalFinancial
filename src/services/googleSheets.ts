import Papa from 'papaparse';
import { AssetItem, PortfolioSummary, MarketResearchHighlight, NewAssetRecommendation } from '../types/portfolio';

const SPREADSHEET_ID = '1QEhVslOnEBrgdxZLa9v5tyTdBhlaPE-6ABN5sME5ZNA';
const GVIZ_BASE_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv`;

function parseNumber(val: any): number {
  if (val === undefined || val === null) return 0;
  const str = String(val)
    .replace(/฿|\$|บาท|THB/gi, '')
    .replace(/,/g, '')
    .replace(/%/g, '')
    .replace(/#N\/A|#VALUE!|#REF!|#NAME\?|N\/A/gi, '')
    .trim();
  if (!str || str === '-') return 0;
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

function extractActionAmount(str: string): { amountTHB?: number; unitsStr?: string } {
  if (!str || str === '-') return { amountTHB: undefined, unitsStr: undefined };

  // Match THB amount like +200,000 บาท or -184,000 บาท or (-184,000 บาท)
  const thbMatch = str.match(/([+-]?[\d,]+(?:\.\d+)?)\s*บาท/);
  let amountTHB = undefined;
  if (thbMatch) {
    const rawNum = thbMatch[1].replace(/,/g, '').replace(/\+/g, '').replace(/-/g, '');
    amountTHB = parseFloat(rawNum);
  }

  // Match units string like (+533 หุ้น), (+7.7 หน่วย), (-100,000 หุ้น), (-100 หน่วย), (+0.023 BTC)
  const unitMatch = str.match(/([+-]?[\d,]+(?:\.\d+)?\s*(?:หุ้น|หน่วย|BTC|oz|หุ้นกู้))/i);
  let unitsStr = unitMatch ? unitMatch[1].trim() : undefined;

  return { amountTHB, unitsStr };
}

export const SPARK_MARKET_RESEARCH: MarketResearchHighlight[] = [
  {
    title: 'บทวิเคราะห์หุ้นไทย (Yuanta Securities)',
    source: 'Wealth Designs Daily & Power Investing',
    url: 'https://cms.yuanta.co.th/emt/b_260805085322_KNGCU.pdf',
    detail: 'แนะนำสะสมหุ้นที่มีแนวโน้มงบไตรมาส 2 แข็งแกร่ง ได้แก่ CPALL, PTTGC, SAWAD, OSP, RATCH',
  },
  {
    title: 'บทวิเคราะห์ตราสารต่างประเทศ (Yuanta DR Dashboard)',
    source: 'Yuanta DR Dashboard',
    url: 'https://cms.yuanta.co.th/emt/DR_260804081008_pR7eq.pdf',
    detail: 'แนะนำสะสม BABA19 (Alibaba DR) รับผลดีจากแนวโน้มอีคอมเมิร์ซและคลาวด์ในจีนฟื้นตัว',
  },
  {
    title: 'ภาพรวมตลาดต่างประเทศ & โภคภัณฑ์',
    source: 'Global Market Intelligence',
    url: 'https://www.google.com/search?q=XAU+USD+gold+price',
    detail: 'ราคาทองคำโลก (XAU/USD) ยืนเหนือ $4,290/oz สภาพคล่องในตลาดสหรัฐฯ ไหลเข้า ETF VOO และ QQQM',
  },
];

export const SPARK_NEW_ASSETS: NewAssetRecommendation[] = [
  {
    assetName: 'DR BABA19 (Alibaba DR)',
    assetClass: 'Foreign DR',
    broker: 'InnovestX / Yuanta',
    recommendedAmountTHB: 50000,
    reason: 'อ้างอิงบทวิเคราะห์ DR Dashboard ของ Yuanta Securities ราคาผ่านจุดต่ำสุด และรายได้กลุ่มคลาวด์/อีคอมเมิร์ซฟื้นตัว',
    sourceUrl: 'https://cms.yuanta.co.th/emt/DR_260804081008_pR7eq.pdf',
  },
];

export async function fetchPortfolioData(): Promise<{
  items: AssetItem[];
  summary: PortfolioSummary;
}> {
  try {
    // Append timestamp cache-buster to prevent Google CDN stale responses
    const url = `${GVIZ_BASE_URL}&t=${Date.now()}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Failed to fetch Google Sheet data: ${res.statusText}`);
    }
    const csvText = await res.text();

    // Check if response is HTML (e.g. Google login redirect or permission error)
    if (csvText.trim().startsWith('<!DOCTYPE html>') || csvText.trim().startsWith('<html')) {
      throw new Error('Google Sheet returned HTML instead of CSV data. Please verify spreadsheet access permissions.');
    }

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
  const parsed = Papa.parse<string[]>(csvText, { skipEmptyLines: true });
  const rows = parsed.data || [];

  let fxRate = 33.15; // Reference rate
  let lastReviewTimestamp = '';
  let sheetTotalCost = 0;
  let sheetTotalMarketValue = 0;
  const items: AssetItem[] = [];

  let totalCostSum = 0;
  let totalMarketValueSum = 0;

  // Default Column Index Map
  let colMap = {
    assetClass: 0,
    assetName: 1,
    broker: 2,
    units: 3,
    costPrice: 4,
    totalCost: 5,
    currentPrice: 6,
    marketValue: 7,
    pnlPercent: 8,
    currentWeight: 9,
    targetWeight: 10,
    weightVariance: 11,
    rebalanceAction: 12,
    userConstraint: 13,
    suggestedActionAmount: 14,
    recommendationRationale: 15,
    lastReviewedTimestamp: 16,
    updatedBy: 17,
  };

  let hasDetectedHeaders = false;

  rows.forEach((row, index) => {
    if (!row || row.length === 0) return;

    try {
      const fullRowText = row.join(' ').toLowerCase();

      // 1. Detect Parameter Rows (FX Rate, Last Review Timestamp)
      const firstColStr = (row[0] || '').trim();
      if (firstColStr.includes('FX Rate')) {
        const val = parseNumber(row[1] || row[2]);
        if (val > 0) fxRate = val;
        return;
      }

      if (
        firstColStr.includes('Last Full Portfolio Review Timestamp') ||
        firstColStr.includes('วันที่เวลาทบทวน')
      ) {
        const ts = (row[1] || '').trim();
        if (ts) lastReviewTimestamp = ts;
        return;
      }

      // Check Total Portfolio / Summary Row
      if (firstColStr.includes('Total Portfolio') || firstColStr.includes('ยอดรวม')) {
        const costVal = parseNumber(row[colMap.totalCost] || row[5]);
        const marketVal = parseNumber(row[colMap.marketValue] || row[7]);
        if (costVal > 0) sheetTotalCost = costVal;
        if (marketVal > 0) sheetTotalMarketValue = marketVal;
        return;
      }

      // 2. Dynamic Header Row Detection
      if (!hasDetectedHeaders && (fullRowText.includes('asset class') || fullRowText.includes('หมวดหมู่สินทรัพย์') || fullRowText.includes('asset name') || fullRowText.includes('ชื่อสินทรัพย์'))) {
        row.forEach((cellText, idx) => {
          const lower = (cellText || '').toLowerCase();
          if (lower.includes('asset class') || lower.includes('หมวดหมู่')) colMap.assetClass = idx;
          else if (lower.includes('asset name') || lower.includes('ticker') || lower.includes('ชื่อสินทรัพย์')) colMap.assetName = idx;
          else if (lower.includes('account') || lower.includes('broker') || lower.includes('บล.') || lower.includes('บัญชี')) colMap.broker = idx;
          else if (lower.includes('unit') || lower.includes('หน่วย')) colMap.units = idx;
          else if (lower.includes('cost price') || lower.includes('ราคาต้นทุน')) colMap.costPrice = idx;
          else if (lower.includes('total cost') || lower.includes('ต้นทุนรวม')) colMap.totalCost = idx;
          else if (lower.includes('current price') || lower.includes('ราคาปัจจุบัน')) colMap.currentPrice = idx;
          else if (lower.includes('market value') || lower.includes('มูลค่าตามราคาตลาด')) colMap.marketValue = idx;
          else if (lower.includes('pnl') || lower.includes('กำไร/ขาดทุน')) colMap.pnlPercent = idx;
          else if (lower.includes('current weight') || lower.includes('สัดส่วนปัจจุบัน')) colMap.currentWeight = idx;
          else if (lower.includes('target weight') || lower.includes('สัดส่วนเป้าหมาย')) colMap.targetWeight = idx;
          else if (lower.includes('weight variance') || lower.includes('ส่วนต่าง')) colMap.weightVariance = idx;
          else if (lower.includes('rebalance action') || lower.includes('คำแนะนำ rebalance')) colMap.rebalanceAction = idx;
          else if (lower.includes('user constraint') || lower.includes('เงื่อนไขข้อจำกัด')) colMap.userConstraint = idx;
          else if (lower.includes('suggested action amount') || lower.includes('จำนวนเงิน')) colMap.suggestedActionAmount = idx;
          else if (lower.includes('recommendation rationale') || lower.includes('เหตุผล')) colMap.recommendationRationale = idx;
          else if (lower.includes('last reviewed') || lower.includes('วันที่เวลา review')) colMap.lastReviewedTimestamp = idx;
          else if (lower.includes('updated by') || lower.includes('ผู้ปรับปรุง')) colMap.updatedBy = idx;
        });
        hasDetectedHeaders = true;
        return; // Skip processing the header row itself
      }

      // Skip generic title or header lines if re-encountered
      if (
        firstColStr.includes('Asset Class') ||
        firstColStr.includes('Investment Portfolio Tracker')
      ) {
        return;
      }

      // Extract values dynamically using colMap
      const assetClass = (row[colMap.assetClass] || firstColStr).trim();
      const assetName = (row[colMap.assetName] || '').trim();
      const broker = (row[colMap.broker] || '').trim();

      // Require valid assetName and assetClass to process as an asset item
      if (!assetName || assetName === '-' || !assetClass) return;

      const units = parseNumber(row[colMap.units]);
      const costPrice = parseNumber(row[colMap.costPrice]);
      const totalCost = parseNumber(row[colMap.totalCost]);
      const currentPrice = parseNumber(row[colMap.currentPrice]);
      const marketValue = parseNumber(row[colMap.marketValue]);
      const pnlPercent = parseNumber(row[colMap.pnlPercent]);
      const currentWeight = parseNumber(row[colMap.currentWeight]);
      const targetWeight = parseNumber(row[colMap.targetWeight]);
      const weightVariance = parseNumber(row[colMap.weightVariance]);

      const rawAction = (row[colMap.rebalanceAction] || '').trim();
      const userConstraint = (row[colMap.userConstraint] || '').trim();
      const rawSuggestedAmount = row[colMap.suggestedActionAmount] ? row[colMap.suggestedActionAmount].trim() : '';
      const rawRationale = row[colMap.recommendationRationale] ? row[colMap.recommendationRationale].trim() : '';
      const lastReviewedTimestamp = row[colMap.lastReviewedTimestamp] ? row[colMap.lastReviewedTimestamp].trim() : undefined;
      const updatedBy = row[colMap.updatedBy] ? row[colMap.updatedBy].trim() : undefined;

      let rebalanceAction: 'BUY' | 'SELL' | 'HOLD' | 'SWITCH' | string = 'HOLD';
      const lowerAction = rawAction.toLowerCase();
      if (lowerAction.includes('buy')) rebalanceAction = 'BUY';
      else if (lowerAction.includes('sell')) rebalanceAction = 'SELL';
      else if (rawAction) rebalanceAction = rawAction.toUpperCase();

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

      // Parse numeric amount THB & units string directly
      const { amountTHB: extractedAmountTHB, unitsStr: extractedUnitsStr } =
        extractActionAmount(rawSuggestedAmount);

      const recommendedAmountTHB = extractedAmountTHB;
      const recommendedUnitsStr = extractedUnitsStr;
      const suggestedActionAmount = rawSuggestedAmount || '-';

      let recommendationRationale = rawRationale;
      if (!recommendationRationale) {
        if (isTaxLocked) {
          recommendationRationale = `ติดเงื่อนไขภาษี (${userConstraint}) ห้ามขายเป็นเงินสด ให้ถือครองต่อตามกำหนด หรือเลือกสับเปลี่ยนกองทุน (Fund Switch) ภายในกลุ่มประเภทเดียวกัน`;
        } else {
          recommendationRationale = `สัดส่วนปัจจุบัน (${currentWeight.toFixed(2)}%) สอดคล้องกับเป้าหมาย (${targetWeight.toFixed(2)}%) อยู่ในกรอบ Rebalancing Band`;
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
        suggestedActionAmount,
        recommendationRationale,
        lastReviewedTimestamp,
        updatedBy,
        switchTarget,
        recommendedAmountTHB,
        recommendedUnitsStr,
      });
    } catch (rowError) {
      console.warn(`Skipped unparseable row at index ${index}:`, rowError);
    }
  });

  // Prioritize the official Total Portfolio summary row from Google Sheet if present
  const finalTotalCost = sheetTotalCost > 0 ? sheetTotalCost : totalCostSum;
  const finalTotalMarketValue = sheetTotalMarketValue > 0 ? sheetTotalMarketValue : totalMarketValueSum;
  const netPnLAmount = finalTotalMarketValue - finalTotalCost;
  const netPnLPercent = finalTotalCost > 0 ? (netPnLAmount / finalTotalCost) * 100 : 0;

  const summary: PortfolioSummary = {
    totalCost: finalTotalCost,
    totalMarketValue: finalTotalMarketValue,
    netPnLAmount,
    netPnLPercent,
    fxRateUSDTHB: fxRate,
    lastUpdated:
      lastReviewTimestamp ||
      new Date().toLocaleString('th-TH', {
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


