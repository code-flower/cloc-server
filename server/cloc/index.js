//////////////// IMPORTS ///////////////////

const {
  processRequestParams,
  checkRepoClonability,
  cloneRepoInFilesystem,
  convertRepoToClocFile,
  convertClocFileToJson,
  sendJsonToClient,
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

  .catch(err => ctrl.conn.error(err))

  .finally(() => deleteRepoFromFilesystem(ctrl))
  .finally(() => closeConnectionToClient(ctrl));
}

/////////////////// EXPORTS ///////////////////

module.exports = getClocData;

