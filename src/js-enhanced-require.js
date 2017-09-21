'use strict';

const path = require('path');
const fs = require('fs');

////////// private //////////

function _findAllNoneModuleSrcFiles(dir) {
  const list = fs.readdirSync(dir).filter(fileName => {
    // no modules, no hidden
    return fileName !== 'node_modules' && !fileName.startsWith('.');
  });

  let results = [];
  list.forEach(function(file) {
    file = dir + '/' + file;
    let stat = fs.statSync(file);

    if (stat && stat.isDirectory()) {
      results = results.concat(_findAllNoneModuleSrcFiles(file));
    }

    if (file.endsWith('.js')) {
      results.push(file);
    }
  });

  return results;
}

function _scanDirsToTraceSrcFiles(srcPathList) {
  return srcPathList.reduce((accu, dirPath) => {
    let absolutePath = path.resolve(dirPath);
    // console.log('yqj-file-preloader: start preloading files at path: ' + absolutePath);
    return accu.concat(_findAllNoneModuleSrcFiles(absolutePath));
  }, []);
}

// array: [fullPathFileName, ...]
const allNoneModuleSrcFiles = _scanDirsToTraceSrcFiles([__dirname + '/../../../']);

function enhanced_require(moduleFileName) {
  if (!moduleFileName.endsWith('.js')) {
    moduleFileName += '.js';
  }

  // console.log(allNoneModuleSrcFiles);
  // convert relative path to absolute
  let foundAbsolutePath = allNoneModuleSrcFiles.find(path => {
    return path.includes(moduleFileName);
  });

  if (foundAbsolutePath !== undefined) {
    return require(foundAbsolutePath);
  }

  throw new Error('Can\'t require "' + moduleFileName + '", file doesn\'t exists');
}

module.exports = enhanced_require;

//
