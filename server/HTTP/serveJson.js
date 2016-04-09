
module.exports = function serveJson(response, json) {
  response.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });

  response.end(JSON.stringify(json));
};