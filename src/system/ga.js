// https://www.npmjs.com/package/universal-analytics

//////////// IMPORTS ////////////

var ua = require('universal-analytics');
var config = require('../../config');

//////////// GLOBALS ////////////

var visitor = ua(config.gaTrackingId);

//////////// PUBLIC /////////////

module.exports = {
  trackPage: function(url) { visitor.pageview(url).send(); },
  trackClone: function(repoName) { visitor.event("Clone", repoName).send(); }
};