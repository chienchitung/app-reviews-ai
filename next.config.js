/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    images: {
      unoptimized: true,
      domains: ['localhost']
    },
    i18n: {
      locales: ['zh-TW'],
      defaultLocale: 'zh-TW',
      localeDetection: false
    },
    experimental: {
      serverActions: {
        bodySizeLimit: '2mb'
      }
    },
    env: {
      GEMINI_API_KEY: process.env.GEMINI_API_KEY
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