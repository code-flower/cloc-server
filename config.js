
var path = require('path');

var REMOTE = false;

module.exports = {

  protocols: {
    HTTP: 'https',
    WS:   'wss'
  },

  hostname: REMOTE ? 'api.codeflower.la' : 'localhost',

  ports: {
    HTTP: REMOTE ? 443 : 8000,
    WS:   REMOTE ? 443 : 8000
  },

  paths: {
    repos:    path.join(__dirname, './src/tmp/repos/'),
    logs:     path.join(__dirname, './src/logs/'),
    SSL: {
      key:    path.join(__dirname, '../devSSL/cert/server.key'),
      cert:   path.join(__dirname, '../devSSL/cert/server.crt')
    } 
  },

  endpoints: {
    cloc: 'cloc'
  },

  responseTypes: {
    update:  'update',
    error:   'error',
    success: 'success'
  },

  errorTypes: {
    needOwnerAndName:   'needOwnerAndName',
    needCredentials:    'needCredentials',
    credentialsInvalid: 'credentialsInvalid',
    repoNotFound:       'repoNotFound',
    branchNotFound:     'branchNotFound',
    clocError:          'clocError',
    mkpathError:        'mkpathError'
  },

  cloc: {
    dataFile: 'data.cloc',
    ignoredFile: 'ignored.txt'
  },

  repoToFolder: function(repoName, folderId) {
    return repoName.replace('/', '#') + '#' + folderId;
  },

  folderToRepo: function(folderName) {
    return folderName.replace('#', '/').replace(/#.*?$/, '');
  },

  deleteAfterClone: true,

  gaTrackingId: 'UA-78051006-1'

};
