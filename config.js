
var path = require('path');

var REMOTE = false;

module.exports = {

  logLevel: 2,

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
    repos:  path.join(__dirname, './server/tmp/repos/'),
    logs:   path.join(__dirname, './server/logs/'),
    SSL: {
      key:  path.join(__dirname, '../devSSL/cert/server.key'),
      cert: path.join(__dirname, '../devSSL/cert/server.crt')
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

  errors: {
    NeedOwnerAndName: {
      name: 'NeedOwnerAndName',
      message: 'The owner and name of a repo are required parameters.',
      statusCode: 400
    },
    NeedCredentials: {
      name: 'NeedCredentials',
      message: 'A github username and password are required to access this repo.',
      statusCode: 401
    },
    CredentialsInvalid: {
      name: 'CredentialsInvalid',
      message: 'The given github username/password combination is invalid.',
      statusCode: 401
    },
    RepoNotFound: {
      name: 'RepoNotFound',
      message: 'The given repo could not be found.',
      statusCode: 404
    },
    BranchNotFound: {
      name: 'BranchNotFound',
      message: 'The given branch could not be found',
      statusCode: 404
    }
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
