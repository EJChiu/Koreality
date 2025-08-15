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
  // 👈 加入這個來暫時測試
  experimental: {
    serverComponentsExternalPackages: ['googlemaps'],
  },
  // 或者更激進的測試方式
  // output: 'export',
};

export default nextConfig;
