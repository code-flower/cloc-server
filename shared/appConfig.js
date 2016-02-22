// the exports object defined below is available both on the server (by requiring this file)
// and in the client (by being injected into the angular app in app.js)

module.exports = {

  hostName: 'localhost',

  ports: {
    HTTP: 8000,
    WS: 8001,
    browserSyncUI: 8090
  },

  endpoints: {
    harvest: '/harvest',
    samples: '/samples'
  },

  paths: {
    client:  `${__dirname}/../client/`,
    server:  `${__dirname}/../server/`,
    repos:   `${__dirname}/../server/repos/`,
    samples: `${__dirname}/../server/samples/`
  },

  database: {
    dbName: 'repos',
    tableName: 'repoTable'
  }

};
