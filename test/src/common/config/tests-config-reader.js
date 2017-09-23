'use strict';

// run test:
// npm run test-only -- test/src/common/config/tests-config-reader.js

const ConfigReader = js_require('src/common/config/config-reader.js').withBaseDir(__dirname + '/../../../fixture');

describe('ConfigReader - src/common/config/config-reader.js: ', function() {
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

  it('should load config file based on NODE_ENV', function() {
    process.env.NODE_ENV = 'dev';
    ConfigReader.get('redis').should.eql(js_require('test/fixture/redis.dev.js'));
  });

  it('should support keypath', function() {
    process.env.NODE_ENV = 'dev';
    ConfigReader.get('redis', 'key.path.path2').should.eql([123, 456]);
  });

  it('should load file in sub dir', function() {
    process.env.NODE_ENV = 'prod';
    ConfigReader.get('sub/config.js').should.eql(js_require('test/fixture/sub/config.prod.js'));
  });

  afterEach(function() {
    sandbox.restore();
  });

  after(function() {
    //
  });
});
