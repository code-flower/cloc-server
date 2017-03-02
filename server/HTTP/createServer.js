////////////////////// IMPORTS /////////////////////////

var http      = require('http');
var https     = require('https');
var fs        = require('fs');
var appConfig = require('../../shared/appConfig.js');

/////////////// CONSTRUCT CREATESERVER /////////////////

var createServer;

if (appConfig.protocol.HTTP === 'https') {

  createServer = function(server) {

    // redirect all http requests to https
    http.createServer(function(req, res) {
      res.setHeader('Location', 'https://' + req.headers.host + req.url);
      res.statusCode = 302;
      res.end();
    }).listen(80);

    // create the https server 
    var certdir = __dirname + '/cert/';
    return https.createServer({
      key:  fs.readFileSync(certdir + 'privkey.pem', 'utf8'),
      cert: fs.readFileSync(certdir + 'cert.pem',    'utf8'),
      ca:   fs.readFileSync(certdir + 'chain.pem',   'utf8')
    }, server);
    
  };

} else {

  createServer = http.createServer;

}

////////////////////// EXPORTS /////////////////////////

module.exports = createServer;