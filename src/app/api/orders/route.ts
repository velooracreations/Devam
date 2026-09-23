import { NextResponse } from 'next/server';
import { saveServerOrder, getAllServerOrders, getCustomerServerOrders, updateServerOrder } from '@/lib/serverOrders';
import { Order } from '@/store/orderStore';

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

    // 2. Dispatch notifications to Admin and Customer asynchronously
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      fetch(`${baseUrl}/api/notifications/order-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(savedOrder),
      }).catch(err => console.warn('[API/orders] Background notification trigger:', err));
    } catch {}

    return NextResponse.json({ success: true, order: savedOrder });
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

    const updatedOrder = await updateServerOrder(orderId, updates);
    if (!updatedOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // If status was changed or cancelled, trigger notification
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      fetch(`${baseUrl}/api/notifications/order-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedOrder),
      }).catch(err => console.warn('[API/orders] Status update notification trigger:', err));
    } catch {}

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error('[API/orders] PATCH error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update order' }, { status: 500 });
  }
}
