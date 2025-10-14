declare module 'next/server' {
  export class NextResponse {
    static next(): NextResponse;
    constructor(...args: any[]);
    headers: Headers;
  }

  export type NextRequest = Request & {
    nextUrl: URL;
    geo?: { country?: string; city?: string; region?: string } | undefined;
    headers: Headers;
  };
}


