import { NextRequest, NextResponse } from 'next/server';

export function proxy(req: NextRequest) {
  const sessionCookie = req.cookies.get('tpn_session');
  if (!sessionCookie?.value) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/calculator/:path*', '/history/:path*'],
};
