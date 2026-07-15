/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // `geist` is ESM and imports `next/font/local` as a bare directory. Node's ESM
  // resolver rejects directory imports, which kills `next build` at page-data
  // collection. Routing it through webpack fixes the resolution.
  transpilePackages: ["geist"],
  webpack: (config) => {
    // Some Solana deps reference Node core modules in the browser bundle.
    config.resolve.fallback = { fs: false, path: false, os: false, crypto: false };
    return config;
  },
};

module.exports = nextConfig;
