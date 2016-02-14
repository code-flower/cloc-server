var exec = require('child_process').exec;
var Q = require('q');

// execute a shell command and stream the output over SSE.
// returns a promise that resolves when the command is done executing
module.exports = function execShellCommand(cmd, SSE) {
  var deferred = Q.defer();

  // run the command
  var process = exec(cmd, function() { deferred.resolve(); }); 

  // listen for command output
  process.stdout.on('data', function(data) { SSE.write(data); });
  process.stderr.on('data', function(data) { SSE.write(data); });

  return deferred.promise;
}
