'use strict';

module.exports = {
  applications: {
    witwork: {
      name: 'witwork',
      tags: ['yqj', 'master', 'v4'],
      check: {
        http: 'http://${host}:${port}/api/dev/health/check',
        interval: '10s'
      }
    },
    discovery: {
      name: 'discovery',
      tags: ['yqj', 'master', 'v4'],
      check: {
        http: 'http://${host}:${port}/dev/health/check',
        interval: '10s'
      }
    }
  },

  appKeys: [
    {
      name: 'demo',
      key: '7rz2z4wbseva7qganpnwsq65p3fx6myv'
    },
    {
      name: 'test',
      key: 'fRUjugestesucRafeThamacAF8CucH6y'
    },
    {
      name: 'internal',
      key: '093ujfodjgp34rahprehoep3974r02ff'
    },
    {
      name: 'app',
      key: 'r4k5gf8wusnd72mftq96wkchp3jzg54h'
    }
  ],

  requestTimeout: 10000
};
