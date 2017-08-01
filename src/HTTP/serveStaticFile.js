//////////// IMPORTS ////////////

var fs = require('fs');
var logger = require('../system').logger;
var ga = require('../system').ga;
var appConfig = require('../../shared/appConfig.js');

//////////// PRIVATE ////////////

function getContentType(pathname) {
  var extension = pathname.match(/\.[^.]*$/)[0];
  switch(extension) {
    case '.css':  return 'text/css';
    case '.js':   return 'text/javascript';
    case '.json': return 'application/json';
    default:      return 'text/html';
  }
}

//////////// EXPORTS ////////////

module.exports = function serveStaticFile(request, response, relPath) {

  // get the full file path
  if (relPath == '/')
    relPath = '/index.html';

  // log requests for index file
  // if (relPath === '/index.html' && process.env.NODE_ENV === 'production')
  //   logger(request.connection.remoteAddress + ',index.html');

  var absPath = appConfig.paths.client + 'dist' + relPath;

  // return 404 if the file doesn't exist
  try {
    var stat = fs.statSync(absPath);
  } catch(e) {
    console.log("File not found: " + absPath);
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.end();
    return;
  }

  // otherwise serve the file
  console.log("Serving: " + relPath);
  response.writeHead(200, {
    'Content-Type': getContentType(relPath),
    'Content-Length': stat.size
  });
  fs.createReadStream(absPath).pipe(response);
};

