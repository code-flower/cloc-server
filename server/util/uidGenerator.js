/* 
  Exports a function that generates a unique string each time it is called. The string incorporates the process id,
  so it's unique across processes on machines running node in multiple cores.

  Import like this, seeding the generator with the process id:

  const uid = require('./[path]/uidGenerator')(process.pid);

  Afterwards, just call the uid function with no args each time you need a unique id.
*/

/////////////// IMPORTS ////////////////

const Probe = require('pmx').probe();

/////////////// PRIVATE ////////////////

function uidGenerator(processId) {

  let curId = 0;

  Probe.metric({
    name: 'uidCounter',
    value: () => curId
  });

  let uid = function() {
    curId = (curId + 1) % (1 << 16);
    return processId + '_' + curId;
  };

  return uid;
}

//////////////// PUBLIC ////////////////

module.exports = uidGenerator;