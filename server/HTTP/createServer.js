////////////////////// IMPORTS /////////////////////////

var http      = require('http');
var https     = require('spdy');
var fs        = require('fs');
var appConfig = require('../../shared/appConfig.js');

/////////////// CONSTRUCT CREATESERVER /////////////////

var createServer;

if (appConfig.protocol.HTTP === 'https') {
  var certdir = __dirname + '/cert/';

  // create an https server
  createServer = function(server) {
    var creds = {
      key:  fs.readFileSync(certdir + 'privkey.pem', 'utf8'),
      cert: fs.readFileSync(certdir + 'cert.pem',    'utf8'),
      ca:   fs.readFileSync(certdir + 'chain.pem',   'utf8')
    };

    return https.createServer(creds, server);
  };

  // redirect all http requests to https
  http.createServer(function(req, res) {
    res.setHeader('Location', 'https://' + req.headers.host + req.url);
    res.statusCode = 302;
    res.end();
  }).listen(80);

} else {
  createServer = http.createServer;
}

////////////////////// EXPORTS /////////////////////////

module.exports = createServer;