import { NextResponse } from 'next/server';
import { getNextServerOrderId } from '@/lib/serverOrders';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const nextOrderId = await getNextServerOrderId();
    return NextResponse.json({ success: true, nextOrderId });
  } catch (error: any) {
    console.error('[API/orders/next-id] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch next order ID' }, { status: 500 });
  }
}
