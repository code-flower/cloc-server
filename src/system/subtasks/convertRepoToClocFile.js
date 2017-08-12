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

    repo.socket.text('\n>> ' + cd + cloc);

    let proc = exec(cd + cloc, () => {
      if (clocError) 
        reject(config.errorTypes.clocError);
      else
        resolve(repo);
    });

    proc.stdout.on('data', data => data => { repo.socket.text(data); });

    proc.stderr.on('data', data => {
      repo.socket.text(data);
      clocError = true;
    });
  });
}

//////////// EXPORTS ////////////

module.exports = convertRepoToClocFile;
