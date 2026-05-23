"use client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { format } from "date-fns";
import clsx from "clsx";

// ─── Equity Curve Chart ───────────────────────────────────────────────────────
interface EquityCurveProps {
  data: { time: number; value: number }[];
  height?: number;
  showGrid?: boolean;
  compact?: boolean;
}

export function EquityCurveChart({
  data,
  height = 220,
  showGrid = true,
  compact = false,
}: EquityCurveProps) {
  const firstValue = data[0]?.value ?? 10000;
  const lastValue = data[data.length - 1]?.value ?? 10000;
  const isPositive = lastValue >= firstValue;
  const color = isPositive ? "#1D9E75" : "#D85A30";

  const formatted = data.map((d) => ({
    ...d,
    displayTime: format(new Date(d.time), compact ? "HH:mm" : "MM/dd HH:mm"),
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={formatted} margin={{ top: 4, right: 4, left: compact ? -20 : 0, bottom: 0 }}>
        <defs>
          <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.2} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" stroke="#1E1E30" vertical={false} />
        )}
        <XAxis
          dataKey="displayTime"
          tick={{ fill: "#6B6B8A", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: "#6B6B8A", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
          domain={["auto", "auto"]}
          width={compact ? 30 : 52}
        />
        <ReferenceLine y={10000} stroke="#2A2840" strokeDasharray="4 4" />
        <Tooltip
          contentStyle={{
            background: "#13131F",
            border: "1px solid #1E1E30",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: "#6B6B8A" }}
          formatter={(v: number) => [
            `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            "Portfolio",
          ]}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill="url(#equityGrad)"
          dot={false}
          activeDot={{ r: 4, fill: color }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Price Sparkline ─────────────────────────────────────────────────────────
interface SparklineProps {
  data: number[];
  height?: number;
  color?: string;
  width?: string | number;
}

export function Sparkline({ data, height = 40, color, width = "100%" }: SparklineProps) {
  const first = data[0] ?? 0;
  const last = data[data.length - 1] ?? 0;
  const lineColor = color ?? (last >= first ? "#1D9E75" : "#D85A30");
  const chartData = data.map((v, i) => ({ i, v }));

  return (
    <ResponsiveContainer width={width} height={height}>
      <AreaChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <defs>
          <linearGradient id={`spark-${lineColor}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={lineColor} stopOpacity={0.15} />
            <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={lineColor}
          strokeWidth={1.5}
          fill={`url(#spark-${lineColor})`}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── OHLC Price Chart (uses AreaChart as proxy - recharts has no native candles) ─
interface PriceChartProps {
  candles: { time: number; open: number; high: number; low: number; close: number; volume: number }[];
  height?: number;
}
export function PriceChart({ candles, height = 280 }: PriceChartProps) {
  const firstClose = candles[0]?.close ?? 0;
  const lastClose = candles[candles.length - 1]?.close ?? 0;
  const isUp = lastClose >= firstClose;
  const color = isUp ? "#1D9E75" : "#D85A30";

  const data = candles.map((c) => ({
    t: format(new Date(c.time), "HH:mm"),
    close: c.close,
    high: c.high,
    low: c.low,
    volume: c.volume,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.18} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1E1E30" vertical={false} />
        <XAxis
          dataKey="t"
          tick={{ fill: "#6B6B8A", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: "#6B6B8A", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          domain={["auto", "auto"]}
          width={60}
          tickFormatter={(v) =>
            v > 1000
              ? `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
              : `$${v.toFixed(4)}`
          }
        />
        <Tooltip
          contentStyle={{
            background: "#13131F",
            border: "1px solid #1E1E30",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: "#6B6B8A" }}
          formatter={(v: number, name: string) => [
            name === "close"
              ? `$${v.toLocaleString(undefined, { maximumFractionDigits: 4 })}`
              : v.toLocaleString(),
            name === "close" ? "Price" : name,
          ]}
        />
        <Area
          type="monotone"
          dataKey="close"
          stroke={color}
          strokeWidth={2}
          fill="url(#priceGrad)"
          dot={false}
          activeDot={{ r: 4, fill: color }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── PnL Bar Chart ───────────────────────────────────────────────────────────
import { BarChart, Bar, Cell } from "recharts";

interface PnlBarChartProps {
  trades: { pnl: number; timestamp: number }[];
  height?: number;
}
export function PnlBarChart({ trades, height = 120 }: PnlBarChartProps) {
  const data = trades.slice(-20).map((t, i) => ({
    i,
    pnl: t.pnl ?? 0,
    t: format(new Date(t.timestamp), "HH:mm"),
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1E1E30" vertical={false} />
        <XAxis dataKey="t" tick={{ fill: "#6B6B8A", fontSize: 9 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fill: "#6B6B8A", fontSize: 9 }} tickLine={false} axisLine={false} width={40} tickFormatter={(v) => `$${v.toFixed(0)}`} />
        <Tooltip
          contentStyle={{ background: "#13131F", border: "1px solid #1E1E30", borderRadius: 8, fontSize: 12 }}
          formatter={(v: number) => [`${v >= 0 ? "+" : ""}$${v.toFixed(2)}`, "P&L"]}
        />
        <Bar dataKey="pnl" radius={[3, 3, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.pnl >= 0 ? "#1D9E75" : "#D85A30"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
