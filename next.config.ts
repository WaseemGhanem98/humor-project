import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Old routes keep working after the Wry redesign.
  async redirects() {
    return [
      { source: "/captions", destination: "/feed", permanent: false },
      { source: "/dashboard", destination: "/profile", permanent: false },
    ];
  },
};

export default nextConfig;
