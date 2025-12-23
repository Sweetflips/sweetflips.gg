import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

declare const process: { env: Record<string, string | undefined> };

// Paths that should be accessible from restricted regions
const ALLOWED_PATHS = [
  '/restricted',
  '/terms-of-service',
  '/privacy-policy',
  '/cookie-policy',
];

// Countries where we don't promote gambling content
const RESTRICTED_COUNTRIES = ['NL', 'AE'];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Get country from Vercel geo headers
  const country = (request.geo?.country || request.headers.get('x-vercel-ip-country') || '').toUpperCase();

  // Check if user is from a restricted country
  if (country && RESTRICTED_COUNTRIES.includes(country)) {
    // Allow access to legal pages and the restricted page itself
    const isAllowedPath = ALLOWED_PATHS.some(path => pathname === path || pathname.startsWith(path + '/'));
    const isStaticAsset = pathname.startsWith('/_next') || 
                          pathname.startsWith('/api') || 
                          pathname.startsWith('/images') ||
                          pathname.startsWith('/webgl') ||
                          pathname === '/favicon.ico';
    
    if (!isAllowedPath && !isStaticAsset) {
      const url = new URL('/restricted', request.url);
      return new NextResponse(null, {
        status: 307,
        headers: { Location: url.toString() },
      });
    }
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