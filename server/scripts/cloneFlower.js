///////////// IMPORTS /////////////

var git = require('./git.js');
var cloc = require('./cloc.js');
var parseGitUrl = require('git-url-parse');

//////////// PRIVATE //////////////

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

//////////// PUBLIC //////////////

module.exports = cloneFlower;
