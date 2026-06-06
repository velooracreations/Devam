import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// Note: In Next.js Edge runtime (middleware), you can't use standard jsonwebtoken library.
// For the sake of this implementation, we will use basic cookie parsing, 
// but in production, you should use jose or NextAuth for edge-compatible token verification.

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define restricted paths
  const isAdminPath = path.startsWith('/admin');
  const isApiErpPath = path.startsWith('/api/erp');

  // Skip middleware for login pages and seed route
  if (path === '/admin/login' || path === '/api/erp/seed') {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value || request.cookies.get('admin_session')?.value || '';

  if ((isAdminPath || isApiErpPath) && !token) {
    // Redirect to login if accessing admin without token
    if (isAdminPath) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // NOTE: Full JWT verification is typically done in the API routes themselves or via a wrapper,
  // since the Edge runtime doesn't fully support Node.js crypto used by jsonwebtoken.
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/erp/:path*'
  ],
};
