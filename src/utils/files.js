'use strict';

const path = require('path');
const fs = require('fs');

function walkDir(dir) {
  let results = [];
  let list = fs.readdirSync(dir);
  list.forEach(file => {
    file = dir + '/' + file;
    let stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(this._walkDir(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

/**
 * "Deep First" walk through the given dir
 *
 * @param  {string} dirPath The dir you want to walk through
 *
 * @param  {Object} params  Like this:
 * {
 *    filter: (fullFilePath) => {...} // return true or false to filter the file out
 *    block: (fullFilePath) => {...} // do what you like with the file
 * }
 */
function doWithFilesInDir(dirPath, params) {
  walkDir(path.resolve(dirPath)).filter(params.filter).forEach(params.block);
}

module.exports = {
  walkDir,
  doWithFilesInDir
};
