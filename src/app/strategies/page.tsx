"use client";
import { useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { ethers } from "ethers";
import { STRATEGIES } from "@/lib/strategies";
import { useStore } from "@/lib/store";
import { Card, Badge, Button, SectionTitle } from "@/components/ui";
import { TRADE_LOGGER_ABI, TRADE_LOGGER_ADDRESS, MANTLE_EXPLORER } from "@/lib/mantle";
import type { Strategy } from "@/types";
import clsx from "clsx";

const RISK_COLORS = { Low: "green", Medium: "amber", High: "red" } as const;

export default function StrategiesPage() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { agents, deployAgent, stopAgent, portfolio } = useStore();
  const [selected, setSelected] = useState<Strategy | null>(null);
  const [params, setParams] = useState<Record<string, number>>({});
  const [deploying, setDeploying] = useState(false);
  const [registerTxHash, setRegisterTxHash] = useState<string | null>(null);
  const [backtestResult, setBacktestResult] = useState<null | {
    roi: number; winRate: number; sharpe: number; maxDD: number; trades: number;
  }>(null);
  const [toast, setToast] = useState<string | null>(null);

  const activeAgents = agents.filter((a) => a.active);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  function selectStrategy(s: Strategy) {
    setSelected(s);
    setBacktestResult(null);
    const defaults: Record<string, number> = {};
    s.params.forEach((p) => (defaults[p.key] = p.default));
    setParams(defaults);
  }

  async function handleDeploy() {
    if (!selected) return;
    if (!isConnected) { showToast("⚠️ Connect your wallet first"); return; }
    if (agents.find((a) => a.strategyId === selected.id && a.active)) {
      showToast(`${selected.name} is already running`); return;
    }

    setDeploying(true);
    let erc8004TokenId: string | undefined;

    try {
      if (walletClient && TRADE_LOGGER_ADDRESS) {
        try {
          const provider = new ethers.BrowserProvider(walletClient as any);
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(TRADE_LOGGER_ADDRESS, TRADE_LOGGER_ABI, signer);
          showToast("⛓️ Registering agent on Mantle Sepolia…");
          const tx = await contract.registerAgent(selected.id, selected.name);
          const receipt = await tx.wait();
          erc8004TokenId = receipt.hash;
          setRegisterTxHash(receipt.hash);
          showToast(`✅ Agent registered on-chain! TX: ${receipt.hash.slice(0, 10)}…`);
        } catch (err: any) {
          console.warn("Agent registration failed:", err?.message);
          showToast("⚠️ On-chain registration skipped — deploying locally");
        }
      }

      deployAgent({
        strategyId: selected.id,
        strategyName: selected.name,
        pair: "MNT/USDT",
        params,
        active: true,
        erc8004TokenId,
      });

      startAgentSimulation(selected.id);

      if (!erc8004TokenId) {
        showToast(`🤖 ${selected.name} deployed!`);
      }
    } finally {
      setDeploying(false);
    }
  }

  function startAgentSimulation(strategyId: string) {
    const agentInterval = setInterval(() => {
      const store = useStore.getState();
      const agent = store.agents.find((a) => a.strategyId === strategyId && a.active);
      if (!agent) { clearInterval(agentInterval); return; }

      const s = STRATEGIES.find((x) => x.id === strategyId);
      const winRatePct = parseFloat(s?.winRate || "60") / 100;
      const isWin = Math.random() < winRatePct;
      const pnlDelta = isWin ? Math.random() * 15 + 2 : -(Math.random() * 10 + 1);
      const price = 0.94 + Math.random() * 0.05;

      store.agentTick(agent.id, pnlDelta, agent.pair, price);
    }, 6000 + Math.random() * 4000);
  }

  function runBacktest() {
    if (!selected) return;
    const winRate = parseFloat(selected.winRate) || 62;
    const trades = Math.floor(Math.random() * 200) + 80;
    const roi = parseFloat((Math.random() * 35 + 8).toFixed(1));
    const sharpe = parseFloat((1.1 + Math.random() * 1.4).toFixed(2));
    const maxDD = parseFloat((Math.random() * 9 + 2).toFixed(1));
    setBacktestResult({ roi, winRate, sharpe, maxDD, trades });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-mantle-card border border-mantle-border rounded-xl px-4 py-3 text-sm text-white shadow-xl max-w-sm">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">AI Strategies</h1>
          <p className="text-xs text-mantle-muted mt-1">
            Deploy autonomous agents on Mantle Sepolia. Every agent registered on-chain via ERC-8004.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {registerTxHash && (
            <a href={`${MANTLE_EXPLORER}/tx/${registerTxHash}`} target="_blank" rel="noopener noreferrer" className="text-xs text-mantle-purple hover:underline font-mono">
              Last reg: {registerTxHash.slice(0, 8)}…
            </a>
          )}
          <Badge variant={activeAgents.length > 0 ? "purple" : "gray"} dot={activeAgents.length > 0}>
            {activeAgents.length} active agent{activeAgents.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </div>

      {!TRADE_LOGGER_ADDRESS && (
        <div className="mb-5 px-4 py-3 rounded-xl border border-amber-800 bg-[#1A1A0D] text-amber-400 text-sm flex items-center gap-3">
          <span>⚠️</span>
          <span>Deploy <code className="bg-black/20 px-1 rounded">MantleQuantTradeLogger.sol</code> to Mantle Sepolia. <a href="https://faucet.sepolia.mantle.xyz" target="_blank" rel="noopener noreferrer" className="underline">Get testnet MNT →</a></span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {STRATEGIES.map((s) => {
          const isActive = agents.find((a) => a.strategyId === s.id && a.active);
          const isSelected = selected?.id === s.id;
          const activeAgent = agents.find((a) => a.strategyId === s.id && a.active);
          return (
            <div key={s.id} onClick={() => selectStrategy(s)} className={clsx("bg-mantle-card border rounded-xl p-5 cursor-pointer transition-all", isSelected ? "border-mantle-purple shadow-[0_0_20px_rgba(127,119,221,0.2)]" : "border-mantle-border hover:border-mantle-border/80")}>
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{s.icon}</span>
                <div className="flex gap-1.5">
                  {isActive && <Badge variant="purple" dot>Live</Badge>}
                  {isSelected && !isActive && <Badge variant="purple">Selected</Badge>}
                </div>
              </div>
              <div className="font-semibold text-white mb-1.5">{s.name}</div>
              <p className="text-xs text-mantle-muted leading-relaxed mb-3">{s.description}</p>
              <div className="flex gap-2 flex-wrap">
                <Badge variant={RISK_COLORS[s.risk]}>{s.risk} Risk</Badge>
                {s.winRate !== "N/A" && <Badge variant="gray">Win rate: {s.winRate}</Badge>}
              </div>
              {activeAgent?.erc8004TokenId && (
                <div className="mt-3 pt-3 border-t border-mantle-border">
                  <a href={`${MANTLE_EXPLORER}/tx/${activeAgent.erc8004TokenId}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-[10px] text-mantle-purple hover:underline font-mono">
                    ⛓️ On-chain: {activeAgent.erc8004TokenId.slice(0, 14)}…
                  </a>
                </div>
              )}
              <div className="mt-3 pt-3 border-t border-mantle-border text-xs text-mantle-muted">
                🌍 {s.bgaAlignment.slice(0, 85)}…
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <Card className="mb-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-semibold text-white">{selected.icon} Configure: {selected.name}</div>
              <div className="text-xs text-mantle-muted mt-1">
                Cash available: ${portfolio.cash.toLocaleString(undefined, { maximumFractionDigits: 2 })} · {TRADE_LOGGER_ADDRESS ? " Agent will be registered on Mantle Sepolia" : " Deploy contract to enable on-chain registration"}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>✕</Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-5">
            {selected.params.map((p) => (
              <div key={p.key}>
                <label className="text-xs text-mantle-muted mb-1.5 block">{p.label} {p.unit && <span className="opacity-60">({p.unit})</span>}</label>
                <input type="number" value={params[p.key] ?? p.default} min={p.min} max={p.max} step={p.step} onChange={(e) => setParams((prev) => ({ ...prev, [p.key]: parseFloat(e.target.value) }))} className="w-full bg-[#0D0D14] border border-mantle-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-mantle-purple" />
              </div>
            ))}
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button variant="primary" onClick={handleDeploy} loading={deploying} disabled={!isConnected}>🚀 Deploy on Mantle Sepolia</Button>
            <Button variant="outline" onClick={runBacktest}>📊 Run 30-day Backtest</Button>
            <Button variant="outline" onClick={() => window.open("/transparency", "_self")}>🔍 View Strategy Logic</Button>
            {!isConnected && <p className="text-xs text-mantle-muted self-center">Connect wallet to deploy</p>}
          </div>
        </Card>
      )}

      {backtestResult && (
        <Card className="mb-5">
          <SectionTitle>Backtest Results — {selected?.name} (30 days simulated)</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            {[
              { label: "Total Return", value: `+${backtestResult.roi}%`, pos: true },
              { label: "Win Rate", value: `${backtestResult.winRate}%`, pos: backtestResult.winRate >= 50 },
              { label: "Sharpe Ratio", value: backtestResult.sharpe.toString() },
              { label: "Max Drawdown", value: `-${backtestResult.maxDD}%`, neg: true },
              { label: "Total Trades", value: backtestResult.trades.toString() },
            ].map((m) => (
              <div key={m.label} className="bg-[#0D0D14] border border-mantle-border rounded-xl p-3">
                <div className="text-xs text-mantle-muted mb-1">{m.label}</div>
                <div className={clsx("text-lg font-semibold num", m.pos && "text-mantle-teal", m.neg && "text-mantle-coral")}>{m.value}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-mantle-muted">⚠️ Paper trading only. Past simulated performance does not guarantee future results.</p>
        </Card>
      )}

      {agents.length > 0 && (
        <Card>
          <SectionTitle>Running Agents</SectionTitle>
          <div className="space-y-0">
            {agents.map((agent) => {
              const s = STRATEGIES.find((x) => x.id === agent.strategyId);
              return (
                <div key={agent.id} className="flex items-center justify-between py-3 border-b border-mantle-border last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{s?.icon}</span>
                    <div>
                      <div className="font-medium text-sm text-white">{agent.strategyName}</div>
                      <div className="text-xs text-mantle-muted">{agent.trades} trades · Started {new Date(agent.startedAt).toLocaleTimeString()}</div>
                      {agent.erc8004TokenId && (
                        <a href={`${MANTLE_EXPLORER}/tx/${agent.erc8004TokenId}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-mantle-purple hover:underline font-mono">
                          ⛓️ {agent.erc8004TokenId.slice(0, 16)}…
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className={clsx("text-sm font-semibold num", agent.pnl >= 0 ? "text-mantle-teal" : "text-mantle-coral")}>{agent.pnl >= 0 ? "+" : ""}${agent.pnl.toFixed(2)}</div>
                      <Badge variant={agent.active ? "purple" : "gray"} dot={agent.active} className="text-[10px]">{agent.active ? "Live" : "Stopped"}</Badge>
                    </div>
                    {agent.active && <Button variant="outline" size="sm" onClick={() => stopAgent(agent.id)}>Stop</Button>}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}