export type RebalanceActionType = 'Buy' | 'Sell' | 'Hold' | 'Switch' | string;

export interface AssetItem {
  id: string;
  assetClass: string;
  assetName: string;
  broker: string;
  units: number;
  costPrice: number;
  totalCost: number;
  currentPrice: number;
  marketValue: number;
  pnlPercent: number;
  currentWeight: number;
  targetWeight: number;
  weightVariance: number;
  rebalanceAction: RebalanceActionType;
  userConstraint?: string;
  detailedRationale?: string;
  switchTarget?: string;
  recommendedAmountTHB?: number;
  recommendedUnitsStr?: string;
}

export interface PortfolioSummary {
  totalCost: number;
  totalMarketValue: number;
  netPnLAmount: number;
  netPnLPercent: number;
  fxRateUSDTHB: number;
  lastUpdated: string;
  assetCount: number;
}

export interface MarketResearchHighlight {
  title: string;
  source: string;
  url: string;
  detail: string;
}

export interface NewAssetRecommendation {
  assetName: string;
  assetClass: string;
  broker: string;
  recommendedAmountTHB: number;
  reason: string;
  sourceUrl: string;
}
