// the exports object defined below is available both on the server (by requiring this file)
// and in the client (by being injected into the angular app in app.js)

module.exports = {

  hostName: process.env.NODE_ENV === 'production' ? 
            '162.243.241.140' : 
            'localhost',

  ports: {
    HTTP: 8000,
    WS: 8001,
    browserSyncUI: 8090
  },

  endpoints: {
    harvest: '/harvest',
    samples: '/samples'
  },

  messageTypes: {
    error: 'error',
    credentials: 'credentials',
    unauthorized: 'unauthorized',
    complete: 'complete'
  },

  paths: {
    client:   `${__dirname}/../client/`,
    server:   `${__dirname}/../server/`,
    repos:    `${__dirname}/../server/repos/`,
    samples:  `${__dirname}/../server/samples/`,
    partials: 'js/app/partials/'
  },

  database: {
    dbName: 'repos',
    tableName: 'repoTable'
  }

};
