/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [],
    },
    async redirects() {
      return [
        {
          source: '/stream',
          destination: 'https://kick.com/sweetflips',
          permanent: true,
        },
        {
          source: '/stream/:path*',
          destination: 'https://kick.com/sweetflips',
          permanent: true,
        },
      ];
    },
    async headers() {
      return [
        {
          source: '/spartans',
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

  export default nextConfig;
