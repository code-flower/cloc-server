// this is for testing all of the various params/responses for clone requests.

//////////////////// IMPORTS //////////////////////

const config = require('../config');
const gitCreds = require('../private/git-creds');
const { httpReq, wsReq } = require('./clocRequests');

//////////////////// CONSTANTS ////////////////////

const RES_TYPES = config.responseTypes;
const ERR_TYPES = config.errorTypes;

///////////////// TEST REQUESTS ///////////////////

const TEST_REQUESTS = [{
  params: {
    owner: 'code-flower',
    name: '',
    branch: 'master'
  },
  test: {
    desc: 'Repo name not provided.',
    expect: msg => msg.type === RES_TYPES.error &&
                   msg.data.errorType === ERR_TYPES.needOwnerAndName
  }
},{
  params: {
    owner: 'code-flower',
    name: 'client-web',
    branch: 'masters'
  },
  test: {
    desc: 'Public repo, non-existent branch provided, no creds.',
    expect: msg => msg.type === RES_TYPES.error &&
                   msg.data.errorType === ERR_TYPES.branchNotFound
  }
},{
  params: {
    owner:  'code-flower',
    name:   'client-web',
    branch: 'new-ui'
  },
  test: {
    desc: 'Public repo, branch valid, no creds.',
    expect: msg => msg.type === RES_TYPES.success &&
                   msg.data.fullName === 'code-flower/client-web'
  }
},{
  params: {
    owner:  'addgatsby',
    name:   'gatsby-api',
    branch: ''
  },
  test: {
    desc: 'Private repo, no branch specified, no creds.',
    expect: msg => msg.type === RES_TYPES.error &&
                   msg.data.errorType === ERR_TYPES.needCredentials
  }
},{
  params: {
    owner: 'Unitech',
    name:  'pm2',
    branch: '',
    username: 'whatthe',
    password: 'hell'
  },
  test: {
    desc: 'Public repo, no branch specified, dummy creds provided.',
    expect: msg => msg.type === RES_TYPES.success &&
                   msg.data.branch === ''
  }
},{
  params: {
    owner: 'jmensch1',
    name:  'sutter-quiz',
    branch: 'releases/1.0',
    username: 'wrong',
    password: 'credentials'
  },
  test: {
    desc: 'Private repo, valid branch specified, invalid credentials provided.',
    expect: msg => msg.type === RES_TYPES.error &&
                   msg.data.errorType === ERR_TYPES.credentialsInvalid
  }
},{
  params: {
    owner: 'jmensch1',
    name:  'sutter-quiz',
    branch: 'releases/1.0',
    username: gitCreds.username,
    password: gitCreds.password
  },
  test: {
    desc: 'Private repo, valid branch specified, valid credentials provided.',
    expect: msg => msg.type === RES_TYPES.success &&
                   msg.data.fullName === 'jmensch1/sutter-quiz' &&
                   msg.data.branch === 'releases/1.0'
  }
}];

/////////////////// FUNCTIONS /////////////////////

function evalResponse(test, res) {
  switch(res.type) {
    case RES_TYPES.update:
      //console.log(res.data.text);
      break;
    case RES_TYPES.success:
    case RES_TYPES.error:
      let passed = test.expect(res);
      let output = (test.expect(res) ? 'PASSED: ' : '\nFAILED: ') + 
                   test.desc;
      console.log(output);
      if (!passed)
        console.log("output:", res, '\n');
      break;
  }
}

////////////////////// RUN TEST ///////////////////////

console.log("WS Tests");
TEST_REQUESTS.forEach(req => {
  wsReq(req.params, res => {
    evalResponse(req.test, res);
  })
});

// console.log("HTTP Tests");
// TEST_REQUESTS.forEach(req => {
//   httpReq(req.params, res => {
//     evalResponse(req.test, res);
//   })
// });


