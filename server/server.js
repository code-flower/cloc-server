
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

/////////////////// RESPOND TO SSE REQUESTS //////////////////

// parses git clone url and converts
// the repo to flowerable json
function cloneFlower(url, response) {

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
    cloc.createClocFile(user, repo, SSE)
    .then(function() {
      cloc.convertClocFile(user, repo, SSE);
    });
  })
}

////////////////// RESPOND TO AJAX REQUESTS ////////////////////

// serves a list of the repos currently stored in repos/
function serveRepos(response) {

  // get array of files in a directory,
  // not including .DS_Store
  var readNoDS = function(path) {
    return fs.readdirSync(path).filter(function(file) {
      return file !== '.DS_Store';
    });
  };

  // construct array of repos
  var repos = [];
  var users = readNoDS(__dirname + '/repos/');
  users.forEach(function(user) {
    var userRepos = readNoDS(__dirname + '/repos/' + user + '/');
    userRepos.forEach(function(userRepo) {
      repos.push(user + '/' + userRepo);
    });
  });

  // serve up the array
  response.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  response.end(JSON.stringify(repos));
}

//////////////////////// START THE SERVER /////////////////////

http.createServer(function (request, response) {

  var urlInfo = url.parse(request.url, true);

  // SSE requests
  if (urlInfo.pathname === '/clone') {
    cloneFlower(urlInfo.query.url, response);

  // ajax request
  } else if (urlInfo.pathname === '/repos') {
    serveRepos(response);

  // regular http request
  } else
    serveStaticFile(response, urlInfo.pathname);

}).listen(8000);

console.log("Server running at http://localhost:8000/");

