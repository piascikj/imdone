/*
 * imdone
 * https://github.com/piascikj/imdone
 *
 * Copyright (c) 2012 Jesse Piascik
 * Licensed under the MIT license.
 */
// Nodejs libs.
var gift = require('gift');
var git = module.exports = {};

git.GitProject = function(config) {
	this.config = config
};


git.GitProject.prototype.getURL = function(file, line) {
	return this.config.url + "/tree/master/" + file + "#L" + line;
};
