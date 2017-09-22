'use strict';

// run test:
// npm run test-only -- test/src/utils/tests-utils.js

const utils = js_require('src/utils/utils');

const stream = require('stream');

describe('Utils - src/utils/utils.js: ', function() {
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

  it('createBase64Transform - should transform data from read stream to base64 str', function(done) {
    const testStr = 'aaabbbccdddsfdsfd';

    const rs = new stream.Readable();
    // must impl _read()
    rs._read = function() {
      this.push(testStr);
      this.push(null); // notify that no more data, this will trigger the 'end' event
    };

    const base64TransformStream = utils.createBase64Transform();
    let base64 = '';

    base64TransformStream.on('data', data => {
      base64 += data.toString();
    });

    base64TransformStream.on('end', () => {
      base64.should.be.eql('YWFhYmJiY2NkZGRzZmRzZmQ=');
      Buffer.from(base64, 'base64').toString('ascii').should.be.eql(testStr);
      done();
    });

    rs.pipe(base64TransformStream);
  });

  describe.skip('download', function() {
    function check_download(url, done) {
      const ws = new stream.Writable();
      let buf = Buffer.alloc(0);
      // must impl _write()
      ws._write = function(chunk, encoding, callback) {
        buf = Buffer.concat([buf, chunk], buf.length + chunk.length);
        callback();
      };

      // no need to close ws, for it's totally in memory
      ws.on('finish', () => {
        buf.includes('PNG', 1).should.be.true();
        done();
      });

      utils.download(url, ws, err => {
        log(err);
        done();
      });
    }

    it('should make a writable stream on the HTTP url', function(done) {
      check_download('http://yiqijiao.net/public/images/icon-apple.png', done);
    });

    it('should support download from HTTPS too', function(done) {
      check_download('https://yiqijiao.net/public/images/icon-apple.png', done);
    });

    it('should fail if the url is broken', function(done) {
      utils.download('http://yiqijiao.net/public/images/jasdfoijs.png', null, err => {
        // log(err);
        err.should.be.Error();
        err.message.should.greaterThan(200);
        done();
      });
    });
  });

  it('download then transform to base64 - should turn the img to base64 string', function(done) {
    const base64TransformStream = utils.createBase64Transform();
    let base64 = '';

    base64TransformStream.on('data', data => {
      // log(data);
      base64 += data.toString();
    });

    base64TransformStream.on('end', () => {
      base64.should.be.eql(
        'iVBORw0KGgoAAAANSUhEUgAAACQAAAAsCAYAAAANUxr1AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABZ0RVh0Q3JlYXRpb24gVGltZQAwNS8wNS8xNotDrIEAAAAcdEVYdFNvZnR3YXJlAEFkb2JlIEZpcmV3b3JrcyBDUzbovLKMAAACWElEQVRYhcWYwXHbMBBFn+Xc4w6iDqwOwlRgdWBmBkce1IGZDnjAETNWOpA6oDqQOiBnfPRBrEA5AJAoEmCQDEn8kwacpR4XuwvsPlwuF6aSENkaSIEX4KCUTP5m82UikCWwBb7/q+3oQEJkK6AEvnYeHUPsFzPBxAFCb5MLpgF2IS8YDUiILAWePY8LpeR5ViBg7VmvgSL0JWMCvTjWGmAd6h0YCUiILHEs10CilAwKZqsp6lCDjpn8f4yDgFoeWAIVcOxswxH4AZzbHjFlIAGezFIFVErJ0vdfD76jw1TbHB2srlTeAzul5NZhtzF23zz/26ADvZd9TiAhshx487zM9fId+uvX+FPfZ5sqJa816g5IiOwJXdxcGTOlflpPd7OsiAAD8G7i7QYkRLYBXiPAAJyAM5gtM1tV4Q7eOWASG9zWQ2kkGFs8r5lmgTYRYEBn2F3aP358fC4JT/ExdXBV8wWwmp8F8NwAYgKVrsWxb4yhanxXklhAle9BLCDveRcLyN4KeooGhL4n9bQgsF+aQM5ivGAgwCbWs2md7mQP1zNxzrKGTiNgY6iMAAPaCaW9C8HNQynwHgnK6hdQ2K5jR3ygNzBbZsr4PiqOVtmuQ8H990SqlZI3INO8neLxkEO/UuezY2jVzjbINGyHCEC5/eE6y1J0wZpLh3Y73gNSSlbMt3UN2gFXOU97pWTBPGVgYxwwDGSUMm3W/e5OTmBgHAPX4UPJ8ERjj77ClOg50Ar9Mb5RjIVJXQ8GgVpQOffdbY2ekmy7Lm/ZJcamPV86AXl7/NLVH2DQ2znoH6yaAAAAAElFTkSuQmCC'
      );
      Buffer.from(base64, 'base64').length.should.eql(768);

      // const fs = require('fs');
      // fs.writeFile('tmp/b.png', Buffer.from(base64, 'base64'), (err) => {
      //   done();
      // });
      done();
    });

    // start
    utils.download('http://yiqijiao.net/public/images/icon-apple.png', base64TransformStream, err => {
      log(err);
      done();
    });
  });

  it('getAllKeyPathsThatValueMatches - should return keypath array', function() {
    const obj = {
      aa: 'http://a.com/aa.mp',
      bb: 'http://b.com/bb.mp3',
      c: {
        d: 'http://b.com/dd.mp',
        e: {
          f: 'https://b.com/ff.mp3'
        }
      }
    };

    const regex = `https?\:\/\/.+\.mp3\\??.*?`;

    const resultArr = [];
    utils.getAllKeyPathsThatValueMatches(obj, '', resultArr, v => {
      return v.match(regex);
    });

    resultArr.should.eql(['bb', 'c.e.f']);
  });

  afterEach(function() {
    sandbox.restore();
  });

  after(function() {
    //
  });
});
