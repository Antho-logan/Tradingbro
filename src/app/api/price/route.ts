import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Mock price data for demonstration
// In production, this would connect to a real price feed API
const MOCK_PRICE_DATA = {
  "BTCUSDT": {
    symbol: "BTCUSDT",
    price: 65432.50,
    change24h: 2.34,
    volume24h: 1234567890,
    high24h: 66123.45,
    low24h: 64890.12,
    timestamp: new Date().toISOString()
  },
  "ETHUSDT": {
    symbol: "ETHUSDT", 
    price: 3456.78,
    change24h: -1.23,
    volume24h: 987654321,
    high24h: 3523.90,
    low24h: 3398.45,
    timestamp: new Date().toISOString()
  }
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol')?.toUpperCase();

  if (!symbol) {
    return NextResponse.json({
      error: "Missing 'symbol' parameter",
      availableSymbols: Object.keys(MOCK_PRICE_DATA)
    }, { status: 400 });
  }

  const priceData = MOCK_PRICE_DATA[symbol as keyof typeof MOCK_PRICE_DATA];
  
  if (!priceData) {
    return NextResponse.json({
      error: `Symbol '${symbol}' not found`,
      availableSymbols: Object.keys(MOCK_PRICE_DATA)
    }, { status: 404 });
  }

  // Add small random fluctuation to simulate real-time data
  const fluctuation = (Math.random() - 0.5) * 10; // ±5 range
  const currentPrice = priceData.price + fluctuation;
  
  const response = {
    ...priceData,
    price: parseFloat(currentPrice.toFixed(2)),
    timestamp: new Date().toISOString(),
    source: "mock_api"
  };

  // Add CORS headers for frontend access
  return NextResponse.json(response, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}