import { NextResponse } from "next/server";

// GET /api/ohlcv?symbol=BTCUSDT&interval=15m&limit=500
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = (searchParams.get("symbol") ?? "LINKUSDT").toUpperCase();
  const interval = searchParams.get("interval") ?? "15m";
  const limit = searchParams.get("limit") ?? "500";

  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;

  const res = await fetch(url, { next: { revalidate: 5 } }); // cache a few seconds
  if (!res.ok) {
    const msg = await res.text();
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }

  // Binance returns array of arrays. Convert to a tidy structure if you want.
  const raw = await res.json();
  const candles = raw.map((r: any[]) => ({
    openTime: r[0],
    open: Number(r[1]),
    high: Number(r[2]),
    low: Number(r[3]),
    close: Number(r[4]),
    volume: Number(r[5]),
    closeTime: r[6],
  }));

  return NextResponse.json({ ok: true, provider: "binance", symbol, interval, candles });
}