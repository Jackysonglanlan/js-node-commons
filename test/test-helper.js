'use strict';

/**
 *
 * @param {*} fn 回调函数
 * @param {*} boundaryValues 待查询边界值
 */
function* boundaryValuesVerification(fn, boundaryValues = [[], null, undefined, '']) {
  require('assert')(typeof fn === 'function', 'fn is not a function');
  for (let i = 0, len = boundaryValues.length; i < len; i++) {
    yield fn(boundaryValues[i]);
  }
}

/**
 * firstObj, sencodObj 根据 standardStructure 的结构进行比较
 * @param {*} firstObj 作为默认的结构
 * @param {*} secondObj
 * @param {*} standardStructure
 * @param {*} assertFn 断言函数，默认为相等判断
 */
function compare(firstObj, secondObj, standardStructure = null, assertFn = null) {
  Object.keys(standardStructure || firstObj).forEach(key => {
    log('key = ', key, firstObj[key], secondObj[key], secondObj);
    if (typeof firstObj[key] === 'object' && typeof secondObj[key] === 'object') {
      compare(firstObj[key], secondObj[key], (standardStructure || firstObj)[key]);
    } else {
      if (typeof assertFn === 'function') {
        assertFn(firstObj[key], secondObj[key]);
      } else {
        firstObj[key].should.eql(secondObj[key]);
      }
    }
  });
}

function sinceHour(hour) {
  const nowTime = new Date();
  const timestamps = nowTime.setHours(nowTime.getHours() + hour, 0, 0, 0);
  return new Date(timestamps);
}

module.exports = {
  sinceHour,
  boundaryValuesVerification,
  compare
};
