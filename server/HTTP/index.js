
module.exports = {
  createServer: require('./createServer'),
  parseUrl: (url) => require('url').parse(url, true),

  serveFlower: require('./serveFlower'),
  serveStaticFile: require('./serveStaticFile'),
  sendEmail: require('./sendEmail')
};