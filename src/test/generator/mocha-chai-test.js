//
//
// Usage:
// npm run test-gene-from -- src/to/target/file.js
//
// Then the mocha unit test file will be generated as test/src/to/target/tests-file.js

'use strict';

const assert = require('assert');

process.env.NODE_ENV = 'dev';

const commons = require('../../../index.js');
commons.assignEnhancedRequireToGlobal('js_require');

const nunjucks = require('nunjucks');
const env = nunjucks.configure(__dirname);
const path = require('path');

function _capitalize(str) {
  return str[0].toUpperCase() + str.substr(1);
}

env.addFilter('test_file_name', function(classFilePath) {
  return `${path.dirname(classFilePath)}/tests-${path.basename(classFilePath)}`;
});

env.addFilter('class_name', function(classFilePath) {
  const nameWithoutExt = path.basename(classFilePath, path.extname(classFilePath));
  return nameWithoutExt
    .split('-')
    .map(word => {
      return _capitalize(word);
    })
    .join('');
});

const mochaTemplate = env.getTemplate('mocha-chai-test.nunjs', true);

function _getMethodListOfObj(obj) {
  if (typeof obj === 'function') {
    obj = obj.prototype;
  }

  return Object.getOwnPropertyNames(obj).filter(name => {
    return typeof obj[name] === 'function' && name !== 'constructor'; // only find user-defined methods
  });
}

function _geneTestCodeFromFile(filePath) {
  return mochaTemplate.render({
    classFilePath: filePath,
    methodList: _getMethodListOfObj(js_require(filePath))
  });
}

const fs = require('fs');
const cp = require('child_process');

function geneMochaTestFileToPath(testTargetFilePath) {
  assert(testTargetFilePath, 'Missing param: testTargetFilePath');

  if (!testTargetFilePath.endsWith('.js')) {
    testTargetFilePath += '.js';
  }

  // put all test files in 'test' dir
  const targetDir = `test/${path.dirname(testTargetFilePath)}`;

  cp.execSync(`mkdir -p ${targetDir}`, {});

  const testFilePath = `${targetDir}/tests-${path.basename(testTargetFilePath)}`;
  if (fs.existsSync(testFilePath)) {
    wlog(`[ABORT]: Test file ${testFilePath} already exists.`);
    process.exit(0);
  }

  const codeContent = _geneTestCodeFromFile(testTargetFilePath);

  fs.writeFileSync(testFilePath, codeContent, {
    flag: 'w+'
  });
  log(`[SUCCESS] Generate unit test file: ${testFilePath}`);
  process.exit(0);
}

module.exports = {
  geneMochaTestFileToPath
};
//
