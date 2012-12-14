/*
 * imdone
 * https://github.com/piascikj/imdone
 *
 * Copyright (c) 2012 Jesse Piascik
 * Licensed under the MIT license.
 */
// Nodejs libs.
var fs = require('fs');
var wrench = require('wrench');
var _ = require('underscore');

var imdone = module.exports;

imdone.processDocs = function(path) {
	wrench.readdirRecursive(path, function(err,files) {
		_.each(files, function(file) {
			if (file.match(imdone.config.exclude) == null && !fs.statSync(file).isDirectory()) console.log("Processing: " + file);

		});
	});
};

imdone.cli = function() {
	// Get the current directory
	var cwd = process.cwd();
	console.log("cwd:" + cwd);
	console.log("args:" + process.argv);
	//[We want to accept a directory as an argument](#to-do:0)
	imdone.initConfig();
	this.processDocs(".");
};

imdone.initConfig = function() {
	var configFile = process.cwd() + "/imdone.js";
	console.log("config file:" + configFile);

	if (fs.existsSync(configFile)) {
		imdone.config = _.extend(imdone.config,require(configFile));
	}
	console.log("config:" + JSON.stringify(imdone.config));
};

imdone.config = {
	exclude:"^node_modules\/|^\.git\/"
};

