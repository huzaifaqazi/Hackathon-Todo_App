/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: false, // Disable app directory since we're using pages
  }
}

module.exports = nextConfig