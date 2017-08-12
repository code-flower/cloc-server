//////////// IMPORTS ////////////

const Promise = require('bluebird'),
      { exec } = require('child_process'),
      config = require('@config');

//////////// PRIVATE //////////////

// uses the git ls-remote command to determine: 
// (1) whether the repo requires credentials,
// (2) whether the repo exists, and
// (3) whether the branch exists
function checkRepoClonability(repo) {
  return new Promise((resolve, reject) => {
    console.log("2. Checking Repo Clonability");

    // construct the git ls-remote command.
    // using '******' as a fallback is a trick that lets us 
    // distinguish between invalid credentials and non-existent repos, 
    // without triggering a username/password prompt
    let user = repo.username || '******',
        pass = repo.password || '******',
        lsRemote = `git ls-remote -h "https://${user}:${pass}@github.com/${repo.fullName}"`;

    // echo the command (but not credentials)
    repo.socket.text('>> ' + lsRemote.replace(/\/.*?@/, '/******:******@'));

    // execute the command
    let proc = exec(lsRemote);

    // stdout fires if the repo exists and the credentials are correct (if required)
    proc.stdout.on('data', data => { 
      repo.socket.text(data); 

      data = data.toString('utf-8');
      if (repo.branch && data.indexOf('refs/heads/' + repo.branch + '\n') === -1)
        reject(config.errorTypes.branchNotFound);
      else
        resolve(repo);
    });

    // stderr fires if the credentials are wrong or the repo doesn't exist
    // Repository not found => credentials are correct AND repository does not exist
    // Invalid username or password => credentials are not correct AND repository may or may not exist
    proc.stderr.on('data', data => { 
      repo.socket.text(data); 

      data = data.toString('utf-8');
      if (data.match(/Invalid username or password/))
        if (repo.username && repo.password)
          reject(config.errorTypes.credentialsInvalid);
        else 
          reject(config.errorTypes.needCredentials);
      else if (data.match(/Repository not found/))
        reject(config.errorTypes.repoNotFound);
    });
  });
}

//////////// EXPORTS //////////////

module.exports = checkRepoClonability;
