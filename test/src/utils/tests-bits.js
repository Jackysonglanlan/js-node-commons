'use strict';

// run test:
// npm run test-only -- test/src/utils/tests-bits.js

const bits = js_require('src/utils/bits.js');

describe('Bits - src/utils/bits.js: ', function() {
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

  describe('bitCount', function() {
    it('should count bit for > 32bit int', function() {
      bits.bitCount(Number.MAX_SAFE_INTEGER - 999999).should.eql(41);
    });
  });

  afterEach(function() {
    sandbox.restore();
  });

  after(function() {
    //
  });
});
