import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol") || "MNTUSDT";
  const interval = searchParams.get("interval") || "15";
  const limit = searchParams.get("limit") || "80";

  try {
    const res = await fetch(
      `https://api.bybit.com/v5/market/kline?category=spot&symbol=${symbol}&interval=${interval}&limit=${limit}`,
      { next: { revalidate: 30 } }
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ retCode: -1, result: { list: [] } });
  }
}