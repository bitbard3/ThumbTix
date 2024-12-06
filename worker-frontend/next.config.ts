import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d2aebbcnff6b6k.cloudfront.net",
      },
    ],
  },
};

export default nextConfig;
