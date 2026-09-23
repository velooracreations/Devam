import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, amount, customerName, merchantUpiId } = body;

    if (!orderId || !amount) {
      return NextResponse.json({ error: 'Missing orderId or amount' }, { status: 400 });
    }

    // Direct NPCI UPI VPA - Defaults to store UPI ID or user-specified VPA
    const payeeVpa = (merchantUpiId || process.env.NEXT_PUBLIC_MERCHANT_UPI_ID || process.env.MERCHANT_UPI_ID || "thedevam@okhdfcbank").trim();
    const payeeName = "Devam Atta and Masala Hub";
    const formattedAmount = Number(amount).toFixed(2);
    const txnNote = `Devam Order ${orderId}`;

    // Universal NPCI UPI Intent URI: Opens Google Pay, PhonePe, Paytm, BHIM directly without opening browser
    const upiIntentUri = `upi://pay?pa=${payeeVpa}&pn=${encodeURIComponent(payeeName)}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(txnNote)}&tr=${encodeURIComponent(orderId)}`;
    
    // High-resolution QR code image encoding the direct UPI intent
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=2&data=${encodeURIComponent(upiIntentUri)}`;

    return NextResponse.json({
      success: true,
      provider: 'direct_upi_intent',
      upiUri: upiIntentUri,
      qrImageUrl,
      orderId,
      amount: Number(amount),
      merchantUpiId: payeeVpa
    });
  } catch (error: any) {
    console.error('[DeliveryQR] Error generating direct UPI delivery payment QR:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate QR' }, { status: 500 });
  }
}

