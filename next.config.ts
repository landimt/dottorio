import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configurações experimentais
  experimental: {
    // Habilita Server Actions
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // Configurações de imagens
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Headers de segurança
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  // Redirecionamentos
  async redirects() {
    return [
      // Redireciona /home para /dashboard
      {
        source: "/home",
        destination: "/dashboard",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
