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
var watchr = require('watchr');

var imdone = module.exports = {};

var taskregx = /\[(.+?)\]\(#([\w-]+?):(\d+?\.{0,1}\d*?)\)/g;
 
imdone.getURL = function(file) {
	if (imdone.config.github) {
		return imdone.config.github.url + "/tree/master/" + file;
	} else {
		return file;
	}
};

imdone.processFiles = function(files, callback) {
	try {
		imdone.processing = true;
		_.each(files, function(file, i) {
			if (imdone.config.exclude.test(file) == false && !fs.statSync(file).isDirectory()) {
				console.log("Extracting tasks from file: " + file);
				//for each file get the tasks
				var data = fs.readFileSync(file, 'utf8');
				var id = 0;
				var lastUpdate = new Date();
				delete imdone.tasks[file];
				data.replace(taskregx, function(md, text, list, order) {
					if (imdone.tasks[file] == undefined) imdone.tasks[file] = {lastUpdate:lastUpdate,tasks:{}};
					var task = {
						path:file,
						url: imdone.getURL(file),
						md:md,
						text:text,
						list:list,
						order:new Number(order),
						pathTaskId:id,
						lastUpdate:lastUpdate
					};
					imdone.tasks[file].tasks[id] = task;
					id++;
				});
			} 

			if (i+1 == files.length) {
				imdone.processing = false;
				//check to see if files still exist
				console.log("tasks:" + JSON.stringify(imdone.tasks, null, "   "));
				imdone.saveListData();
				if (callback) callback();
			}
		});
	} catch(e) {
		console.log(e.message);
		imdone.processing = false;
	}
};

imdone.watchFiles = function() {
	watchr.watch({
    	path: imdone.root,
    	listeners: {
	        /*
	        log: function(logLevel){
	            console.log('a log message occured:', arguments);
	        },
	        */
	        error: function(err){
	            console.log('an error occured:', err);
	        },
	        watching: function(err,watcherInstance,isWatching){
	            console.log('a new watcher instance finished setting up', arguments);
	        },
	        change: function(changeType,filePath,fileCurrentStat,filePreviousStat){
	            console.log('a change event occured:',arguments);
	            console.log("an " + changeType + " occured on " + filePath);
	            if (filePath.match(imdone.config.exclude) != null) return;
	            switch(changeType) {
	            	case "update":
	            		imdone.processFiles([filePath]);
	            		break;
	            	case "create":
	            		imdone.processFiles([filePath]);
	            		break;
	            	case "delete":
				    	delete imdone.tasks[filePath];
				    	imdone.saveListData();
				    	console.log("tasks:" + JSON.stringify(imdone.tasks, null, "   "));
	            		break;
	            }
	        }
	    },
	    next: function(err,watchers){
	        console.log('watching for all our paths has completed', arguments);
	    }
	});

}

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
	imdone.loadListData();
	this.processFiles(wrench.readdirSyncRecursive(dir), function() {
		//set up watcher
		imdone.watchFiles();
		//start the server
		require("./server").start(imdone);
	});
}

imdone.initConfig = function() {
	imdone.dataDir = process.cwd() + "/imdone";

	//Check for the imdone directory
	if (!fs.existsSync(imdone.dataDir)) {
		fs.mkdirSync(imdone.dataDir);
	}

	imdone.configFile = imdone.dataDir + "/config.js";
	imdone.defaultConfig = "./config";
	
	//Extend the default config
	imdone.config = require(imdone.defaultConfig);
	if (fs.existsSync(imdone.configFile)) {
		console.log("Found imdone config file:" + imdone.configFile);
		imdone.config = _.extend(imdone.config,require(imdone.configFile));
	} else {
		var inStr = fs.createReadStream(require.resolve(imdone.defaultConfig));
		var outStr = fs.createWriteStream(imdone.configFile);

		inStr.pipe(outStr);	
	}
	console.log("config:" + JSON.stringify(imdone.config));

	imdone.dataFile = imdone.dataDir + "/data.js";

};

imdone.loadListData = function() {
	imdone.lists = [];
	imdone.currentLists = [];
	//Get the lists from the data file
	if (fs.existsSync(imdone.dataFile)) {
		 var data = fs.readFileSync(imdone.dataFile, 'utf8');
		 imdone.lists = JSON.parse(data);
		 //printjson(imdone.lists);
	}
};

imdone.saveListData = function() {
	var currentLists = [];

	_.each(imdone.tasks, function(fileTasks, file){
		_.each(fileTasks.tasks,function(task, id) {
			if (!_.contains(currentLists, task.list)) currentLists.push(task.list);
		});
	});
	
	console.log("currentLists:" + JSON.stringify(currentLists, null, 2));


	var intersection = _.intersection(imdone.lists, currentLists);

	console.log("Intersection:" + JSON.stringify(intersection, null, 2));


	var union = _.union(intersection, currentLists);
	
	console.log("Saving list data:" + JSON.stringify(union, null, 2));
	fs.writeFileSync(imdone.dataFile, JSON.stringify(union, null, 2), 'utf8');
};
