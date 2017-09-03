
///////////////////// IMPORTS ////////////////////

const PM2 = require('./PM2'),
      Promise = require('bluebird'),
      ProgressBar = require('ascii-progress');

//////////////////// CONSTANTS ///////////////////

const POLL_INTERVAL = 1000;

//////////////////// FUNCTIONS ///////////////////

function getActiveConnArr() {
  return PM2.list().then(list => {
    let activeConns = list.map(el => {
      let axm = el.pm2_env.axm_monitor;
      return axm && axm.activeConns ? axm.activeConns.value : 0;
    });
    return Promise.resolve(activeConns);
  });
}

const ProgressBars = (() => {
  const colors = ['brightRed', 'brightCyan', 'brightWhite', 'brightGreen'];

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

    if (list.length === 0) {
      console.log("There are no active processes to monitor.");
      PM2.disconnect();
      return false;
    }

    console.log("Active Connections");
    ProgressBars.init({ 
      numBars:  list.length, 
      maxValue: 10,
      schema:   idx => `Process ${list[idx].pm_id}: [ :curValue ] :bar.color`
    });
    
    setInterval(() => {
      getActiveConnArr().then(ProgressBars.update);
    }, POLL_INTERVAL);

  })
  .catch(console.error);

