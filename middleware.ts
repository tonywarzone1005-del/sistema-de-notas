import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    if (pathname.startsWith('/dashboard/coordinator') && token?.role !== 'COORDINADOR') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (pathname.startsWith('/dashboard/professor') && token?.role !== 'PROFESOR') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (pathname.startsWith('/dashboard/student') && token?.role !== 'ESTUDIANTE') {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
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