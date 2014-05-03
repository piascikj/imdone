#!/usr/bin/env node

// Nodejs libs.
var fs = require('fs');
var path = require('path');

//Got this badass lib from grunt
var findup = require('../server/util/findup');

// Where might a locally-installed imdone live?
var dir = findup(process.cwd(), 'imdone.js');
dir = path.resolve(dir || '.', '../node_modules/imdone');

// If imdone is installed locally, use it. Otherwise use this imdone.
if (!fs.existsSync(dir)) { dir = '../server/imdone'; }

// Run imdone.
var imdone = require(dir);

// Get the current directory
var cwd = process.cwd();
console.log("cwd:" + cwd);
//console.log("args:" + process.argv);
//ARCHIVE:840 We want to accept a root directory as an argument
imdone.startFromCLI(cwd);

