//////// IMPORTS ////////

var exec = require('child_process').exec;
var Q = require('q');

///////// PUBLIC ///////

// execute a shell command and stream the output over the given socket.
// returns a promise that resolves when the command is done executing
module.exports = function execShellCommand(cmd, socket) {
  var deferred = Q.defer();

  // run the command
  var process = exec(cmd, function() { deferred.resolve(); }); 

  // listen for command output
  process.stdout.on('data', function(data) { socket.text(data); });
  process.stderr.on('data', function(data) { socket.text(data); });

  return deferred.promise;
};
