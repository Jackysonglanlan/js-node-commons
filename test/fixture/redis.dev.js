'use strict';

const RedisConfig = {
  host: '127.0.0.1',
  port: 6379,
  password: 'yqjauth#98432',
  // db: 0,
  family: 4, // 4 (IPv4) or 6 (IPv6)
  retryStrategy: times => {
    var delay = Math.min(times * 300, 2000);
    return delay;
  },
  key: {
    path: {
      path2: [123, 456]
    }
  },
  reconnectOnError: function(err) {
    var targetError = 'READONLY';
    if (err.message.slice(0, targetError.length) === targetError) {
      // Only reconnect when the error starts with "READONLY"
      return true; // or `return 1;`
    }
  },

  showFriendlyErrorStack: true
};

module.exports = RedisConfig;
