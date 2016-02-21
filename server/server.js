/////////////////// IMPORTS ////////////////////

// npm
var http = require('http');
var url = require('url');
var fs = require('fs');
var ws = require('nodejs-websocket');
var parseGitUrl = require('git-url-parse');

// app
var appConfig = require('../shared/appConfig.js');
var ServerSentEvents = require('./scripts/SSE.js');
var git = require('./scripts/git.js');
var cloc = require('./scripts/cloc.js');
var deleteFiles = require('./scripts/delete.js');
var serveStaticFile = require('./scripts/staticFileServer.js');

console.log("APPCONFIG = ", appConfig);

/////////////////// FUNCTIONS  /////////////////

function analyzeRepo(url, user, repo, SSE) {
  // clone repo, create and convert cloc file
  git.cloneRepo(url, user, SSE)
  .then(function() {
    return cloc.generateJson(user, repo, SSE);
  })
  .then(function() {
    SSE.write('');
    SSE.write('END:' + user + '/' + repo);
    SSE.close();
  })
  .catch(function(error) {
    if (error = 'unauthorized') {
      SSE.write('UNAUTHORIZED');
      SSE.close();
    }
  });
}

// parses git clone url and converts the repo to flowerable json
function cloneFlower(SSE, url, isPrivate) {

  var urlInfo = parseGitUrl(url);
  var user = urlInfo.owner;
  var repo = urlInfo.name;

  // require https
  if (!urlInfo.protocol.match(/https/i)) {
    SSE.write('Please use an https url.');
    SSE.write('');
    SSE.write('ERROR');
    SSE.close();
    return;
  }

  // because some urls don't contain a user
  // like the beanstalk one in roofshoot
  if (!user) user = 'temp';

  // require a user and repo
  if (!user || !repo) {
    SSE.write('Not a valid git clone url.');
    SSE.write('');
    SSE.write('ERROR');
    SSE.close();
    return;
  }

  if (isPrivate) 
    analyzeRepo(url, user, repo, SSE);
  else 
    git.checkPrivateRepo(user, repo, SSE)
    .then(function(isPrivate) {
      if (isPrivate) {
        SSE.write('CREDENTIALS');
        SSE.close();
      } else {
        analyzeRepo(url, user, repo, SSE);
      }
    });
}

// serves up the json for a given repo
function serveFlower(response, repo) {
  response.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });

  var absPath = __dirname + '/repos/' + repo + '.json';
  var readStream = fs.createReadStream(absPath);
  readStream.pipe(response);
  readStream.on('end', function() {
    var user = repo.match(/(^.*?)\//)[1];
    deleteFiles(user);
  });
}

// serves a list of the repos currently stored in repos/
function serveSamples(response) {
  // get array of files in a directory,
  // not including .DS_Store
  var readNoDS = function(path) {
    return fs.readdirSync(path).filter(function(file) {
      return file !== '.DS_Store';
    });
  };

  // construct array of repos
  var repos = [],
      samples = __dirname + '/samples/',
      users = readNoDS(samples);

  users.forEach(function(user) {
    var repo = readNoDS(samples + user + '/').filter(function(file) {
      return file.match(/\.json/);
    })[0];
    var json = fs.readFileSync(samples + user + '/' + repo, 'utf8'); 
    repos.push({
      name: user + '/' + repo.replace('.json', ''),
      data: JSON.parse(json)
    });
  });

  // serve up the array
  response.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  response.end(JSON.stringify(repos));
}

////////////// START THE HTTP SERVER /////////////
// this server handles static file requests and
// harvesting the json after repos are cloned

http.createServer(function (request, response) {

  var urlInfo = url.parse(request.url, true);

  if (urlInfo.pathname === '/harvest') 
    serveFlower(response, urlInfo.query.repo);
  else if (urlInfo.pathname === '/samples')
    serveSamples(response);
  else
    serveStaticFile(response, urlInfo.pathname);

}).listen(appConfig.ports.HTTP);

console.log(`HTTP server running at http://${appConfig.hostName}:${appConfig.ports.HTTP}`);

/////////// START THE WEBSOCKETS SERVER ///////////
// this server handles clone requests and broadcasts
// the server events to the client

ws.createServer(function(conn) {

  conn.on('text', function (data) {
    console.log("New websockets connection");
    var SSE = new ServerSentEvents(conn);
    data = JSON.parse(data);
    cloneFlower(SSE, data.url, data.isPrivate);
  });

  conn.on('close', function (code, reason) {
    console.log("Connection closed");
  });

}).listen(appConfig.ports.WS);

console.log(`Websockets server running at ws://${appConfig.hostName}:${appConfig.ports.WS}`);

