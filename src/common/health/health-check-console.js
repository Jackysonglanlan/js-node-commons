'use strict';

require('yqj-commons');
const ConfigReader = yqj_require('config-reader');
let consulConf = ConfigReader.get('server', 'consul');

const hCheck = require('./health-check'),
  DB = yqj_require('src/db/DB');
const redis = DB.redis,
  mongoose = DB.mongoose;

const promise = hCheck.checkAllWithout();

setInterval(() => {

  if (promise.isRejected()) {
    console.log(3); // something is wrong
    process.exit();
    return;
  }

  if (!promise.isFulfilled()) {
    // wait for promise to fulfill
    return;
  }

  const v = promise.value();

  if (v.health) {
    console.log(0); // all ok
  } else if (!v.isRedisOK) {
    console.log(`1 - Error: ${redis.config.host}:${redis.config.port} -> REDIS IS DOWN`); // redis is down
  } else if (!v.isMongooseOK) {
    console.log(`1 - Error: ${mongoose.config.server} -> MONGO IS DOWN FROM MONGOOSE`); // mongoose is down
  } else if (!v.isConsulOK) {
    console.log(`1 - Error:  ${consulConf.host}:${consulConf.port} -> CONSUL IS DOWN`); // consul is down
  }

  process.exit();
}, 200);

//
