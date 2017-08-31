
/* 
  This duplicates pm2's graceful reload concept, which doesn't
  work for this app because the SIGINT signal terminates the child
  processes that the server depends on, e.g. git clone, cloc.
*/

///////////////////// IMPORTS ////////////////////

const PM2 = require('./PM2'),
      Promise = require('bluebird');

//////////////////// FUNCTIONS ///////////////////

function gracefulExit(pmId) {
  return new Promise((resolve, reject) => {
    PM2.sendMessageToProcess(pmId, 'prep-for-shutdown')
      .then(msg => {
        if (msg.data && msg.data.success)
          resolve(pmId);
        else
          reject('malformed data from process: ' + JSON.stringify(msg.data));
      })
      .catch(reject);
  });
}

function gracefulRestart(pmId) {
  console.log('Restarting:', pmId);
  return gracefulExit(pmId).then(PM2.restart);
}

////////////////////// MAIN //////////////////////

PM2.connect(true)
  .then(PM2.list)
  .then(list => {
    
    // gracefully restart the processes in sequence
    let pmIds = list.map(el => el.pm_id);
    return Promise
      .mapSeries(pmIds, pmId => gracefulRestart(pmId))
      .then(() => PM2.disconnect());

  })
  .catch(console.error);

