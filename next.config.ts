import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    typedRoutes: false, // Desabilita validação estrita de rotas
  },
};

export default nextConfig;
