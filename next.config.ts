import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    // Exclude sharp from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        child_process: false,
      };
      
      // Exclude sharp from client bundle
      config.externals = config.externals || [];
      config.externals.push('sharp');
    }
    
    return config;
  },
};

export default nextConfig;
