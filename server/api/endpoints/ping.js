
const Log = require('@log'),
      Promise = require('bluebird');

module.exports = function servePing({ resp }) {
  Log(1, 'Serving ping response.');

  let data = { message: 'server is running' };
  let externalIp = process.env.external_ip_address;
  if (externalIp)
    data.externalIp = externalIp;

  resp.success(data);
  return Promise.resolve();
};