
//////////////////// IMPORTS ////////////////////////

const config = require('@config'),
      fs = require('fs'),
      https = require('https'),
      { exec } = require('child_process'),
      url = require('url'),
      httpHelpers = require('./httpHelpers'),
      Promise = require('bluebird'),
      creds = require(config.paths.creds.git),
      pkgJson = require('../../package.json');

//////////////////// PRIVATE //////////////////////// 

function getExternalIP() {
  return httpHelpers.get('http://ipinfo.io/ip')
    .then(ip => Promise.resolve(ip.replace('\n', '')));
}

function hooksUrl() {
  let fullName = pkgJson.repository.url.replace(/^.*?\.com\//, '');
  return `https://${creds.username}:${creds.password}@api.github.com/repos/${fullName}/hooks`;
}

function getWebhookData() {
  return new Promise((resolve, reject) => {
    let curl = `curl ${hooksUrl()}`;

    let proc = exec(curl, (err, stdout, stderr) => {
      if (err)
        reject(stderr);
      else
        resolve(stdout);
    });
  });
}

function webhookExists(externalIP, webhookData) {
  return false;
}

function createWebhook(externalIP, port) {
  return new Promise((resolve, reject) => {
    let json = JSON.stringify({
      "name": "web",
      "active": true,
      "config": {
        "url": `https://${externalIP}:${port}/webhook`,
        "content_type": "json",
        "insecure_ssl": "1"
      }
    });
    let curl = `curl -H "Content-Type: application/json" -X POST -d '${json}' ${hooksUrl()}`;

    let proc = exec(curl, (err, stdout, stderr) => {
      console.log(stdout);
      if (err)
        reject(stderr);
      else
        resolve(stdout);
    });
  }); 
}

function webhookServer(request, response) {
  // if (request.method === 'POST')
  //   httpHelpers.receivePOST(request)
  //     .then(reqInfo => {
  //       console.log("reqInfo:", reqInfo);
  //     });

  let urlInfo = url.parse(request.url, true);
  console.log("received request:", urlInfo.pathname);
  
  switch(urlInfo.pathname) {
    case '/webhook':
      console.log("running pull and restart");
      break;
    case '/ping':
      response.end('server is listening');
      break;
  }
}

function startWebhookServer(port, cb) {
  https
    .createServer({
      key:  fs.readFileSync(config.paths.SSL.key,  'utf8'),
      cert: fs.readFileSync(config.paths.SSL.cert, 'utf8')
    }, webhookServer)
    .listen(port, () => {
      Promise.all([
        getExternalIP(),
        getWebhookData()
      ])
      .spread((externalIP, webhookData) => {
        console.log("externalIP:", externalIP);
        console.log("webhookData:", webhookData);

        if (webhookExists(externalIP, webhookData))
          return Promise.resolve();
        else
          return createWebhook(externalIP, port);
      })
      .then(() => cb())
      .catch(console.log);
    });
}

//////////////////// EXPORTS ////////////////////////

module.exports = {
  listen: startWebhookServer
};


