/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Some Solana deps reference Node core modules in the browser bundle.
    config.resolve.fallback = { fs: false, path: false, os: false, crypto: false };
    return config;
  },
};

module.exports = nextConfig;
