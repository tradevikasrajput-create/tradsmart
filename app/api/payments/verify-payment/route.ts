import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { verifySignature } from '@/lib/razorpay';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const token = authHeader.replace('Bearer ', '');
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  try {
    const body = await request.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;

    const isValid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    
    if (isValid) {
      await db.updateUser(payload.id as string, { plan: 'pro' });
      return NextResponse.json({ success: true, message: 'Payment verified, upgraded to PRO' });
    }

    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
