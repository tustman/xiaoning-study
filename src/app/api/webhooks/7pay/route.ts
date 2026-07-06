import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { trade_no, amount, status, signature } = body;

    if (!trade_no || !amount || !status || !signature) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    // Verify 7pay signature
    // Signature format: hmac_sha256(secret, trade_no + amount + status)
    const secret = process.env.PAY_SECRET_KEY || 'default_7pay_secret_key';
    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${trade_no}${amount}${status}`)
      .digest('hex');

    if (signature !== computedSignature) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid signature verification failed.' 
      }, { status: 400 });
    }

    // Update order status in database
    if (status === 'completed') {
      const updatedOrder = await db.updateOrderStatus(trade_no, 'completed');
      if (!updatedOrder) {
        return NextResponse.json({ success: false, error: 'Order not found in database' }, { status: 404 });
      }
    }

    return NextResponse.json({ success: true, message: 'Webhook processed successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
