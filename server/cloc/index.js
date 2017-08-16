//////////////// IMPORTS ///////////////////

const {
  processRequestParams,
  checkRepoClonability,
  cloneRepoInFilesystem,
  convertRepoToClocFile,
  convertClocFileToJson,
  sendJsonToClient,
  handleErrors,
  deleteRepoFromFilesystem,
  closeConnectionToClient
} = require('./subtasks/');

//////////////// PRIVATE ///////////////////

function getClocData(ctrl) {
  processRequestParams(ctrl)
  .then(checkRepoClonability)
  .then(cloneRepoInFilesystem)
  .then(convertRepoToClocFile)
  .then(convertClocFileToJson)
  .then(sendJsonToClient)
  .catch(err => handleErrors(err, ctrl))
  .finally(() => deleteRepoFromFilesystem(ctrl))
  .finally(() => closeConnectionToClient(ctrl));
}

/////////////////// EXPORTS ///////////////////

module.exports = getClocData;

