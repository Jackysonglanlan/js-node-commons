'use strict';

const http = require('http');
const https = require('https');

/**
 * Download data from given url the pipe to the given writable.
 *
 * You *must* remember to close the writable once you're done!
 *
 * @param  {string}   url
 * @param  {stream}   writable
 * @param  {Function} cb   (err) => {}
 *
 * @return {null}
 */
function download(url, writable, cb) {
  let module = url.startsWith('https:') ? https : http;

  module
    .get(url, response => {
      const statusCode = response.statusCode;

      let error;
      if (statusCode !== 200) {
        error = new Error(statusCode);
      }

      if (error) {
        // consume response data to free up memory
        response.resume();
        cb(error);
        return;
      }

      response.pipe(writable);
    })
    .on('error', err => {
      // Handle errors
      if (cb) {
        cb(err);
      }
    });
}

const stream = require('stream');

/**
 * A Transform stream that turn the data to base64 string.
 * The data in the 'on' event is Buffer of base64 encoded string.
 *
 * @return {stream} Transform
 */
function createBase64Transform() {
  const s = new stream.Transform();
  s._js_tmp_buf = Buffer.alloc(0);

  // do the transform, this will be called whenever readstream's push() is called.
  s._transform = function(chunk, encoding, done) {
    s._js_tmp_buf = Buffer.concat([s._js_tmp_buf, chunk], s._js_tmp_buf.length + chunk.length); // just keep the data
    done();
  };

  // this will be called when there's no data in the read stream(the readstream.push(null) is called)
  s._flush = function(done) {
    // encode only once
    const result = Buffer.from(this._js_tmp_buf).toString('base64');

    // pass out
    this.push(result);
    s._js_tmp_buf = null;

    done();
  };

  return s;
}

/**
 * 递归方法，深度优先遍历所有的key，如果符合 matcher 要求，记录其 keyPath 到 resultArr。
 *
 * @param  {object} obj
 * @param  {string} currKeyPath 用于递归保留状态，第一次调用传 ''
 * @param  {array} resultArr    结果数组，第一次调用传 []
 * @param  {Function} matcher   (value)=>{} return boolean to select the needed value
 *
 * @return {Array}             [keyPath, ...]
 */
function getAllKeyPathsThatValueMatches(obj, currKeyPath, resultArr, matcher) {
  const copyPath = currKeyPath;
  Object.keys(obj).forEach(key => {
    const v = obj[key];

    currKeyPath += `.${key}`;

    if (typeof v === 'object') {
      getAllKeyPathsThatValueMatches(v, currKeyPath, resultArr, matcher);
      return;
    }

    if (matcher(v)) {
      resultArr.push(currKeyPath.substr(1));
    }

    // recover path for next key
    currKeyPath = copyPath;
  });
}

module.exports = {
  download,
  createBase64Transform,
  getAllKeyPathsThatValueMatches
};

//
