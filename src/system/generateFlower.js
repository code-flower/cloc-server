//////////////// IMPORTS ///////////////////

const prepRepoForPipeline      = require('./bin/prepRepoForPipeline'),
      checkRepoClonability     = require('./bin/checkRepoClonability'),
      cloneRepoInFilesystem    = require('./bin/cloneRepoInFilesystem'),
      convertRepoToClocFile    = require('./bin/convertRepoToClocFile'),
      convertClocFileToJson    = require('./bin/convertClocFileToJson'),
      sendJsonToClient         = require('./bin/sendJsonToClient'),
      deleteRepoFromFilesystem = require('./bin/deleteRepoFromFilesystem');

//////////////// PRIVATE ///////////////////

function generateFlower(repo) {
  prepRepoForPipeline(repo)
  .then(checkRepoClonability)
  .then(cloneRepoInFilesystem)
  .then(convertRepoToClocFile)
  .then(convertClocFileToJson)
  .then(sendJsonToClient)
  .then((repo) => {
    console.log("SUCCESS: " + repo.fullName);
  })
  .catch((err) => {
    console.log("CATCH: ", err);
  })
  .error((err) => {
    console.log("ERROR: ", err);
  })
  .finally(() => deleteRepoFromFilesystem(repo));
}

/////////////////// EXPORTS ///////////////////

module.exports = generateFlower;

