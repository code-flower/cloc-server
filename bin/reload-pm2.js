////////////////////// IMPORTS /////////////////////////

const pm2 = require('pm2');

////////////////////// PRIVATE /////////////////////////

function sendMessageToProcess(pmId) {
  console.log("Sending message to process.");
  pm2.sendDataToProcessId(pmId, {
    data: {},
    topic: 'graceful-reload'
  }, function(err, res) {
    if (err)
      console.log("Error sending message to process:", err);
  });
}

function gracefulReload(pmId, onResponse) {
  pm2.launchBus((err, bus)=> {
    if (err)
      console.log("Error launching bus:", err);
    if (bus)
      sendMessageToProcess(pmId);
    bus.on('reloaded', onResponse);
  });
}

//////////////////////// MAIN ///////////////////////////

pm2.connect((err) => {
  if (err) {
    console.log("Connection error:", err);
    return false;
  }
  
  pm2.list((err, listOfProcesses) => {
    if (err) {
      console.log("Error listing processes:", err);
      return false;
    }

    let list = listOfProcesses.map(proc => {
      return {
        pid: proc.pid,
        name: proc.name,
        pmId: proc.pm_id
      }
    });

    console.log("Processes:\n", list);

    gracefulReload(list[0].pmId, (res) => {
      if (res.data.success)
        console.log("Successfully reloaded:", res.process.pm_id);
      else 
        console.log("Unsuccessful reload:", res.process.pm_id);

      pm2.restart(list[0].pmId, (err) => {
        if (err)
          console.log("error restarting process:", err);
        else
          console.log("process restarted!");

        pm2.disconnect();
      });

      
    });
  });

});
