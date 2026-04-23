import type { NextConfig } from "next";

const nextConfig: NextConfig = {
compiler: {
    // Xóa tất cả console.* trong production
    removeConsole: process.env.NODE_ENV === "production",
    // Hoặc chỉ xóa console.log, giữ lại console.error
    // removeConsole: { exclude: ['error'], },
  },
};

export default nextConfig;
