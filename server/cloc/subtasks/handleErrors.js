
//////////// IMPORTS ////////////

const config = require('@config'),
      Log = require('@log'),
      sendAlert = require('../../util/sendAlert');

//////////// PRIVATE ////////////

function handleErrors(error, ctrl) {
  return new Promise((resolve, reject) => {

    Log(2, '8. Handling Errors');
    Log(1, 'ERROR:', ctrl.folderName, error);

    // is the error listed in the config?
    let isRecognizedError = (
      Object.values(config.errors)
        .map(e => e.name)
        .indexOf(error.name) !== -1
    );

    if (isRecognizedError) {
      error.params = ctrl.params;
      ctrl.conn.error(error);
    } else {
      let errorMessage = {
        stack: error.stack,
        ctrl
      };

      sendAlert('codeflower: cloc-server error', errorMessage);

      ctrl.conn.error({
        name: 'GenericServerError',
        statusCode: 500,
        stack: error.stack,
        params: ctrl.params
      });
    }

    resolve(ctrl);
  });
}

//////////// EXPORTS ////////////

module.exports = handleErrors;