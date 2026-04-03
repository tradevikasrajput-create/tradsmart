import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Mock F&O Stocks
const STOCKS = ['RELIANCE', 'HDFCBANK', 'INFY', 'TCS', 'ICICIBANK', 'SBIN', 'ITC', 'LART', 'BAJFINANCE', 'BHARTIARTL'];

function generateRandomSignal(type: 'BULLISH' | 'BEARISH') {
  const symbol = STOCKS[Math.floor(Math.random() * STOCKS.length)];
  const price = 1000 + Math.random() * 2000;
  
  // Metrics
  const oiChange = Math.random() * 15 + 5; // 5% to 20%
  const volumeSpike = Math.random() * 3 + 1.5; // 1.5x to 4.5x
  const trendConf = Math.random() * 100;
  const sectorStrength = Math.random() * 100;
  const momentum = Math.random() * 100;

  // Score calculation based on requested weights
  const oiScore = Math.min((oiChange / 20) * 100, 100) * 0.30;
  const volScore = Math.min((volumeSpike / 4) * 100, 100) * 0.25;
  const trendScore = trendConf * 0.20;
  const sectorScore = sectorStrength * 0.15;
  const momScore = momentum * 0.10;
  
  const probability = Math.round(oiScore + volScore + trendScore + sectorScore + momScore);
  
  // Pricing
  const entry = parseFloat(price.toFixed(2));
  const slPercent = type === 'BULLISH' ? 0.99 : 1.01; // 1% SL
  const targetPercent = type === 'BULLISH' ? 1.03 : 0.97; // 3% Target
  
  const stopLoss = parseFloat((entry * slPercent).toFixed(2));
  const target = parseFloat((entry * targetPercent).toFixed(2));
  
  // Position Sizing: Assuming 100,000 capital, 1% risk (1000 risk)
  const riskPerShare = Math.abs(entry - stopLoss);
  const positionSize = Math.floor(1000 / riskPerShare);

  return {
    symbol,
    type,
    buildUp: type === 'BULLISH' ? 'Long Build-up' : 'Short Build-up',
    metrics: {
      oiChangePercent: parseFloat(oiChange.toFixed(2)),
      volumeSpikeX: parseFloat(volumeSpike.toFixed(2)),
      sectorStrength: parseFloat(sectorStrength.toFixed(2)),
      institutionalActivity: probability > 80 ? 'High' : 'Moderate',
    },
    entry,
    stopLoss,
    target,
    probability,
    positionSize,
  };
}

export async function GET(request: Request) {
  const killSwitch = await db.getKillSwitch();
  if (killSwitch) {
    return NextResponse.json({ error: 'System halted by admin kill switch.' }, { status: 503 });
  }

  // Generate Top 3 Bullish and Top 3 Bearish
  const bullish = Array.from({ length: 3 }, () => generateRandomSignal('BULLISH')).sort((a, b) => b.probability - a.probability);
  const bearish = Array.from({ length: 3 }, () => generateRandomSignal('BEARISH')).sort((a, b) => b.probability - a.probability);

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    signals: {
      bullish,
      bearish
    }
  });
}
