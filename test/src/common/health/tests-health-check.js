'use strict';

// run test:
// npm run test-only -- test/src/common/health/tests-health-check.js

const HealthCheck = js_require('src/common/health/health-check.js');

describe('HealthCheck - src/common/health/health-check.js: ', function() {
  let sandbox;

  before(function() {
    //
  });

  beforeEach(function() {
    sandbox = sinon.sandbox.create({
      injectInto: null,
      properties: ['spy', 'stub', 'mock', 'clock', 'server', 'requests'],
      useFakeTimers: false,
      useFakeServer: false
    });
  });

  describe('check', function() {
    it('should check all items in checkList, then return result', function*() {
      //
      const mockList = [
        {
          name: 'aaa',
          checker: () => {
            return new Promise((resolve, reject) => {
              setTimeout(function() {
                resolve(true);
              }, 100);
            });
          }
        },
        {
          name: 'fff',
          checker: () => {
            return Promise.resolve(0);
          }
        },
        {
          name: 'bbb',
          checker: () => {
            return Promise.reject();
          }
        },
        {
          name: 'ccc',
          checker: () => {
            return Promise.resolve(false);
          }
        }
      ];

      const result = yield HealthCheck.check(mockList);
      result.should.eql({
        aaa: true,
        fff: false,
        bbb: false,
        ccc: false,
        isAllHealthy: false
      });
    });
  });

  afterEach(function() {
    sandbox.restore();
  });

  after(function() {
    //
  });
});
