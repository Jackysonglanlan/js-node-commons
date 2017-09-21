//
'use strict';

function setTestRunningEnv() {
  // 测试环境和开发环境都是 dev, 配置一样
  process.env.NODE_ENV = 'dev';
}

setTestRunningEnv();

const commons = require('../index.js');
commons.assignEnhancedRequireToGlobal('js_require');

/* 3rd party */

// test toolkits
['should', 'sinon'].forEach(lib => {
  var name = lib.split('.')[0];
  global[name] = require(lib);
});

// chai
var chai = require('chai');
chai.config.includeStack = true;

// global.AssertionError = chai.AssertionError;
// global.Assertion = chai.Assertion;
// global.assert = chai.assert;
global.expect = chai.expect;

// 'should' lib is conflict with 'sinon-chai', so we can't use it

['chai-as-promised', 'chai-deep-match'].forEach(plugin => {
  chai.use(require(plugin));
});

global.chai = chai;

let Helper = require('./test-helper.js');
global.Helper = Helper;
//
