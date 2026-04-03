import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');
  const payload = await verifyToken(token);
  
  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const userTrades = await db.getUserTrades(payload.id as string);
  
  const totalPnL = userTrades.reduce((sum: number, trade: any) => sum + Number(trade.pnl), 0);
  const openPositions = userTrades.filter((t: any) => t.status === 'OPEN').length;
  const closedPositions = userTrades.filter((t: any) => t.status === 'CLOSED').length;

  return NextResponse.json({
    totalPnL,
    openPositions,
    closedPositions,
    trades: userTrades.slice(0, 10) // Last 10 trades
  });
}
