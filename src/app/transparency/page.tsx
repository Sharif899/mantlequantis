"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useStore } from "@/lib/store";
import { STRATEGIES, getSignalForStrategy } from "@/lib/strategies";
import { fetchKlines } from "@/lib/bybit";
import {
  fetchOnChainTrades,
  getExplorerTxUrl,
  MANTLE_EXPLORER,
  TRADE_LOGGER_ADDRESS,
} from "@/lib/mantle";
import { Card, StatCard, Badge, SectionTitle, EmptyState } from "@/components/ui";
import { format } from "date-fns";
import clsx from "clsx";
import type { OHLCCandle } from "@/types";

// Human-readable explanation of each strategy's signal logic
const STRATEGY_LOGIC_DOCS: Record<string, { steps: string[]; pseudocode: string }> = {
  momentum: {
    steps: [
      "1. Compute Fast EMA (default 9) and Slow EMA (default 21) over closing prices",
      "2. Compute RSI over the last 14 candles",
      "3. BUY signal fires when: Fast EMA crosses above Slow EMA AND RSI < 70 (not overbought)",
      "4. SELL signal fires when: Fast EMA crosses below Slow EMA AND RSI > 30 (not oversold)",
      "5. HOLD when no crossover detected — agent stays flat",
      "6. Position size is capped at configured % of portfolio (default 10%)",
    ],
    pseudocode: `function getMomentumSignal(candles, params):
  closes = candles.map(c => c.close)
  fastEMA = ema(closes, params.emaFast)   // default: 9
  slowEMA = ema(closes, params.emaSlow)   // default: 21
  rsi = computeRSI(closes[-14:])

  if fastEMA[-1] > slowEMA[-1]            // EMA crossed up
  and fastEMA[-2] <= slowEMA[-2]          // was below before
  and rsi < params.rsiOverbought:         // not overbought
    return BUY, confidence=high

  if fastEMA[-1] < slowEMA[-1]            // EMA crossed down
  and fastEMA[-2] >= slowEMA[-2]
  and rsi > params.rsiOversold:
    return SELL, confidence=high

  return HOLD`,
  },
  meanrev: {
    steps: [
      "1. Compute Bollinger Bands: 20-period SMA ± 2 standard deviations",
      "2. BUY when price closes below lower Bollinger Band AND RSI < 30 (oversold confirmation)",
      "3. SELL when price closes above upper Bollinger Band (overbought)",
      "4. Stop loss placed at configured % below entry (default 2%)",
      "5. Mean (middle band) acts as natural take-profit target",
      "6. Agent re-evaluates every candle close",
    ],
    pseudocode: `function getMeanRevSignal(candles, params):
  closes = candles.map(c => c.close)
  mean = average(closes[-params.bbPeriod:])
  std = stddev(closes[-params.bbPeriod:])
  upperBand = mean + std * params.bbStd   // default: 2
  lowerBand = mean - std * params.bbStd
  rsi = computeRSI(closes[-14:])
  last = closes[-1]

  if last < lowerBand and rsi < params.rsiOversold:
    return BUY                            // price below lower band + oversold

  if last > upperBand:
    return SELL                           // price above upper band

  return HOLD`,
  },
  smartmoney: {
    steps: [
      "1. Monitor Mantle on-chain activity for wallets labeled 'Smart Money' by Nansen",
      "2. When a whale wallet (>$50K) accumulates a token, flag as BUY signal",
      "3. Apply configurable delay (default 30s) before following — avoids front-running",
      "4. Limit maximum open positions (default 3) to control concentration risk",
      "5. Auto-exit after configured hours (default 4h) to avoid holding overnight risk",
    ],
    pseudocode: `function trackSmartMoney(onchainEvents, params):
  for event in onchainEvents:
    wallet = event.wallet
    if nansen.isSmartMoney(wallet)
    and event.usdValue > params.minWalletUsd:
      signal = {
        asset: event.asset,
        side: event.action,          // accumulate → BUY
        delay: params.followDelay,   // wait 30s default
        maxHold: params.exitAfterH,
      }
      schedule(execute, signal, after=delay)`,
  },
  rwa: {
    steps: [
      "1. Fetch current APY from USDY (Ondo), mETH (Mantle), and fBTC yield protocols",
      "2. Calculate APY differential between highest and current holding",
      "3. If diff > threshold (default 0.5%), trigger rotation",
      "4. Max single-asset allocation capped at configured % (default 40%) for diversification",
      "5. Rebalance check runs every configured hours (default 6h)",
      "6. Slippage tolerance prevents rotating during thin liquidity",
    ],
    pseudocode: `function rwaYieldHunter(yields, portfolio, params):
  best = max(yields, key=lambda y: y.apy)
  current = portfolio.currentHolding

  apyDiff = best.apy - current.apy
  if apyDiff > params.minApyDiff:      // default: 0.5%
    if portfolio.allocation[best] < params.maxAllocation:
      rotate(from=current, to=best,
             slippageTol=params.slippageTol)`,
  },
  arb: {
    steps: [
      "1. Fetch real-time price of same token from Merchant Moe and Agni Finance",
      "2. If spread > minimum threshold (default 0.3%), arb opportunity exists",
      "3. Verify slippage estimate doesn't exceed max slippage (default 0.1%)",
      "4. Execute: buy on cheaper DEX, sell on more expensive DEX atomically",
      "5. Net profit = spread minus gas fees — agent only acts when profitable",
    ],
    pseudocode: `function crossPoolArb(moePools, agniPools, params):
  for token in TRACKED_TOKENS:
    priceMoe = moePools[token].price
    priceAgni = agniPools[token].price
    spread = abs(priceMoe - priceAgni) / min(priceMoe, priceAgni)

    if spread > params.minSpreadPct:
      estimatedSlippage = estimateSlippage(params.maxTradeUsdt)
      if estimatedSlippage < params.maxSlippage:
        buy(cheaper, params.maxTradeUsdt)
        sell(expensive, params.maxTradeUsdt)`,
  },
  ml: {
    steps: [
      "1. Compute 12 technical features: RSI, EMA ratio, BB position, volume z-score, etc.",
      "2. Run features through logistic regression model (weights pre-trained on Mantle candles)",
      "3. Output: probability of price increase in next 15 minutes",
      "4. Only trade when model confidence exceeds threshold (default 70%)",
      "5. Stop loss at configured % (default 2%) — model is not always right",
      "6. Feature importance published on-chain so predictions are fully auditable",
    ],
    pseudocode: `function mlPredict(candles, params):
  features = [
    rsi(candles, 14),
    emaRatio(candles, 9, 21),
    bbPosition(candles, 20),
    volumeZScore(candles, 20),
    priceROC(candles, 5),
    // ... 7 more features
  ]
  prob = sigmoid(dot(features, MODEL_WEIGHTS))

  if prob > params.confidenceThreshold:    // default: 0.70
    return BUY, confidence=prob
  elif prob < (1 - params.confidenceThreshold):
    return SELL, confidence=1-prob
  return HOLD`,
  },
};

