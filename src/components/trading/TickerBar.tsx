"use client";
import { useBybitTicker } from "@/lib/bybit";
import clsx from "clsx";

const PAIRS = ["MNT/USDT", "ETH/USDT", "BTC/USDT"];

export default function TickerBar() {
  const tickers = useBybitTicker(PAIRS);

  return (
    <div className="flex items-center gap-6 overflow-x-auto py-2 mb-6 border-b border-mantle-border hide-scrollbar">
      <div className="flex items-center gap-1.5 shrink-0 text-xs text-mantle-muted">
        <span className="live-dot" />
        Live
      </div>
      {PAIRS.map((pair) => {
        const t = tickers[pair];
        const price = t ? parseFloat(t.lastPrice) : null;
        const change = t ? parseFloat(t.price24hPcnt) * 100 : null;
        const isUp = (change ?? 0) >= 0;

        return (
          <div key={pair} className="flex items-center gap-3 shrink-0">
            <span className="text-sm font-semibold text-white">{pair}</span>
            <span className="text-sm num text-white">
              {price != null
                ? price > 100
                  ? `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                  : `$${price.toFixed(4)}`
                : "—"}
            </span>
            <span
              className={clsx(
                "text-xs font-medium num",
                isUp ? "text-mantle-teal" : "text-mantle-coral"
              )}
            >
              {change != null
                ? `${isUp ? "+" : ""}${change.toFixed(2)}%`
                : "—"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
