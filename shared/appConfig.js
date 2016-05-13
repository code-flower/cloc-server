// this object is available both on the server (by requiring this file)
// and on the client (by being injected into the angular app in app.js)

module.exports = {

  protocol: {
    HTTP: process.env.NODE_ENV === 'production' ? 'https' : 'http',
    WS:   process.env.NODE_ENV === 'production' ? 'wss'   : 'ws'
  },

  hostName: process.env.NODE_ENV === 'production' ? 
            'codeflower.la' : 
            'localhost',

  ports: {
    HTTP: process.env.NODE_ENV === 'production' ? 443 : 8000,
    WS:   process.env.NODE_ENV === 'production' ? 443 : 8000,
    browserSyncUI: 8090
  },

  paths: {
    client:   `${__dirname}/../client/`,
    server:   `${__dirname}/../server/`,
    repos:    `${__dirname}/../server/system/repos/`,
    samples:  `${__dirname}/../server/system/samples/`,
    partials: 'app/partials/'
  },

  //// HTTP ////
  endpoints: {
    harvest: '/harvest',
    samples: '/samples',
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
