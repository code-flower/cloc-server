
//// MODULES ////

// standard file serving modules
var http = require('http');
var url = require('url');
var fileSystem = require('fs');
var path = require('path');


//// SERVE STATIC FILES ////

function getContentType(pathname) {
  var extension = pathname.match(/\.[^.]*$/)[0];
  switch (extension) {
    case '.css': return 'text/css';
    case '.js':  return 'text/javascript';
    default:     return 'text/html';
  }
}

function serveStaticFile(response, pathname) {

  // get the full file path
  if (pathname == '/')
    pathname = '/index.html';
  var filePath = path.join(__dirname, pathname);

  // return 404 if the file doesn't exist
  try {
    var stat = fileSystem.statSync(filePath);
  } catch(e) {
    console.log("File not found: " + pathname);
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.end();
    return;
  }

  // otherwise serve the file
  console.log("Serving: " + pathname);
  response.writeHead(200, {
    'Content-Type': getContentType(pathname),
    'Content-Length': stat.size
  });
  fileSystem.createReadStream(filePath).pipe(response);
}


//// START THE SERVER ////

http.createServer(function (request, response) {

  var urlInfo = url.parse(request.url, true);

  if (urlInfo.pathname == '/search') {
    response.writeHead(200, {'Content-Type': 'application/json'});
    response.end(JSON.stringify({message: 'hello'}));
  } else
    serveStaticFile(response, urlInfo.pathname);

}).listen(8000);

console.log("Server running at http://localhost:8000/");