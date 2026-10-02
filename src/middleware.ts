import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminToken } from '@/lib/adminToken';

export async function middleware(request: NextRequest) {
  // 1. Enforce HTTPS in production when behind HTTP proxy
  if (
    process.env.NODE_ENV === 'production' &&
    request.headers.get('x-forwarded-proto') === 'http'
  ) {
    const httpsUrl = request.nextUrl.clone();
    httpsUrl.protocol = 'https:';
    return NextResponse.redirect(httpsUrl, 301);
  }

  const path = request.nextUrl.pathname;
  const method = request.method;

  // 2. Critical Security: Disable database seeding completely in production
  if (path === '/api/erp/seed') {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Database seeding endpoint is disabled in production.' },
        { status: 403 }
      );
    }
  }

  // 3. Skip middleware for admin login page and its API endpoints
  if (
    path === '/admin/login' ||
    path === '/api/admin/login' ||
    path === '/api/admin/verify-session'
  ) {
    return addSecurityHeaders(NextResponse.next());
  }

  // 4. Extract and verify cryptographic admin session token
  const adminToken = request.cookies.get('admin_token')?.value;
  const adminSession = request.cookies.get('admin_session')?.value;
  const legacyToken = request.cookies.get('token')?.value;

  const authResult = await verifyAdminToken(adminToken);
  const isAuth =
    authResult.valid ||
    (process.env.NODE_ENV !== 'production' &&
      (adminSession === 'true' || legacyToken === 'admin-authenticated'));

  // 5. Route-Specific Reverse Proxy / Security Gateway Rules

  // A. Admin Portal Protection
  if (path.startsWith('/admin')) {
    if (!isAuth) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(loginUrl);
    }
  }

  // B. ERP Endpoints Protection (Financials, inventory, bulk order sync)
  if (path.startsWith('/api/erp')) {
    if (!isAuth) {
      return NextResponse.json(
        { error: 'Unauthorized: ERP access restricted to verified administrators.' },
        { status: 401 }
      );
    }
  }

  // C. B2B Distributor Leads Protection (Prevent competitor scraping)
  if (path === '/api/distributors' && method === 'GET') {
    if (!isAuth) {
      return NextResponse.json(
        { error: 'Unauthorized: Distributor leads access restricted to verified administrators.' },
        { status: 401 }
      );
    }
  }

  // D. Product Catalog Tampering Protection (Prevent unauthorized catalog mutations or wipe)
  if (path === '/api/products' && (method === 'POST' || method === 'DELETE')) {
    if (!isAuth) {
      return NextResponse.json(
        { error: 'Unauthorized: Product modifications restricted to verified administrators.' },
        { status: 401 }
      );
    }
  }

  // E. Customer Orders Protection
  if (path === '/api/orders') {
    if (method === 'DELETE') {
      if (!isAuth) {
        return NextResponse.json(
          { error: 'Unauthorized: Deleting orders requires administrative authorization.' },
          { status: 401 }
        );
      }
    } else if (method === 'GET') {
      const searchParams = request.nextUrl.searchParams;
      const isAdminQuery = searchParams.get('admin') === 'true';
      const email = searchParams.get('email')?.trim();
      const phone = searchParams.get('phone')?.trim();
      const userId = searchParams.get('userId')?.trim();

      // If querying all orders without customer filter, require admin token
      if (isAdminQuery || (!email && !phone && !userId)) {
        if (!isAuth) {
          return NextResponse.json(
            { error: 'Unauthorized: Accessing all store orders requires administrative authorization.' },
            { status: 401 }
          );
        }
      }
    }
  }

  // F. Email Notifications Engine Protection (Prevent unauthorized email relay/spam or config leaks)
  if (path.startsWith('/api/notifications') && method === 'GET') {
    if (!isAuth) {
      return NextResponse.json(
        { error: 'Unauthorized: Notification diagnostics restricted to verified administrators.' },
        { status: 401 }
      );
    }
  }

  // G. AI Product Description Engine (Prevent API quota draining)
  if (path === '/api/ai' || path === '/api') {
    if (method === 'POST') {
      if (!isAuth) {
        return NextResponse.json(
          { error: 'Unauthorized: AI description generator restricted to administrators.' },
          { status: 401 }
        );
      }
    }
  }

  return addSecurityHeaders(NextResponse.next());
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/erp/:path*',
    '/api/distributors',
    '/api/products',
    '/api/orders',
    '/api/notifications/:path*',
    '/api/ai',
  ],
};
