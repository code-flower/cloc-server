// this object is available both on the server (by requiring this file)
// and on the client (by being injected into the angular app in app.js)

var path = require('path');
var PROD = process.env.NODE_ENV === 'production';

module.exports = {

  protocol: {
    HTTP: PROD ? 'https' : 'http',
    WS:   PROD ? 'wss'   : 'ws'
  },

  hostName: PROD ? 'codeflower.la' : 'localhost',

  ports: {
    HTTP: PROD ? 443 : 8000,
    WS:   PROD ? 443 : 8000,
    browserSyncUI: 8090
  },

  paths: {
    client:   path.join(__dirname, '../client/'),
    server:   path.join(__dirname, '../server/'),
    repos:    path.join(__dirname, '../server/system/repos/'),
    samples:  path.join(__dirname, '../server/system/samples/'),
    partials: 'app/partials/'
  },

  //// HTTP ////
  endpoints: {
    harvest: '/harvest',
    email:   '/email',
    samples: '/data/samples.json'
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

  //// CLIENT-SIDE DB ////
  database: {
    dbName: 'repos',
    tableName: 'repoTable'
  },

  repoToFolder: function(repoName) {
    return repoName.replace('/', '#');
  },

  folderToRepo: function(folderName) {
    return folderName.replace('#', '/');
  },

  deleteAfterClone: true,

  maxNodes: 1000

};
