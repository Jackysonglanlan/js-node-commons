'use strict';

const path = require('path');

function replaceBracketContent(capture, g1, g2, offset) {
  return (offset !== 0 ? '.' : '') + g1.replace(/\./g, '«dot»');
}

function toSegments(keypath) {
  if (Array.isArray(keypath)) {
    return Array.prototype.slice.call(keypath);
  }
  if (typeof keypath === 'string') {
    keypath = keypath.replace(/\.\./g, '«dot»');

    // issue #1 https://github.com/jeeeyul/underscore-keypath/issues/1
    keypath = keypath.replace(/\['(([^']|\\')*)'\]/g, replaceBracketContent);
    keypath = keypath.replace(/\["(([^"]|\\")*)"\]/g, replaceBracketContent);

    keypath = keypath.replace(/([$A-Za-z_][0-9A-Za-z_$]*)\(\)/, '$1');

    var result = keypath.split('.');

    result = result.map(function(each) {
      return each.replace(/«dot»/g, '.');
    });

    return result;
  }
  throw new Error('keypath must be an array or a string');
}

function capitalize(str) {
  str = str === null ? '' : String(str);
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getProperty(obj, name) {
  if (name === '') {
    return obj;
  }

  var target = obj['get' + capitalize(name)];

  if (target === undefined) {
    target = obj['is' + capitalize(name)];
  }

  if (target === undefined) {
    target = obj[name];
  }

  if (typeof target === 'function') {
    target = target.call(obj);
  }

  return target;
}

function valueForKeyPath(obj, keypath, fallback) {
  var finger = obj, segments, next, parent;

  if (obj === null || obj === undefined) {
    return fallback;
  }

  segments = toSegments(keypath);
  next = segments.shift();
  parent = undefined;

  while (finger !== null && finger !== undefined && typeof next === 'string') {
    parent = finger;
    finger = getProperty(finger, next);
    if (typeof finger === 'function') {
      finger = finger.call(parent);
    }
    next = segments.shift();
  }

  if (finger === null || finger === undefined) {
    return fallback;
  } else {
    return finger;
  }
}

/**
 * Load any ".js" config files in config/ dir, according to the process.env.NODE_ENV value.
 *
 * E.g:
 *
 *   If process.env.NODE_ENV is "dev":
 *
 *     get('foo') will load config/foo.dev.js
 *     get('bar') will load config/bar.dev.js
 *
 */
class ConfigReader {
  constructor(baseDir) {
    if (!baseDir.endsWith('/')) {
      baseDir = baseDir + '/';
    }
    this.baseDir = baseDir;
  }

  /**
   * Load the whole config file or just a value under the specified "keyPath".
   *
   * @param  {string} fileName *MUST* be the config file name in config/ dir.
   * @param  {string} keyPath  A keyPath where the value is, like "outer.inner.key"
   *
   * @return {Object or value type}  the whole config file data if NO keyPath, or it will return the value of keyPath
   */
  get(fileName, keyPath) {
    if (!fileName.endsWith('.js')) {
      fileName += '.js';
    }

    const dir = this.baseDir + path.dirname(fileName);
    const ext = path.extname(fileName);
    const nameWithoutExt = path.basename(fileName, ext);

    const realFilePath = `${dir}/${nameWithoutExt}.${process.env.NODE_ENV}${ext}`;

    const data = require(realFilePath);

    if (keyPath) {
      return valueForKeyPath(data, keyPath);
    }

    return data;
  }
}

module.exports = {
  withBaseDir: function(baseDir) {
    const reader = new ConfigReader(baseDir);
    return reader;
  }
};

//
