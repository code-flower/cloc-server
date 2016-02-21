// the exports object defined below is available both on the server (by requiring this file)
// and in the client (by being injected into the angular app in app.js)

// the first and last line come from here:
// http://stackoverflow.com/questions/3225251/how-can-i-share-code-between-node-js-and-the-browser

(function(exports) {

  exports.test = 120;

})(typeof exports === 'undefined' ? this.appConfig = {} : exports);


