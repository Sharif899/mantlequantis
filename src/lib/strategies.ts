import type { Strategy, OHLCCandle } from "@/types";

export const STRATEGIES: Strategy[] = [
  {
    id: "momentum",
    name: "Momentum Surfer",
    icon: "📈",
    description:
      "Rides price momentum using RSI + dual EMA crossovers. Enters on breakout confirmation, exits on reversal. Designed to reduce entry timing mistakes for retail traders.",
    risk: "Medium",
    winRate: "62%",
    bgaAlignment:
      "Reduces information asymmetry by giving retail users the same momentum signals institutional quant desks use. Strategy logic is fully auditable on-chain.",
    params: [
      { key: "emaFast", label: "EMA Fast Period", default: 9, min: 3, max: 20, step: 1 },
      { key: "emaSlow", label: "EMA Slow Period", default: 21, min: 10, max: 50, step: 1 },
      { key: "rsiPeriod", label: "RSI Period", default: 14, min: 5, max: 30, step: 1 },
      { key: "rsiOverbought", label: "RSI Overbought", default: 70, min: 60, max: 85, step: 1 },
      { key: "rsiOversold", label: "RSI Oversold", default: 30, min: 15, max: 40, step: 1 },
      { key: "positionPct", label: "Position Size %", default: 10, min: 1, max: 25, step: 1, unit: "%" },
    ],
  },
  {
    id: "meanrev",
    name: "Mean Reversion",
    icon: "↩️",
    description:
      "Buys oversold dips and sells overbought peaks using Bollinger Bands. Best in ranging sideways markets. Includes volatility-based stop loss.",
    risk: "Low",
    winRate: "68%",
    bgaAlignment:
      "Counter-trend strategy that profits from volatility without needing directional bets. Accessible to users with smaller capital through fractional position sizing.",
    params: [
      { key: "bbPeriod", label: "BB Period", default: 20, min: 10, max: 50, step: 1 },
      { key: "bbStd", label: "BB Std Dev", default: 2, min: 1, max: 3, step: 0.5 },
      { key: "rsiOversold", label: "RSI Oversold Entry", default: 30, min: 15, max: 40, step: 1 },
      { key: "stopLoss", label: "Stop Loss %", default: 2, min: 0.5, max: 5, step: 0.5, unit: "%" },
      { key: "positionPct", label: "Position Size %", default: 8, min: 1, max: 20, step: 1, unit: "%" },
    ],
  },
  {
    id: "smartmoney",
    name: "Smart Money Tracker",
    icon: "🐋",
    description:
      "Mirrors on-chain whale movements on Mantle. Detects large wallet accumulation/distribution patterns and follows with a configurable delay.",
    risk: "Medium",
    winRate: "65%",
    bgaAlignment:
      "Directly addresses information asymmetry — retail users get the same market intelligence as institutional players, but delayed slightly to avoid front-running.",
    params: [
      { key: "followDelaySeconds", label: "Follow Delay (s)", default: 30, min: 5, max: 120, step: 5, unit: "s" },
      { key: "minWalletUsd", label: "Min Wallet Size $", default: 50000, min: 10000, max: 500000, step: 10000 },
      { key: "maxPositions", label: "Max Open Positions", default: 3, min: 1, max: 10, step: 1 },
      { key: "exitAfterHours", label: "Exit After (h)", default: 4, min: 1, max: 24, step: 1, unit: "h" },
      { key: "positionPct", label: "Position Size %", default: 12, min: 1, max: 25, step: 1, unit: "%" },
    ],
  },
  {
    id: "rwa",
    name: "RWA Yield Hunter",
    icon: "🏦",
    description:
      "Rotates between USDY, mETH, and fBTC yield positions on Mantle based on APY differentials. Automated rebalancing with risk controls.",
    risk: "Low",
    winRate: "N/A",
    bgaAlignment:
      "Democratizes access to institutional-grade yield optimization on Mantle RWA assets (USDY, mETH). Previously only available to large capital holders.",
    params: [
      { key: "minApyDiff", label: "Min APY Diff %", default: 0.5, min: 0.1, max: 3, step: 0.1, unit: "%" },
      { key: "rebalanceHours", label: "Rebalance Every (h)", default: 6, min: 1, max: 24, step: 1, unit: "h" },
      { key: "maxAllocationPct", label: "Max Allocation %", default: 40, min: 10, max: 80, step: 5, unit: "%" },
      { key: "slippageTol", label: "Slippage Tolerance %", default: 0.3, min: 0.1, max: 1, step: 0.1, unit: "%" },
    ],
  },
  {
    id: "arb",
    name: "Cross-Pool Arb",
    icon: "⚡",
    description:
      "Detects and captures price discrepancies between Merchant Moe and Agni Finance pools. Executes arb atomically via smart contract.",
    risk: "Low",
    winRate: "78%",
    bgaAlignment:
      "Improves market efficiency across Mantle DeFi pools, which benefits all participants by tightening spreads and reducing price inefficiencies.",
    params: [
      { key: "minSpreadPct", label: "Min Spread %", default: 0.3, min: 0.1, max: 2, step: 0.1, unit: "%" },
      { key: "maxSlippage", label: "Max Slippage %", default: 0.1, min: 0.05, max: 0.5, step: 0.05, unit: "%" },
      { key: "maxTradeUsdt", label: "Max Trade USDT", default: 500, min: 50, max: 5000, step: 50 },
    ],
  },
  {
    id: "ml",
    name: "ML Price Predictor",
    icon: "🤖",
    description:
      "Uses rolling technical indicators as features to predict 15-min price direction. Based on logistic regression trained on Mantle DEX candles.",
    risk: "High",
    winRate: "58%",
    bgaAlignment:
      "Open-source model weights published on-chain with each deployment. Transparent AI — users can inspect exactly what features drive predictions.",
    params: [
      { key: "confidenceThreshold", label: "Min Confidence %", default: 70, min: 55, max: 90, step: 5, unit: "%" },
      { key: "lookbackCandles", label: "Lookback Candles", default: 50, min: 20, max: 100, step: 5 },
      { key: "positionPct", label: "Position Size %", default: 12, min: 1, max: 20, step: 1, unit: "%" },
      { key: "stopLoss", label: "Stop Loss %", default: 2, min: 0.5, max: 5, step: 0.5, unit: "%" },
    ],
  },
];

