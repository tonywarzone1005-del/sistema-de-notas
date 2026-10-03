import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Si no hay token, redirigir al login
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Validación por rol
    if (pathname.startsWith('/dashboard/coordinator') && token.role !== 'COORDINADOR') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (pathname.startsWith('/dashboard/professor') && token.role !== 'PROFESOR') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (pathname.startsWith('/dashboard/student') && token.role !== 'ESTUDIANTE') {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Deshabilitar caché del navegador en todas las rutas del dashboard
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*'],
};