import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Allowed origins for dev mode (uyarıyı kaldırır)
  allowedDevOrigins: ["http://168.231.101.122:3002"],

  // ✅ TypeScript hatalarını build sırasında yoksay
  typescript: {
    ignoreBuildErrors: true,
  },

  // ✅ ESLint hatalarını build sırasında yoksay
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ✅ React Strict Mode kapalı (geliştirmede performans)
  reactStrictMode: false,

  // ✅ nodemon ile derleme kontrolü
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ignored: ["**/*"], // webpack hot reload kapalı
      };
    }
    return config;
  },
};

export default nextConfig;
