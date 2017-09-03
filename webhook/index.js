
//////////////////// IMPORTS ////////////////////////

require('module-alias/register');

const config = require('@config'),
      creds = require(config.paths.creds.git),
      httpHelpers = require('./httpHelpers'),
      fs = require('fs'),
      https = require('https'),
      { exec } = require('child_process'),
      url = require('url'),
      Promise = require('bluebird'),
      crypto = require('crypto');

//////////////////// CONFIG /////////////////////////

const REPO_OWNER    = 'code-flower',
      REPO_NAME     = 'cloc-server',
      HOSTNAME      = '',
      PORT          = 9000,
      SSL_KEY_PATH  = config.paths.SSL.key,
      SSL_CERT_PATH = config.paths.SSL.cert,
      GIT_USERNAME  = creds.username,
      GIT_PASSWORD  = creds.password,
      HOOK_COMMAND  = 'echo "running pull and reload"';
      HOOK_SECRET   = 'monkey christmas apple bunny';

//////////////////// PRIVATE //////////////////////// 

function getExternalIP() {
  return httpHelpers.get('http://ipinfo.io/ip')
    .then(ip => Promise.resolve(ip.replace('\n', '')));
}

function hooksUrl() {
  return `https://${GIT_USERNAME}:${GIT_PASSWORD}@api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/hooks`;
}

function getWebhookData() {
  return new Promise((resolve, reject) => {
    let curl = `curl ${hooksUrl()}`;
    let proc = exec(curl, (err, stdout, stderr) => {
      if (err)
        reject(stderr);
      else
        resolve(JSON.parse(stdout));
    });
  });
}

function webhookExists(externalIP, webhookData) {
  let IPs = webhookData.map(wh => wh.config.url.match(/:\/\/(.*?):/)[1]);

  console.log('External IP:', externalIP);
  console.log('Existing webhook IPs:', IPs);

  return IPs.indexOf(externalIP) !== -1;
}

function createWebhook(externalIP) {
  return new Promise((resolve, reject) => {
    let payload = JSON.stringify({
      name:   'web',
      active: true,
      config: {
        url:          `https://${externalIP}:${PORT}/webhook`,
        content_type: 'json',
        insecure_ssl: '1',
        secret:       HOOK_SECRET
      }
    });
    let curl = `curl -H "Content-Type: application/json" -X POST -d '${payload}' ${hooksUrl()}`;
    let proc = exec(curl, (err, stdout, stderr) => {
      if (err)
        reject(stderr);
      else
        resolve(stdout);
    });
  }); 
}

function validSignature(xHubSig, body) {
  let hmac = crypto.createHmac('sha1', HOOK_SECRET);
  hmac.update(body);
  return xHubSig === 'sha1=' + hmac.digest('hex');
}

function webhookServer(request, response) {
  let urlInfo = url.parse(request.url, true);  
  switch(urlInfo.pathname) {
    case '/webhook':
      httpHelpers.getReqBody(request)
        .then(body => {
          let xHubSig = request.headers['x-hub-signature'],
              valid = validSignature(xHubSig, body),
              event = request.headers['x-github-event'];

          if (valid)
            switch(event) {
              case 'ping':
                console.log('Webhook successfully created.');
                break;
              default:
                exec(HOOK_COMMAND, (err, stdout, stderr) => {
                  console.log(stdout);
                });
              break;
            }

          response.writeHead(valid ? 200 : 403);
          response.end();
        });
      break;

    case '/ping':
      response.writeHead(404);
      response.end('server is listening');
      break;

    default:
      response.writeHead(404);
      response.end();
      break;
  }
}

function startWebhookServer() {
  https
    .createServer({
      key:  fs.readFileSync(SSL_KEY_PATH,  'utf8'),
      cert: fs.readFileSync(SSL_CERT_PATH, 'utf8')
    }, webhookServer)
    .listen(PORT, () => {
      console.log(`Webhook server running on port ${PORT}.`);
      console.log('Checking whether webhook is active.');
      Promise.all([
        getExternalIP(),
        getWebhookData()
      ])
      .spread((externalIP, webhookData) => {
        if (webhookExists(externalIP, webhookData)) {
          console.log('Webhook is active.');
          return Promise.resolve();
        } else {
          console.log('Creating webhook...');
          return createWebhook(externalIP);
        }
      })
      .catch(console.log);
    });
}

//////////////////// EXPORTS ////////////////////////

startWebhookServer();

