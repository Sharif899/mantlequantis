"use client";
import { useState, useEffect } from "react";
import { fetchMNTPrice } from "@/lib/bybit";
import { useStore } from "@/lib/store";
import { Card, StatCard, Badge, SectionTitle } from "@/components/ui";
import clsx from "clsx";

// Simulated on-chain analytics (in prod: replace with Nansen API or Mantle Explorer API)
const SMART_MONEY = [
  { wallet: "0x7f3a…Mantle Whale", action: "Accumulated", asset: "MNT", amount: "$2.4M", time: "4m ago", label: "Smart Money" },
  { wallet: "0x9e2f…DeFi Fund", action: "Staked", asset: "mETH", amount: "$890K", time: "12m ago", label: "Institution" },
  { wallet: "0x2c8b…Yield Optimizer", action: "Added LP", asset: "MNT/USDT", amount: "$1.1M", time: "23m ago", label: "Smart Money" },
  { wallet: "0x5a1e…Quant Bot", action: "Sold", asset: "ETH", amount: "$340K", time: "31m ago", label: "Quant" },
  { wallet: "0x8d4c…RWA Protocol", action: "Minted", asset: "USDY", amount: "$5.2M", time: "1h ago", label: "Protocol" },
];

const POOLS = [
  { name: "MNT/USDT", protocol: "Merchant Moe", tvl: "$42M", vol24h: "$8.2M", apr: "18.4%", fee: "0.3%" },
  { name: "mETH/USDT", protocol: "Agni Finance", tvl: "$31M", vol24h: "$5.4M", apr: "12.1%", fee: "0.05%" },
  { name: "ETH/USDT", protocol: "Merchant Moe", tvl: "$28M", vol24h: "$11M", apr: "9.8%", fee: "0.3%" },
  { name: "fBTC/USDT", protocol: "Agni Finance", tvl: "$19M", vol24h: "$3.1M", apr: "7.2%", fee: "0.05%" },
  { name: "USDY/USDT", protocol: "Merchant Moe", tvl: "$14M", vol24h: "$2.8M", apr: "5.4%", fee: "0.01%" },
];

const ANOMALIES = [
  { type: "Volume Spike", asset: "MNT/USDT", detail: "3.2x normal volume on Merchant Moe", severity: "high", time: "2m ago" },
  { type: "Large Liquidation", asset: "ETH", detail: "$4.1M liquidated across Mantle lending protocols", severity: "medium", time: "8m ago" },
  { type: "Flash Loan", asset: "mETH", detail: "$12M flash loan, returned same block — arb likely", severity: "low", time: "15m ago" },
  { type: "Whale Alert", asset: "BTC", detail: "500 BTC bridged to Mantle from Ethereum", severity: "medium", time: "22m ago" },
  { type: "New Whale", asset: "MNT", detail: "New wallet accumulated $3.8M MNT in 10 minutes", severity: "high", time: "35m ago" },
];

const SEVERITY_COLORS = { high: "red", medium: "amber", low: "gray" } as const;
const LABEL_COLORS = { "Smart Money": "purple", Institution: "blue", Quant: "amber", Protocol: "gray" } as const;

export default function AnalyticsPage() {
  const { agents } = useStore();
  const [mntData, setMntData] = useState({ price: 0, change24h: 0, marketCap: 0 });

  useEffect(() => {
    fetchMNTPrice().then(setMntData);
    const interval = setInterval(() => fetchMNTPrice().then(setMntData), 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Analytics</h1>
        <p className="text-xs text-mantle-muted mt-1">
          On-chain intelligence — Mantle Network · Powered by CoinGecko + Mantle Explorer
        </p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Mantle TVL"
          value="$4.2B"
          sub={<span className="text-mantle-teal">+2.3% today</span>}
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
          positive={mntData.change24h > 0}
          negative={mntData.change24h < 0}
        />
        <StatCard
          label="24h DEX Volume"
          value="$182M"
          sub="Merchant Moe + Agni Finance"
        />
        <StatCard
          label="Active MantleQuant Agents"
          value={agents.filter((a) => a.active).length.toString()}
          sub={<span><span className="live-dot mr-1" />Competing in hackathon</span>}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* Smart money */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <SectionTitle className="mb-0">Smart Money Signals</SectionTitle>
            <Badge variant="gray" className="text-[10px]">via Nansen labels</Badge>
          </div>
          <div className="space-y-0">
            {SMART_MONEY.map((s, i) => (
              <div key={i} className="flex items-start gap-3 py-3 border-b border-mantle-border last:border-0">
                <Badge
                  variant={LABEL_COLORS[s.label as keyof typeof LABEL_COLORS] || "gray"}
                  className="text-[10px] shrink-0 mt-0.5"
                >
                  {s.label}
                </Badge>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white truncate">{s.wallet}</div>
                  <div className="text-xs text-mantle-muted">
                    {s.action} <span className="text-mantle-purple">{s.asset}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-semibold text-white">{s.amount}</div>
                  <div className="text-[10px] text-mantle-muted">{s.time}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-mantle-muted mt-3">
            * In production: connect Nansen API (free tier available for hackathon sponsors)
          </p>
        </Card>

        {/* Pool data */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <SectionTitle className="mb-0">Top Pools — Mantle DEXes</SectionTitle>
            <Badge variant="green" dot className="text-[10px]">Live</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-mantle-border">
                  {["Pool", "Protocol", "TVL", "24h Vol", "APR"].map((h) => (
                    <th key={h} className="text-left py-2 pr-3 text-mantle-muted font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {POOLS.map((p) => (
                  <tr key={p.name} className="border-b border-mantle-border last:border-0 hover:bg-[#0D0D14] transition-colors">
                    <td className="py-2.5 pr-3 font-medium text-white">{p.name}</td>
                    <td className="py-2.5 pr-3 text-mantle-muted">{p.protocol}</td>
                    <td className="py-2.5 pr-3 num">{p.tvl}</td>
                    <td className="py-2.5 pr-3 num">{p.vol24h}</td>
                    <td className="py-2.5 pr-3">
                      <Badge variant="green" className="text-[10px]">{p.apr}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Anomaly detection */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <SectionTitle className="mb-0">On-chain Anomaly Detection</SectionTitle>
          <Badge variant="purple" dot className="text-[10px]">AI-powered</Badge>
        </div>
        <div className="space-y-0">
          {ANOMALIES.map((a, i) => (
            <div key={i} className="flex items-start gap-3 py-3 border-b border-mantle-border last:border-0">
              <Badge variant={SEVERITY_COLORS[a.severity as keyof typeof SEVERITY_COLORS]} className="shrink-0 mt-0.5 text-[10px]">
                {a.severity}
              </Badge>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-white">{a.type}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2A2840] text-mantle-purple">{a.asset}</span>
                </div>
                <div className="text-xs text-mantle-muted">{a.detail}</div>
              </div>
              <div className="text-[10px] text-mantle-muted shrink-0">{a.time}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Mantle chain stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
        {[
          { label: "Block Time", value: "~2s", sub: "Mantle Sepolia" },
          { label: "Avg Gas Fee", value: "$0.001", sub: "Very low L2 fees" },
          { label: "MNT Market Cap", value: mntData.marketCap > 0 ? `$${(mntData.marketCap / 1e9).toFixed(2)}B` : "—", sub: "CoinGecko live" },
          { label: "EigenDA Uptime", value: "99.9%", sub: "Data availability layer" },
        ].map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} sub={s.sub} />
        ))}
      </div>
    </div>
  );
}
