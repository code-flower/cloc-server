
/* 
  This duplicates pm2's graceful reload concept, which doesn't
  work for this app because the SIGINT signal terminates the child
  processes that the server depends on, e.g. git clone, cloc.
*/

////////////////////// IMPORTS /////////////////////////

const pm2 = require('pm2'),
      Promise = require('bluebird');

////////////////////// PRIVATE /////////////////////////

function sendMessageToProcess(pmId) {
  return new Promise((resolve, reject) => {
    pm2.sendDataToProcessId(pmId, {
      data: {},
      topic: 'close-connections'
    }, (err, res) => {
      if (err)
        reject(err);
      else 
        resolve(res);
    });
  });
}

function closeConnections(pmId, onResponse) {
  return new Promise((resolve, reject) => {
    pm2.launchBus((err, bus) => {
      if (err)
        reject(err);
      else
        sendMessageToProcess(pmId);

      bus.on('connections-closed', () => resolve(pmId));
    });
  });
}

function restartProcess(pmId) {
  return new Promise((resolve, reject) => {
    pm2.restart(pmId, err => {
      if (err) 
        reject(err);
      else
        resolve(pmId);
    });
  });
}

function gracefulRestart(pmId) {
  console.log("Reloading process:", pmId);
  return closeConnections(pmId).then(restartProcess);
}

//////////////////////// MAIN ///////////////////////////

pm2.connect((err) => {
  if (err) {
    console.log("Connection error:", err);
    return false;
  }
  
  pm2.list((err, list) => {
    if (err) {
      console.log("Error listing processes:", err);
      return false;
    }

    // gracefully restart the processes in sequence
    let pmIds = list.map(el => el.pm_id);
    Promise.mapSeries(pmIds, pmId => gracefulRestart(pmId)).then(() => {
      pm2.disconnect();
      process.exit(0);
    });
  });
});
