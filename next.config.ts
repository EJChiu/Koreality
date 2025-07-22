import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // 禁用靜態導出，使用服務器渲染
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
