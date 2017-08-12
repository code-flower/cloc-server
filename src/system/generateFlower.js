//////////////// IMPORTS ///////////////////

const {
  prepRepoForPipeline,
  checkRepoClonability,
  cloneRepoInFilesystem,
  convertRepoToClocFile,
  convertClocFileToJson,
  sendJsonToClient,
  deleteRepoFromFilesystem
} = require('./subtasks/');

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

