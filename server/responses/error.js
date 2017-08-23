
////////////////// IMPORTS //////////////////

const Log = require('@log');

////////////////// PRIVATE //////////////////

function serveError(ctrl) {
  Log(1, 'ERROR: ' + ctrl.err.name);
  ctrl.conn.error(ctrl.err);
  ctrl.conn.close();
}

////////////////// EXPORTS //////////////////

module.exports = serveError;