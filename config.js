
var path = require('path');

var REMOTE = false;

module.exports = {

  protocols: {
    HTTP: 'https',
    WS:   'wss'
  },

  ports: {
    HTTP: REMOTE ? 443 : 8000,
    WS:   REMOTE ? 443 : 8000
  },

  paths: {
    static:   path.join(__dirname, './src/static'),
    repos:    path.join(__dirname, './src/system/repos/'),
    samples:  path.join(__dirname, './src/system/samples/'),
    logs:     path.join(__dirname, './src/system/logs/'),
    SSL: {
      key:    path.join(__dirname, '../devSSL/cert/server.key'),
      cert:   path.join(__dirname, '../devSSL/cert/server.crt')
    } 
  },

  //// HTTP ////
  endpoints: {
    harvest: '/harvest',
    email:   '/email'
  },

  //// WS ////
  messageTypes: {
    // from client to server
    clone: 'clone',
    abort: 'abort',
    // from server to client
    text: 'text',
    error: 'error',
    credentials: 'credentials',
    unauthorized: 'unauthorized',
    complete: 'complete'
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
