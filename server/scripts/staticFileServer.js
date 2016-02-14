//////////////// IMPORTS //////////////////

var fs = require('fs');
var path = require('path');

/////////////// PRIVATE //////////////////

// the location of the static files relative to this file
var DOCUMENT_ROOT = '../../client';

function getContentType(pathname) {
  var extension = pathname.match(/\.[^.]*$/)[0];
  switch(extension) {
    case '.css': return 'text/css';
    case '.js':  return 'text/javascript';
    default:     return 'text/html';
  }
}

//////////////// PUBLIC //////////////////

module.exports = function serveStaticFile(response, relPath) {

  // get the full file path
  if (relPath == '/')
    relPath = '/index.html';

  var absPath = path.join(__dirname, DOCUMENT_ROOT + relPath);

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
}

