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
var watch = require("watch");

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
			} 

			if (i+1 == files.length) {
				imdone.processing = false;
				//check to see if files still exist
				imdone.removeDeleted();
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

//We have to check for deleted files, since watch is a bit buggy on deletions
imdone.removeDeleted = function() {
	_.each(imdone.tasks, function(tasks, file) {
		if (!fs.existsSync(file)) {
			console.log(file + "not found.");
			delete imdone.tasks[file];
		}
	});	
}

imdone.start = function(dir) {
	imdone.root = dir;
	imdone.tasks = {};
	imdone.initConfig();
	this.processFiles(wrench.readdirSyncRecursive(dir), function() {
		//set up watcher
		imdone.watchFiles();
		//check to see if files still exist
		console.log("started polling for deleted files.")
		imdone.intervalID = setInterval(imdone.removeDeleted, imdone.config.pollingInterval);
	});
}

imdone.watchFiles = function() {
	watch.createMonitor(imdone.root, {
		filter:function(file, stat) {
			return file.match(imdone.config.exclude) != null;
		}},
		function (monitor) {
		    monitor.on("created", function (f, stat) {
	      		imdone.processFiles([f]);
		    })
		    monitor.on("changed", function (f, curr, prev) {
	      		imdone.processFiles([f]);
		    })
		    monitor.on("removed", function (f, stat) {
		    	console.log(f + " has been deleted");
		    	delete imdone.tasks[f];
		    	console.log("tasks:" + JSON.stringify(imdone.tasks, null, "   "));
		    })
		}
	);

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
