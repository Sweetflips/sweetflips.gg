import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Geo-blocking is handled by Vercel Firewall rules

  if (pathname.includes('/webgl/')) {
    const response = NextResponse.next();

    if (pathname.endsWith('.gz')) {
      response.headers.set('Content-Encoding', 'gzip');

      if (pathname.includes('.js.gz')) {
        response.headers.set('Content-Type', 'application/javascript');
      } else if (pathname.includes('.wasm.gz')) {
        response.headers.set('Content-Type', 'application/wasm');
      } else if (pathname.includes('.data.gz')) {
        response.headers.set('Content-Type', 'application/octet-stream');
      } else if (pathname.includes('.symbols.json.gz')) {
        response.headers.set('Content-Type', 'application/json');
      }
    } else if (pathname.endsWith('.br')) {
      response.headers.set('Content-Encoding', 'br');

      if (pathname.includes('.js.br')) {
        response.headers.set('Content-Type', 'application/javascript');
      } else if (pathname.includes('.wasm.br')) {
        response.headers.set('Content-Type', 'application/wasm');
      } else if (pathname.includes('.data.br')) {
        response.headers.set('Content-Type', 'application/octet-stream');
      }
    } else if (pathname.endsWith('.wasm')) {
      response.headers.set('Content-Type', 'application/wasm');
    }

    response.headers.set('Access-Control-Allow-Origin', '*');

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};