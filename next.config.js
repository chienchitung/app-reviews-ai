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
    serverRuntimeConfig: {
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    },
    publicRuntimeConfig: {
      // 這裡放置可以公開的配置
    },
    experimental: {
      serverActions: {
        allowedOrigins: ["*"],  // 根據需要設置允許的域名
        bodySizeLimit: '2mb'
      }
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