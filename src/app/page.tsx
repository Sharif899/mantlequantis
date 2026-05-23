"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { fetchKlines, fetchMNTPrice } from "@/lib/bybit";
import { Card, StatCard, Badge, Button, SectionTitle, PnlText, EmptyState } from "@/components/ui";
import { EquityCurveChart, Sparkline } from "@/components/charts";
import TickerBar from "@/components/trading/TickerBar";
import { format } from "date-fns";
import type { OHLCCandle } from "@/types";

export default function HomePage() {
  const { portfolio, agents } = useStore();
  const [mntData, setMntData] = useState({ price: 0, change24h: 0, marketCap: 0 });
  const [candles, setCandles] = useState<OHLCCandle[]>([]);

  useEffect(() => {
    fetchMNTPrice().then(setMntData);
    fetchKlines("MNT/USDT", "15", 60).then(setCandles);
    const interval = setInterval(() => fetchMNTPrice().then(setMntData), 60000);
    return () => clearInterval(interval);
  }, []);

  const activeAgents = agents.filter((a) => a.active);
  const closedTrades = portfolio.trades.filter((t) => t.status === "closed");
  const winRate =
    closedTrades.length > 0
      ? (closedTrades.filter((t) => (t.pnl ?? 0) > 0).length / closedTrades.length) * 100
      : null;

  const signals = [
    { pair: "MNT/USDT", signal: "BUY", conf: 87, reason: "RSI oversold (28) + EMA crossover detected", strategy: "Momentum" },
    { pair: "ETH/USDT", signal: "HOLD", conf: 72, reason: "Consolidating within Bollinger Bands mid zone", strategy: "Mean Rev" },
    { pair: "mETH/USDT", signal: "BUY", conf: 81, reason: "Whale accumulation detected on Mantle", strategy: "Smart Money" },
    { pair: "BTC/USDT", signal: "SELL", conf: 79, reason: "BB upper band touch, RSI overbought (74)", strategy: "Mean Rev" },
  ] as const;

  const protocols = [
    { name: "Merchant Moe", type: "CLMM DEX", tvl: "$42M", apr: "18.4%", status: "live" },
    { name: "Agni Finance", type: "AMM DEX", tvl: "$31M", apr: "12.1%", status: "live" },
    { name: "mETH Protocol", type: "Liquid Staking", tvl: "$1.2B", apr: "4.8%", status: "live" },
    { name: "Fluxion", type: "Derivatives", tvl: "$18M", apr: "—", status: "live" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <TickerBar />

      {/* Hero stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Paper Portfolio"
          value={`$${portfolio.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          sub={
            <PnlText value={portfolio.totalPnl} />
          }
        />
        <StatCard
          label="MNT Price"
          value={mntData.price > 0 ? `$${mntData.price.toFixed(4)}` : "—"}
          sub={
            mntData.change24h !== 0 ? (
              <span className={mntData.change24h >= 0 ? "text-mantle-teal" : "text-mantle-coral"}>
                {mntData.change24h >= 0 ? "+" : ""}{mntData.change24h.toFixed(2)}% 24h
              </span>
            ) : "Loading..."
          }
        />
        <StatCard
          label="Active Agents"
          value={activeAgents.length.toString()}
          sub={<span><span className="live-dot mr-1" />Live on Mantle Sepolia</span>}
        />
        <StatCard
          label="Win Rate"
          value={winRate != null ? `${winRate.toFixed(0)}%` : "—"}
          sub={`${closedTrades.length} closed trades`}
          positive={winRate != null && winRate >= 50}
          negative={winRate != null && winRate < 50}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <Card>
          <SectionTitle>Portfolio Performance</SectionTitle>
          {portfolio.equityCurve.length > 1 ? (
            <EquityCurveChart data={portfolio.equityCurve} height={200} />
          ) : (
            <EmptyState icon="📊" title="No trades yet" sub="Deploy a strategy to start building your curve" />
          )}
        </Card>

        <Card>
          <SectionTitle>AI Strategy Signals</SectionTitle>
          <div className="space-y-0">
            {signals.map((s) => (
              <div key={s.pair} className="flex items-center gap-3 py-3 border-b border-mantle-border last:border-0">
                <div className="w-24 font-semibold text-sm text-white">{s.pair}</div>
                <Badge
                  variant={s.signal === "BUY" ? "green" : s.signal === "SELL" ? "red" : "gray"}
                  className="w-12 justify-center"
                >
                  {s.signal}
                </Badge>
                <div className="flex-1 text-xs text-mantle-muted">{s.reason}</div>
                <div className="text-xs font-semibold text-mantle-purple">{s.conf}%</div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link href="/strategies">
              <Button variant="outline" size="sm" className="w-full">
                Deploy Strategy Agent →
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* MNT Sparkline */}
        <Card>
          <SectionTitle>MNT/USDT — 15m Chart</SectionTitle>
          {candles.length > 0 ? (
            <>
              <Sparkline data={candles.map((c) => c.close)} height={80} />
              <div className="flex justify-between text-xs text-mantle-muted mt-2">
                <span>High: <span className="text-mantle-teal">${Math.max(...candles.map((c) => c.high)).toFixed(4)}</span></span>
                <span>Low: <span className="text-mantle-coral">${Math.min(...candles.map((c) => c.low)).toFixed(4)}</span></span>
                <span>Vol: ${(candles.reduce((s, c) => s + c.volume, 0) / 1e6).toFixed(2)}M</span>
              </div>
            </>
          ) : (
            <div className="text-xs text-mantle-muted text-center py-8">Loading chart...</div>
          )}
        </Card>

        {/* Recent trades */}
        <Card>
          <SectionTitle>Recent Trades</SectionTitle>
          {portfolio.trades.length === 0 ? (
            <EmptyState icon="📋" title="No trades yet" sub="Connect wallet and trade to see history" />
          ) : (
            <div className="space-y-0">
              {portfolio.trades.slice(-5).reverse().map((t) => (
                <div key={t.id} className="flex items-center justify-between py-2.5 border-b border-mantle-border last:border-0">
                  <div className="flex items-center gap-2">
                    <Badge variant={t.side === "buy" ? "green" : "red"} className="text-[10px]">
                      {t.side.toUpperCase()}
                    </Badge>
                    <span className="text-sm font-medium">{t.pair}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-mantle-muted">{format(new Date(t.timestamp), "HH:mm:ss")}</div>
                    {t.pnl != null && <PnlText value={t.pnl} className="text-xs" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Mantle protocols */}
        <Card>
          <SectionTitle>Mantle Ecosystem</SectionTitle>
          <div className="space-y-0">
            {protocols.map((p) => (
              <div key={p.name} className="flex items-center justify-between py-2.5 border-b border-mantle-border last:border-0">
                <div>
                  <div className="text-sm font-medium text-white">{p.name}</div>
                  <div className="text-xs text-mantle-muted">{p.type}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-white">TVL: {p.tvl}</div>
                  <Badge variant="green" className="text-[10px] mt-1">
                    <span className="live-dot" />
                    {p.apr !== "—" ? `APR ${p.apr}` : "Live"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* BGA Banner */}
      <div className="mt-5 rounded-xl border border-mantle-border bg-gradient-to-r from-[#13131F] to-[#1A1A2E] p-5 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-white mb-1">
            🌍 Built for Financial Inclusion — BGA Track
          </div>
          <div className="text-xs text-mantle-muted max-w-lg">
            MantleQuant gives retail traders access to the same AI quant strategies used by institutions.
            Every trade decision is logged on Mantle Sepolia for full transparency and verifiability.
          </div>
        </div>
        <Link href="/strategies">
          <Button variant="primary" size="sm" className="shrink-0 ml-4">
            Start Trading
          </Button>
        </Link>
      </div>
    </div>
  );
}
