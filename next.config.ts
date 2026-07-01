import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Запрет на встраивание сайта в iframe (защита от clickjacking)
          { key: 'X-Frame-Options', value: 'DENY' },
          // Запрет на угадывание MIME-типа браузером
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Ограничение передачи реферера при переходах
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Принудительный HTTPS (1 год)
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          // Базовая политика разрешений
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        // Запрет кэширования для API-роутов (актуальные данные всегда)
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
