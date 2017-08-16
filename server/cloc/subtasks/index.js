
module.exports = {
  processRequestParams:     require('./processRequestParams'),
  checkRepoClonability:     require('./checkRepoClonability'),
  cloneRepoInFilesystem:    require('./cloneRepoInFilesystem'),
  convertRepoToClocFile:    require('./convertRepoToClocFile'),
  convertClocFileToJson:    require('./convertClocFileToJson'),
  sendJsonToClient:         require('./sendJsonToClient'),
  deleteRepoFromFilesystem: require('./deleteRepoFromFilesystem'),
  closeConnectionToClient:  require('./closeConnectionToClient')
};