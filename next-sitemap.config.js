module.exports = {
  siteUrl: process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL.replace(/^https?:\/\//, '')}`
    : 'https://www.arpit.one',
  generateRobotsTxt: true
};
