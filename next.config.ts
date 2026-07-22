import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // The native argon2 binary cannot be bundled into the server output.
  serverExternalPackages: ['@node-rs/argon2'],
};

export default nextConfig;
