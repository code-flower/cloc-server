
/* 
  This duplicates pm2's graceful reload concept, which doesn't
  work for this app because the SIGINT signal terminates the child
  processes that the server depends on, e.g. git clone, cloc.
*/

///////////////////// IMPORTS ////////////////////

const PM2 = require('./PM2'),
      Promise = require('bluebird'),
      ProgressBar = require('ascii-progress');

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
      .catch(err => resolve(-1));
  });
}

function getActiveConnArr(pmIds) {
  return Promise.map(pmIds, pmId => getActiveConns(pmId));
}

const ProgressBars = (() => {
  const colors = ['red', 'cyan', 'blue', 'grey'];

  let bars = [];
  let max;

  return {
    init: ({ numBars, maxValue, schema }) => {
      for (var i = 0; i < numBars; i++)
        bars.push(new ProgressBar({
          schema: schema(i).replace('bar.color', 'bar.' + colors[i % colors.length]),
          blank: ' '
        }));
      max = maxValue;
    },

    update: (curValues) => {
      curValues.forEach((curValue, idx) => {
        bars[idx].update(curValue / max, {
          curValue: curValue
        });     
      });
    }
  };
})();

////////////////////// MAIN //////////////////////

PM2.connect(true)
  .then(PM2.list)
  .then(list => {
    let pmIds = list.map(el => el.pm_id);

    if (pmIds.length === 0) {
      console.log("There are no active processes to monitor.");
      PM2.disconnect();
      return false;
    }

    console.log("Active Connections");
    ProgressBars.init({ 
      numBars:  pmIds.length, 
      maxValue: 10,
      schema:   idx => `Process ${pmIds[idx]}: [ :curValue ] :bar.color`
    });
    
    setInterval(() => {
      getActiveConnArr(pmIds).then(ProgressBars.update);
    }, POLL_INTERVAL);

  })
  .catch(console.error);

