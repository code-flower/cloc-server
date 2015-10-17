
///////////////////////// MODULES /////////////////////////

var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;
var Q = require('q');
var convertCloc = require('./scripts/dataConverter.js');
var mkpath = require('mkpath');

////////////////////// SSE FUNCTIONS //////////////////////

var SSE = {

  res: null,

  open: function(response) {
    this.res = response;
    this.res.writeHead(200, {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive'
    });
    console.log("SSE CONNECTION OPEN");
  },

  write: function(data) {
    console.log(data);
    this.res.write('id: ' + 'node server' + '\n');
    this.res.write('data: ' + data + '\n\n');
  },

  close: function() {
    this.res.end();
    console.log("SSE CONNECTION CLOSED");
  }

};

//////////////// RESPONSE TO SSE REQUESTS //////////////////

function cloneRepo(giturl, user) {
  var deferred = Q.defer();

  mkpath.sync('repos/' + user + '/');

  var cd = 'cd repos/' + user + '/'; 
  var clone = 'git clone ' + giturl + ' --progress';

  SSE.write('>> ' + clone.replace(' --progress', ''));

  var process = exec(cd + clone, function() {
    deferred.resolve();
  }); 

  process.stderr.on('data', function(data) {
    SSE.write(data);
  });

  return deferred.promise;
}

function createClocFile(user, repo) {
  var deferred = Q.defer();

  var cd = 'cd repos/' + user + '/; ';
  var cloc = 'cloc ' + repo +
             ' --csv --by-file --report-file=../../cloc-data/' + 
             user + '/' + repo + '.cloc';

  SSE.write('');
  SSE.write('>> ' + cloc.replace('cd repos; ', ''));

  var process = exec(cd + cloc, function() {
    deferred.resolve();
  });

  process.stdout.on('data', function(data) {
    SSE.write(data);
  });

  return deferred.promise;
}

function convertClocFile(user, repo) {
  SSE.write('');
  SSE.write('Converting cloc file to json...');

  fs.readFile('cloc-data/' + user + '/' + repo + '.cloc', 'utf8', function(err, data) {
    if (err) 
      console.log(err);
    else {
      var json = convertCloc(data);

      var filePath = '../client/data/' + user + '/';
      mkpath.sync(filePath);

      var fileName =  filePath + repo + '.json';
      fs.writeFile(fileName, JSON.stringify(json), 'utf8', function(err) {
        if (err) 
          console.log(err);
        else {
          SSE.write('File converted.');
          SSE.write('');
          SSE.write('END:' + user + '/' + repo);
          SSE.close();
        }
      })
    }
  });
}

function sendFlower(url, response) {

  SSE.open(response);

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

  cloneRepo(url, user)
  .then(function() {
    return createClocFile(user, repo);
  })
  .then(function() {
    convertClocFile(user, repo);
  });
}

////////////////////// AJAX REQUESTS /////////////////////////

function getRepos() {

  var readNoDS = function(path) {
    return fs.readdirSync(path).filter(function(file) {
      return file !== '.DS_Store';
    });
  }

  var repos = [];
  var users = readNoDS('repos/');
  users.forEach(function(user) {
    var userRepos = readNoDS('repos/' + user + '/');
    userRepos.forEach(function(userRepo) {
      repos.push(user + '/' + userRepo);
    });
  });

  return repos;
}

///////////////////// SERVE STATIC FILES /////////////////////

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

  // direct to client folder
  pathname = '../client' + pathname;

  var filePath = path.join(__dirname, pathname);

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

  // ajax request
  if (urlInfo.pathname === '/repos') {
    response.writeHead(200, {'Content-Type': 'application/json'});
    response.end(JSON.stringify(getRepos()));

  // SSE request
  } else if (urlInfo.pathname === '/parse') {
    sendFlower(urlInfo.query.url, response);

  // regular http request
  } else
    serveStaticFile(response, urlInfo.pathname);

}).listen(8000);

console.log("Server running at http://localhost:8000/");


