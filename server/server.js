
///////////////////////// MODULES /////////////////////////

var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var convertCloc = require('./dataConverter.js');

////////////////////// GET CLOC DATA //////////////////////

function convertClocFile(response) {
  fs.readFile('cloc-data/insights2.cloc', 'utf8', function(err, data) {
    if (err) 
      console.log(err);
    else {
      var json = convertCloc(data);
      fs.writeFile('../client/data/test.json', JSON.stringify(json), 'utf8', function(err) {
        if (err) 
          console.log(err);
        else {
          writeSSE(response, 'cloc file converted to json');
          writeSSE(response, 'END');
          response.end();
        }
      })
    }
  });
}

function createClocFile(response) {
 // var command = 'cloc ../../CODE-Insights --csv --by-file --report-file=cloc-data/insights2.cloc';
  var command = 'cloc ../../CodeFlower --csv --by-file --report-file=cloc-data/insights2.cloc';

  var process = exec(command, function() {
    convertClocFile(response);
  });

  process.stdout.on('data', function(data) {
    writeSSE(response, data);
  });
}

//createClocFile();

//////////////////// EVENT SOURCE SERVER /////////////////////
 
function openSSEConnection(response) {
  response.writeHead(200, {
    'Content-Type':  'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection':    'keep-alive'
  });
    
  console.log("Connection established.");
  // writeServerSendEvent(res, sseId, "First communication");
}
 
function writeSSE(res, data) {
  console.log(data);

  res.write('id: ' + 'node server' + '\n');
  res.write('data: ' + data + '\n\n');
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
  } else if (urlInfo.pathname == '/talk') {

    openSSEConnection(response);
    createClocFile(response);

  // regular http request
  } else
    serveStaticFile(response, urlInfo.pathname);

}).listen(8000);

console.log("Server running at http://localhost:8000/");



