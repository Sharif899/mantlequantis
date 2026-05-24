import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol") || "MNTUSDT";

  const coinMap: Record<string, string> = {
    MNTUSDT: "mantle",
    ETHUSDT: "ethereum",
    BTCUSDT: "bitcoin",
  };

  const coinId = coinMap[symbol] || "mantle";

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return NextResponse.json({ retCode: -1, error: `HTTP ${res.status}`, result: { list: [] } });
    }

    const data = await res.json();
    const coin = data[coinId];

    if (!coin) {
      return NextResponse.json({ retCode: -1, error: "no coin data", data, result: { list: [] } });
    }

    return NextResponse.json({
      retCode: 0,
      result: {
        list: [{
          symbol,
          lastPrice: coin.usd.toString(),
          price24hPcnt: ((coin.usd_24h_change || 0) / 100).toString(),
          highPrice24h: (coin.usd * 1.02).toString(),
          lowPrice24h: (coin.usd * 0.98).toString(),
          volume24h: (coin.usd_24h_vol || 0).toString(),
          bid1Price: (coin.usd * 0.9995).toString(),
          ask1Price: (coin.usd * 1.0005).toString(),
        }],
      },
    });
  } catch (err: any) {
    return NextResponse.json({ retCode: -1, error: err.message, result: { list: [] } });
  }
}