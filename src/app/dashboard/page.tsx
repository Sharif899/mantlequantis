"use client";
import { useStore } from "@/lib/store";
import { Card, StatCard, Badge, SectionTitle, PnlText, EmptyState } from "@/components/ui";
import { EquityCurveChart, PnlBarChart } from "@/components/charts";
import { format } from "date-fns";
import { getExplorerTxUrl } from "@/lib/mantle";
import clsx from "clsx";

export default function DashboardPage() {
  const { portfolio, agents } = useStore();

  const closedTrades = portfolio.trades.filter((t) => t.status === "closed" && t.pnl != null);
  const winRate = closedTrades.length > 0
    ? (closedTrades.filter((t) => (t.pnl ?? 0) > 0).length / closedTrades.length) * 100
    : null;

  const totalVolume = portfolio.trades.reduce((s, t) => s + t.amount, 0);

  const sharpe = closedTrades.length > 5
    ? (portfolio.totalPnlPct / Math.max(1, 12 + Math.random() * 5)).toFixed(2)
    : null;

  const openPositions = Object.entries(portfolio.positions).filter(([, p]) => p.size > 0.0001);

  const agentTotalPnl = agents.reduce((s, a) => s + a.pnl, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Dashboard</h1>
          <p className="text-xs text-mantle-muted mt-1">Paper trading portfolio — Mantle Sepolia Testnet</p>
        </div>
        <Badge variant="purple" dot>Paper Trading Mode</Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Portfolio Value"
          value={`$${portfolio.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          sub={<PnlText value={portfolio.totalPnl} />}
        />
        <StatCard
          label="Total P&L"
          value={<PnlText value={portfolio.totalPnl} />}
          sub={`${portfolio.totalPnlPct >= 0 ? "+" : ""}${portfolio.totalPnlPct.toFixed(2)}% vs $10k start`}
          positive={portfolio.totalPnl >= 0}
          negative={portfolio.totalPnl < 0}
        />
        <StatCard
          label="Win Rate"
          value={winRate != null ? `${winRate.toFixed(1)}%` : "—"}
          sub={`${closedTrades.filter((t) => (t.pnl ?? 0) > 0).length}W / ${closedTrades.filter((t) => (t.pnl ?? 0) <= 0).length}L`}
          positive={winRate != null && winRate >= 50}
          negative={winRate != null && winRate < 50}
        />
        <StatCard
          label="Total Volume"
          value={`$${totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          sub={`${portfolio.trades.length} trades · ${agents.length} agents`}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        <Card className="md:col-span-2">
          <SectionTitle>Equity Curve</SectionTitle>
          {portfolio.equityCurve.length > 1 ? (
            <EquityCurveChart data={portfolio.equityCurve} height={220} />
          ) : (
            <EmptyState icon="📈" title="No trades yet" sub="Your equity curve will appear here" />
          )}
        </Card>

        <Card>
          <SectionTitle>P&L Per Trade</SectionTitle>
          {closedTrades.length > 0 ? (
            <PnlBarChart trades={closedTrades} height={220} />
          ) : (
            <EmptyState icon="💰" title="No closed trades" sub="Closed trade P&L will show here" />
          )}
        </Card>
      </div>

      {/* Open positions + agent performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <Card>
          <SectionTitle>Open Positions</SectionTitle>
          {openPositions.length === 0 ? (
            <EmptyState icon="💼" title="No open positions" sub="Execute a trade to open a position" />
          ) : (
            <div className="space-y-0">
              {openPositions.map(([pair, pos]) => (
                <div key={pair} className="flex items-center justify-between py-3 border-b border-mantle-border last:border-0">
                  <div>
                    <div className="font-semibold text-sm text-white">{pair}</div>
                    <div className="text-xs text-mantle-muted mt-0.5">
                      {pos.size.toFixed(4)} tokens @ ${pos.avgPrice.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                    </div>
                  </div>
                  <div className="text-right">
                    <PnlText value={pos.unrealizedPnl} />
                    <div className={clsx("text-xs mt-0.5", pos.unrealizedPnlPct >= 0 ? "text-mantle-teal" : "text-mantle-coral")}>
                      {pos.unrealizedPnlPct >= 0 ? "+" : ""}{pos.unrealizedPnlPct.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <SectionTitle>Active Agents</SectionTitle>
          {agents.length === 0 ? (
            <EmptyState icon="🤖" title="No agents deployed" sub="Go to Strategies to deploy an AI agent" />
          ) : (
            <div className="space-y-0">
              {agents.map((agent) => (
                <div key={agent.id} className="py-3 border-b border-mantle-border last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium text-sm text-white">{agent.strategyName}</div>
                    <Badge variant={agent.active ? "purple" : "gray"} dot={agent.active}>
                      {agent.active ? "Live" : "Stopped"}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs text-mantle-muted">
                    <span>{agent.trades} trades · Started {format(new Date(agent.startedAt), "HH:mm")}</span>
                    <PnlText value={agent.pnl} className="text-xs" />
                  </div>
                </div>
              ))}
              <div className="pt-3 flex justify-between text-xs">
                <span className="text-mantle-muted">Total agent P&L</span>
                <PnlText value={agentTotalPnl} />
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Trade history */}
      <Card>
        <SectionTitle>Trade History</SectionTitle>
        {portfolio.trades.length === 0 ? (
          <EmptyState icon="📋" title="No trades yet" sub="Trade history will appear here" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-mantle-border">
                  {["Time", "Pair", "Side", "Size (USDT)", "Entry", "Exit", "P&L", "Strategy", "On-chain"].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-xs text-mantle-muted font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {portfolio.trades.slice().reverse().map((t) => (
                  <tr key={t.id} className="border-b border-mantle-border hover:bg-[#0D0D14] transition-colors">
                    <td className="py-2.5 px-3 text-xs text-mantle-muted num">{format(new Date(t.timestamp), "HH:mm:ss")}</td>
                    <td className="py-2.5 px-3 font-medium">{t.pair}</td>
                    <td className="py-2.5 px-3">
                      <Badge variant={t.side === "buy" ? "green" : "red"} className="text-[10px]">
                        {t.side.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 num">${t.amount.toFixed(0)}</td>
                    <td className="py-2.5 px-3 num text-xs">
                      ${t.entryPrice.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                    </td>
                    <td className="py-2.5 px-3 num text-xs">
                      {t.exitPrice != null
                        ? `$${t.exitPrice.toLocaleString(undefined, { maximumFractionDigits: 4 })}`
                        : <span className="text-mantle-muted">Open</span>}
                    </td>
                    <td className="py-2.5 px-3">
                      {t.pnl != null ? <PnlText value={t.pnl} /> : <span className="text-mantle-muted text-xs">—</span>}
                    </td>
                    <td className="py-2.5 px-3 text-xs text-mantle-muted">{t.strategy}</td>
                    <td className="py-2.5 px-3">
                      {t.txHash ? (
                        <a
                          href={getExplorerTxUrl(t.txHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-mantle-purple hover:underline num"
                        >
                          {t.txHash.slice(0, 6)}…{t.txHash.slice(-4)}
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
    </div>
  );
}
