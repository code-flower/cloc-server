//////////// IMPORTS ////////////

const Promise = require('bluebird');
var exec = require('child_process').exec;

//////////// PRIVATE //////////////

// uses the git ls-remote command to determine: 
// (1) whether the repo requires credentials,
// (2) whether the repo exists, and
// (3) whether the branch exists
function checkRepoStatus(repo) {
  return new Promise((resolve, reject) => {

    // construct the git ls-remote command.
    // using '******' as a fallback is a trick that lets us 
    // distinguish between invalid credentials and non-existent repos, 
    // without triggering a username/password prompt
    let user = repo.username ? repo.username.replace(/@/g, '%40') : '******',
        pass = repo.password ? repo.password.replace(/@/g, '%40') : '******',
        lsRemote = `git ls-remote -h "https://${user}:${pass}@github.com/${repo.fullName}"`;

    // echo the command (but not credentials)
    repo.socket.text('>> ' + lsRemote.replace(/\/.*?@/, '/******:******@'));

    // execute the command
    let proc = exec(lsRemote);

    // stdout fires if the repo exists and the credentials are correct (if required)
    proc.stdout.on('data', function(data) { 
      repo.socket.text(data); 

      data = data.toString('utf-8');
      if (repo.branch && data.indexOf('refs/heads/' + repo.branch + '\n') === -1)
        reject({type: 'not-a-branch'});
      else
        resolve(repo);
    });

    // stderr fires if the credentials are wrong or the repo doesn't exist
    // Repository not found => credentials are correct AND repository does not exist
    // Invalid username or password => credentials are not correct AND repository may or may not exist
    proc.stderr.on('data', function(data) { 
      repo.socket.text(data); 

      data = data.toString('utf-8');
      if (data.match(/Invalid username or password/))
        reject({type: 'credentials'});
      else if (data.match(/Repository not found/))
        reject({type: 'not-a-repo'});
    });
  });
}

//////////// EXPORTS //////////////

module.exports = checkRepoStatus;
