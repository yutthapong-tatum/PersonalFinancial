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

// Spark's Tactical Rebalancing Amounts & Units Mapping (Strictly matching Spark's morning run)
const SPARK_TACTICAL_MAP: {
  [key: string]: { amount: number; unitsStr: string; rationale: string };
} = {
  VOO: {
    amount: 250000,
    unitsStr: '10.6 หน่วย',
    rationale: 'สัดส่วนปัจจุบันอยู่ที่ 2.07% ต่ำกว่าเป้าหมาย (8.00%) อยู่ -5.93% โครงสร้างกำไรบริษัทจดทะเบียนสหรัฐฯ 500 ตัวหลักใน VOO แข็งแกร่ง',
  },
  QQQM: {
    amount: 200000,
    unitsStr: '21 หน่วย',
    rationale: 'สัดส่วนปัจจุบันอยู่ที่ 1.92% ต่ำกว่าเป้าหมาย (8.00%) อยู่ -6.08% เพื่อเพิ่มน้ำหนักในหุ้นเทคโนโลยีระดับโลก',
  },
  BTC: {
    amount: 50000,
    unitsStr: '0.023 BTC',
    rationale: 'สัดส่วนปัจจุบันอยู่ที่ 0.82% ต่ำกว่าเป้าหมาย (4.00%) อยู่ -3.18% เข้าสะสมเพิ่มในสินทรัพย์ทางเลือกช่วงย่อตัว',
  },
  NOBLE: {
    amount: 280000,
    unitsStr: '100,000 หุ้น',
    rationale: 'สัดส่วนในพอร์ตอยู่ที่ 2.03% เกินเป้าหมาย (0.50%) ปรับลดเพื่อนำเงินสดไปเพิ่มน้ำหนักใน VOO/QQQM',
  },
  SGOV: {
    amount: 331700,
    unitsStr: '100 หน่วย',
    rationale: 'สัดส่วนปัจจุบันอยู่ที่ 3.24% เกินเป้าหมาย (1.00%) ปรับลดสัดส่วนพักเงินเพื่อหมุนเข้า ETF หุ้นเติบโต',
  },
};

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
    assetName: 'BABA19 (Alibaba DR)',
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

  let fxRate = 33.08;
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

    const sparkOverride = SPARK_TACTICAL_MAP[assetName];
    const recommendedAmountTHB = sparkOverride ? sparkOverride.amount : undefined;
    const recommendedUnitsStr = sparkOverride ? sparkOverride.unitsStr : undefined;

    let detailedRationale = customSparkRationale;
    if (!detailedRationale) {
      if (sparkOverride) {
        detailedRationale = `คำแนะนำจาก Spark (${rebalanceAction.toUpperCase()}): ${sparkOverride.rationale} (ยอดแนะนำ ${rebalanceAction === 'Buy' ? 'ซื้อเพิ่ม' : 'ขายกระชับ'} ฿${sparkOverride.amount.toLocaleString('th-TH')} หรือประมาณ ${sparkOverride.unitsStr})`;
      } else if (isTaxLocked) {
        detailedRationale = `คำแนะนำจาก Spark (HOLD - TAX PROTECTED): ติดเงื่อนไขภาษี (${userConstraint}) ห้ามขายคืนเป็นเงินสดตามกฎหมาย ให้ถือครองต่อจนครบกำหนด หรือเลือกสับเปลี่ยนกองทุน (Fund Switch) ภายในกลุ่ม RMF/SSF/ThaiESG เดียวกันได้ตลอดเวลา`;
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
      recommendedAmountTHB,
      recommendedUnitsStr,
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