export default function TransparencyPage() {
  const { address } = useAccount();
  const { portfolio, agents } = useStore();
  const [selectedStrategy, setSelectedStrategy] = useState(STRATEGIES[0].id);
  const [candles, setCandles] = useState<OHLCCandle[]>([]);
  const [onChainTrades, setOnChainTrades] = useState<any[]>([]);
  const [loadingOnChain, setLoadingOnChain] = useState(false);
  const [activeTab, setActiveTab] = useState<"logic" | "decisions" | "onchain">("logic");

  const strategy = STRATEGIES.find((s) => s.id === selectedStrategy)!;
  const logicDoc = STRATEGY_LOGIC_DOCS[selectedStrategy];

  useEffect(() => {
    fetchKlines("MNT/USDT", "15", 50).then(setCandles);
  }, []);

  useEffect(() => {
    if (!address || !TRADE_LOGGER_ADDRESS) return;
    setLoadingOnChain(true);
    fetchOnChainTrades(address)
      .then(setOnChainTrades)
      .finally(() => setLoadingOnChain(false));
  }, [address]);

  // Generate live signal for the selected strategy
  const signal =
    candles.length > 20
      ? getSignalForStrategy(selectedStrategy, candles, {})
      : null;

  // Trades filtered by strategy
  const strategyTrades = portfolio.trades.filter(
    (t) => t.strategy === strategy.name || t.strategy === strategy.id
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Transparency Center</h1>
        <p className="text-xs text-mantle-muted mt-1">
          Every AI decision explained. Every trade verifiable on-chain. No black boxes.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Trades Logged On-chain"
          value={onChainTrades.length > 0 ? onChainTrades.length.toString() : portfolio.trades.filter((t) => t.txHash).length.toString()}
          sub={
            TRADE_LOGGER_ADDRESS
              ? <a href={`${MANTLE_EXPLORER}/address/${TRADE_LOGGER_ADDRESS}`} target="_blank" rel="noopener noreferrer" className="text-mantle-purple hover:underline">View contract →</a>
              : "Deploy contract to enable"
          }
        />
        <StatCard
          label="Strategies Available"
          value={STRATEGIES.length.toString()}
          sub="All logic open-source"
        />
        <StatCard
          label="Active Agents"
          value={agents.filter((a) => a.active).length.toString()}
          sub={agents.filter((a) => a.erc8004TokenId).length + " registered on-chain"}
        />
        <StatCard
          label="Contract"
          value={TRADE_LOGGER_ADDRESS ? "Deployed ✅" : "Not deployed"}
          sub={
            TRADE_LOGGER_ADDRESS
              ? `${TRADE_LOGGER_ADDRESS.slice(0, 8)}…${TRADE_LOGGER_ADDRESS.slice(-6)}`
              : "See README to deploy"
          }
          positive={!!TRADE_LOGGER_ADDRESS}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-5">
        {/* Strategy selector */}
        <div className="space-y-2">
          <SectionTitle>Select Strategy</SectionTitle>
          {STRATEGIES.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStrategy(s.id)}
              className={clsx(
                "w-full text-left px-4 py-3 rounded-xl border transition-all",
                selectedStrategy === s.id
                  ? "border-mantle-purple bg-[#1A1A30] text-white"
                  : "border-mantle-border bg-mantle-card text-mantle-muted hover:text-white"
              )}
            >
              <div className="flex items-center gap-2">
                <span>{s.icon}</span>
                <span className="text-sm font-medium">{s.name}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Main content */}
        <div>
          {/* Strategy header */}
          <Card className="mb-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{strategy.icon}</span>
                  <h2 className="text-lg font-semibold text-white">{strategy.name}</h2>
                  <Badge variant={{ Low: "green", Medium: "amber", High: "red" }[strategy.risk] as any}>
                    {strategy.risk} Risk
                  </Badge>
                </div>
                <p className="text-sm text-mantle-muted">{strategy.description}</p>
              </div>
              {/* Live signal */}
              {signal && (
                <div className="text-right shrink-0 ml-4">
                  <div className="text-xs text-mantle-muted mb-1">Current Signal</div>
                  <Badge
                    variant={signal.signal === "BUY" ? "green" : signal.signal === "SELL" ? "red" : "gray"}
                    className="text-sm px-3 py-1"
                  >
                    {signal.signal}
                  </Badge>
                  <div className="text-xs text-mantle-muted mt-1">{signal.confidence}% confidence</div>
                  <div className="text-xs text-mantle-muted mt-0.5 max-w-[180px]">{signal.reason}</div>
                </div>
              )}
            </div>
          </Card>

          {/* Tabs */}
          <div className="flex border-b border-mantle-border mb-4">
            {(["logic", "decisions", "onchain"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  "px-5 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize",
                  activeTab === tab
                    ? "border-mantle-purple text-mantle-purple"
                    : "border-transparent text-mantle-muted hover:text-white"
                )}
              >
                {tab === "logic" && "📐 Strategy Logic"}
                {tab === "decisions" && "🧠 AI Decisions"}
                {tab === "onchain" && "⛓️ On-chain Audit"}
              </button>
            ))}
          </div>

          {/* Tab: Logic */}
          {activeTab === "logic" && logicDoc && (
            <div className="space-y-4">
              <Card>
                <SectionTitle>How It Works — Step by Step</SectionTitle>
                <ol className="space-y-2">
                  {logicDoc.steps.map((step, i) => (
                    <li key={i} className="text-sm text-mantle-muted leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ol>
              </Card>

              <Card>
                <SectionTitle>Signal Generation Pseudocode</SectionTitle>
                <pre className="text-xs text-mantle-teal font-mono bg-[#050508] rounded-lg p-4 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                  {logicDoc.pseudocode}
                </pre>
                <p className="text-xs text-mantle-muted mt-3">
                  Full TypeScript implementation:{" "}
                  <code className="bg-[#0D0D14] px-1.5 py-0.5 rounded text-mantle-purple">
                    src/lib/strategies.ts
                  </code>
                </p>
              </Card>

              <Card>
                <SectionTitle>BGA Alignment</SectionTitle>
                <p className="text-sm text-mantle-muted leading-relaxed">{strategy.bgaAlignment}</p>
              </Card>
            </div>
          )}

          {/* Tab: Decisions */}
          {activeTab === "decisions" && (
            <Card>
              <SectionTitle>Trade Decisions — {strategy.name}</SectionTitle>
              {strategyTrades.length === 0 ? (
                <EmptyState
                  icon="🧠"
                  title="No decisions yet"
                  sub={`Deploy ${strategy.name} to see AI decision log`}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-mantle-border">
                        {["Time", "Pair", "Decision", "Price", "Amount", "P&L", "On-chain TX"].map((h) => (
                          <th key={h} className="text-left py-2 px-3 text-xs text-mantle-muted font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {strategyTrades.slice().reverse().map((t) => (
                        <tr key={t.id} className="border-b border-mantle-border hover:bg-[#0D0D14] transition-colors">
                          <td className="py-2.5 px-3 text-xs text-mantle-muted num">
                            {format(new Date(t.timestamp), "HH:mm:ss")}
                          </td>
                          <td className="py-2.5 px-3 font-medium">{t.pair}</td>
                          <td className="py-2.5 px-3">
                            <Badge variant={t.side === "buy" ? "green" : "red"} className="text-[10px]">
                              {t.side.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3 num text-xs">
                            ${t.entryPrice.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                          </td>
                          <td className="py-2.5 px-3 num">${t.amount.toFixed(0)}</td>
                          <td className="py-2.5 px-3">
                            {t.pnl != null ? (
                              <span className={clsx("num font-semibold", t.pnl >= 0 ? "text-mantle-teal" : "text-mantle-coral")}>
                                {t.pnl >= 0 ? "+" : ""}${t.pnl.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-mantle-muted text-xs">Open</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            {t.txHash ? (
                              <a
                                href={getExplorerTxUrl(t.txHash)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-mantle-purple hover:underline font-mono"
                              >
                                {t.txHash.slice(0, 8)}…{t.txHash.slice(-4)}
                              </a>
                            ) : (
                              <span className="text-xs text-mantle-muted">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {/* Tab: On-chain */}
          {activeTab === "onchain" && (
            <div className="space-y-4">
              <Card>
                <SectionTitle>On-chain Trade Log — Mantle Sepolia</SectionTitle>

                {!TRADE_LOGGER_ADDRESS ? (
                  <div className="px-4 py-6 text-center">
                    <div className="text-3xl mb-3 opacity-30">⛓️</div>
                    <div className="text-sm font-medium text-mantle-muted mb-2">Contract Not Deployed</div>
                    <div className="text-xs text-mantle-muted mb-4">
                      Deploy <code className="bg-[#0D0D14] px-1 rounded">MantleQuantTradeLogger.sol</code> to
                      Mantle Sepolia and add the address to <code className="bg-[#0D0D14] px-1 rounded">.env.local</code>
                    </div>
                    <a
                      href="https://faucet.sepolia.mantle.xyz"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-mantle-purple hover:underline"
                    >
                      Get testnet MNT from faucet →
                    </a>
                  </div>
                ) : !address ? (
                  <EmptyState icon="🔐" title="Connect wallet" sub="Connect to see your on-chain trade log" />
                ) : loadingOnChain ? (
                  <div className="text-center py-8 text-sm text-mantle-muted">
                    Loading on-chain trades…
                  </div>
                ) : onChainTrades.length === 0 ? (
                  <EmptyState
                    icon="📋"
                    title="No on-chain trades yet"
                    sub="Execute a trade to log it to Mantle Sepolia"
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-mantle-border">
                          {["TX Hash", "Pair", "Side", "Amount", "Price", "Strategy", "Time"].map((h) => (
                            <th key={h} className="text-left py-2 px-3 text-xs text-mantle-muted font-medium">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {onChainTrades.map((t, i) => (
                          <tr key={i} className="border-b border-mantle-border hover:bg-[#0D0D14] transition-colors">
                            <td className="py-2.5 px-3">
                              <a
                                href={getExplorerTxUrl(t.txHash)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-mantle-purple hover:underline font-mono"
                              >
                                {t.txHash.slice(0, 10)}…{t.txHash.slice(-4)}
                              </a>
                            </td>
                            <td className="py-2.5 px-3 font-medium">{t.pair}</td>
                            <td className="py-2.5 px-3">
                              <Badge variant={t.side === "buy" ? "green" : "red"} className="text-[10px]">
                                {t.side.toUpperCase()}
                              </Badge>
                            </td>
                            <td className="py-2.5 px-3 num">${t.amount?.toFixed(2)}</td>
                            <td className="py-2.5 px-3 num text-xs">${t.price?.toFixed(4)}</td>
                            <td className="py-2.5 px-3 text-xs text-mantle-muted">{t.strategyId}</td>
                            <td className="py-2.5 px-3 text-xs text-mantle-muted num">
                              {t.timestamp ? format(new Date(t.timestamp * 1000), "MMM d HH:mm") : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>

              {/* Local trades with tx hashes */}
              {portfolio.trades.filter((t) => t.txHash).length > 0 && (
                <Card>
                  <SectionTitle>Local Trades with On-chain Record</SectionTitle>
                  <div className="space-y-0">
                    {portfolio.trades
                      .filter((t) => t.txHash)
                      .slice()
                      .reverse()
                      .map((t) => (
                        <div key={t.id} className="flex items-center justify-between py-3 border-b border-mantle-border last:border-0">
                          <div className="flex items-center gap-3">
                            <Badge variant={t.side === "buy" ? "green" : "red"} className="text-[10px]">
                              {t.side.toUpperCase()}
                            </Badge>
                            <div>
                              <div className="text-sm font-medium">{t.pair}</div>
                              <div className="text-xs text-mantle-muted">{t.strategy}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <a
                              href={getExplorerTxUrl(t.txHash!)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-mantle-purple hover:underline font-mono"
                            >
                              ⛓️ {t.txHash!.slice(0, 10)}…
                            </a>
                            <div className="text-xs text-mantle-muted mt-0.5">
                              {format(new Date(t.timestamp), "HH:mm:ss")}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
