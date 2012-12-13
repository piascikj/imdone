/*
 * imdone
 * https://github.com/piascikj/imdone
 *
 * Copyright (c) 2012 Jesse Piascik
 * Licensed under the MIT license.
 */
// Nodejs libs.
var fs = require('fs');
var _ = require('underscore');

var imdone = exports;
imdone.processDocs = function(path) {
	fs.readdir(path, function(err,files) {
		_.each(files, function(file) {
			console.log(file);
		});
	});
};

imdone.cli = function() {
	// Get the current directory
	var cwd = process.cwd();
	console.log("cwd:" + cwd);
	console.log(process.argv);
	this.processDocs(".");
};
