//////////////// IMPORTS ///////////////////

const {
  processRequestParams,
  checkRepoClonability,
  cloneRepoInFilesystem,
  getBranchNameIfNeeded,
  convertRepoToClocFile,
  convertClocFileToJson,
  sendJsonToClient,
  handleErrors,
  deleteRepoFromFilesystem
} = require('./subtasks/');

//////////////// PRIVATE ///////////////////

function serveClocData(ctrl) {
  processRequestParams(ctrl)
  .then(checkRepoClonability)
  .then(cloneRepoInFilesystem)
  .then(getBranchNameIfNeeded)
  .then(convertRepoToClocFile)
  .then(convertClocFileToJson)
  .then(sendJsonToClient)
  .catch(err => handleErrors(err, ctrl))
  .finally(() => deleteRepoFromFilesystem(ctrl));
}

/////////////////// EXPORTS ///////////////////

module.exports = serveClocData;

