import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typedRoutes: true,
  // El binario nativo de argon2 no puede empaquetarse en el bundle del servidor.
  serverExternalPackages: ['@node-rs/argon2'],
};

export default nextConfig;
