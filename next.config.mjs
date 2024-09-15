import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ayplstxuxzdnzxgkvlwc.supabase.co",
        port: "",
      }
    ]
  }
};

const withMdx = createMDX()

export default withMdx(nextConfig);
