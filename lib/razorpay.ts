import Razorpay from 'razorpay';
import crypto from 'crypto';

export async function createOrder(amount: number) {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    // Mock for local preview if keys are not set
    return { id: `order_mock_${Date.now()}`, amount, currency: 'INR' };
  }
  
  const rzp = new Razorpay({ 
    key_id: process.env.RAZORPAY_KEY_ID, 
    key_secret: process.env.RAZORPAY_KEY_SECRET 
  });
  
  return rzp.orders.create({ amount, currency: 'INR' });
}

export function verifySignature(orderId: string, paymentId: string, signature: string) {
  if (!process.env.RAZORPAY_KEY_SECRET) return true; // Mock for local preview
  
  const text = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(text)
    .digest('hex');
    
  return expected === signature;
}
