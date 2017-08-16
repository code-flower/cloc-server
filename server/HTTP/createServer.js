////////////////////// IMPORTS /////////////////////////

var http = require('http');
var https = require('https');
var fs = require('fs');
var config = require('@config');

/////////////// CONSTRUCT CREATESERVER /////////////////

var createServer;

if (config.protocols.HTTP === 'https') {

  createServer = function(server) {
    return https.createServer({
      key:  fs.readFileSync(config.paths.SSL.key,  'utf8'),
      cert: fs.readFileSync(config.paths.SSL.cert, 'utf8')
    }, server);
  };

} else {

  createServer = http.createServer;

}

////////////////////// EXPORTS /////////////////////////

module.exports = createServer;