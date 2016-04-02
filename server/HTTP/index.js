
module.exports = {
  createServer: require('http').createServer,
  parseUrl: (url) => require('url').parse(url, true),

  serveFlower: require('./serveFlower'),
  serveSamples: require('./serveSamples'),
  serveStaticFile: require('./staticFileServer')
};