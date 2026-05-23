"use client";
import { useEffect, useState } from "react";
import type { TickerData, OHLCCandle, OrderBookLevel } from "@/types";

export const PAIRS: Record<string, string> = {
  "MNT/USDT": "MNTUSDT",
  "ETH/USDT": "ETHUSDT",
  "BTC/USDT": "BTCUSDT",
};

async function fetchTickerViaProxy(symbol: string): Promise<TickerData | null> {
  try {
    const res = await fetch(`/api/ticker?symbol=${symbol}`);
    const data = await res.json();
    if (data.retCode === 0 && data.result?.list?.length > 0) {
      return data.result.list[0] as TickerData;
    }
    return null;
  } catch {
    return null;
  }
}

export function useBybitTicker(displayPairs: string[]) {
  const [tickers, setTickers] = useState<Record<string, TickerData>>({});

  useEffect(() => {
    async function fetchAll() {
      for (const pair of displayPairs) {
        const symbol = PAIRS[pair] || pair.replace("/", "");
        const ticker = await fetchTickerViaProxy(symbol);
        if (ticker) {
          setTickers((prev) => ({ ...prev, [pair]: ticker }));
        }
      }
    }

    fetchAll();
    const interval = setInterval(fetchAll, 3000);
    return () => clearInterval(interval);
  }, [displayPairs.join(",")]);

  return tickers;
}

export function useBybitOrderBook(symbol: string) {
  const [asks, setAsks] = useState<OrderBookLevel[]>([]);
  const [bids, setBids] = useState<OrderBookLevel[]>([]);

  useEffect(() => {
    async function fetchBook() {
      const bybitSym = PAIRS[symbol] || symbol.replace("/", "");
      const ticker = await fetchTickerViaProxy(bybitSym);
      if (!ticker) return;

      const mid = parseFloat(ticker.lastPrice);
      const spread = mid * 0.0005;
      const newAsks: OrderBookLevel[] = [];
      const newBids: OrderBookLevel[] = [];

      for (let i = 1; i <= 8; i++) {
        const askPrice = (mid + spread * i).toFixed(mid > 100 ? 2 : 4);
        const bidPrice = (mid - spread * i).toFixed(mid > 100 ? 2 : 4);
        newAsks.push({ price: askPrice, size: (Math.random() * 5000 + 200).toFixed(2), depth: Math.random() });
        newBids.push({ price: bidPrice, size: (Math.random() * 5000 + 200).toFixed(2), depth: Math.random() });
      }

      setAsks(newAsks);
      setBids(newBids);
    }

    fetchBook();
    const interval = setInterval(fetchBook, 3000);
    return () => clearInterval(interval);
  }, [symbol]);

  return { asks, bids };
}

export async function fetchKlines(pair: string, interval = "15", limit = 80): Promise<OHLCCandle[]> {
  const symbol = PAIRS[pair] || pair.replace("/", "");
  try {
    const res = await fetch(`/api/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
    const data = await res.json();
    if (data.retCode !== 0 || !data.result?.list) return [];
    return (data.result.list as string[][]).reverse().map((c) => ({
      time: parseInt(c[0]),
      open: parseFloat(c[1]),
      high: parseFloat(c[2]),
      low: parseFloat(c[3]),
      close: parseFloat(c[4]),
      volume: parseFloat(c[5]),
    }));
  } catch {
    return [];
  }
}

export async function fetchMNTPrice(): Promise<{ price: number; change24h: number; marketCap: number }> {
  try {
    const res = await fetch("/api/ticker?symbol=MNTUSDT");
    const data = await res.json();
    if (data.retCode === 0 && data.result?.list?.length > 0) {
      const t = data.result.list[0];
      return { price: parseFloat(t.lastPrice), change24h: parseFloat(t.price24hPcnt) * 100, marketCap: 0 };
    }
    return { price: 0, change24h: 0, marketCap: 0 };
  } catch {
    return { price: 0, change24h: 0, marketCap: 0 };
  }
}