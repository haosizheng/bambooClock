/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  distDir: 'out',
  generateBuildId: async () => {
    return 'static'
  },
  experimental: {
    esmExternals: false
  }
}

module.exports = nextConfig
