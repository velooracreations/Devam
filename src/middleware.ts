import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This is a basic middleware to secure the /admin routes
// In production, this would verify a Firebase Auth token or NextAuth session
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Protect all /admin routes
  if (pathname.startsWith('/admin')) {
    // For now, since we don't have a live login flow hooked up,
    // we check for a mock cookie or query param to allow entry.
    // Real implementation: check auth token.
    const isAuthenticated = request.cookies.has('admin_session');
    
    // Allow access to the login page itself
    if (pathname === '/admin/login') {
      if (isAuthenticated) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    if (!isAuthenticated) {
      // Redirect unauthenticated users to the admin login page
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

// Specify which paths this middleware should run on
export const config = {
  matcher: ['/admin/:path*'],
};
