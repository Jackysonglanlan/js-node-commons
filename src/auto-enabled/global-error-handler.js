'use strict';

require('../../index');

const gc = require('gc-stats')();
const heapdump = require('heapdump');
const MB = 1000 * 1000;

function _doDumpHeap(snapshotFileName) {
  return new Promise((resolve, reject) => {
    heapdump.writeSnapshot(snapshotFileName, (err, file) => {
      if (err) {
        elog('Can not dump heap: ', err);
        reject(err);
        return;
      }
      flog(`[!!!] Heap is dumpped to: ${file}`);
      resolve(file);
    });
  });
}

/**
 * 创建 dump 点: 内存使用量 > 预警阀值, 就 dump heap
 *
 * @param {float} percentage 预警阀值, heap 极限大小的百分比
 *
 * @return {Function} 检查点，如果超过预警值，则 dump
 *                    dump 文件名格式: low-memory-heap-dump-${percentage}-${timestamp}-${pid}.heapsnapshot
 */
function _createDumpPoint(percentage, done) {
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
      flog('memory achieve warning valve ', percentage);
      flog('[!!!] Node may crash because of memory is running out, start dumping heap...');
      _doDumpHeap(`./low-memory-heap-dump-${percentage * 100}-${Date.now()}-${process.pid}.heapsnapshot`).then(done);
    }
  };
}

/**
 * 在应用启动的时候 dump 一次。
 *
 * 为什么要在应用启动的时候:
 *
 * heapdump 库是用 node-addon C++ 扩展直接调用 v8 的 C++ API 来实现的，而这些 API 由于不是标准的 Node API, 很可能变。
 * 所以如果 heapdump 的作者不经常更新他的代码，那很可能当 Node 升级的时候(比如我们从 Node 6 升级到 8)，用这个库就崩了。
 *
 * 而我们执行 heapdump 库的时机，是内存快要用完的时候，也就是说，我们要在程序启动很久以后，才会用到，而如果库有问题，则
 * 意味着我们要在 程序启动很久以后 才知道这个库有问题。
 *
 * 为实践 fail-fast，我们需要在程序刚刚启动的时候，手动调用一下，确保这个库是 OK 的, 而且，这时 dump 出的内存可以作为以后
 * 采集内存的比较基准。
 */
function takeInitHeapdump() {
  setTimeout(function() {
    _doDumpHeap(`./init-heap-dump-${process.pid}.heapsnapshot`);
  }, 10 * 1000); // 启动 10s 后采集，对大多数应用来说，10s 足够完全启动
}

/**
 * 内存快用完的时候(很可能下一步就是内存不够崩了)，dump heap，以便排查是否有内存泄露
 */
function dumpHeapIfMemoryIsAboutToRunOut() {
  const dumpPointAt70P = _createDumpPoint(0.7);
  const dumpPointAt80P = _createDumpPoint(0.8);
  const dumpPointAt90P = _createDumpPoint(0.9);

  // see https://github.com/dainis/node-gcstats
  gc.on('stats', function(stats) {
    // 根据内存消耗速率，不一定这3个点都可以采集到(比如一秒钟就消耗100M，那很可能从 0.7 到 0.9 只要几秒钟)
    // 但是没关系，采到一个都很有用
    dumpPointAt70P(stats.after.usedHeapSize, stats.after.heapSizeLimit);
    dumpPointAt80P(stats.after.usedHeapSize, stats.after.heapSizeLimit);
    dumpPointAt90P(stats.after.usedHeapSize, stats.after.heapSizeLimit);
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

takeInitHeapdump();

dumpHeapIfMemoryIsAboutToRunOut();

handleGlobalUncatchedException();

/**
 * 本 module 自动装载，不需要 export
 */
module.exports = {};

//
