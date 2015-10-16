
///////////////////////// MODULES /////////////////////////

var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var Q = require('q');
var convertCloc = require('./dataConverter.js');

////////////////////// SSE FUNCTIONS //////////////////////

var SSE = {

  open: function(response) {
    response.writeHead(200, {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive'
    });
    console.log("Connection established.");
  },

  write: function(response, data) {
    console.log(data);
    response.write('id: ' + 'node server' + '\n');
    response.write('data: ' + data + '\n\n');
  },

  close: function(response) {
    response.end();
  }
}

////////////////////// GET CLOC DATA //////////////////////

function cloneRepo(giturl, response) {
  var deferred = Q.defer();
  var command = 'cd repos; git clone ' + giturl + ' --progress';

  SSE.write(response, '>> ' + command.replace('cd repos; ', '').replace(' --progress', ''));

  var process = exec(command, function() {
    deferred.resolve();
  }); 

  process.stderr.on('data', function(data) {
    SSE.write(response, data);
  });

  return deferred.promise;
}

function createClocFile(gitRepo, response) {
  var deferred = Q.defer();
  var command = 'cd repos; cloc ' + gitRepo + ' --csv --by-file --report-file=../cloc-data/' + gitRepo + '.cloc';

  SSE.write(response, '');
  SSE.write(response, '>> ' + command.replace('cd repos; ', ''));

  var process = exec(command, function() {
    deferred.resolve();
  });

  process.stdout.on('data', function(data) {
    SSE.write(response, data);
  });

  return deferred.promise;
}

function convertClocFile(gitRepo, response) {
  SSE.write(response, '');
  SSE.write(response, 'Converting cloc file to json...');

  fs.readFile('cloc-data/' + gitRepo + '.cloc', 'utf8', function(err, data) {
    if (err) 
      console.log(err);
    else {
      var json = convertCloc(data);
      fs.writeFile('../client/data/test.json', JSON.stringify(json), 'utf8', function(err) {
        if (err) 
          console.log(err);
        else {
          SSE.write(response, 'File converted.');
          SSE.write(response, '');
          SSE.write(response, 'END');
          SSE.close(response);
        }
      })
    }
  });
}

function sendFlower(url, response) {

  console.log("URL = ", url);

  var match = url.match(/.com\/(.*?)\.git$/)[1].split('/');
  var gitUser = match[0];
  var gitRepo = match[1];

  console.log("USER = ", gitUser);
  console.log("REPO = ", gitRepo);

  SSE.open(response);

  cloneRepo(url, response)
  .then(function() {
    return createClocFile(gitRepo, response);
  })
  .then(function() {
    convertClocFile(gitRepo, response);
  });
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

  //if (!pathname.match(/\.json/))
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
  if (urlInfo.pathname == '/search') {

    console.log("received request");
    // response.writeHead(200, {'Content-Type': 'application/json'});
    // response.end(JSON.stringify({message: 'hello'}));

  // SSE request
  } else if (urlInfo.pathname == '/parse') {
    console.log(urlInfo);

    sendFlower(urlInfo.query.url, response);

  // regular http request
  } else
    serveStaticFile(response, urlInfo.pathname);

}).listen(8000);

console.log("Server running at http://localhost:8000/");


