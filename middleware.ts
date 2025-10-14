import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

declare const process: { env: Record<string, string | undefined> };

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const headerCountry = request.headers.get('x-vercel-ip-country') ?? undefined;
  const country: string | undefined = request.geo?.country ?? headerCountry;
  const headerCity = request.headers.get('x-vercel-ip-city') ?? undefined;
  const city: string | undefined = request.geo?.city ?? headerCity;

  const blockedCountries = (process.env.EDGE_BLOCKED_COUNTRIES || '')
    .split(',')
    .map((s: string) => s.trim().toUpperCase())
    .filter(Boolean);

  const blockedCities = (process.env.EDGE_BLOCKED_CITIES || '')
    .split(',')
    .map((s: string) => s.trim().toLowerCase())
    .filter(Boolean);

  const isCountryBlocked = Boolean(country && blockedCountries.includes(country.toUpperCase()));
  const isCityBlocked = Boolean(city && blockedCities.includes(city.toLowerCase()));
  if (isCountryBlocked || isCityBlocked) {
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