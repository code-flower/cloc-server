// for testing individual clone requests during development

//////////////////// IMPORTS //////////////////////

const { httpReq, wsReq } = require('./clocRequests');
const config = require('../config');
const gitCreds = require('../private/git-creds');

////////////////// TEST REPOS /////////////////////

const TEST_REPOS = [{
  owner: '',
  name:  'client-web',
  branch: 'masters'
},{
  owner: 'code-flower',
  name:  'client-web',
  branch: ''
},{
  owner: 'code-flower',
  name:  'client-web',
  branch: 'new-ui'
},{
  owner: 'addgatsby',
  name:  'gatsby-api',
  branch: ''
},{
  owner: 'Unitech',
  name:  'pm2',
  branch: ''
},{
  owner: 'jmensch1',
  name:  'sutter-quiz',
  branch: 'releases/1.0',
  username: '',
  password: ''
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
      console.log(res.data.text);
      break;
    case config.responseTypes.success:
      console.log("SUCCESS: " + res.data.sha);
      break;
    case config.responseTypes.error:
      console.log("error: ", res.data);
      break;
  }
}

wsReq(TEST_REPOS[4], handleResponse);
//httpReq(TEST_REPOS[1], handleResponse);

