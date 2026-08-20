import { NextResponse } from 'next/server';
import { sendOrderEmail, generateWhatsAppMessage } from '@/lib/notifications';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { orderId, customerName, customerEmail, customerPhone, totalAmount, items, status, shippingAddress, trackingNumber, courierPartner } = payload;

    if (!orderId || !customerName || !status) {
      return NextResponse.json({ error: "Missing required notification fields" }, { status: 400 });
    }

    // 1. Send Email Notification
    const emailResult = await sendOrderEmail({
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      totalAmount: totalAmount || 0,
      items: items || [],
      status,
      shippingAddress,
      trackingNumber,
      courierPartner,
    });

    // 2. Generate WhatsApp Message Link & Payload
    const whatsappMessage = generateWhatsAppMessage({
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      totalAmount: totalAmount || 0,
      items: items || [],
      status,
      shippingAddress,
      trackingNumber,
      courierPartner,
    });

    const phoneClean = customerPhone ? customerPhone.replace(/\D/g, '') : '919979640900';
    const whatsappUrl = `https://wa.me/${phoneClean.startsWith('91') ? phoneClean : '91' + phoneClean}?text=${whatsappMessage}`;

    return NextResponse.json({
      success: true,
      emailSent: emailResult.success,
      whatsappUrl,
      status,
    });

  } catch (error: any) {
    console.error("Notification API Error:", error);
    return NextResponse.json({ error: "Failed to dispatch notification", details: error.message }, { status: 500 });
  }
}
