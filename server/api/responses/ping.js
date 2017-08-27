
const Promise = require('bluebird');

module.exports = function servePing({ resp }) {
  resp.success('server is running');
  return Promise.resolve();
};