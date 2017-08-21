// NOTE: change repo.name to repo.folderName in the cloc command to test the error state

//////////// IMPORTS ////////////

const { exec } = require('child_process'),
      Promise = require('bluebird'),
      config = require('@config'),
      Log = require('@log');

//////////// PRIVATE ////////////

function convertRepoToClocFile(ctrl) {
  return new Promise((resolve, reject) => {
    Log(2, '5. Converting Repo To Cloc File');

    let cd = 'cd ' + config.paths.repos + ctrl.folderName + '; ',
        cloc = 'cloc ' + ctrl.repo.name +
               ' --csv --by-file ' + 
               `--ignored=${config.cloc.ignoredFile} ` +  
               `--report-file=${config.cloc.dataFile}`;

    ctrl.conn.update('\n>> ' + cd + cloc);

    let proc = exec(cd + cloc, () => resolve(ctrl));
    proc.stdout.on('data', data => ctrl.conn.update(data));
    proc.stderr.on('data', data => ctrl.conn.update(data));
  });
}

//////////// EXPORTS ////////////

module.exports = convertRepoToClocFile;
