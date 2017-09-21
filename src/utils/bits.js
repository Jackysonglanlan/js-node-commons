'use strict';

const assert = require('assert');

const m1 = 0x55555555; // 01010101010101010101010101010101
const m2 = 0x33333333; // 00110011001100110011001100110011
const m4 = 0x0f0f0f0f; // 00001111000011110000111100001111
// const m8 = 0x00ff00ff; // 00000000111111110000000011111111
// const m16 = 0x0000ffff; // 00000000000000001111111111111111
const h01 = 0x01010101; // the sum of 256 to the power of 0, 1, 2, 3

function _bitCount32(x) {
  x -= (x >> 1) & m1; //put count of each 2 bits into those 2 bits
  x = (x & m2) + ((x >> 2) & m2); //put count of each 4 bits into those 4 bits
  x = (x + (x >> 4)) & m4; //put count of each 8 bits into those 8 bits
  return (x * h01) >> 24; // left 8 bits of x + (x<<8) + (x<<16) + (x<<24)  return c;
}

/**
 * 计算一个整数的二进制表示中有多少个 “1”。
 *
 * 这个方法比 Number(n).toString().replaceAll('0', '').length 要快。
 *
 * @param  {Number}   n 整数，最大 Number.MAX_SAFE_INTEGER
 *
 * @return {Number}   n 的二进制表示中有多少个 “1”
 */
function bitCount(n) {
  assert(typeof n === 'number', 'Param n Must be an Number');

  const bits = _bitCount32(n);

  n = n / 0x100000000; // 把高32位变成小数
  if (n < 1) {
    return bits; // n 是 32 位 int
  }

  // 64位，算第二轮

  // Bitwise operations will only work reliably in Javascript for "integers" up to 32-bits
  // 所以要拆开，32位为一块来计算，最后加总

  return bits + _bitCount32(n);
}

module.exports = {
  bitCount
};

//
