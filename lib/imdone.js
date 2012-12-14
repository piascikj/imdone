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

var imdone = module.exports = {};

var taskregx = /\[(.+?)\]\(#([\w-]+?):(\d+?\.{0,1}\d*?)\)/g;

imdone.processFiles = function(files, callback) {
	try {
		imdone.processing = true;
		_.each(files, function(file, i) {
			if (file.match(imdone.config.exclude) == null && !fs.statSync(file).isDirectory()) {
				console.log("Extracting tasks from file: " + file);
				//for each file get the tasks
				var data = fs.readFileSync(file, 'utf8');
				imdone.tasks[file] = [];
				data.replace(taskregx, function(md, text, list, order) {
					var task = {
						path:file,
						md:md,
						text:text,
						list:list,
						order:new Number(order)
					};
					imdone.tasks[file].push(task);
				});
				//if (tasks[file] != undefined) console.log(JSON.stringify(tasks[file], null, "   "));
			} else {
				console.log(file + " does not qulify.");
			}
			//console.log(i + " - " + files.length);
			if (i+1 == files.length) {
				imdone.processing = false;
				console.log("tasks:" + JSON.stringify(imdone.tasks, null, "   "));
				if (callback) callback();
			}
		});
	} catch(e) {
		console.log(e.message);
		imdone.processing = true;
	}
};

imdone.cli = function() {
	// Get the current directory
	var cwd = process.cwd();
	console.log("cwd:" + cwd);
	console.log("args:" + process.argv);
	//[We want to accept a directory as an argument](#to-do:0.1)
	imdone.start(".");

};

imdone.start = function(dir) {
	imdone.root = dir;
	imdone.tasks = {};
	imdone.initConfig();
	this.processFiles(wrench.readdirSyncRecursive(dir), imdone.watchFiles);
}

imdone.watchFiles = function() {
	fs.watch(imdone.root, function(event,file) {
		console.log(file + " has changed.");
		imdone.processFiles([file]);
	});
}

imdone.initConfig = function() {
	var configFile = process.cwd() + "/imdone.js";
	console.log("config file:" + configFile);
	imdone.config = require("./config");
	if (fs.existsSync(configFile)) {
		imdone.config = _.extend(imdone.config,require(configFile));
	}
	console.log("config:" + JSON.stringify(imdone.config));
};
