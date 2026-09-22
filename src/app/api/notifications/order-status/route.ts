import { NextResponse } from 'next/server';

// ── Admin configuration ───────────────────────────────────────────────────────
const ADMIN_WHATSAPP = process.env.ADMIN_WHATSAPP_NUMBER || '919979640900';
const ADMIN_EMAILS   = ['thedevam2024@gmail.com', 'info@thedevam.com'];

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const {
      id, orderId: rawOrderId, customerName, customerEmail,
      customerPhone, totalAmount, items, status, shippingAddress,
      paymentMethod, trackingNumber, courierPartner, date,
    } = payload;

    const orderId     = id || rawOrderId || 'N/A';
    const orderStatus = status || 'Order Placed';

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const results: Record<string, any> = { orderId, status: orderStatus };

    // ── 1. Build admin WhatsApp message ───────────────────────────────────────
    const itemList = (items || [])
      .map((i: any) => `  • ${i.name} (${i.weight || ''}) ×${i.quantity} @ ₹${i.price}`)
      .join('\n');

    const orderDate = date
      ? new Date(date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
      : new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

    const adminMsg = [
      `🚨 *NEW ORDER RECEIVED — DEVAM*`,
      ``,
      `📦 *Order ID:* ${orderId}`,
      `📅 *Date:* ${orderDate}`,
      ``,
      `👤 *Customer Details*`,
      `  Name: ${customerName || 'Guest'}`,
      `  Phone: ${customerPhone || 'N/A'}`,
      `  Email: ${customerEmail || 'N/A'}`,
      ``,
      `💳 *Payment:* ${paymentMethod || orderStatus}`,
      `💰 *Total:* ₹${totalAmount}`,
      ``,
      `🛍️ *Items Ordered:*`,
      itemList || '  (see admin panel for details)',
      ``,
      `📍 *Ship To Address:*`,
      `  ${shippingAddress || 'Address not available'}`,
      ``,
      `🔗 Manage orders: https://thedevam.com/admin/orders`,
    ].join('\n');

    const cleanPhone           = (customerPhone || '').replace(/\D/g, '');
    const customerWhatsappPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

    const adminWhatsappUrl    = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(adminMsg)}`;
    const customerMsg         = [
      `✅ *Order Confirmed — Devam Atta & Spices*`,
      ``,
      `Hi ${customerName || 'Valued Customer'},`,
      `Your order has been received! 🎉`,
      ``,
      `📦 *Order ID:* ${orderId}`,
      `💰 *Amount:* ₹${totalAmount}`,
      `💳 *Payment:* ${paymentMethod || 'Order Placed'}`,
      ``,
      `📍 *Delivering To:*`,
      `${shippingAddress || 'Your registered address'}`,
      ``,
      `We will notify you once your order is shipped.`,
      `Track your order: https://thedevam.com/account`,
      ``,
      `Thank you for choosing Devam! 🙏`,
    ].join('\n');

    const customerWhatsappUrl = `https://wa.me/${customerWhatsappPhone}?text=${encodeURIComponent(customerMsg)}`;

    results.adminWhatsappUrl   = adminWhatsappUrl;
    results.customerWhatsappUrl = customerWhatsappUrl;
    results.adminMessage        = adminMsg;

    // ── 2. Send email via SMTP if configured ──────────────────────────────────
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const nodemailer = (await import('nodemailer')).default;
        const transporter = nodemailer.createTransport({
          host:   process.env.SMTP_HOST,
          port:   parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });

        const plainText = adminMsg.replace(/\*/g, '');
        await transporter.sendMail({
          from:    process.env.SMTP_FROM || '"Devam Order Alert" <thedevam2024@gmail.com>',
          to:      [...ADMIN_EMAILS, customerEmail].filter(Boolean).join(', '),
          subject: `🚨 New Order #${orderId} — ₹${totalAmount} | ${customerName || 'Guest'}`,
          text:    plainText,
        });
        results.email = `sent to admins + ${customerEmail || 'customer'}`;
      } catch (emailErr: any) {
        console.warn('[Notify] Email send failed:', emailErr.message);
        results.email = 'failed';
      }
    } else {
      results.email = 'smtp_not_configured';
    }

    return NextResponse.json({ success: true, ...results });

  } catch (error: any) {
    console.error('[Notify] Order notification error:', error);
    return NextResponse.json(
      { error: 'Notification failed', details: error.message },
      { status: 500 }
    );
  }
}
