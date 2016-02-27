///////////// IMPORTS /////////////

var appConfig = require('../../shared/appConfig.js');
var git = require('./git.js');
var cloc = require('./cloc.js');
var parseGitUrl = require('git-url-parse');

//////////// PRIVATE //////////////

function analyzeRepo(repo, socket) {
  // clone repo, create and convert cloc file
  git.cloneRepo(repo, socket)
  .then(function() {
    return cloc.generateJson(repo, socket);
  })
  .then(function() {
    socket.complete(repo);
  })
  .catch(function(error) {
    if (error === appConfig.messageTypes.unauthorized) 
      socket.unauthorized(repo);
  });
}

// parses git clone url and converts the repo to flowerable json
function cloneFlower(socket, repo) {

  var urlInfo = parseGitUrl(repo.url || ''),
      usingHTTPS = urlInfo.protocol === 'https';

  repo.fullName = urlInfo.full_name;

  if (!repo.fullName) 
    socket.invalidUrl(repo);

  else if (repo.private) {
    if (!usingHTTPS) 
      socket.needHTTPS(repo);
    else 
      analyzeRepo(repo, socket);
  }
  
  else 
    git.checkPrivateRepo(repo, socket)
    .then(function(isPrivate) {
      if (isPrivate) 
        socket.credentials(repo, !usingHTTPS);
      else 
        analyzeRepo(repo, socket);
    });
}

//////////// PUBLIC //////////////

module.exports = cloneFlower;

