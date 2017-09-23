'use strict';

require('../../index');

const gc = require('gc-stats')();
const heapdump = require('heapdump');
const MB = 1000 * 1000;

function _doDumpHeap() {
  flog('[!!!] Node may crash because of memory is running out, start dumping heap...');
  heapdump.writeSnapshot('./low-memory-heap-dump-' + Date.now() + '.heapsnapshot', (err, file) => {
    if (err) {
      elog('Can not dump heap: ', err);
      return;
    }
    flog(`[!!!] Heap is dumpped to: ${file}`);
  });
}

/**
 * 创建 dump 点: 内存使用量 > 预警阀值, 就 dump heap
 *
 * @param {float} percentage 预警阀值, heap 极限大小的百分比
 *
 * @return {Function} 检查点，如果超过预警值，则 dump
 */
function _createDumpPoint(percentage) {
  let used = false;
  return function(usedHeapSize, heapSizeLimit) {
    if (used) {
      return;
    }

    const warningValveMB = Math.ceil(heapSizeLimit / MB * percentage);
    const usedHeapSizeMB = Math.ceil(usedHeapSize / MB);

    // log('warningValveMB: ', warningValveMB);
    // log('usedHeapSizeMB: ', usedHeapSizeMB);

    if (usedHeapSizeMB > warningValveMB) {
      used = true; // fire just once
      _doDumpHeap();
    }
  };
}

/**
 * 内存快用完的时候(很可能下一步就是内存不够崩了)，dump heap，以便排查是否有内存泄露
 */
function dumpHeapIfMemoryIsAboutToRunOut() {
  const dumpPointAt70P = _createDumpPoint(0.7);
  const dumpPointAt80P = _createDumpPoint(0.8);

  // see https://github.com/dainis/node-gcstats
  gc.on('stats', function(stats) {
    dumpPointAt70P(stats.after.usedHeapSize, stats.after.heapSizeLimit);
    dumpPointAt80P(stats.after.usedHeapSize, stats.after.heapSizeLimit);
  });
}

/**
 * 处理未捕获的异常: 一旦出现未捕获异常，记录到日志，然后强制 kill 进程
 */
function handleGlobalUncatchedException() {
  const logThenSuicide = (e, context) => {
    // 记录 error
    if (context) {
      elog(context);
    }
    elog('**** Found Unhandled Exception, need kill process ****\n' + e.stack);

    setTimeout(function() {
      // 杀掉进程，触发 PM2 重启
      // 为何要杀, 而且要在这里杀? 见 https://blog.risingstack.com/mastering-the-node-js-core-modules-the-process-module
      process.exit(1);
    }, 500); // 等待上面的 elog 日志写入文件
  };

  process.on('unhandledRejection', logThenSuicide);

  process.on('uncaughtException', logThenSuicide);
}

dumpHeapIfMemoryIsAboutToRunOut();

handleGlobalUncatchedException();

/**
 * 本 module 自动装载，不需要 export
 */
module.exports = {};

//
