//////////////// IMPORTS ///////////////////

const {
  prepRepoForPipeline,
  checkRepoClonability,
  cloneRepoInFilesystem,
  convertRepoToClocFile,
  convertClocFileToJson,
  sendJsonToClient,
  deleteRepoFromFilesystem,
  closeConnectionToClient
} = require('./subtasks/');

//////////////// PRIVATE ///////////////////

function generateFlower(repo) {
  prepRepoForPipeline(repo)
  .then(checkRepoClonability)
  .then(cloneRepoInFilesystem)
  .then(convertRepoToClocFile)
  .then(convertClocFileToJson)
  .then(sendJsonToClient)

  .catch(err => repo.conn.error(err))

  .finally(() => deleteRepoFromFilesystem(repo))
  .finally(() => closeConnectionToClient(repo));
}

/////////////////// EXPORTS ///////////////////

module.exports = generateFlower;

