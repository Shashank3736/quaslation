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
    ]
  }
};

const withMdx = createMDX()

export default withMdx(nextConfig);
