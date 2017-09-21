//

'use strict';

const path = require('path');

const js_require = require('./src/js-enhanced-require');

const files = js_require('src/utils/files.js');

function commons() {}
commons.utils = {};

function _mountToGlobal() {
  /* 3rd party */
  // global.Promise = require('bluebird');
  // global.HashTable = require('hashtable');
  // global._ = require('lodash');

  /* logger */
  js_require('src/logger').useGlobal({
    // forConsole can specify multi config
    forConsole: [
      {
        name: 'log',
        level: 'log'
      },
      {
        name: 'logw',
        level: 'warn'
      }
    ],
    // just one
    forFile: {
      name: 'flog',
      level: 'log'
    },
    forError: 'elog'
  });
}
_mountToGlobal();

function _enable3rdParty() {
  /* ours */
  commons.utils.strman = require('./src/third-party-libs/strman/transpiler/strman');
  // add more
}
_enable3rdParty();

function _enableExt() {
  files.doWithFilesInDir('src/ext/', {
    filter: fullFilePath => {
      return fullFilePath.endsWith('.js');
    },
    block: fullFilePath => {
      try {
        require(fullFilePath);
      } catch (e) {
        // elog(e);
        // never mind: require 失败是因为某些库没有装，如果项目选择使用这些库，则不会报错
      }
    }
  });
}
_enableExt();

function _enableUtils() {
  files.doWithFilesInDir('src/utils/', {
    filter: fullFilePath => {
      return fullFilePath.endsWith('.js');
    },
    block: fullFilePath => {
      commons.utils[path.basename(fullFilePath, '.js')] = require(fullFilePath);
    }
  });
}
_enableUtils();

//////////// public ////////////

commons.assignEnhancedRequireToGlobal = globalParamName => {
  global[globalParamName] = js_require;
};

module.exports = commons;

//
