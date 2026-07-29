import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, currency = "INR", receipt = "receipt#1" } = body;

    // Validate amount (Razorpay requires minimum 100 paise i.e., 1 INR)
    if (!amount || amount < 100) {
      return NextResponse.json(
        { error: 'Invalid amount. Minimum amount is 100 paise.' },
        { status: 400 }
      );
    }

    const options = {
      amount: amount.toString(), // amount in smallest currency unit
      currency,
      receipt,
    };

    const order = await razorpay.orders.create(options);
    
    return NextResponse.json(order);
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
