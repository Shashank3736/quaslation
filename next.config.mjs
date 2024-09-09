/** @type {import('next').NextConfig} */
const nextConfig = {
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

export default nextConfig;
