"use client";
import { useEffect, useRef, useCallback, useState } from "react";
import type { TickerData, OHLCCandle, OrderBookLevel } from "@/types";

const WS_URL = "wss://stream.bybit.com/v5/public/spot";

// Maps our display pairs to Bybit symbols
export const PAIRS: Record<string, string> = {
  "MNT/USDT": "MNTUSDT",
  "ETH/USDT": "ETHUSDT",
  "BTC/USDT": "BTCUSDT",
};

export function useBybitTicker(symbols: string[]) {
  const [tickers, setTickers] = useState<Record<string, TickerData>>({});
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      const bybitSymbols = symbols.map((s) => PAIRS[s] || s);
      ws.current?.send(
        JSON.stringify({
          op: "subscribe",
          args: bybitSymbols.map((sym) => `tickers.${sym}`),
        })
      );
    };

    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.topic?.startsWith("tickers.") && data.data) {
        const sym = data.topic.replace("tickers.", "");
        const pair = Object.entries(PAIRS).find(([, v]) => v === sym)?.[0];
        if (pair) {
          setTickers((prev) => ({ ...prev, [pair]: data.data as TickerData }));
        }
      }
    };

    ws.current.onclose = () => {
      reconnectTimer.current = setTimeout(connect, 3000);
    };

    // Heartbeat every 20s to keep connection alive
    const ping = setInterval(() => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ op: "ping" }));
      }
    }, 20000);

    return () => clearInterval(ping);
  }, [symbols]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      ws.current?.close();
    };
  }, [connect]);

  return tickers;
}

export function useBybitOrderBook(symbol: string) {
  const [asks, setAsks] = useState<OrderBookLevel[]>([]);
  const [bids, setBids] = useState<OrderBookLevel[]>([]);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const bybitSym = PAIRS[symbol] || symbol;
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      ws.current?.send(
        JSON.stringify({
          op: "subscribe",
          args: [`orderbook.25.${bybitSym}`],
        })
      );
    };

    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.topic?.startsWith("orderbook.") && data.data) {
        const book = data.data;
        const rawAsks: [string, string][] = book.a || [];
        const rawBids: [string, string][] = book.b || [];

        const maxAskSize = Math.max(...rawAsks.map(([, s]) => parseFloat(s)), 1);
        const maxBidSize = Math.max(...rawBids.map(([, s]) => parseFloat(s)), 1);

        setAsks(
          rawAsks.slice(0, 8).map(([p, s]) => ({
            price: p,
            size: s,
            depth: parseFloat(s) / maxAskSize,
          }))
        );
        setBids(
          rawBids.slice(0, 8).map(([p, s]) => ({
            price: p,
            size: s,
            depth: parseFloat(s) / maxBidSize,
          }))
        );
      }
    };

    ws.current.onclose = () => {};

    return () => ws.current?.close();
  }, [symbol]);

  return { asks, bids };
}

// Fetch historical klines from Bybit REST (free, no auth)
export async function fetchKlines(
  symbol: string,
  interval = "15",
  limit = 100
): Promise<OHLCCandle[]> {
  const bybitSym = PAIRS[symbol] || symbol;
  const url = `https://api.bybit.com/v5/market/kline?category=spot&symbol=${bybitSym}&interval=${interval}&limit=${limit}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.retCode !== 0) return [];

    return (data.result.list as string[][])
      .reverse()
      .map((c) => ({
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

// Fetch MNT price from CoinGecko (free, no key)
export async function fetchMNTPrice(): Promise<{
  price: number;
  change24h: number;
  marketCap: number;
}> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=mantle&vs_currencies=usd&include_24hr_change=true&include_market_cap=true"
    );
    const data = await res.json();
    return {
      price: data.mantle?.usd || 0,
      change24h: data.mantle?.usd_24h_change || 0,
      marketCap: data.mantle?.usd_market_cap || 0,
    };
  } catch {
    return { price: 0, change24h: 0, marketCap: 0 };
  }
}
