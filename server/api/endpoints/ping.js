
const Log = require('@log'),
      Promise = require('bluebird');

module.exports = function servePing({ resp }) {
  Log(1, 'Serving ping response.');
  resp.success('server is running');
  return Promise.resolve();
};