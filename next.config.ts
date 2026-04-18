import type { NextConfig } from "next";
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Turbopack workaround for Webpack plugins like next-pwa
    turbopack: {},
  } as any,
};

export default withPWA(nextConfig);
