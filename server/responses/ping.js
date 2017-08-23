
module.exports = function servePing(ctrl) {
  ctrl.conn.success('server is healthy');
  ctrl.conn.close;
};