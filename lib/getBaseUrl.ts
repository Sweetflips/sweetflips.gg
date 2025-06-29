// lib/getBaseUrl.ts
export const getBaseUrl = (): string => {
  if (process.env.VERCEL_ENV === 'production') {
    return 'https://sweetflips.gg';
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
};
