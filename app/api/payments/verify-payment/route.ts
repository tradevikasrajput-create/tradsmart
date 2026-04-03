import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer mock-jwt-')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = authHeader.replace('Bearer mock-jwt-', '');
  const user = db.users.find(u => u.id === userId);

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;

    // Mock verification logic
    if (razorpay_payment_id && razorpay_order_id) {
      // Upgrade user to PRO
      user.plan = 'pro';
      return NextResponse.json({ success: true, message: 'Payment verified, upgraded to PRO' });
    }

    return NextResponse.json({ error: 'Invalid payment details' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
