
module.exports = function serveJson(response, json, statusCode) {
  response.writeHead(statusCode || 200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });

  response.end(JSON.stringify(json));
};