////////////////////// IMPORTS /////////////////////////

var http      = require('http');
var https     = require('https');
var fs        = require('fs');
var config = require('../../config');

/////////////// CONSTRUCT CREATESERVER /////////////////

var createServer;

if (config.protocols.HTTP === 'https') {

  createServer = function(server) {

    // redirect all http requests to https
    http.createServer(function(req, res) {
      res.setHeader('Location', 'https://' + req.headers.host + req.url);
      res.statusCode = 302;
      res.end();
    }).listen(80);

    // create the https server 
    var cD = config.certDir;
    return https.createServer({
      key:  fs.readFileSync(cD + 'privkey.pem', 'utf8'),
      cert: fs.readFileSync(cD + 'cert.pem',    'utf8'),
      ca:   fs.readFileSync(cD + 'chain.pem',   'utf8')
    }, server);
    
  };

} else {

  createServer = http.createServer;

}

////////////////////// EXPORTS /////////////////////////

module.exports = createServer;