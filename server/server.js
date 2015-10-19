
///////////////////////// MODULES /////////////////////////

var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var Q = require('q');
var mkpath = require('mkpath');
var convertCloc = require('./scripts/dataConverter.js');

/////////////////////// SSE MODULE //////////////////////

// implements the server side of the EventSource protocol
var SSE = (function() {

  // the sse connection
  var conn = null;

  return {

    // open the connection
    open: function(httpResponse) {
      conn = httpResponse;
      conn.writeHead(200, {
        'Content-Type':  'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection':    'keep-alive'
      });
      console.log("SSE CONNECTION OPEN");
    },

    // stream a bit of data
    write: function(data) {
      console.log(data);
      conn.write('id: node' + '\n');
      conn.write('data: ' + data + '\n\n');
    },

    // close the connection
    close: function() {
      conn.end();
      conn = null;
      console.log("SSE CONNECTION CLOSED");
    }
  };

})();

////////////////// TURN REPOS INTO JSON /////////////////

// execute a shell command and stream the output over SSE
// returns promise that resolve when command is done executing
function execShellCommand(cmd) {
  var deferred = Q.defer();

  // run the command
  var process = exec(cmd, function() { deferred.resolve(); }); 

  // listen for command output
  process.stdout.on('data', function(data) { SSE.write(data); });
  process.stderr.on('data', function(data) { SSE.write(data); });

  return deferred.promise;
}

// runs git clone
function cloneRepo(giturl, user) {
  mkpath.sync('repos/' + user + '/');

  var cd = 'cd repos/' + user + '/; '; 
  var clone = 'git clone ' + giturl + ' --progress';

  SSE.write('>> ' + clone.replace(' --progress', ''));

  return execShellCommand(cd + clone);
}

// runs git pull
function pullRepo(repoName) {
  var cd = 'cd repos/' + repoName + '/; '; 
  var pull = 'git pull --progress';

  SSE.write('>> git pull');

  return execShellCommand(cd + pull);
}

// runs cloc
function createClocFile(user, repo) {
  var deferred = Q.defer();

  var cd = 'cd repos/' + user + '/; ';
  var cloc = 'cloc ' + repo +
             ' --csv --by-file ' + 
             '--ignored=../../reasons.txt ' +  
             '--report-file=../../cloc-data/' +
             user + '/' + repo + '.cloc';

  SSE.write('');
  SSE.write('>> ' + cloc.replace('cd repos; ', ''));

  return execShellCommand(cd + cloc);
}

// converts a cloc file to json
function convertClocFile(user, repo) {
  SSE.write('');
  SSE.write('Converting cloc file to json...');

  var inFile = 'cloc-data/' + user + '/' + repo + '.cloc';
  fs.readFile(inFile, 'utf8', function(err, data) {
    if (err) 
      console.log(err);
    else {
      var json = convertCloc(data);

      var outFilePath = '../client/data/' + user + '/';
      mkpath.sync(outFilePath);

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
  SSE.open(response);

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
  cloneRepo(url, user)
  .then(function() {
    createClocFile(user, repo)
    .then(function() {
      convertClocFile(user, repo);
    });
  })
}

function pullFlower(repoName, response) {

  // open eventsource connection
  SSE.open(response);

  // parse the repoName
  var arr = repoName.split('/');
  var user = arr[0];
  var repo = arr[1];

  // pull repo, create and convert cloc file
  pullRepo(repoName)
  .then(function() {
    createClocFile(user, repo)
    .then(function() {
      convertClocFile(user, repo);
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
  }

  // construct array of repos
  var repos = [];
  var users = readNoDS('repos/');
  users.forEach(function(user) {
    var userRepos = readNoDS('repos/' + user + '/');
    userRepos.forEach(function(userRepo) {
      repos.push(user + '/' + userRepo);
    });
  });

  // serve up the array
  response.writeHead(200, {'Content-Type': 'application/json'});
  response.end(JSON.stringify(repos));
}

/////////////// RESPOND TO STATIC FILE REQUESTS //////////////////

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

  var filePath = path.join(__dirname, '../client' + pathname);

  // return 404 if the file doesn't exist
  try {
    var stat = fs.statSync(filePath);
  } catch(e) {
    console.log("File not found: " + filePath);
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
  fs.createReadStream(filePath).pipe(response);
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


