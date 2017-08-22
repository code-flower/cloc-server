
//////////// IMPORTS ////////////

const config = require('@config'),
      Log = require('@log'),
      sendAlert = require('../../util/sendAlert');

//////////// PRIVATE ////////////

function handleErrors(error, ctrl) {
  return new Promise((resolve, reject) => {

    Log(2, '8. Handling Errors');

    // is the error listed in the config?
    let isRecognizedError = (
      Object.values(config.errors)
        .map(e => e.name)
        .indexOf(error.name) !== -1
    );

    if (isRecognizedError) {

      Log(1, 'ERROR:', ctrl.repo.fNameBr, error.name);
      error.params = ctrl.params;
      ctrl.conn.error(error);

    } else {

      Log('error', error);

      ctrl.conn.error({
        name: 'GenericServerError',
        statusCode: 500,
        stack: error.stack,
        params: ctrl.params
      });

      if (config.emailUnhandledErrors) {
        let errorEmail = (
          '<!DOCTYPE html><html><body>' + 
            '<h3>Stack Trace</h3>' + 
            '<p>' + error.stack.replace(/\n/g, '<br/>') + '</p>' + 
            '<h3>Request Params</h3>' + 
            '<p>' + JSON.stringify(ctrl.params) + '</p>' +
          '</body></html>'
        );
        sendAlert('codeflower: cloc-server error', errorEmail);
      }

    }

    resolve(ctrl);
  });
}

//////////// EXPORTS ////////////

module.exports = handleErrors;