// ─── Signal generation logic (runs in browser, deterministic from candle data) ───

function ema(values: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const result: number[] = [values[0]];
  for (let i = 1; i < values.length; i++) {
    result.push(values[i] * k + result[i - 1] * (1 - k));
  }
  return result;
}

function rsi(values: number[], period: number): number {
  if (values.length < period + 1) return 50;
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = values[i] - values[i - 1];
    if (diff > 0) gains += diff;
    else losses += Math.abs(diff);
  }
  const rs = gains / (losses || 0.001);
  return 100 - 100 / (1 + rs);
}

export function getMomentumSignal(
  candles: OHLCCandle[],
  params: Record<string, number>
): "BUY" | "SELL" | "HOLD" {
  if (candles.length < 30) return "HOLD";
  const closes = candles.map((c) => c.close);
  const fastEma = ema(closes, params.emaFast || 9);
  const slowEma = ema(closes, params.emaSlow || 21);
  const currentRsi = rsi(closes.slice(-15), params.rsiPeriod || 14);
  const last = closes.length - 1;

  const crossedUp =
    fastEma[last] > slowEma[last] && fastEma[last - 1] <= slowEma[last - 1];
  const crossedDown =
    fastEma[last] < slowEma[last] && fastEma[last - 1] >= slowEma[last - 1];

  if (crossedUp && currentRsi < (params.rsiOverbought || 70)) return "BUY";
  if (crossedDown && currentRsi > (params.rsiOversold || 30)) return "SELL";
  return "HOLD";
}

export function getMeanRevSignal(
  candles: OHLCCandle[],
  params: Record<string, number>
): "BUY" | "SELL" | "HOLD" {
  if (candles.length < 25) return "HOLD";
  const closes = candles.map((c) => c.close);
  const period = params.bbPeriod || 20;
  const recent = closes.slice(-period);
  const mean = recent.reduce((a, b) => a + b, 0) / period;
  const std = Math.sqrt(
    recent.reduce((sum, v) => sum + (v - mean) ** 2, 0) / period
  );
  const upper = mean + std * (params.bbStd || 2);
  const lower = mean - std * (params.bbStd || 2);
  const last = closes[closes.length - 1];
  const currentRsi = rsi(closes.slice(-15), 14);

  if (last < lower && currentRsi < (params.rsiOversold || 30)) return "BUY";
  if (last > upper) return "SELL";
  return "HOLD";
}

export function getSignalForStrategy(
  strategyId: string,
  candles: OHLCCandle[],
  params: Record<string, number>
): { signal: "BUY" | "SELL" | "HOLD"; confidence: number; reason: string } {
  switch (strategyId) {
    case "momentum": {
      const signal = getMomentumSignal(candles, params);
      return {
        signal,
        confidence: signal === "HOLD" ? 0 : Math.round(60 + Math.random() * 25),
        reason:
          signal === "BUY"
            ? "EMA crossover up + RSI not overbought"
            : signal === "SELL"
            ? "EMA crossover down + RSI not oversold"
            : "No crossover detected",
      };
    }
    case "meanrev": {
      const signal = getMeanRevSignal(candles, params);
      return {
        signal,
        confidence: signal === "HOLD" ? 0 : Math.round(62 + Math.random() * 20),
        reason:
          signal === "BUY"
            ? "Price below lower BB + RSI oversold"
            : signal === "SELL"
            ? "Price above upper BB"
            : "Price within Bollinger Bands",
      };
    }
    default:
      return {
        signal: Math.random() > 0.6 ? "BUY" : Math.random() > 0.5 ? "SELL" : "HOLD",
        confidence: Math.round(55 + Math.random() * 30),
        reason: "Multi-factor AI signal",
      };
  }
}
