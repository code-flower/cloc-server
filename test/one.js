// for testing individual clone requests during development

//////////////////// IMPORTS //////////////////////

require('module-alias/register');

const config = require('@config'),
      gitCreds = require(config.paths.creds.git),
      { httpReq, wsReq, showResponse } = require('./_common')
      argv = require('minimist')(process.argv);

////////////////// TEST REPOS /////////////////////

const TESTS = [{
  endpoint: 'cloc',
  params: {
    owner: 'code-flower',
    name:  'client-web',
    branch: ''
  }
},{
  endpoint: 'cloc',
  params: {
    owner: '',
    name:  'client-web',
    branch: 'masters'
  }
},{
  endpoint: 'cloc',
  params: {
    owner: 'code-flower',
    name:  'client-web',
    branch: 'new-ui'
  }
},{
  endpoint: 'cloc',
  params: {
    owner: 'addgatsby',
    name:  'gatsby-api',
    branch: ''
  }
},{
  endpoint: 'moose',
  params: {
    owner: 'code-flower',
    name:  'client-web',
    branch: ''
  }
},
'raw string',
{
  endpoint: 'cloc',
  params: {
    owner: 'Unitech',
    name:  'pm2',
    branch: ''
  }
},{
  endpoint: 'cloc',
  params: {
    owner: 'jmensch1',
    name:  'sutter-quiz',
    branch: 'releases/1.0',
    username: '',
    password: ''
  }
},{
  endpoint: 'cloc',
  params: {
    owner: 'jmensch1',
    name:  'sutter-quiz',
    branch: 'releases/1.0',
    username: gitCreds.username,
    password: gitCreds.password
  }
},{
  endpoint: 'cloc',
  params: {
    owner: 'tensorflow',
    name: 'tensorflow',
    branch: ''
  }
}];

///////////////////// MAIN ////////////////////////

let reqFunc = argv.http ? httpReq : wsReq,
    testNum = argv.n || 0,
    test = TESTS[testNum],
    isString = typeof test === 'string';

reqFunc(test, res => showResponse(res, true), isString);



