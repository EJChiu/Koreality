import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    // 完全忽略 ESLint 錯誤
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 完全忽略 TypeScript 錯誤
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
