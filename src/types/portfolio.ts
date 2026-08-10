export type RebalanceActionType = 'BUY' | 'SELL' | 'HOLD' | 'SWITCH' | string;

export interface AssetItem {
  id: string;
  // Column A: Asset Class
  assetClass: string;
  // Column B: Asset Name / Ticker
  assetName: string;
  // Column C: Account / Broker
  broker: string;
  // Column D: Units / Shares
  units: number;
  // Column E: Avg Cost / Unit
  costPrice: number;
  // Column F: Total Cost THB
  totalCost: number;
  // Column G: Current Price / Unit
  currentPrice: number;
  // Column H: Market Value THB
  marketValue: number;
  // Column I: Unrealized P&L %
  pnlPercent: number;
  // Column J: Current Weight %
  currentWeight: number;
  // Column K: Target Weight %
  targetWeight: number;
  // Column L: Variance %
  weightVariance: number;
  // Column M: Rebalance Action
  rebalanceAction: RebalanceActionType;
  // Column N: User Constraint / Preference
  userConstraint?: string;
  // Column O: Suggested Action Amount
  suggestedActionAmount?: string;
  // Column P: Recommendation Rationale
  recommendationRationale?: string;
  // Column Q: Last Reviewed Timestamp
  lastReviewedTimestamp?: string;
  // Column R: Updated By System / Agent
  updatedBy?: string;

  // Extra helper fields
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
