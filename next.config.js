module.exports = {
  agentRules: false,
  allowedDevOrigins: ['127.0.0.1'],
  devIndicators: false,
  async redirects() {
    return [
      {
        source: '/posts',
        destination: '/writing',
        permanent: true
      },
      {
        source: '/posts/:slug',
        destination: '/writing/:slug',
        permanent: true
      }
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'user-images.githubusercontent.com'
      },
      {
        protocol: 'https',
        hostname: 'assets.arpit.one'
      },
      {
        protocol: 'https',
        hostname: 'i.scdn.co'
      },
      {
        protocol: 'https',
        hostname: 'mosaic.scdn.co'
      }
    ]
  }
}
