//////////// IMPORTS ////////////

const Promise = require('bluebird'),
      { exec } = require('child_process'),
      config = require('@config');

//////////// PRIVATE //////////////

// uses the git ls-remote command to determine: 
// (1) whether the repo requires credentials,
// (2) whether the repo exists, and
// (3) whether the branch exists
function checkRepoClonability(ctrl) {
  return new Promise((resolve, reject) => {
    console.log("2. Checking Repo Clonability");

    let eTypes = config.errorTypes;

    // construct the git ls-remote command.
    // using '******' as a fallback is a trick that lets us 
    // distinguish between invalid credentials and non-existent repos, 
    // without triggering a username/password prompt
    let user =  ctrl.creds.username || '******',
        pass =  ctrl.creds.password || '******',
        fName = ctrl.repo.fullName,
        lsRemote = `git ls-remote -h "https://${user}:${pass}@github.com/${fName}"`;

    // echo the command (but not credentials)
    ctrl.conn.update('>> ' + lsRemote.replace(/\/.*?@/, '/******:******@'));

    // execute the command
    let proc = exec(lsRemote);

    // stdout fires if the repo exists and the credentials are correct (if required)
    proc.stdout.on('data', data => { 
      ctrl.conn.update(data); 

      data = data.toString('utf-8');
      if (ctrl.repo.branch && data.indexOf('refs/heads/' + ctrl.repo.branch + '\n') === -1)
        reject({ errorType: eTypes.branchNotFound });
      else
        resolve(ctrl);
    });

    // stderr fires if the credentials are wrong or the repo doesn't exist
    // Repository not found => credentials are correct AND repository does not exist
    // Invalid username or password => credentials are not correct AND repository may or may not exist
    proc.stderr.on('data', data => { 
      ctrl.conn.update(data); 

      data = data.toString('utf-8');
      if (data.match(/Invalid username or password/))
        if (ctrl.creds.username && ctrl.creds.password)
          reject({ errorType: eTypes.credentialsInvalid });
        else 
          reject({ errorType: eTypes.needCredentials });
      else if (data.match(/Repository not found/))
        reject({ errorType: eTypes.repoNotFound });
    });
  });
}

//////////// EXPORTS //////////////

module.exports = checkRepoClonability;
