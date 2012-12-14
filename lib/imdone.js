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

var taskregx = /\[(.+?)\]\(#([\w-]+?):(\d+?\.{0,1}\d*?)\)/g;

/*{
 	filepath:[
      {
      	md:"markdown for task"
        text:"task text",
        list:"list name",
        order:num
      }
    ]
  }
 */
var tasks = {};

imdone.processFiles = function(path) {
	wrench.readdirRecursive(path, function(err,files) {
		_.each(files, function(file) {
			if (file.match(imdone.config.exclude) == null && !fs.statSync(file).isDirectory()) {
				console.log("Extracting tasks from file: " + file);
				//for each file get the tasks
				fs.readFile(file, 'utf8', function (err,data) {
					if (err) {
						return console.log(err);
					}
					data.replace(taskregx, function(md, text, list, order) {
						var task = {
							file:file,
							md:md,
							text:text,
							list:list,
							order:order
						};
						console.log(JSON.stringify(task, null, "   "));
					});
				});
			}
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
	this.processFiles(".");
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
	exclude:/^node_modules\/|^\.git\/|^\.svn\//
};

