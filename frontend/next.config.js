/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Remove API rewrites - Vercel serverless functions handle /api/* directly
}

module.exports = nextConfig
