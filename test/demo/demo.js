'use strict';

const commons = require('../../index');

const arr = [1, 2, 3];
log(arr);
arr.jsClean();
log(arr);

flog(commons.utils.bits);
log(commons.utils.bits.bitCount(123));

// elog('aaa');

const http = require('http');

const server = http.createServer((req, res) => {
  res.end();
});
server.listen(8000);

setTimeout(function() {
  throw new Error('ssss');
}, 100);
