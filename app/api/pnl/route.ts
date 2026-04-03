import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer mock-jwt-')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = authHeader.replace('Bearer mock-jwt-', '');
  const user = db.users.find(u => u.id === userId);

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const userTrades = db.trades.filter(t => t.userId === userId);
  
  const totalPnL = userTrades.reduce((sum, trade) => sum + trade.pnl, 0);
  const openPositions = userTrades.filter(t => t.status === 'OPEN').length;
  const closedPositions = userTrades.filter(t => t.status === 'CLOSED').length;

  return NextResponse.json({
    totalPnL,
    openPositions,
    closedPositions,
    trades: userTrades.slice(-10) // Last 10 trades
  });
}
