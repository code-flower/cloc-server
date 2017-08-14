
const uid = require('./uidGenerator')(process.pid);

setTimeout(function() {
  for (var i = 0; i < 5; i++)
    console.log(uid());
}, 5000);

