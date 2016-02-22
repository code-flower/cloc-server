///////////// IMPORTS /////////////

var git = require('./git.js');
var cloc = require('./cloc.js');
var parseGitUrl = require('git-url-parse');

//////////// PRIVATE //////////////

function analyzeRepo(url, user, repo, socket) {
  // clone repo, create and convert cloc file
  git.cloneRepo(url, user, socket)
  .then(function() {
    return cloc.generateJson(user, repo, socket);
  })
  .then(function() {
    socket.write('');
    socket.write('END:' + user + '/' + repo);
    socket.close();
  })
  .catch(function(error) {
    if (error = 'unauthorized') {
      socket.write('UNAUTHORIZED');
      socket.close();
    }
  });
}

// parses git clone url and converts the repo to flowerable json
function cloneFlower(socket, url, isPrivate) {

  var urlInfo = parseGitUrl(url);
  var user = urlInfo.owner;
  var repo = urlInfo.name;

  // require https
  if (!urlInfo.protocol.match(/https/i)) {
    socket.write('Please use an https url.');
    socket.write('');
    socket.write('ERROR');
    socket.close();
    return;
  }

  // because some urls don't contain a user
  // like the beanstalk one in roofshoot
  if (!user) user = 'temp';

  // require a user and repo
  if (!user || !repo) {
    socket.write('Not a valid git clone url.');
    socket.write('');
    socket.write('ERROR');
    socket.close();
    return;
  }

  if (isPrivate) 
    analyzeRepo(url, user, repo, socket);
  else 
    git.checkPrivateRepo(user, repo, socket)
    .then(function(isPrivate) {
      if (isPrivate) {
        socket.write('CREDENTIALS');
        socket.close();
      } else {
        analyzeRepo(url, user, repo, socket);
      }
    });
}

//////////// PUBLIC //////////////

module.exports = cloneFlower;
