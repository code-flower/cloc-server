// NOTE: change repo.name to repo.folderName in the cloc command to test the error state

//////////// IMPORTS ////////////

const { exec } = require('child_process'),
      Promise = require('bluebird'),
      config = require('@config');

//////////// PRIVATE ////////////

function convertRepoToClocFile(repo) {
  return new Promise((resolve, reject) => {
    console.log("4. Converting Repo To Cloc File");

    let clocError = false,
        cd = 'cd ' + config.paths.repos + repo.folderName + '; ',
        cloc = 'cloc ' + repo.name +
               ' --csv --by-file ' + 
               `--ignored=${config.cloc.ignoredFile} ` +  
               `--report-file=${config.cloc.dataFile}`;

    repo.conn.update('\n>> ' + cd + cloc);

    let proc = exec(cd + cloc, () => {
      // NOTE: Unitech/pm2 throws an error about recursion
      // but it still produces the cloc file so no need to reject.
      // Think about how to handle that (and other non-fatal errors).

      // if (clocError) 
      //   reject({
      //     errorType: config.errorTypes.clocError
      //   });
      // else
      //   resolve(repo);

      resolve(repo);
    });

    proc.stdout.on('data', data => data => { repo.conn.update(data); });

    proc.stderr.on('data', data => {
      repo.conn.update(data);
      clocError = true;
    });
  });
}

//////////// EXPORTS ////////////

module.exports = convertRepoToClocFile;
