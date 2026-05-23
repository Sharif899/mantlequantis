"use client";
import { useBybitOrderBook } from "@/lib/bybit";
import clsx from "clsx";

interface OrderBookProps {
  symbol: string;
  midPrice?: number;
}

export default function OrderBook({ symbol, midPrice }: OrderBookProps) {
  const { asks, bids } = useBybitOrderBook(symbol);

  const fmt = (p: string) => {
    const n = parseFloat(p);
    return n > 100
      ? n.toLocaleString(undefined, { maximumFractionDigits: 2 })
      : n.toFixed(4);
  };

  const fmtSize = (s: string) => {
    const n = parseFloat(s);
    return n > 1000 ? `${(n / 1000).toFixed(1)}K` : n.toFixed(2);
  };

  return (
    <div className="font-mono text-xs">
      {/* Header */}
      <div className="flex justify-between text-mantle-muted mb-2 px-1">
        <span>Price (USDT)</span>
        <span>Size</span>
      </div>

      {/* Asks (sell side - shown in reverse so lowest ask is closest to mid) */}
      <div className="flex flex-col gap-0.5 mb-1">
        {asks.slice().reverse().map((ask, i) => (
          <div key={i} className="relative flex justify-between items-center px-1 py-0.5 rounded overflow-hidden">
            <div
              className="absolute right-0 top-0 bottom-0 bg-mantle-coral opacity-10 rounded"
              style={{ width: `${ask.depth * 100}%` }}
            />
            <span className="text-mantle-coral relative z-10">{fmt(ask.price)}</span>
            <span className="text-mantle-muted relative z-10">{fmtSize(ask.size)}</span>
          </div>
        ))}
      </div>

      {/* Mid price */}
      <div className="text-center py-2 border-y border-mantle-border my-1">
        <span className="text-base font-bold text-white num">
          {midPrice != null
            ? midPrice > 100
              ? `$${midPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
              : `$${midPrice.toFixed(4)}`
            : asks[0]
            ? `$${fmt(asks[0].price)}`
            : "—"}
        </span>
      </div>

      {/* Bids (buy side) */}
      <div className="flex flex-col gap-0.5 mt-1">
        {bids.map((bid, i) => (
          <div key={i} className="relative flex justify-between items-center px-1 py-0.5 rounded overflow-hidden">
            <div
              className="absolute right-0 top-0 bottom-0 bg-mantle-teal opacity-10 rounded"
              style={{ width: `${bid.depth * 100}%` }}
            />
            <span className="text-mantle-teal relative z-10">{fmt(bid.price)}</span>
            <span className="text-mantle-muted relative z-10">{fmtSize(bid.size)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
