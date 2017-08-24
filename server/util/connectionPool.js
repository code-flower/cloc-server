/* 
  Exports a function that generates a unique string each time it is called. The string incorporates the process id,
  so it's unique across processes on machines running node in multiple cores.

  Import like this, seeding the generator with the process id:

  const uid = require('./[path]/uidGenerator')(process.pid);

  Afterwards, just call the uid function with no args each time you need a unique id.
*/

/////////////// IMPORTS ////////////////

const Probe = require('pmx').probe(),
      getCurrentTime = require('./getCurrentTime');

/////////////// METRICS ////////////////

const activeConns = Probe.metric({ name: 'activeConns' });

const totalConns = Probe.metric({ name: 'totalConns' });

const lastRequestTime = Probe.metric({ name: 'lastRequestTime' });
lastRequestTime.set('');

/////////////// PRIVATE ////////////////

function connectionPool(processId) {

  let conns = [],
      curId = 0;

  return {
    addConn: () => {
      // add new id to conns array
      curId = (curId + 1) % (1 << 16);
      let connId = processId + '_' + curId;
      conns.push(connId);

      // update metrics
      activeConns.set(conns.length);
      totalConns.set(curId);
      lastRequestTime.set(getCurrentTime());

      return connId;
    },

    removeConn: (id) => {
      let idx = conns.indexOf(id);
      if (idx !== -1) {
        conns.splice(idx, 1);
        activeConns.set(conns.length);
      }
    }
  };
}

//////////////// PUBLIC ////////////////

module.exports = connectionPool;

