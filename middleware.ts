import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const env = ((globalThis as any).process?.env ?? {}) as Record<string, string | undefined>;
  const country = (request.geo?.country || request.headers.get('x-vercel-ip-country') || '').toUpperCase();
  const city = (request.geo?.city || request.headers.get('x-vercel-ip-city') || '').toLowerCase();

  const blockedCountries = (env.EDGE_BLOCKED_COUNTRIES || '')
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  const blockedCities = (env.EDGE_BLOCKED_CITIES || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if ((blockedCountries.length && country && blockedCountries.includes(country)) ||
      (blockedCities.length && city && blockedCities.includes(city))) {
    return new NextResponse('Access from your region is not allowed.', { status: 403 });
  }

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