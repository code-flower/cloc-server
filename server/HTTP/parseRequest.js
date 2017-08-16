
//////////// IMPORTS ////////////

const url = require('url'),
      Promise = require('bluebird');

//////////// PRIVATE ////////////

function parseRequest(request) {
  return new Promise((resolve, reject) => {

    let urlInfo = url.parse(request.url, true);

    let reqInfo = {
      method: request.method,
      endpoint: urlInfo.pathname.substring(1)
    };

    switch(request.method) {
      case 'GET': 
        reqInfo.params = urlInfo.query;
        resolve(reqInfo);
        break;
      case 'POST': 
        let body = '';
        request.on('data', data => body += data);
        request.on('end', () => {
          reqInfo.params = JSON.parse(body);
          resolve(reqInfo);
        });
        break;
      default: 
        reject(null);
        break;
    }
  });
}

//////////// PUBLIC /////////////

module.exports = parseRequest;