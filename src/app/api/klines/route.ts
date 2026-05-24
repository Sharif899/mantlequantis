import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol") || "MNTUSDT";
  const limit = parseInt(searchParams.get("limit") || "80");

  const coinMap: Record<string, string> = {
    MNTUSDT: "mantle",
    ETHUSDT: "ethereum",
    BTCUSDT: "bitcoin",
  };

  const coinId = coinMap[symbol] || "mantle";
  const apiKey = process.env.COINGECKO_API_KEY || "";

  try {
    // CoinGecko OHLC endpoint - free tier supports up to 30 days
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=usd&days=2`,
      {
        cache: "no-store",
        headers: { "x-cg-demo-api-key": apiKey },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ retCode: -1, error: `HTTP ${res.status}`, result: { list: [] } });
    }

    const data = await res.json();

    // CoinGecko returns [timestamp, open, high, low, close]
    // Convert to Bybit format [timestamp, open, high, low, close, volume]
    const list = data.slice(-limit).map((c: number[]) => [
      c[0].toString(),
      c[1].toString(),
      c[2].toString(),
      c[3].toString(),
      c[4].toString(),
      "1000000",
    ]);

    return NextResponse.json({
      retCode: 0,
      result: { list: list.reverse() },
    });
  } catch (err: any) {
    return NextResponse.json({ retCode: -1, error: err.message, result: { list: [] } });
  }
}