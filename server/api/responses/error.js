
////////////////// IMPORTS //////////////////

const Log = require('@log');

////////////////// PRIVATE //////////////////

function serveError(ctrl) {
  Log(1, 'ERROR: ' + ctrl.err.name);
  ctrl.resp.error(ctrl.err);
  ctrl.resp.close();
}

////////////////// EXPORTS //////////////////

module.exports = serveError;