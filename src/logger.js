'use strict';

const tracer = require('tracer');
const PrettyError = require('pretty-error');
const fs = require('fs');

const format = [
  '{{timestamp}} [{{title}}] ({{file}}:{{line}}) {{message}}',
  {
    error: '{{timestamp}} [{{title}}] ({{file}}:{{line}}) {{message}}\n-----------\nCall Stack:\n{{stack}}\n\n'
  }
];

const fileLogger = tracer.dailyfile({
  root: 'logs',
  maxLogFiles: 60,
  format: format,
  dateformat: 'yyyy-mm-dd HH:MM:ss.L'
});

const errorLogger = tracer.dailyfile({
  root: 'logs/error',
  maxLogFiles: 60,
  format: format,
  dateformat: 'yyyy-mm-dd HH:MM:ss.L'
});

const colors = require('colors');
const consoleLogger = tracer.colorConsole({
  format: format,
  dateformat: 'yyyy-mm-dd HH:MM:ss.L',
  inspectOpt: {
    showHidden: false, //the object's non-enumerable properties will be shown too
    depth: 2 //tells inspect how many times to recurse while formatting the object.
    // This is useful for inspecting large complicated objects. Defaults to 2.
    // To make it recurse indefinitely pass null.
  },
  filters: {
    log: [colors.green, colors.italic],
    trace: [colors.magenta, colors.italic],
    debug: [colors.cyan, colors.italic],
    info: [colors.grey, colors.italic],
    warn: [colors.yellow, colors.bold, colors.italic],
    error: [colors.red, colors.bold, colors.italic]
  }
});

const NONE_LOGGER = () => {};
// global.debug = noneLogger;

function _isInEnv(envName) {
  if (envName.toLowerCase().includes('dev') && !!!process.env.NODE_ENV) {
    return true;
  }
  return process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase().includes(envName);
}

function buildPrettyErrorConsoleLogger() {
  // see https://github.com/AriaMinaei/pretty-error
  const pe = new PrettyError();
  pe.appendStyle({
    // our error message
    'pretty-error > header > message': {
      // let's change its color:
      color: 'red',

      // we can use black, red, green, yellow, blue, magenta, cyan, white,
      // grey, bright-red, bright-green, bright-yellow, bright-blue,
      // bright-magenta, bright-cyan, and bright-white

      // it understands paddings too!
      padding: '0 1' // top/bottom left/right
    },

    // each trace item ...
    'pretty-error > trace > item': {
      // ... can have a margin ...
      marginLeft: 2,

      // ... and a bullet character!
      bullet: '"<grey>o</grey>"'

      // Notes on bullets:
      //
      // The string inside the quotation mark gets used as the character
      // to show for the bullet point.
      //
      // You can set its color/background color using tags.
      //
      // This example sets the background color to white, and the text color
      // to cyan, the character will be a hyphen with a space character
      // on each side:
      // example: '"<bg-white><cyan> - </cyan></bg-white>"'
      //
      // Note that we should use a margin of 3, since the bullet will be
      // 3 characters long.
    }
  });

  const el = _isInEnv('dev') ? consoleLogger : errorLogger;
  return err => {
    if (err instanceof Error) {
      const renderedError = pe.render(err);
      console.log(renderedError);
      return;
    }
    el.error(err);
  };
}

module.exports = {
  useGlobal: opts => {
    if (opts.forConsole) {
      opts.forConsole.forEach(opt => {
        global[opt.name] = _isInEnv('prod') ? NONE_LOGGER : consoleLogger[opt.level];
      });
    }

    if (opts.forFile) {
      const logger = _isInEnv('dev') ? consoleLogger : fileLogger;
      global[opts.forFile.name] = logger[opts.forFile.level];
    }

    if (opts.forError) {
      // log to console if in dev env.
      const logger = _isInEnv('dev') ? buildPrettyErrorConsoleLogger() : errorLogger.error;
      global[opts.forError] = logger;
    }
  }
};

//
