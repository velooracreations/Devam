import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, amount, customerName, customerPhone, customerEmail } = body;

    if (!orderId || !amount) {
      return NextResponse.json({ error: 'Missing orderId or amount' }, { status: 400 });
    }

    const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_TcNI9ejHlDnlqC";
    const key_secret = process.env.RAZORPAY_KEY_SECRET || "avf5fQdWx9QcW08CweaXMK3x";

    let cleanPhone = (customerPhone || '9979640900').replace(/\D/g, '');
    if (cleanPhone.length > 10) cleanPhone = cleanPhone.slice(-10);
    const validContact = cleanPhone.length === 10 ? `+91${cleanPhone}` : '+919979640900';

    const validEmail = customerEmail && customerEmail.includes('@') && !customerEmail.includes('guest@')
      ? customerEmail
      : 'orders@thedevam.com';

    try {
      const Razorpay = (await import('razorpay')).default;
      const razorpay = new Razorpay({ key_id, key_secret });

      // Create a Razorpay Payment Link for the exact order amount
      const paymentLink = await razorpay.paymentLink.create({
        amount: Math.round(Number(amount) * 100),
        currency: "INR",
        accept_partial: false,
        description: `Payment for Devam Order #${orderId}`,
        customer: {
          name: customerName || 'Customer',
          contact: validContact,
          email: validEmail,
        },
        notify: {
          sms: false,
          email: false,
        },
        reminder_enable: false,
        notes: {
          order_id: orderId,
          type: 'delivery_qr_payment'
        },
      });

      if (paymentLink && paymentLink.short_url) {
        const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(paymentLink.short_url)}`;
        return NextResponse.json({
          success: true,
          provider: 'razorpay',
          paymentUrl: paymentLink.short_url,
          qrImageUrl,
          orderId,
          amount: Number(amount)
        });
      }
    } catch (rzpErr: any) {
      console.warn('[DeliveryQR] Razorpay link creation warning, using UPI intent fallback:', rzpErr.message);
    }

    // Direct UPI intent fallback if Razorpay API request encounters any limitation
    const upiUrl = `upi://pay?pa=thedevam@okhdfcbank&pn=Shreeji%20Foods%20and%20Spices&am=${Number(amount)}&cu=INR&tn=Order%20${encodeURIComponent(orderId)}`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUrl)}`;

    return NextResponse.json({
      success: true,
      provider: 'upi_fallback',
      paymentUrl: upiUrl,
      qrImageUrl,
      orderId,
      amount: Number(amount)
    });
  } catch (error: any) {
    console.error('[DeliveryQR] Error generating delivery payment QR:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate QR' }, { status: 500 });
  }
}
