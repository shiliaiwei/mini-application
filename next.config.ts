import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.telegram.org",
      },
      {
        protocol: "https",
        hostname: "t.me",
      },
      {
        protocol: "https",
        hostname: "ucarecdn.com",
      },
      {
        protocol: "https",
        hostname: "ucarecd.net",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(), geolocation=()",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://telegram.org https://*.telegram.org; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.telegram.org https://telegram.org https://t.me https://*.t.me https://ucarecdn.com https://*.ucarecdn.com https://ucarecd.net https://*.tile.openstreetmap.org; font-src 'self' data:; connect-src 'self' https://api.telegram.org https://*.telegram.org https://*.neon.tech https://upload.uploadcare.com https://*.uploadcare.com https://nominatim.openstreetmap.org https://ipapi.co; frame-ancestors 'self' https://web.telegram.org https://*.telegram.org https://desktop.telegram.org https://oauth.telegram.org https://*.t.me; form-action 'self'; base-uri 'self'; object-src 'none'; upgrade-insecure-requests;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
