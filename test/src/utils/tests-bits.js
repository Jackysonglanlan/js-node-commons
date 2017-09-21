
'use strict';

// run test:
// npm run test-only -- test/src/utils/tests-bits.js

const Bits = js_require('src/utils/bits.js');

describe('Bits - src/utils/bits.js: ', function() {

  let sandbox;

  before(function() {
    // TODO
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
    it('should TODO', function() {
      // TODO
    });


  });


  afterEach(function() {

    sandbox.restore();
  });

  after(function() {
    // TODO
  });

});
