//

'use strict';

const path = require('path');

const files = require('./src/utils/files.js');

function commons() {}
commons.utils = {};

function _autoEnable() {
  files.doWithFilesInDir(__dirname + '/src/auto-enabled', {
    filter: fullFilePath => {
      return fullFilePath.endsWith('.js');
    },
    block: fullFilePath => {
      require(fullFilePath);
    }
  });
}
_autoEnable();

function _mountToGlobal() {
  /* logger */
  require(__dirname + '/src/logger').useGlobal({
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

  /* 3rd party */
  try {
    global.Promise = require('bluebird');
    global.NMap = require('es6-native-map');
    global._ = require('lodash');
  } catch (e) {
    // never mind: require 失败是因为库没有装，如果项目选择使用这些库，则不会报错
  }
}
_mountToGlobal();

function _enable3rdParty() {
  /* ours */
  commons.utils.strman = require('./src/third-party-libs/strman/transpiler/strman');
  // add more
}
_enable3rdParty();

function _enableExt() {
  files.doWithFilesInDir(__dirname + '/src/ext/', {
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
  files.doWithFilesInDir(__dirname + '/src/utils/', {
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
  global[globalParamName] = require('./src/js-enhanced-require.js');
};

module.exports = commons;

//
