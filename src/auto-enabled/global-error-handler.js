'use strict';

function handleGlobalUncatchedException() {
  const logThenForceExit = (e, context) => {
    // 记录 error
    if (context) {
      elog(context);
    }
    elog('**** Found Unhandled Exception, need kill process ****', e);

    // 杀掉进程，触发 PM2 重启
    // 为何要杀, 而且要在这里杀? 见 https://blog.risingstack.com/mastering-the-node-js-core-modules-the-process-module
    process.exit(1);
  };

  process.on('unhandledRejection', logThenForceExit);

  process.on('uncaughtException', logThenForceExit);
}

handleGlobalUncatchedException();

module.exports = {};

//
