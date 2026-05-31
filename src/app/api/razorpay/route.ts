import { NextResponse } from "next/server";
import Razorpay from "razorpay";

// Initialize Razorpay with fallback test keys
// IMPORTANT: Replace these with process.env.RAZORPAY_KEY_ID and process.env.RAZORPAY_KEY_SECRET in production
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_YourTestKeyHere",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "YourTestSecretHere",
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount } = body; // Amount should be in rupees

    if (!amount) {
      return NextResponse.json({ error: "Amount is required" }, { status: 400 });
    }

    // Razorpay requires amount in paise (1 INR = 100 paise)
    const options = {
      amount: amount * 100, 
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
