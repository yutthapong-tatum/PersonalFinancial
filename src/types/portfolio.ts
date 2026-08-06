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

export interface CategoryAllocation {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface BrokerAllocation {
  name: string;
  value: number;
  percentage: number;
}

export interface RebalanceRecommendation {
  assetName: string;
  assetClass: string;
  broker: string;
  action: 'Buy' | 'Sell' | 'Hold' | 'Switch';
  currentWeight: number;
  targetWeight: number;
  variance: number;
  estimatedAmountTHB: number;
  reason: string;
  constraint?: string;
  switchTarget?: string;
}
