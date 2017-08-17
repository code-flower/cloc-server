/* 
  Exports a function that generates a unique string each time it is called. The string incorporates the process id,
  so it's unique across processes on machines running node in multiple cores.

  Import like this, seeding the generator with the process id:

  const uid = require('./[path]/uidGenerator')(process.pid);

  Afterwards, just call the uid function with no args each time you need a unique id.
*/

/////////////// IMPORTS ////////////////

const Probe = require('pmx').probe();

/////////////// METRICS ////////////////

const uidCounter = Probe.metric({
  name: 'uidCounter'
});
uidCounter.set('');

const lastRequestTime = Probe.metric({
  name: 'lastRequestTime'
});
lastRequestTime.set('');

/////////////// PRIVATE ////////////////

function getCurrentTime() {
  let date = new Date(),
      d = date.toDateString(),
      t = date.toLocaleTimeString();
  return `${d} ${t}`;
}

function uidGenerator(processId) {
  let curId = 0;

  let uid = function() {
    curId = (curId + 1) % (1 << 16);

    uidCounter.set(curId);
    lastRequestTime.set(getCurrentTime());

    return processId + '_' + curId;
  };

  return uid;
}

//////////////// PUBLIC ////////////////

module.exports = uidGenerator;

