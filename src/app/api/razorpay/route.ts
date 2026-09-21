import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount } = body;

    if (!amount) {
      return NextResponse.json({ error: "Amount is required" }, { status: 400 });
    }

    const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_TcNI9ejHlDnlqC";
    const key_secret = process.env.RAZORPAY_KEY_SECRET || "avf5fQdWx9QcW08CweaXMK3x";

    // Lazy-init Razorpay inside handler
    const Razorpay = (await import('razorpay')).default;
    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const options = {
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json({ ...order, key_id }, { status: 200 });
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    const detailMsg = error?.error?.description || error?.description || error?.message || 'Internal Server Error';
    return NextResponse.json({ error: detailMsg }, { status: 500 });
  }
}
