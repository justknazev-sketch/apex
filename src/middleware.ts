import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get('admin_token')?.value;

  // Protect /admin/dashboard routes
  if (path.startsWith('/admin/dashboard')) {
    if (!token) {
      // Redirect to admin login if no token
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // Redirect from /admin to dashboard if already logged in
  if (path === '/admin') {
    if (token) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

// Config to specify matching routes
export const config = {
  matcher: ['/admin', '/admin/dashboard/:path*'],
};
