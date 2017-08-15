//////////// IMPORTS ////////////

const Promise = require('bluebird'),
      { exec } = require('child_process'),
      config = require('@config');

//////////// PRIVATE //////////////

// scans lsRemote output and returns the sha of either the latest commit in the given branch,
// or the latest commit in the default branch if no branch is given.
// returns blank if a branch is given and does not exist
function getLatestSha(lsRemoteOutput, branch) {
  let lines = lsRemoteOutput.split('\n')
    .slice(0, -1)
    .map(line => line.split('\t'))
    .filter(line => (
      line[1] === 'HEAD' || 
      line[1].indexOf('refs/heads/') !== -1
    ))
    .map(line => ({
      sha: line[0],
      branch: line[1] && line[1].replace('refs/heads/', '')
    }));

  for (var i = 0; i < lines.length; i++)
    // use sha of given branch, or 
    // default branch if no branch specified
    if (lines[i].branch === branch || 
        (!branch && lines[i].branch === 'HEAD')) 
      return lines[i].sha;

  return '';
}

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
        lsRemote = `git ls-remote "https://${user}:${pass}@github.com/${fName}"`;

    // echo the command (but not credentials)
    ctrl.conn.update('>> ' + lsRemote.replace(/\/.*?@/, '//******:******@'));

    // execute the command
    let proc = exec(lsRemote),
        stdoutText = '',
        stderrText = '';

    // stdout fires if the repo exists and the credentials are correct (if required)
    proc.stdout.on('data', data => { 
      ctrl.conn.update(data); 
      stdoutText += data;
    });

    proc.stdout.on('end', () => {
      let sha = getLatestSha(stdoutText, ctrl.repo.branch);
      if (sha) {
        ctrl.repo.sha = sha;
        resolve(ctrl);
      } else
        reject({ errorType: eTypes.branchNotFound });
    });

    // stderr fires if the credentials are wrong or the repo doesn't exist
    // Repository not found => credentials are correct AND repository does not exist
    // Invalid username or password => credentials are not correct AND repository may or may not exist
    proc.stderr.on('data', data => { 
      ctrl.conn.update(data); 
      stderrText += data;
    });

    proc.stderr.on('end', () => {
      if (stderrText.match(/Invalid username or password/))
        if (ctrl.creds.username && ctrl.creds.password)
          reject({ errorType: eTypes.credentialsInvalid });
        else 
          reject({ errorType: eTypes.needCredentials });
      else if (stderrText.match(/Repository not found/))
        reject({ errorType: eTypes.repoNotFound });
    });
  });
}

//////////// EXPORTS //////////////

module.exports = checkRepoClonability;

