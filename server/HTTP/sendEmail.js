//////////// IMPORTS ////////////

var user = require('../../private/gmail-credentials');
var send = require('gmail-send');

//////////// EXPORTS ////////////

module.exports = function sendEmail(response, message) {
  send({

    user:    user.email,
    pass:    user.password,
    to:      user.email,
    subject: 'message from codeflower.la',
    text:    message

  })({}, function(err, res) {

    if (err) {
      console.log("EMAIL ERROR:", err);
      response.writeHead(500, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      response.end(JSON.stringify(err));
    } else {
      response.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      response.end(JSON.stringify(message));
    }

  });
};

