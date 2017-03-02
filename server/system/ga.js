// https://www.npmjs.com/package/universal-analytics

//////////// IMPORTS ////////////

var ua = require('universal-analytics');
var appConfig = require('../../shared/appConfig.js');

//////////// GLOBALS ////////////

var visitor = ua(appConfig.gaTrackingId);

//////////// PUBLIC /////////////

module.exports = {
  trackPage: function(url) { visitor.pageview(url).send(); },
  trackClone: function(repoName) { visitor.event("Clone", repoName).send(); }
};