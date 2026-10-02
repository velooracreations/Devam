import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Devam API Gateway',
    timestamp: new Date().toISOString()
  });
}
