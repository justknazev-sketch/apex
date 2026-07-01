import { NextResponse, NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path.startsWith('/admin/dashboard')) {
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    // Верифицируем подпись JWT — не просто проверяем наличие cookie
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
    } catch {
      // Токен поддельный, просроченный или неверно подписан — выгоняем
      const response = NextResponse.redirect(new URL('/admin', request.url));
      response.cookies.delete('admin_token');
      return response;
    }
  }

  // Если уже авторизован — редиректим со страницы логина сразу в dashboard
  if (path === '/admin') {
    const token = request.cookies.get('admin_token')?.value;
    if (token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        await jwtVerify(token, secret);
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      } catch {
        // Токен невалидный — остаемся на странице логина
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/dashboard/:path*'],
};
