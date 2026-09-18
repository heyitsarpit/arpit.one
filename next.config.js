module.exports = {
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
      }
    ]
  }
}
