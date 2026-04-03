import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer mock-jwt-')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Mock Razorpay Order Creation
  const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  
  return NextResponse.json({
    id: orderId,
    amount: 499900, // 4999 INR in paise
    currency: 'INR',
  });
}
