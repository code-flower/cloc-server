
var path = require('path');

var SECURE = false;

module.exports = {

  protocols: {
    HTTP: SECURE ? 'https' : 'http',
    WS:   SECURE ? 'wss'   : 'ws'
  },

  ports: {
    HTTP: SECURE ? 443 : 8000,
    WS:   SECURE ? 443 : 8000
  },

  paths: {
    static:   path.join(__dirname, './static'),
    repos:    path.join(__dirname, './src/system/repos/'),
    samples:  path.join(__dirname, './src/system/samples/'),
    logs:     path.join(__dirname, './src/system/logs/')
  },

  certDir: '/etc/letsencrypt/live/codeflower.la/',

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

  repoToFolder: function(repoName) {
    return repoName.replace('/', '#');
  },

  folderToRepo: function(folderName) {
    return folderName.replace('#', '/');
  },

  deleteAfterClone: true,

  gaTrackingId: 'UA-78051006-1'

};
