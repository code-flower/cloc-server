// the exports object defined below is available both on the server (by requiring this file)
// and in the client (by being injected into the angular app in app.js)

module.exports = {
  hostName: 'localhost',
  ports: {
    HTTP: 8000,
    WS: 8001,
    browserSyncUI: 8090
  }
};
