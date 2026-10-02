import { NextResponse } from 'next/server';
import { saveServerOrder, getAllServerOrders, getCustomerServerOrders, updateServerOrder, deleteServerOrder } from '@/lib/serverOrders';
import { sendOrderNotificationEmail, NotificationPayload } from '@/lib/notifications';
import { Order } from '@/store/orderStore';
import { verifyAdminToken } from '@/lib/adminToken';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');
    const userId = searchParams.get('userId');
    const admin = searchParams.get('admin');

    // If admin is requesting, return all store orders
    if (admin === 'true' || (!email && !phone && !userId)) {
      const cookieHeader = request.headers.get("cookie") || "";
      const match = cookieHeader.match(/admin_token=([^;]+)/);
      const token = match ? decodeURIComponent(match[1]) : undefined;
      const auth = await verifyAdminToken(token);

      if (!auth.valid && process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { error: 'Unauthorized: Accessing all store orders requires administrative authorization.' },
          { status: 401 }
        );
      }

      const orders = await getAllServerOrders();
      return NextResponse.json({ success: true, count: orders.length, orders });
    }

    // Filter for customer
    const orders = await getCustomerServerOrders({
      email: email || undefined,
      phone: phone || undefined,
      userId: userId || undefined,
    });

    return NextResponse.json({ success: true, count: orders.length, orders });
  } catch (error: any) {
    console.error('[API/orders] GET error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { order, userId } = body;

    if (!order || !order.id) {
      return NextResponse.json({ error: 'Invalid order data' }, { status: 400 });
    }

    // 1. Save to persistent Cloud Firestore + Server Cache
    const savedOrder = await saveServerOrder(order as Order, userId);

    // 2. Dispatch in-process email notification to Admin & Customer immediately
    let notificationResult: any = null;
    try {
      notificationResult = await sendOrderNotificationEmail({
        orderId: savedOrder.id,
        customerName: savedOrder.customerName,
        customerEmail: savedOrder.customerEmail,
        customerPhone: savedOrder.customerPhone,
        totalAmount: savedOrder.totalAmount,
        items: savedOrder.items,
        status: savedOrder.status || 'Order Placed',
        shippingAddress: savedOrder.shippingAddress,
        paymentMethod: savedOrder.paymentMethod,
        trackingNumber: savedOrder.trackingNumber,
        courierPartner: savedOrder.courierPartner,
        date: savedOrder.date,
        userId
      });
      console.log(`[API/orders] Order #${savedOrder.id} email intimation dispatch:`, notificationResult.diagnostic);
    } catch (notifyErr: any) {
      console.error('[API/orders] Error sending order placement email:', notifyErr.message);
    }

    return NextResponse.json({ 
      success: true, 
      order: savedOrder,
      notification: notificationResult 
    });
  } catch (error: any) {
    console.error('[API/orders] POST error:', error);
    return NextResponse.json({ error: error.message || 'Failed to save order' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { orderId, updates } = body;

    if (!orderId || !updates) {
      return NextResponse.json({ error: 'Missing orderId or updates' }, { status: 400 });
    }

    const cookieHeader = request.headers.get("cookie") || "";
    const match = cookieHeader.match(/admin_token=([^;]+)/);
    const token = match ? decodeURIComponent(match[1]) : undefined;
    const auth = await verifyAdminToken(token);

    // If not admin, strictly allow only customer cancellation
    if (!auth.valid && process.env.NODE_ENV === 'production') {
      const allowedKeys = ['status', 'cancellationReason', 'timeline'];
      const updateKeys = Object.keys(updates);
      const hasDisallowedKeys = updateKeys.some(k => !allowedKeys.includes(k));
      if (hasDisallowedKeys || updates.status !== 'Cancelled') {
        return NextResponse.json(
          { error: 'Unauthorized: Only order cancellation is allowed for non-administrators.' },
          { status: 403 }
        );
      }
    }

    const updatedOrder = await updateServerOrder(orderId, updates);
    if (!updatedOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Dispatch notification if status changed, especially when cancelled
    let notificationResult: any = null;
    try {
      const isCancelled = updates.status === 'Cancelled' || updatedOrder.status === 'Cancelled';
      const reason = updates.cancellationReason || (updatedOrder as any).cancellationReason;

      notificationResult = await sendOrderNotificationEmail({
        orderId: updatedOrder.id,
        customerName: updatedOrder.customerName,
        customerEmail: updatedOrder.customerEmail,
        customerPhone: updatedOrder.customerPhone,
        totalAmount: updatedOrder.totalAmount,
        items: updatedOrder.items,
        status: updatedOrder.status,
        shippingAddress: updatedOrder.shippingAddress,
        paymentMethod: updatedOrder.paymentMethod,
        trackingNumber: updatedOrder.trackingNumber,
        courierPartner: updatedOrder.courierPartner,
        cancellationReason: reason,
        date: updatedOrder.date,
      });
      console.log(`[API/orders] Order #${updatedOrder.id} update intimation dispatch:`, notificationResult.diagnostic);
    } catch (notifyErr: any) {
      console.error('[API/orders] Error sending order update email:', notifyErr.message);
    }

    return NextResponse.json({ 
      success: true, 
      order: updatedOrder,
      notification: notificationResult 
    });
  } catch (error: any) {
    console.error('[API/orders] PATCH error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId parameter' }, { status: 400 });
    }

    const cookieHeader = request.headers.get("cookie") || "";
    const match = cookieHeader.match(/admin_token=([^;]+)/);
    const token = match ? decodeURIComponent(match[1]) : undefined;
    const auth = await verifyAdminToken(token);

    if (!auth.valid && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Unauthorized: Deleting orders requires administrative authorization.' },
        { status: 401 }
      );
    }

    const deleted = await deleteServerOrder(orderId);
    return NextResponse.json({ success: deleted, orderId });
  } catch (error: any) {
    console.error('[API/orders] DELETE error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete order' }, { status: 500 });
  }
}
