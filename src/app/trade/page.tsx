"use client";
import { useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { ethers } from "ethers";
import { useBybitTicker, fetchKlines } from "@/lib/bybit";
import { useStore } from "@/lib/store";
import { logTradeOnChain, TRADE_LOGGER_ADDRESS } from "@/lib/mantle";
import { Card, Badge, Button, SectionTitle } from "@/components/ui";
import { PriceChart } from "@/components/charts";
import OrderBook from "@/components/trading/OrderBook";
import clsx from "clsx";
import type { OHLCCandle } from "@/types";

const TRADE_PAIRS = ["MNT/USDT", "ETH/USDT", "BTC/USDT"];
const TABS = ["Buy", "Sell", "Agents"] as const;
type Tab = typeof TABS[number];

export default function TradePage() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { portfolio, agents, executeTrade, selectedPair, setSelectedPair } = useStore();
  const tickers = useBybitTicker(TRADE_PAIRS);
  const [activeTab, setActiveTab] = useState<Tab>("Buy");
  const [buyAmount, setBuyAmount] = useState("100");
  const [sellAmount, setSellAmount] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [orderType, setOrderType] = useState<"Market" | "Limit">("Market");
  const [candles, setCandles] = useState<OHLCCandle[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [loggingOnChain, setLoggingOnChain] = useState(false);

  const ticker = tickers[selectedPair];
  const currentPrice = ticker ? parseFloat(ticker.lastPrice) : 0;
  const change24h = ticker ? parseFloat(ticker.price24hPcnt) * 100 : 0;
  const contractDeployed = !!TRADE_LOGGER_ADDRESS;
  const pos = portfolio.positions[selectedPair];
  const hasSellable = pos && pos.size > 0.0001;
  const tokenSymbol = selectedPair.split("/")[0];

  // Use limit price if set, otherwise use market price
  const executionPrice = orderType === "Limit" && parseFloat(limitPrice) > 0
    ? parseFloat(limitPrice)
    : currentPrice;

  useEffect(() => {
    fetchKlines(selectedPair, "15", 80).then(setCandles);
  }, [selectedPair]);

  useEffect(() => {
    if (pos && pos.size > 0.0001) {
      setSellAmount(pos.size.toFixed(4));
    } else {
      setSellAmount("");
    }
  }, [selectedPair, pos?.size]);

  // Auto-fill limit price with current price when switching to Limit
  useEffect(() => {
    if (orderType === "Limit" && currentPrice > 0 && !limitPrice) {
      setLimitPrice(currentPrice.toFixed(currentPrice > 100 ? 2 : 4));
    }
  }, [orderType, currentPrice]);

  const showToast = (msg: string, type: "success" | "error" | "info" = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  async function handleTrade(side: "buy" | "sell") {
    if (!isConnected) { showToast("Connect your wallet first", "error"); return; }
    if (currentPrice === 0) { showToast("Price not loaded yet", "error"); return; }
    if (orderType === "Limit" && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      showToast("Enter a limit price", "error"); return;
    }

    let amountUsdt: number;
    if (side === "buy") {
      amountUsdt = parseFloat(buyAmount);
      if (isNaN(amountUsdt) || amountUsdt < 10) { showToast("Minimum trade is $10", "error"); return; }
    } else {
      const tokenAmt = parseFloat(sellAmount);
      if (isNaN(tokenAmt) || tokenAmt <= 0) { showToast("Enter amount to sell", "error"); return; }
      if (!pos || tokenAmt > pos.size) { showToast("Insufficient position", "error"); return; }
      amountUsdt = tokenAmt * executionPrice;
    }

    setSubmitting(true);
    let txHash: string | undefined;

    try {
      if (walletClient && contractDeployed) {
        setLoggingOnChain(true);
        try {
          const provider = new ethers.BrowserProvider(walletClient as any);
          const signer = await provider.getSigner();
          const hash = await logTradeOnChain(signer, {
            id: Date.now().toString(),
            pair: selectedPair,
            side,
            amount: amountUsdt,
            size: amountUsdt / executionPrice,
            entryPrice: executionPrice,
            strategy: "Manual",
            timestamp: Date.now(),
            status: side === "buy" ? "open" : "closed",
          });
          if (hash) {
            txHash = hash;
            setLastTxHash(hash);
            showToast(`✅ Trade logged on Mantle! TX: ${hash.slice(0, 10)}…`, "success");
          }
        } catch (err: any) {
          console.warn("On-chain log failed:", err?.message);
          showToast("⚠️ On-chain log skipped", "info");
        } finally {
          setLoggingOnChain(false);
        }
      }

      const trade = executeTrade({
        pair: selectedPair,
        side,
        amountUsdt,
        price: executionPrice,
        strategy: "Manual",
        txHash,
      });

      if (!trade) {
        showToast(side === "buy" ? "Insufficient cash balance" : "Insufficient position to sell", "error");
        return;
      }

      if (!txHash) {
        showToast(
          `${side === "buy" ? "📈 Bought" : "📉 Sold"} ${trade.size.toFixed(4)} ${tokenSymbol} @ $${executionPrice.toLocaleString(undefined, { maximumFractionDigits: 4 })}`,
          "success"
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  const pctBuy = (p: number) => {
    const val = (portfolio.cash * p) / 100;
    setBuyAmount(val.toFixed(0));
  };

  const pctSell = (p: number) => {
    if (!pos || pos.size <= 0) return;
    setSellAmount(((pos.size * p) / 100).toFixed(4));
  };

  const LimitPriceInput = () => (
    <div className="mb-3">
      <div className="flex justify-between mb-1.5">
        <label className="text-xs text-mantle-muted">Limit Price (USDT)</label>
        <span className="text-xs text-mantle-muted">
          Market: <span className="text-white cursor-pointer hover:text-mantle-purple" onClick={() => setLimitPrice(currentPrice.toFixed(currentPrice > 100 ? 2 : 4))}>
            ${currentPrice.toFixed(currentPrice > 100 ? 2 : 4)}
          </span>
        </span>
      </div>
      <input
        type="number"
        value={limitPrice}
        step={currentPrice > 100 ? "0.01" : "0.0001"}
        onChange={(e) => setLimitPrice(e.target.value)}
        className="w-full bg-[#0D0D14] border border-mantle-purple/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-mantle-purple num"
        placeholder={`Enter limit price`}
      />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {toast && (
        <div className={clsx(
          "fixed bottom-6 right-6 z-50 border rounded-xl px-4 py-3 text-sm text-white shadow-xl max-w-sm",
          toast.type === "success" && "bg-[#0D2E20] border-mantle-teal",
          toast.type === "error" && "bg-[#2E1010] border-mantle-coral",
          toast.type === "info" && "bg-mantle-card border-mantle-border",
        )}>
          {toast.msg}
        </div>
      )}

      <div className={clsx(
        "flex items-center gap-3 px-4 py-3 rounded-xl border mb-5 text-sm",
        contractDeployed ? "bg-[#0D2E20] border-mantle-teal text-mantle-teal" : "bg-[#1A1A14] border-amber-800 text-amber-400"
      )}>
        <span>{contractDeployed ? "⛓️" : "⚠️"}</span>
        {contractDeployed ? (
          <span>On-chain logging active — every trade is recorded on <a href="https://explorer.sepolia.mantle.xyz" target="_blank" rel="noopener noreferrer" className="underline font-medium">Mantle Sepolia</a></span>
        ) : (
          <span>Deploy contract to enable on-chain logging. <a href="https://faucet.sepolia.mantle.xyz" target="_blank" rel="noopener noreferrer" className="underline">Get testnet MNT →</a></span>
        )}
        {lastTxHash && (
          <a href={`https://explorer.sepolia.mantle.xyz/tx/${lastTxHash}`} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs underline font-mono shrink-0">
            Last TX: {lastTxHash.slice(0, 8)}…
          </a>
        )}
      </div>

      <div className="flex items-center gap-3 mb-5 overflow-x-auto pb-1">
        {TRADE_PAIRS.map((pair) => {
          const t = tickers[pair];
          const price = t ? parseFloat(t.lastPrice) : null;
          const chg = t ? parseFloat(t.price24hPcnt) * 100 : null;
          return (
            <button key={pair} onClick={() => setSelectedPair(pair)} className={clsx("flex items-center gap-2 px-4 py-2 rounded-lg border text-sm whitespace-nowrap transition-all", selectedPair === pair ? "border-mantle-purple bg-[#1A1A30] text-white" : "border-mantle-border bg-mantle-card text-mantle-muted hover:border-mantle-border/60")}>
              <span className="font-medium">{pair}</span>
              {price != null && <span className="num text-xs">{price > 100 ? `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : `$${price.toFixed(4)}`}</span>}
              {chg != null && <span className={clsx("text-xs num", chg >= 0 ? "text-mantle-teal" : "text-mantle-coral")}>{chg >= 0 ? "+" : ""}{chg.toFixed(2)}%</span>}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_260px_1fr] gap-4">
        <Card>
          <SectionTitle>Order Book</SectionTitle>
          <OrderBook symbol={selectedPair} midPrice={currentPrice || undefined} />
        </Card>

        <div className="space-y-4">
          <Card>
            <div className="flex border-b border-mantle-border mb-4 -mx-5 px-5">
              {TABS.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={clsx("px-4 py-2.5 text-sm font-medium border-b-2 transition-colors", activeTab === tab ? "border-mantle-purple text-mantle-purple" : "border-transparent text-mantle-muted hover:text-white")}>
                  {tab}
                  {tab === "Agents" && agents.filter((a) => a.active).length > 0 && (
                    <span className="ml-1.5 bg-mantle-purple text-white text-[10px] px-1 rounded-full">{agents.filter((a) => a.active).length}</span>
                  )}
                </button>
              ))}
            </div>

            {activeTab === "Buy" && (
              <>
                <div className="mb-3">
                  <label className="text-xs text-mantle-muted mb-1.5 block">Order Type</label>
                  <select value={orderType} onChange={(e) => { setOrderType(e.target.value as any); setLimitPrice(""); }} className="w-full bg-[#0D0D14] border border-mantle-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-mantle-purple">
                    <option>Market</option>
                    <option>Limit</option>
                  </select>
                </div>
                {orderType === "Limit" && <LimitPriceInput />}
                <div className="mb-3">
                  <div className="flex justify-between mb-1.5">
                    <label className="text-xs text-mantle-muted">Amount (USDT)</label>
                    <span className="text-xs text-mantle-muted">Available: <span className="text-white">${portfolio.cash.toFixed(2)}</span></span>
                  </div>
                  <input type="number" value={buyAmount} min="10" onChange={(e) => setBuyAmount(e.target.value)} className="w-full bg-[#0D0D14] border border-mantle-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-mantle-purple num" />
                </div>
                <div className="flex gap-1.5 mb-4">
                  {[25, 50, 75, 100].map((p) => (
                    <button key={p} onClick={() => pctBuy(p)} className="flex-1 py-1.5 text-xs border border-mantle-border rounded-lg text-mantle-muted hover:border-mantle-purple hover:text-mantle-purple transition-colors">{p}%</button>
                  ))}
                </div>
                {executionPrice > 0 && parseFloat(buyAmount) > 0 && (
                  <div className="text-xs text-mantle-muted mb-3">
                    ≈ {(parseFloat(buyAmount) / executionPrice).toFixed(4)} {tokenSymbol}
                    {orderType === "Limit" && <span className="ml-2 text-mantle-purple">@ limit ${parseFloat(limitPrice).toFixed(4)}</span>}
                  </div>
                )}
                <Button variant="success" className="w-full" loading={submitting || loggingOnChain} onClick={() => handleTrade("buy")}>
                  {loggingOnChain ? "Logging on Mantle…" : `${orderType === "Limit" ? "Place Limit Buy" : "Buy"} ${tokenSymbol}`}
                </Button>
              </>
            )}

            {activeTab === "Sell" && (
              <>
                <div className="mb-3">
                  <label className="text-xs text-mantle-muted mb-1.5 block">Order Type</label>
                  <select value={orderType} onChange={(e) => { setOrderType(e.target.value as any); setLimitPrice(""); }} className="w-full bg-[#0D0D14] border border-mantle-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-mantle-purple">
                    <option>Market</option>
                    <option>Limit</option>
                  </select>
                </div>
                {orderType === "Limit" && <LimitPriceInput />}
                <div className="mb-3">
                  <div className="flex justify-between mb-1.5">
                    <label className="text-xs text-mantle-muted">Amount ({tokenSymbol})</label>
                    <span className="text-xs text-mantle-muted">Available: <span className="text-white">{pos ? pos.size.toFixed(4) : "0"} {tokenSymbol}</span></span>
                  </div>
                  <input type="number" value={sellAmount} min="0" step="0.0001" onChange={(e) => setSellAmount(e.target.value)} className="w-full bg-[#0D0D14] border border-mantle-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-mantle-purple num" placeholder={`Enter ${tokenSymbol} amount`} />
                </div>
                <div className="flex gap-1.5 mb-4">
                  {[25, 50, 75, 100].map((p) => (
                    <button key={p} onClick={() => pctSell(p)} className="flex-1 py-1.5 text-xs border border-mantle-border rounded-lg text-mantle-muted hover:border-mantle-purple hover:text-mantle-purple transition-colors">{p}%</button>
                  ))}
                </div>
                {executionPrice > 0 && parseFloat(sellAmount) > 0 && (
                  <div className="text-xs text-mantle-muted mb-3">
                    ≈ ${(parseFloat(sellAmount) * executionPrice).toFixed(2)} USDT
                    {orderType === "Limit" && <span className="ml-2 text-mantle-purple">@ limit ${parseFloat(limitPrice).toFixed(4)}</span>}
                  </div>
                )}
                <Button variant="danger" className="w-full" loading={submitting || loggingOnChain} onClick={() => handleTrade("sell")} disabled={!hasSellable}>
                  {loggingOnChain ? "Logging on Mantle…" : hasSellable ? `${orderType === "Limit" ? "Place Limit Sell" : "Sell"} ${tokenSymbol}` : `No ${tokenSymbol} position`}
                </Button>
              </>
            )}

            {activeTab === "Agents" && (
              <div>
                {agents.filter((a) => a.active).length === 0 ? (
                  <div className="text-center py-6 text-sm text-mantle-muted">No active agents.<br />Go to Strategies to deploy one.</div>
                ) : (
                  agents.filter((a) => a.active).map((agent) => (
                    <div key={agent.id} className="py-2.5 border-b border-mantle-border last:border-0">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-white">{agent.strategyName}</span>
                        <Badge variant="purple" dot>Live</Badge>
                      </div>
                      <div className="text-xs text-mantle-muted mt-0.5">
                        {agent.trades} trades · <span className={agent.pnl >= 0 ? "text-mantle-teal" : "text-mantle-coral"}>{agent.pnl >= 0 ? "+" : ""}${agent.pnl.toFixed(2)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {contractDeployed && activeTab !== "Agents" && (
              <p className="text-[10px] text-mantle-muted text-center mt-2">⛓️ Trade will be recorded on Mantle Sepolia</p>
            )}
            {!isConnected && (
              <p className="text-xs text-mantle-muted text-center mt-2">Connect wallet to trade</p>
            )}
          </Card>

          <Card>
            <SectionTitle>Paper Balances</SectionTitle>
            <div className="space-y-0">
              <div className="flex justify-between py-2 border-b border-mantle-border text-sm">
                <span className="text-mantle-muted">USDT (Cash)</span>
                <span className="font-medium num">${portfolio.cash.toFixed(2)}</span>
              </div>
              {Object.entries(portfolio.positions).filter(([, p]) => p.size > 0.0001).map(([pair, p]) => (
                <div key={pair} className="flex justify-between py-2 border-b border-mantle-border last:border-0 text-sm">
                  <span className="text-mantle-muted">{pair.split("/")[0]}</span>
                  <div className="text-right">
                    <div className="font-medium num">{p.size.toFixed(4)}</div>
                    <div className="text-xs text-mantle-muted num">≈${(p.size * (tickers[pair] ? parseFloat(tickers[pair].lastPrice) : p.avgPrice)).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <SectionTitle className="mb-0">{selectedPair} · 15m <span className="live-dot ml-2" /></SectionTitle>
            {ticker && (
              <div className="flex gap-4 text-xs text-mantle-muted">
                <span>H: <span className="text-mantle-teal num">${parseFloat(ticker.highPrice24h).toLocaleString(undefined, { maximumFractionDigits: 4 })}</span></span>
                <span>L: <span className="text-mantle-coral num">${parseFloat(ticker.lowPrice24h).toLocaleString(undefined, { maximumFractionDigits: 4 })}</span></span>
                <span>Vol: <span className="text-white num">${(parseFloat(ticker.volume24h) / 1e6).toFixed(1)}M</span></span>
              </div>
            )}
          </div>
          {candles.length > 0 ? (
            <PriceChart candles={candles} height={300} />
          ) : (
            <div className="flex items-center justify-center h-64 text-mantle-muted text-sm">Loading chart data...</div>
          )}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-bold num">
              {currentPrice > 100 ? `$${currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : `$${currentPrice.toFixed(4)}`}
            </span>
            <span className={clsx("text-sm font-medium num", change24h >= 0 ? "text-mantle-teal" : "text-mantle-coral")}>
              {change24h >= 0 ? "+" : ""}{change24h.toFixed(2)}% (24h)
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}