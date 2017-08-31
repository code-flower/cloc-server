
/* 
  This duplicates pm2's graceful reload concept, which doesn't
  work for this app because the SIGINT signal terminates the child
  processes that the server depends on, e.g. git clone, cloc.
*/

///////////////////// IMPORTS ////////////////////

const PM2 = require('./PM2'),
      Promise = require('bluebird');

//////////////////// CONSTANTS ///////////////////

const POLL_INTERVAL = 1000;

//////////////////// FUNCTIONS ///////////////////

function getActiveConns(pmId) {
  return new Promise((resolve, reject) => {
    PM2.sendMessageToProcess(pmId, 'report-active-conns')
      .then(msg => {
        if (msg.data && msg.data.success)
          resolve(msg.data.numConns);
        else
          reject('malformed data from process: ' + JSON.stringify(msg.data));
      })
      .catch(err => resolve(0));
  });
}

function getActiveConnArr(pmIds) {
  return Promise.map(pmIds, pmId => getActiveConns(pmId));
}

////////////////////// MAIN //////////////////////

PM2.connect(true)
  .then(PM2.list)
  .then(list => {
    let pmIds = list.map(el => el.pm_id);
    
    setInterval(() => {

      getActiveConnArr(pmIds).then(console.log);

    }, POLL_INTERVAL);

  })
  .catch(console.error);

