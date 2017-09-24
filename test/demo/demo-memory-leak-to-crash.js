'use strict';

require('../../index');

const leak = [];
setInterval(function foo() {
  leak.push(Buffer.allocUnsafe(1000 * 1000 * 10).toString());
  // console.log(process.memoryUsage().heapTotal / 1000000);
}, 100);

//
