'use strict';

const isInProdEnv = process.env.NODE_ENV.toLowerCase().includes('prod');
const isInDevEnv = process.env.NODE_ENV.toLowerCase().includes('dev');
const isInTestEnv = process.env.NODE_ENV.toLowerCase().includes('test');

function doInDevEnv(logic) {
  if (isInDevEnv) {
    logic();
  }
}

function doInTestEnv(logic) {
  if (isInTestEnv) {
    logic();
  }
}

function doInProductionEnv(logic) {
  if (isInProdEnv) {
    logic();
  }
}

module.exports = {
  doInDevEnv,
  doInTestEnv,
  doInProductionEnv
};
