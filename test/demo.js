'use strict';

const commons = require('../index');

const arr = [1, 2, 3];
arr.jsClean();
log(arr);

log(commons.utils.bits.bitCount(123));
