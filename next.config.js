/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    images: {
      unoptimized: true
    },
    i18n: {
      locales: ['zh-TW'],
      defaultLocale: 'zh-TW',
      localeDetection: false
    },
    env: {
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    },
    experimental: {
      serverActions: true,
    },
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
          net: false,
          tls: false,
        };
      }
      return config;
    },
  }
  
  module.exports = nextConfig 