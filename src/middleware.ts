import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Enforce HTTPS in production when behind HTTP proxy
  if (
    process.env.NODE_ENV === 'production' &&
    request.headers.get('x-forwarded-proto') === 'http'
  ) {
    const httpsUrl = request.nextUrl.clone();
    httpsUrl.protocol = 'https:';
    return NextResponse.redirect(httpsUrl, 301);
  }

  const path = request.nextUrl.pathname;

  // Define restricted paths
  const isAdminPath = path.startsWith('/admin');
  const isApiErpPath = path.startsWith('/api/erp');

  // Skip middleware for admin login and public assets
  if (path === '/admin/login' || path === '/api/erp/seed') {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value || request.cookies.get('admin_session')?.value || '';

  if ((isAdminPath || isApiErpPath) && !token) {
    if (isAdminPath) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/erp/:path*'
  ],
};
