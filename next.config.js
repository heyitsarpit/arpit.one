// @ts-check

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  swcMinify: true,
  images: {
    domains: ['images.pexels.com', 'user-images.githubusercontent.com']
  },
  async rewrites() {
    return [
      {
        source: '/bee.js',
        destination: 'https://cdn.splitbee.io/sb.js'
      },
      {
        source: '/_hive/:slug',
        destination: 'https://hive.splitbee.io/:slug'
      }
    ];
  }
};

module.exports = nextConfig;
