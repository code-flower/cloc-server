
///////////////////////// MODULES /////////////////////////

// npm
var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var Q = require('q');
var mkpath = require('mkpath');

// app
var convertCloc = require('./scripts/dataConverter.js');
var ServerSentEvents = require('./scripts/SSE.js');
var serveStaticFile = require('./scripts/staticFileServer.js');
var execShellCommand = require('./scripts/shell.js');

////////////////// TURN REPOS INTO JSON /////////////////

// runs git clone
function cloneRepo(giturl, user, SSE) {
  mkpath.sync(__dirname + '/repos/' + user + '/');

  var cd = 'cd ' + __dirname + '/repos/' + user + '/; '; 
  var clone = 'git clone ' + giturl + ' --progress';

  SSE.write('>> ' + clone.replace(' --progress', ''));

  return execShellCommand(cd + clone, SSE);
}

// runs git pull
function pullRepo(repoName, SSE) {
  var cd = 'cd ' + __dirname + '/repos/' + repoName + '/; '; 
  var pull = 'git pull --progress';

  SSE.write('>> git pull');

  return execShellCommand(cd + pull, SSE);
}

// runs cloc
function createClocFile(user, repo, SSE) {
  var cd = 'cd ' + __dirname + '/repos/' + user + '/; ';
  var cloc = 'cloc ' + repo +
             ' --csv --by-file ' + 
             '--ignored=../../reasons.txt ' +  
             '--report-file=../../cloc-data/' +
             user + '/' + repo + '.cloc';

  SSE.write('');
  SSE.write('>> ' + cloc);

  return execShellCommand(cd + cloc, SSE);
}

// converts a cloc file to json
function convertClocFile(user, repo, SSE) {
  SSE.write('');
  SSE.write('Converting cloc file to json...');

  // read the cloc file
  var inFile = __dirname + '/cloc-data/' + user + '/' + repo + '.cloc';
  fs.readFile(inFile, 'utf8', function(err, data) {
    if (err) 
      console.log(err);
    else {  
      // convert the cloc file to json
      var json = convertCloc(data);

      // make a new folder for the user
      var outFilePath = __dirname + '/../client/data/' + user + '/';
      mkpath.sync(outFilePath);

      // write out the json
      var outFile =  outFilePath + repo + '.json';
      fs.writeFile(outFile, JSON.stringify(json), 'utf8', function(err) {
        if (err) 
          console.log(err);
        else {
          SSE.write('Wrote ' + outFile);
          SSE.write('');
          SSE.write('END:' + user + '/' + repo);
          SSE.close();
        }
      });
    }
  });
}

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
  cloneRepo(url, user, SSE)
  .then(function() {
    createClocFile(user, repo, SSE)
    .then(function() {
      convertClocFile(user, repo, SSE);
    });
  })
}

function pullFlower(repoName, response) {

  // open eventsource connection
  var SSE = new ServerSentEvents(response);

  // parse the repoName
  var arr = repoName.split('/');
  var user = arr[0];
  var repo = arr[1];

  // pull repo, create and convert cloc file
  pullRepo(repoName, SSE)
  .then(function() {
    createClocFile(user, repo, SSE)
    .then(function() {
      convertClocFile(user, repo, SSE);
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

  } else if (urlInfo.pathname === '/pull') {
    pullFlower(urlInfo.query.repo, response);

  // ajax request
  } else if (urlInfo.pathname === '/repos') {
    serveRepos(response);

  // regular http request
  } else
    serveStaticFile(response, urlInfo.pathname);

}).listen(8000);

console.log("Server running at http://localhost:8000/");

