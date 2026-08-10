import Papa from 'papaparse';
import { AssetItem, PortfolioSummary, MarketResearchHighlight, NewAssetRecommendation } from '../types/portfolio';

const SPREADSHEET_ID = '1QEhVslOnEBrgdxZLa9v5tyTdBhlaPE-6ABN5sME5ZNA';
const GVIZ_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv`;

function parseNumber(val: any): number {
  if (val === undefined || val === null) return 0;
  const str = String(val).replace(/,/g, '').replace(/%/g, '').trim();
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

  let fxRate = 33.15; // Cell B2 reference rate
  let lastReviewTimestamp = '';
  let sheetTotalCost = 0;
  let sheetTotalMarketValue = 0;
  const items: AssetItem[] = [];

  let totalCostSum = 0;
  let totalMarketValueSum = 0;

  rows.forEach((row, index) => {
    if (!row || row.length === 0) return;

    const firstColStr = (row[0] || '').trim();

    // Check Cell B2 / FX Rate Parameter
    if (firstColStr.includes('FX Rate')) {
      const val = parseNumber(row[1]);
      if (val > 0) fxRate = val;
      return;
    }

    // Check Cell B3 / Last Full Portfolio Review Timestamp
    if (
      firstColStr.includes('Last Full Portfolio Review Timestamp') ||
      firstColStr.includes('วันที่เวลาทบทวน')
    ) {
      const ts = (row[1] || '').trim();
      if (ts) lastReviewTimestamp = ts;
      return;
    }

    // Check Total Portfolio / Summary Row (e.g. Row 106)
    if (firstColStr.includes('Total Portfolio') || firstColStr.includes('ยอดรวม')) {
      const costVal = parseNumber(row[5]);
      const marketVal = parseNumber(row[7]);
      if (costVal > 0) sheetTotalCost = costVal;
      if (marketVal > 0) sheetTotalMarketValue = marketVal;
      return;
    }

    if (
      firstColStr.includes('Asset Class') ||
      firstColStr.includes('Investment Portfolio Tracker')
    ) {
      return;
    }

    // Schema Columns A to P
    const assetClass = firstColStr; // Column A
    const assetName = (row[1] || '').trim(); // Column B
    const broker = (row[2] || '').trim(); // Column C

    if (!assetName || !assetClass) return;

    const units = parseNumber(row[3]); // Column D
    const costPrice = parseNumber(row[4]); // Column E
    const totalCost = parseNumber(row[5]); // Column F
    const currentPrice = parseNumber(row[6]); // Column G
    const marketValue = parseNumber(row[7]); // Column H
    const pnlPercent = parseNumber(row[8]); // Column I
    const currentWeight = parseNumber(row[9]); // Column J
    const targetWeight = parseNumber(row[10]); // Column K
    const weightVariance = parseNumber(row[11]); // Column L

    const rawAction = (row[12] || '').trim(); // Column M
    const userConstraint = (row[13] || '').trim(); // Column N
    const rawSuggestedAmount = row[14] ? row[14].trim() : ''; // Column O
    const rawRationale = row[15] ? row[15].trim() : ''; // Column P
    const lastReviewedTimestamp = row[16] ? row[16].trim() : undefined; // Column Q
    const updatedBy = row[17] ? row[17].trim() : undefined; // Column R

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

    // Parse numeric amount THB & units string directly from Column O
    const { amountTHB: extractedAmountTHB, unitsStr: extractedUnitsStr } =
      extractActionAmount(rawSuggestedAmount);

    const recommendedAmountTHB = extractedAmountTHB;
    const recommendedUnitsStr = extractedUnitsStr;

    // Column O: Suggested Action Amount
    const suggestedActionAmount = rawSuggestedAmount || '-';

    // Column P: Recommendation Rationale
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
  });

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

