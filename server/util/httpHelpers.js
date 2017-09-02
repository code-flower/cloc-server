
////////////////////// IMPORTS //////////////////////////

const http = require('http'),
      https = require('https'),
      Promise = require('bluebird');

///////////////////// FUNCTIONS /////////////////////////

function get(url, parseResponse=false) {
  return new Promise((resolve, reject) => {
    let module = url.indexOf('https://') !== -1 ? https : http;

    module.get(url, res => {
      if (res.statusCode !== 200) {
        reject(new Error(res.statusCode));
        return false;
      }

      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        let output = parseResponse ? JSON.parse(rawData) : rawData;
        resolve(output);
      });
    });
  });
}

function receivePOST(request, parseRequest=false, onError=null) {
  return new Promise((resolve, reject) => {

    onError || (onError = new Error('Request not parseable.'));

    let urlInfo;
    try {
      urlInfo = url.parse(request.url, true);
    } catch(e) {
      reject(onError);
    }

    let reqInfo = {
      endpoint: urlInfo.pathname.substring(1)
    };

    let body = '';
    request.on('data', data => body += data);
    request.on('end', () => {
      try {
        reqInfo.params = parseRequest ? JSON.parse(body) : body;
        resolve(reqInfo);
      } catch(e) {
        reject(onError);
      }
    });
  });
}

////////////////////// EXPORTS //////////////////////////

module.exports = {
  get
};