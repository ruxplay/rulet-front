import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 🚫 Ignorar errores de ESLint durante el build
  eslint: {
    ignoreDuringBuilds: true,
  },

  webpack: (config, { isServer }) => {
    // Excluir el directorio del backend del bundle
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ["**/Ruleta-backend/**"],
    };

    // Excluir archivos del backend del bundle
    config.externals = config.externals || [];
    if (Array.isArray(config.externals)) {
      config.externals.push({
        "./Ruleta-backend/**": "commonjs ./Ruleta-backend/**",
      });
    }

    return config;
  },

  // Excluir archivos del backend del build
  outputFileTracingExcludes: {
    "*": ["./Ruleta-backend/**"],
  },

  // Mantener experimento para permitir importar desde fuera del directorio del proyecto
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
