//
//
// Usage:
// npm run test-gene-from -- src/to/target/file.js
//
// Then the mocha unit test file will be generated as test/src/to/target/tests-file.js

'use strict';

process.env.NODE_ENV = 'dev';

const commons = require('../../index.js');
commons.assignEnhancedRequireToGlobal('js_require');

const nunjucks = require('nunjucks');
const env = nunjucks.configure('test/generator');
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

const mochaTemplate = env.getTemplate('mocha-tests.nunjs', true);

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

const filePathNeedGeneTest = process.argv[2]; // the param should be target file's path relative to src/
const fs = require('fs');
const cp = require('child_process');

function geneMochaTestFileToPath(testTargetFilePath) {
  if (!testTargetFilePath.endsWith('.js')) {
    testTargetFilePath += '.js';
  }

  const targetDir = `test/${path.dirname(testTargetFilePath)}`;
  cp.exec(`mkdir -p ${targetDir}`, {}, err => {
    if (err) {
      log(err);
      process.exit(1);
    }

    let testFilePath = `${targetDir}/tests-${path.basename(testTargetFilePath)}`;

    if (fs.existsSync(testFilePath)) {
      log(`ABORT: Test file ${testFilePath} already exists.`);
      process.exit(0);
    }

    const codeContent = _geneTestCodeFromFile(testTargetFilePath);

    fs.writeFileSync(testFilePath, codeContent, {
      flag: 'w+'
    });
    log(`SUCCESS: Generate test file ${testFilePath}`);
    process.exit(0);
  });
}

geneMochaTestFileToPath(filePathNeedGeneTest);

//
