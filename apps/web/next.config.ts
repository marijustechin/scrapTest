import type { NextConfig } from 'next';

// Server-side URL of the API. The /api/* rewrite lets the browser call the backend
// through the web app origin, so client-side code does not need CORS.
const apiUrl = process.env.API_URL ?? 'http://localhost:3001';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
