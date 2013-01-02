#!/usr/bin/env node

// Nodejs libs.
var fs = require('fs');
var path = require('path');

//Got this badass lib from grunt
var findup = require('../lib/util/findup');

// Where might a locally-installed imdone live?
var dir = path.resolve(findup(process.cwd(), 'imdone.js'), '../node_modules/imdone');

// If imdone is installed locally, use it. Otherwise use this imdone.
if (!fs.existsSync(dir)) { dir = '../lib/imdone'; }

// Run imdone.
var imdone = require(dir);

// Get the current directory
var cwd = process.cwd();
//console.log("cwd:" + cwd);
//console.log("args:" + process.argv);
//[We want to accept a root directory as an argument](#todo:40)
imdone.start(cwd, process.argv);

