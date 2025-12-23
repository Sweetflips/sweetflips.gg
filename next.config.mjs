import { withBotId } from 'botid/next/config';

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['qzdxgtegacnkmeninxww.supabase.co', 'uqabipngzjjuwijrvdsh.supabase.co'],
    },
    // Configure headers for Unity WebGL files
    async headers() {
      return [
        {
          source: '/webgl/:path*.gz',
          headers: [
            {
              key: 'Content-Encoding',
              value: 'gzip',
            },
          ],
        },
        {
          source: '/webgl/:path*.br',
          headers: [
            {
              key: 'Content-Encoding',
              value: 'br',
            },
          ],
        },
        {
          source: '/webgl/:path*.wasm',
          headers: [
            {
              key: 'Content-Type',
              value: 'application/wasm',
            },
          ],
        },
        {
          source: '/webgl/:path*.wasm.gz',
          headers: [
            {
              key: 'Content-Type',
              value: 'application/wasm',
            },
            {
              key: 'Content-Encoding',
              value: 'gzip',
            },
          ],
        },
        {
          source: '/webgl/:path*.js.gz',
          headers: [
            {
              key: 'Content-Type',
              value: 'application/javascript',
            },
            {
              key: 'Content-Encoding',
              value: 'gzip',
            },
          ],
        },
        {
          source: '/webgl/:path*.data.gz',
          headers: [
            {
              key: 'Content-Type',
              value: 'application/octet-stream',
            },
            {
              key: 'Content-Encoding',
              value: 'gzip',
            },
          ],
        },
        {
          source: '/razed',
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
            },
            {
              key: 'Pragma',
              value: 'no-cache',
            },
            {
              key: 'Expires',
              value: '0',
            },
            {
              key: 'Surrogate-Control',
              value: 'no-store',
            },
          ],
        },
      ];
    },
  };
  
  export default withBotId(nextConfig);  