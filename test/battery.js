// this is for testing all of the various params/responses for clone requests.

//////////////////// IMPORTS //////////////////////

require('module-alias/register');

const config = require('@config'),
      gitCreds = require('@creds/git'),
      { httpReq, wsReq } = require('./clocRequests');

//////////////////// CONSTANTS ////////////////////

const RES_TYPES = config.responseTypes;
const ERRORS = config.errors;

///////////////// TEST REQUESTS ///////////////////

const TEST_REQUESTS = [{
  params: {
    owner: 'code-flower',
    name: '',
    branch: 'master'
  },
  test: {
    desc: 'Repo name not provided.',
    expect: res => res.type === RES_TYPES.error &&
                   res.data.name === ERRORS.NeedOwnerAndName.name
  }
},{
  params: {
    owner:  'code-flower',
    name:   'test-repo-1',
    branch: ''
  },
  test: {
    desc: 'Public repo with default branch of not-master, no branch specified, no creds.',
    expect: res => res.type === RES_TYPES.success &&
                   res.data.branch === 'not-master' &&
                   res.data.lastCommit === 'ba2a2fd68c243bb5cfe4907d3adbce8e0d4b29fa'
  }
},{
  params: {
    owner:  'code-flower',
    name:   'test-repo-1',
    branch: 'not-master'
  },
  test: {
    desc: 'Public repo with default branch of not-master, not-master branch specified, no creds.',
    expect: res => res.type === RES_TYPES.success &&
                   res.data.branch === 'not-master' &&
                   res.data.lastCommit === 'ba2a2fd68c243bb5cfe4907d3adbce8e0d4b29fa'
  }
},{
  params: {
    owner:  'code-flower',
    name:   'test-repo-1',
    branch: 'master'
  },
  test: {
    desc: 'Public repo with default branch of not-master, master branch specified, no creds.',
    expect: res => res.type === RES_TYPES.success &&
                   res.data.branch === 'master' &&
                   res.data.lastCommit === '39b7825656927aa5233b13c877e20157ab8c6d2d'
  }
},{
  params: {
    owner:  'code-flower',
    name:   'client-web',
    branch: ''
  },
  test: {
    desc: 'Public repo, no branch specified, no creds.',
    expect: res => res.type === RES_TYPES.success &&
                   res.data.fullName === 'code-flower/client-web'
  }
},{
  params: {
    owner: 'code-flower',
    name: 'client-web',
    branch: 'masters'
  },
  test: {
    desc: 'Public repo, non-existent branch specified, no creds.',
    expect: res => res.type === RES_TYPES.error &&
                   res.data.name === ERRORS.BranchNotFound.name
  }
},{
  params: {
    owner:  'code-flower',
    name:   'client-web',
    branch: 'new-ui'
  },
  test: {
    desc: 'Public repo, valid branch specified, no creds.',
    expect: res => res.type === RES_TYPES.success &&
                   res.data.fullName === 'code-flower/client-web'
  }
},{
  params: {
    owner:  'addgatsby',
    name:   'gatsby-api',
    branch: ''
  },
  test: {
    desc: 'Private repo, no branch specified, no creds.',
    expect: res => res.type === RES_TYPES.error &&
                   res.data.name === ERRORS.NeedCredentials.name
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
    expect: res => res.type === RES_TYPES.success &&
                   res.data.branch === 'master'
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
    expect: res => res.type === RES_TYPES.error &&
                   res.data.name === ERRORS.CredentialsInvalid.name
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
    expect: res => res.type === RES_TYPES.success &&
                   res.data.fullName === 'jmensch1/sutter-quiz' &&
                   res.data.branch === 'releases/1.0'
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
  });
});

// console.log("HTTP Tests");
// TEST_REQUESTS.forEach(req => {
//   httpReq(req.params, res => {
//     evalResponse(req.test, res);
//   });
// });


