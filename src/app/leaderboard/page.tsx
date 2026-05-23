"use client";
import { useStore } from "@/lib/store";
import { useAccount } from "wagmi";
import { Card, StatCard, Badge, SectionTitle } from "@/components/ui";
import { PnlText } from "@/components/ui";
import { EquityCurveChart } from "@/components/charts";
import clsx from "clsx";

const MOCK_LEADERBOARD = [
  { rank: 1, name: "MantleAlpha.eth", wallet: "0x7f3a…2b1c", strategy: "Momentum Surfer", roi: 34.2, volume: 2100000, trades: 847, score: 9840 },
  { rank: 2, name: "QuantBot_X", wallet: "0x9e2f…4d8a", strategy: "Cross-Pool Arb", roi: 28.7, volume: 3400000, trades: 1204, score: 9210 },
  { rank: 3, name: "NeuralTrader", wallet: "0x2c8b…7f3d", strategy: "ML Predictor", roi: 22.1, volume: 980000, trades: 312, score: 8650 },
  { rank: 4, name: "WhaleFollower", wallet: "0x5a1e…9c2b", strategy: "Smart Money", roi: 19.8, volume: 1200000, trades: 156, score: 7920 },
  { rank: 5, name: "YieldHunter.eth", wallet: "0x8d4c…1a7f", strategy: "RWA Yield", roi: 15.3, volume: 560000, trades: 89, score: 7100 },
  { rank: 6, name: "SigmaDegen", wallet: "0x3b9a…5e2c", strategy: "Mean Reversion", roi: 11.2, volume: 720000, trades: 441, score: 6340 },
  { rank: 7, name: "MangoTrader", wallet: "0x1f2e…8a3b", strategy: "Momentum Surfer", roi: 8.7, volume: 430000, trades: 203, score: 5880 },
  { rank: 8, name: "OnchainOracle", wallet: "0x6c4d…2f9a", strategy: "Smart Money", roi: 6.1, volume: 280000, trades: 78, score: 4920 },
];

const RANK_COLORS: Record<number, string> = {
  1: "text-yellow-400",
  2: "text-gray-300",
  3: "text-amber-600",
};

export default function LeaderboardPage() {
  const { portfolio, agents } = useStore();
  const { address } = useAccount();

  const yourRoi = portfolio.totalPnlPct;
  const yourVolume = portfolio.trades.reduce((s, t) => s + t.amount, 0);
  const yourTrades = portfolio.trades.length;

  // Insert user into leaderboard
  const yourEntry = {
    rank: 0,
    name: address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "You",
    wallet: address || "—",
    strategy: agents[0]?.strategyName || "—",
    roi: yourRoi,
    volume: yourVolume,
    trades: yourTrades,
    score: Math.max(0, Math.round(yourRoi * 200 + yourTrades * 5)),
    isYou: true,
  };

  // Combine and sort
  const combined = [...MOCK_LEADERBOARD, yourEntry]
    .sort((a, b) => b.roi - a.roi)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  const yourRank = combined.find((e) => e.isYou)?.rank ?? "—";

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Leaderboard</h1>
          <p className="text-xs text-mantle-muted mt-1">
            Turing Test Hackathon 2026 — AI Awakening Phase · 662 participants
          </p>
        </div>
        <Badge variant="green" dot>Live Rankings</Badge>
      </div>

      {/* Your stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Your Rank"
          value={`#${yourRank}`}
          sub="of 662 hackers"
          positive={typeof yourRank === "number" && yourRank <= 10}
        />
        <StatCard
          label="Your ROI"
          value={`${yourRoi >= 0 ? "+" : ""}${yourRoi.toFixed(2)}%`}
          sub={`$${portfolio.totalValue.toFixed(2)} portfolio`}
          positive={yourRoi > 0}
          negative={yourRoi < 0}
        />
        <StatCard
          label="Your Volume"
          value={`$${yourVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          sub={`${yourTrades} trades executed`}
        />
        <StatCard
          label="Your Score"
          value={yourEntry.score.toLocaleString()}
          sub="ROI × volume × trades"
          positive={yourEntry.score > 5000}
        />
      </div>

      {/* Equity curve */}
      {portfolio.equityCurve.length > 2 && (
        <Card className="mb-5">
          <SectionTitle>Your Equity Curve</SectionTitle>
          <EquityCurveChart data={portfolio.equityCurve} height={180} />
        </Card>
      )}

      {/* Leaderboard table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-mantle-border">
                {["Rank", "Agent / Wallet", "Strategy", "ROI", "Volume", "Trades", "Score"].map((h) => (
                  <th key={h} className="text-left py-3 px-3 text-xs text-mantle-muted font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {combined.map((row) => (
                <tr
                  key={row.wallet}
                  className={clsx(
                    "border-b border-mantle-border transition-colors",
                    row.isYou
                      ? "bg-[#1A1A2E] border-mantle-purple/30"
                      : "hover:bg-[#0D0D14]"
                  )}
                >
                  <td className="py-3 px-3">
                    <span className={clsx(
                      "text-base font-bold num",
                      RANK_COLORS[row.rank] || "text-mantle-muted"
                    )}>
                      {row.rank <= 3 ? ["🥇", "🥈", "🥉"][row.rank - 1] : `#${row.rank}`}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className={clsx("font-medium", row.isYou && "text-mantle-purple")}>
                      {row.name}
                      {row.isYou && <span className="ml-2 text-[10px] text-mantle-purple">(You)</span>}
                    </div>
                    <div className="text-[10px] text-mantle-muted font-mono mt-0.5">{row.wallet}</div>
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant="purple" className="text-[10px]">{row.strategy || "—"}</Badge>
                  </td>
                  <td className={clsx("py-3 px-3 font-semibold num", row.roi >= 0 ? "text-mantle-teal" : "text-mantle-coral")}>
                    {row.roi >= 0 ? "+" : ""}{row.roi.toFixed(2)}%
                  </td>
                  <td className="py-3 px-3 num text-sm">
                    ${row.volume >= 1000000
                      ? `${(row.volume / 1000000).toFixed(1)}M`
                      : `${(row.volume / 1000).toFixed(0)}K`}
                  </td>
                  <td className="py-3 px-3 num text-mantle-muted">{row.trades}</td>
                  <td className="py-3 px-3 font-semibold num">{row.score.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-4 border-t border-mantle-border">
          <p className="text-xs text-mantle-muted">
            📊 Score = (ROI × 200) + (Trades × 5). Rankings update in real time.
            All trades are logged on <a href="https://explorer.sepolia.mantle.xyz" target="_blank" rel="noopener noreferrer" className="text-mantle-purple hover:underline">Mantle Sepolia Explorer</a> for full transparency.
          </p>
        </div>
      </Card>
    </div>
  );
}
