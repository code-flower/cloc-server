
module.exports = {
  processRequestParams:     require('./processRequestParams'),
  checkRepoClonability:     require('./checkRepoClonability'),
  cloneRepoInFilesystem:    require('./cloneRepoInFilesystem'),
  getBranchNameIfNeeded:    require('./getBranchNameIfNeeded'),
  convertRepoToClocFile:    require('./convertRepoToClocFile'),
  convertClocFileToJson:    require('./convertClocFileToJson'),
  sendJsonToClient:         require('./sendJsonToClient'),
  handleErrors:             require('./handleErrors'),
  deleteRepoFromFilesystem: require('./deleteRepoFromFilesystem'),
  closeConnectionToClient:  require('./closeConnectionToClient')
};