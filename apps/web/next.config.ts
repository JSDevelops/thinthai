import type { NextConfig } from 'next';

const apiOrigin =
  process.env.API_URL ||
  process.env.API_ORIGIN ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://127.0.0.1:4200';

const config: NextConfig = {
  poweredByHeader: false,
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${apiOrigin}/api/:path*` }];
  },
};
export default config;
