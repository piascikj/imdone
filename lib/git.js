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

git.init = function(imdone) {
	git.imdone = imdone;
	return git;
}

git.getURL = function(file, line) {
	return git.imdone.config.github.url + "/tree/master/" + file + "#L" + line;
};
