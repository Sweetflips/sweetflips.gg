import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['qzdxgtegacnkmeninxww.supabase.co', 'uqabipngzjjuwijrvdsh.supabase.co'],
    },
    // Redirects
    async redirects() {
      return [
        {
          source: '/stream',
          destination: 'https://kick.com/sweetflips',
          permanent: true,
        },
      ];
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
  
  // BotID integration
  let config = nextConfig;
  try {
    const { withBotId } = require('botid/next/config');
    config = withBotId(nextConfig);
  } catch (e) {
    // BotID not available or error - use config as-is
    console.warn('BotID integration skipped:', e.message);
  }
  
  export default config;  