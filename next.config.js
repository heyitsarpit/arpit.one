module.exports = {
  agentRules: false,
  allowedDevOrigins: ['127.0.0.1'],
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
