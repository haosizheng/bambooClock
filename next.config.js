/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  distDir: 'out',
  generateBuildId: async () => {
    return 'build-' + Date.now()
  }
}

module.exports = nextConfig
