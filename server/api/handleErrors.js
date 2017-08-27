
//////////// IMPORTS ////////////

const config = require('@config'),
      Log = require('@log'),
      sendAlert = require('@util/sendAlert');

//////////// PRIVATE ////////////

function handleErrors(error, responder) {
  Log(2, 'Handling Errors');

  // is the error listed in the config?
  let isClientError = (
    Object.values(config.errors)
      .map(e => e.name)
      .indexOf(error.name) !== -1
  );

  if (isClientError) {

    let fNameBr = error.repo && error.repo.fNameBr;
    Log(1, 'ERROR:', (fNameBr || ''), error.name);
    responder.error(error);

  } else {

    Log('error', error);

    responder.error({
      name: 'ServerError',
      statusCode: 500,
      stack:  error.stack,
      params: error.params,
      repo:   error.repo
    });

    if (config.emailUnhandledErrors) {
      let errorEmail = (
        '<!DOCTYPE html><html><body>' + 
          '<h3>Stack Trace</h3>' + 
          '<p>' + (error.stack || '').replace(/\n/g, '<br/>') + '</p>' + 
          '<h3>Request Params</h3>' + 
          '<p>' + JSON.stringify(error.params || '') + '</p>' +
        '</body></html>'
      );
      sendAlert('codeflower: cloc-server error', errorEmail);
    }
  }
}

//////////// EXPORTS ////////////

module.exports = handleErrors;

