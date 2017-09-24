#!/usr/bin/env node

'use strict';

const mochaGene = require('../src/test/generator/mocha-chai-test.js');

const filePathToGeneTest = process.argv[2]; // the param should be target file's path relative to project's root dir

mochaGene.geneMochaTestFileToPath(filePathToGeneTest);

//
