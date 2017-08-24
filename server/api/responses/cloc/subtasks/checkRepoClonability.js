//////////// IMPORTS ////////////

const Promise = require('bluebird'),
      { exec } = require('child_process'),
      config = require('@config'),
      Log = require('@log');

//////////// PRIVATE //////////////

// scans lsRemote output and returns an object of branches 
// where the keys are the branch names and the values are the shas
function getBranches(lsRemoteOutput) {
  let branches = {};
  lsRemoteOutput.split('\n')
    .slice(0, -1)
    .map(line => line.split('\t'))
    .forEach(line => {
      branches[line[1].replace('refs/heads/', '')] = line[0];
    });
  return branches;
}

// uses the git ls-remote command to determine: 
// (1) whether the repo requires credentials,
// (2) whether the repo exists, and
// (3) whether the branch exists
function checkRepoClonability(ctrl) {
  return new Promise((resolve, reject) => {
    Log(2, '2. Checking Repo Clonability');

    // construct the git ls-remote command.
    // using '******' as a fallback is a trick that lets us 
    // distinguish between invalid credentials and non-existent repos, 
    // without triggering a username/password prompt
    let user =  ctrl.creds.username || '******',
        pass =  ctrl.creds.password || '******',
        fName = ctrl.repo.fullName,
        lsRemote = `git ls-remote -h "https://${user}:${pass}@github.com/${fName}"`;

    // echo the command (but not credentials)
    ctrl.resp.update('>> ' + lsRemote.replace(/\/.*?@/, '//******:******@'));

    // execute the command
    let proc = exec(lsRemote),
        stdoutText = '',
        stderrText = '';

    // stdout fires if the repo exists and the credentials are correct (if required)
    proc.stdout.on('data', data => { 
      ctrl.resp.update(data); 
      stdoutText += data;
    });

    proc.stdout.on('end', () => {
      ctrl.repo.branches = getBranches(stdoutText);

      let { branch } = ctrl.repo;
      if (!branch || Object.keys(ctrl.repo.branches).indexOf(branch) !== -1) 
        resolve(ctrl);
      else
        reject(config.errors.BranchNotFound);
    });

    // stderr fires if the credentials are wrong or the repo doesn't exist
    // Repository not found => credentials are correct AND repository does not exist
    // Invalid username or password => credentials are not correct AND repository may or may not exist
    proc.stderr.on('data', data => { 
      ctrl.resp.update(data); 
      stderrText += data;
    });

    proc.stderr.on('end', () => {
      if (stderrText.match(/Invalid username or password/))
        if (ctrl.creds.username && ctrl.creds.password)
          reject(config.errors.CredentialsInvalid);
        else 
          reject(config.errors.NeedCredentials);
      else if (stderrText.match(/Repository not found/))
        reject(config.errors.RepoNotFound);
    });
  });
}

//////////// EXPORTS //////////////

module.exports = checkRepoClonability;

