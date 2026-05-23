export type TradeSide = "buy" | "sell";

export interface Trade {
  id: string;
  pair: string;
  side: TradeSide;
  amount: number;       // USDT value
  size: number;         // base token amount
  entryPrice: number;
  exitPrice?: number;
  pnl?: number;
  pnlPct?: number;
  strategy: string;
  timestamp: number;
  txHash?: string;      // Mantle on-chain tx hash
  status: "open" | "closed";
}

export interface Position {
  pair: string;
  size: number;
  avgPrice: number;
  currentPrice: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  icon: string;
  risk: "Low" | "Medium" | "High";
  winRate: string;
  params: StrategyParam[];
  bgaAlignment: string;
}

export interface StrategyParam {
  key: string;
  label: string;
  default: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
}

export interface Agent {
  id: string;
  strategyId: string;
  strategyName: string;
  pair: string;
  params: Record<string, number>;
  active: boolean;
  startedAt: number;
  trades: number;
  pnl: number;
  erc8004TokenId?: string; // ERC-8004 identity on Mantle
}

export interface OHLCCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TickerData {
  symbol: string;
  lastPrice: string;
  price24hPcnt: string;
  highPrice24h: string;
  lowPrice24h: string;
  volume24h: string;
  bid1Price: string;
  ask1Price: string;
}

export interface OrderBookLevel {
  price: string;
  size: string;
  depth: number; // 0-1 for bar width
}

export interface PaperPortfolio {
  cash: number;
  positions: Record<string, Position>;
  totalValue: number;
  totalPnl: number;
  totalPnlPct: number;
  trades: Trade[];
  equityCurve: { time: number; value: number }[];
}
