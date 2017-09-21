'use strict';

const env = process.env.NODE_ENV;

const isInProdEnv = env && env.toLowerCase().includes('prod');
const isInDevEnv = env && env.toLowerCase().includes('dev');
const isInTestEnv = env && env.toLowerCase().includes('test');

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
