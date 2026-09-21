import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, currency = "INR", receipt = "receipt#1" } = body;

    if (!amount || amount < 100) {
      return NextResponse.json(
        { error: 'Invalid amount. Minimum amount is 100 paise.' },
        { status: 400 }
      );
    }

    const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_TcNI9ejHlDnlqC";
    const key_secret = process.env.RAZORPAY_KEY_SECRET || "avf5fQdWx9QcW08CweaXMK3x";

    // Lazy-init Razorpay inside handler
    const Razorpay = (await import('razorpay')).default;
    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const options = {
      amount: Math.round(Number(amount)), // Amount in paise as INTEGER
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json({
      ...order,
      key_id
    });
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    const detailMsg = error?.error?.description || error?.description || error?.message || 'Failed to create order';
    return NextResponse.json({ error: detailMsg, statusCode: error?.statusCode || 500 }, { status: 500 });
  }
}
