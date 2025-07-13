
import type {NextConfig} from 'next';
import { loadEnvConfig } from '@next/env';

// Load environment variables from .env files
loadEnvConfig(process.cwd());

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
});

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default withPWA(nextConfig);
