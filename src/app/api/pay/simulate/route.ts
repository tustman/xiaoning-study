import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { trade_no } = await req.json();

    if (!trade_no) {
      return NextResponse.json({ success: false, error: 'Missing trade_no' }, { status: 400 });
    }

    const order = await db.getOrder(trade_no);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Simulate 7pay payload signing on server-side
    const status = 'completed';
    const amount = order.amount;
    const secret = process.env.PAY_SECRET_KEY || 'default_7pay_secret_key';
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${trade_no}${amount}${status}`)
      .digest('hex');

    // Trigger the webhook internally
    const webhookUrl = new URL('/api/webhooks/7pay', req.url);
    const webhookRes = await fetch(webhookUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        trade_no,
        amount,
        status,
        signature,
      }),
    });

    const result = await webhookRes.json();
    if (!webhookRes.ok || !result.success) {
      return NextResponse.json({ 
        success: false, 
        error: result.error || 'Webhook trigger failed' 
      }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
