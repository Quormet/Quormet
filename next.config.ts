import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: '/fees',
        destination: '/payments',
        permanent: true,
      },
      {
        source: '/dues',
        destination: '/payments',
        permanent: true,
      },
      {
        source: '/help',
        destination: '/board',
        permanent: true,
      },
      {
        source: '/voting',
        destination: '/polls',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
