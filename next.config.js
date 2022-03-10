const withPWA = require('next-pwa');
const runtimeCaching = require('next-pwa/cache');

module.exports = withPWA({
  pwa: {
    disable: process.env.NODE_ENV === 'development',
    dest: 'public',
    runtimeCaching
  },
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
});
