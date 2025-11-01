import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  // Enable client-side router cache reuse for a limited time on navigation
  experimental: {
    staleTimes: {
      dynamic: 30, // seconds for dynamic segments
      static: 180, // seconds for static segments
    },
  },
  // Optimize production builds
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Enable compression
  compress: true,
  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ayplstxuxzdnzxgkvlwc.supabase.co",
        port: "",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
        port: "",
      }
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Optimize production output
  poweredByHeader: false,
  reactStrictMode: true,
};

const withMdx = createMDX()

export default withMdx(nextConfig);
