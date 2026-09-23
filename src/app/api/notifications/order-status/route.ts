import { NextResponse } from 'next/server';
import { 
  sendOrderNotificationEmail, 
  sendTestEmail, 
  verifyEmailConfiguration, 
  ADMIN_NOTIFICATION_EMAILS,
  NotificationPayload 
} from '@/lib/notifications';

const ADMIN_WHATSAPP = process.env.ADMIN_WHATSAPP_NUMBER || '919979640900';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Diagnostic and Test Email Endpoint
 * GET /api/notifications/order-status
 * GET /api/notifications/order-status?action=test&to=thedevam2024@gmail.com
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const to = searchParams.get('to');

    if (action === 'test') {
      const testResult = await sendTestEmail(to || undefined);
      return NextResponse.json(testResult);
    }

    const config = verifyEmailConfiguration();
    return NextResponse.json({
      success: true,
      service: 'Devam Notification Engine',
      config
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * Dispatch Order Placed or Order Cancelled notification
 * POST /api/notifications/order-status
 */
export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const {
      id, orderId: rawOrderId, customerName, customerEmail,
      customerPhone, totalAmount, items, status, shippingAddress,
      paymentMethod, trackingNumber, courierPartner, date,
      cancellationReason
    } = payload;

    const orderId = id || rawOrderId || 'N/A';
    const orderStatus = status || 'Order Placed';

    if (!orderId || orderId === 'N/A') {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const notificationPayload: NotificationPayload = {
      orderId,
      customerName: customerName || 'Valued Customer',
      customerEmail,
      customerPhone,
      totalAmount: totalAmount || 0,
      items: items || [],
      status: orderStatus,
      shippingAddress,
      paymentMethod,
      trackingNumber,
      courierPartner,
      cancellationReason,
      date
    };

    // 1. Dispatch Email to Admins & Customer
    const emailResult = await sendOrderNotificationEmail(notificationPayload);

    // 2. Build WhatsApp Click-to-Chat deep links for instant fallback
    const isCancelled = orderStatus === 'Cancelled' || orderStatus.toLowerCase().includes('cancel');
    const orderDate = date
      ? new Date(date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
      : new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

    const itemList = (items || [])
      .map((i: any) => `  • ${i.name} (${i.weight || ''}) ×${i.quantity} @ ₹${i.price}`)
      .join('\n');

    const adminHeader = isCancelled
      ? `❌ *ORDER CANCELLED BY CUSTOMER — DEVAM*`
      : `🚨 *NEW ORDER RECEIVED — DEVAM*`;

    const adminMsg = [
      adminHeader,
      ``,
      `📦 *Order ID:* ${orderId}`,
      `📅 *Date:* ${orderDate}`,
      `📊 *Status:* ${orderStatus.toUpperCase()}`,
      ...(isCancelled ? [`⚠️ *Cancellation Reason:* ${cancellationReason || 'Cancelled by customer in My Account'}`] : []),
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

    const cleanPhone = (customerPhone || '').replace(/\D/g, '');
    const customerWhatsappPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

    const adminWhatsappUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(adminMsg)}`;
    const customerMsg = isCancelled ? [
      `❌ *Order Cancelled — Devam Atta & Spices*`,
      ``,
      `Hi ${customerName || 'Valued Customer'},`,
      `Your order #${orderId} (₹${totalAmount}) has been cancelled.`,
      ...(cancellationReason ? [`Reason: ${cancellationReason}`, ``] : [``]),
      `If you have paid online, your refund will be processed within 3-5 business days.`,
      `Track account: https://thedevam.com/account`,
      ``,
      `Thank you for reaching out to Devam! 🙏`,
    ].join('\n') : [
      `✅ *Order Confirmed — Devam Atta & Spices*`,
      ``,
      `Hi ${customerName || 'Valued Customer'},`,
      `Your order status: ${orderStatus}! 🎉`,
      ``,
      `📦 *Order ID:* ${orderId}`,
      `💰 *Amount:* ₹${totalAmount}`,
      `💳 *Payment:* ${paymentMethod || 'Order Placed'}`,
      ``,
      `📍 *Delivering To:*`,
      `${shippingAddress || 'Your registered address'}`,
      ``,
      `Track your order: https://thedevam.com/account`,
      ``,
      `Thank you for choosing Devam! 🙏`,
    ].join('\n');

    const customerWhatsappUrl = `https://wa.me/${customerWhatsappPhone}?text=${encodeURIComponent(customerMsg)}`;

    return NextResponse.json({
      success: true,
      orderId,
      status: orderStatus,
      email: emailResult,
      adminWhatsappUrl,
      customerWhatsappUrl,
      adminMessage: adminMsg
    });

  } catch (error: any) {
    console.error('[Notify] Order notification error:', error);
    return NextResponse.json(
      { error: 'Notification failed', details: error.message },
      { status: 500 }
    );
  }
}
