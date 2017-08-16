// for pounding the server

//////////////////// IMPORTS //////////////////////

const { httpReq, wsReq } = require('./clocRequests');
const config = require('../config');
const gitCreds = require('../private/git-creds');

////////////////// TEST REPOS /////////////////////

const TEST_REPOS = [{
  owner: 'code-flower',
  name:  'client-web',
  branch: ''
},{
  owner: 'code-flower',
  name:  'client-web',
  branch: 'new-ui'
},{
  owner: 'Unitech',
  name:  'pm2',
  branch: ''
},{
  owner: 'jmensch1',
  name:  'sutter-quiz',
  branch: 'releases/1.0',
  username: gitCreds.username,
  password: gitCreds.password
}];

////////////////////// MAIN ////////////////////////

function handleResponse(res) {
  switch(res.type) {
    case config.responseTypes.update:
      //console.log(res.data.text);
      break;
    case config.responseTypes.success:
      console.log("SUCCESS: " + res.data.fNameBr);
      break;
    case config.responseTypes.error:
      console.log("ERROR: ", res.data.fNameBr);
      break;
  }
}

for (var i = 0; i < 10; i++)
  wsReq(TEST_REPOS[2], handleResponse);

//httpReq(TEST_REPOS[1], handleResponse);