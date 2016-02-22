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
    socket.write({
      type: appConfig.messageTypes.complete,
      repoName: repo.fullName
    });
    socket.close();
  })
  .catch(function(error) {
    if (error === appConfig.messageTypes.unauthorized) {
      socket.write({
        type: appConfig.messageTypes.unauthorized
      });
      socket.close();
    }
  });
}

// parses git clone url and converts the repo to flowerable json
function cloneFlower(socket, repo) {

  var urlInfo = parseGitUrl(repo.url),
      usingHTTPS = urlInfo.protocol === 'https';

  repo.fullName = urlInfo.full_name;

  if (!repo.fullName) {
    socket.write('Not a valid git clone url.');
    socket.write('');
    socket.write({
      type: appConfig.messageTypes.error
    });
    socket.close();
    return;
  }

  if (repo.private) {
    // require https for private repos
    if (!usingHTTPS) {
      socket.write('Please use an https url.');
      socket.write('');
      socket.write({
        type: appConfig.messageTypes.error
      });
      socket.close();
      return;
    } else {
      analyzeRepo(repo, socket);
    }
  }
  else 
    git.checkPrivateRepo(repo, socket)
    .then(function(isPrivate) {
      console.log("isPrivate?", isPrivate);
      if (isPrivate) {
        socket.write({
          type: appConfig.messageTypes.credentials,
          needHTTPS: !usingHTTPS
        });
        socket.close();
      } else {
        console.log("not private:", repo);
        analyzeRepo(repo, socket);
      }
    });
}

//////////// PUBLIC //////////////

module.exports = cloneFlower;


//////////// TESTING ///////////

// var fakeSocket = {
//   write: function(data) {
//     console.log("SOCKET:", data);
//   }
// };

// var repo = {
//   url: 'https://github.com/claudiajs/claudia',
//   private: false
// };

// cloneFlower(fakeSocket, repo);

