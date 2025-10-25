import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Allowed origins for dev mode (uyarıyı kaldırır)
  allowedDevOrigins:
    process.env.DEV_SERVER_ORIGINS?.split(',').map((origin) => origin.trim()).filter(Boolean) ?? [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://0.0.0.0:3000",
    ],

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
        ignored: ["**/node_modules", "**/.git"],
      };
    }
    return config;
  },
};

export default nextConfig;
