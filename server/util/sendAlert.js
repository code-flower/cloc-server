
//////////// IMPORTS ////////////

const creds = require('@creds/sendgrid');

const emailAlerts = require('email-alerts')({
  fromEmail: creds.email,
  toEmail:   creds.email,
  apiKey:    creds.apiKey
});

//////////// PRIVATE ////////////

function sendAlert(subject, message) {
  emailAlerts.alert(subject, message, function(error) {
    if (error)
      console.log("ALERT ERROR:", error);
    else
      console.log("SENT ALERT:", {
        subject: subject,
        message: message
      });
  });
}

//////////// PUBLIC //////////////

module.exports = sendAlert;

