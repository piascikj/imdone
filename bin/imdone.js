#!/usr/bin/env node

// Nodejs libs.
var fs = require('fs');
var path = require('path');
// In Nodejs 0.8.0, existsSync moved from path -> fs.
var existsSync = fs.existsSync || path.existsSync;

// Badass internal imdone lib.
var findup = require('../lib/util/findup');

// Where might a locally-installed imdone live?
var dir = path.resolve(findup(process.cwd(), 'imdone.js'), '../node_modules/imdone');

// If imdone is installed locally, use it. Otherwise use this imdone.
if (!existsSync(dir)) { dir = '../lib/imdone'; }

// Run imdone.
require(dir).cli();
