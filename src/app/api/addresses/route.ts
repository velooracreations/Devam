import { NextResponse } from 'next/server';
import { getServerAddresses, saveServerAddress, deleteServerAddress } from '@/lib/serverAddresses';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || undefined;
    const phone = searchParams.get('phone') || undefined;
    const userId = searchParams.get('userId') || undefined;

    if (!email && !phone && !userId) {
      return NextResponse.json({ success: true, addresses: [], profile: null });
    }

    const result = await getServerAddresses({ email, phone, userId });
    return NextResponse.json({
      success: true,
      addresses: result.addresses,
      profile: result.profile,
    });
  } catch (err: any) {
    console.error('[API Addresses GET] Error:', err);
    return NextResponse.json({ success: false, error: err.message, addresses: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { address, addresses, profile, userId, email, phone } = body;

    const result = await saveServerAddress({
      address,
      addresses,
      profile,
      userId,
      email,
      phone,
    });

    return NextResponse.json({
      success: true,
      addresses: result.addresses,
      profile: result.profile,
    });
  } catch (err: any) {
    console.error('[API Addresses POST] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { addressId, userId, email, phone } = body;

    if (!addressId) {
      return NextResponse.json({ success: false, error: 'addressId is required' }, { status: 400 });
    }

    const result = await deleteServerAddress({
      addressId,
      userId,
      email,
      phone,
    });

    return NextResponse.json({
      success: true,
      addresses: result.addresses,
    });
  } catch (err: any) {
    console.error('[API Addresses DELETE] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
