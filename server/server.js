
///////////////////////// MODULES /////////////////////////

// npm
var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');

// app
var ServerSentEvents = require('./scripts/SSE.js');
var serveStaticFile = require('./scripts/staticFileServer.js');
var git = require('./scripts/git.js');
var cloc = require('./scripts/cloc.js');
var deleteFiles = require('./scripts/delete.js');

/////////////////// RESPOND TO SSE REQUESTS //////////////////

function closeSSE(user, repo, SSE) {
  SSE.write('');
  SSE.write('END:' + user + '/' + repo);
  SSE.close();
}

// parses git clone url and converts
// the repo to flowerable json
function cloneFlower(response, url) {

  // open eventsource connection
  var SSE = new ServerSentEvents(response);

  // parse the url
  // NEED TO MAKE THIS MORE ROBUST
  var match = url.match(/.com\/(.*?)\.git$/);
  if (match && match[1]) {
    var matchParts = match[1].split('/');
    var user = matchParts[0];
    var repo = matchParts[1];
  } else {
    SSE.write('Not a valid repository.');
    SSE.write('');
    SSE.write('ERROR');
    SSE.close();
    return;
  }

  // clone repo, create and convert cloc file
  git.cloneRepo(url, user, SSE)
  .then(function() {
    return cloc.createClocFile(user, repo, SSE);
  })
  .then(function() {
    return cloc.convertClocFile(user, repo, SSE);
  })
  .then(function() {
    closeSSE(user, repo, SSE);
  });
}

function serveFlower(response, repo) {
  response.writeHead(200, {'Content-Type': 'application/json'});

  var absPath = __dirname + '/repos/' + repo + '.json';
  var readStream = fs.createReadStream(absPath);
  readStream.pipe(response);
  readStream.on('end', function() {
    var user = repo.match(/(^.*?)\//)[1];
    deleteFiles(user);
  });
}

//////////////////////// START THE SERVER /////////////////////

http.createServer(function (request, response) {

  var urlInfo = url.parse(request.url, true);

  if (urlInfo.pathname === '/clone')
    cloneFlower(response, urlInfo.query.url);

  else if (urlInfo.pathname === '/harvest')
    serveFlower(response, urlInfo.query.repo);

  else
    serveStaticFile(response, urlInfo.pathname);

}).listen(8000);

console.log("Server running at http://localhost:8000/");

