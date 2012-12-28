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
var marked = require('marked');

var imdone = module.exports = {pause:{}};

var taskregx = /\[(.+?)\]\(#([\w-]+?):(\d+?\.{0,1}\d*?)\)/g;
 
imdone.getURL = function(file) {
	if (imdone.config.github) {
		return imdone.config.github.url + "/tree/master/" + file;
	} else {
		return file;
	}
};

imdone.getSortedLists = function() {
	var lists = {}, out = [];
	_.each(imdone.tasks, function(fileTasks, file){
		_.each(fileTasks.tasks,function(task, id) {
			var list = task.list;
			if (lists[list] == undefined) lists[list] = [];
			lists[list].push(task);
		});
	});

	_.each(lists, function(tasks, list) {
		var listObj = {name:list};
		listObj.tasks = _.sortBy(tasks, "order");
		out.push(listObj);
	});

	out = _.sortBy(out, function(listObj) {
		return _.indexOf(imdone.lists,listObj.name);
	});

	return out;	
}

imdone.renameList = function(request) {
	var name = request.name;
	var newName = request.newName;
	var pos = _.indexOf(imdone.lists, name);
	var list = _.where(imdone.getSortedLists(),{name:name})[0];
	//console.log(JSON.stringify(list, null, 3));
	
	_.each(list.tasks, function(task) {
		imdone.pause(task.path);
		//open the file and change the order of the tasks
		imdone.modifyTask(task, {list:newName});
	});

	//unpause all paths in the list
	_.each(list.tasks, function(task) {
		if (imdone.isPaused(task.path)) {
			imdone.unpause(task.path);
		}
	});

	var lists = _.without(imdone.lists, newName);
	lists.splice(pos,0,newName);
	imdone.lists = lists;
	imdone.saveListData();

	return imdone.lists;
};

imdone.moveList = function(request) {
	var list = request.list;
	var pos = parseInt(request.position);
	var lists = _.without(imdone.lists, list);
	lists.splice(pos, 0, list);
	imdone.lists = lists;
	imdone.saveListData();
	return imdone.lists;
};

imdone.moveTask = function(request) {
	var path = request.path;
	var from = request.from;
	var to = request.to;
	var lastUpdate = request.lastUpdate;
	var pos = parseInt(request.pos);
	var pathTaskId = parseInt(request.pathTaskId);

	//Get the current task from the data
	var pathObj = imdone.tasks[path];
	var task = pathObj.tasks[pathTaskId];

	//if the lastUpdate is different return need refresh
	if (new Date(lastUpdate) < pathObj.lastUpdate) {
		return {refresh:true};
	}


	//Change the list of the task
	if (to != from) {
		console.log("Moving task:" + JSON.stringify(task, null, 3));
		imdone.pause(path);
		imdone.modifyTask(task, {list:to});
		//process the file but leave it paused
		imdone.processFiles([path]);
	}

	//Pause processing for all files that have tasks in the list
	var list = _.where(imdone.getSortedLists(),{name:to})[0];
	//Move the task to the correct position in the array by removing it then inserting in the correct position
	var removedTask = task;
	list.tasks = _.reject(list.tasks, function(task) {
		if (task.path == path && task.pathTaskId == pathTaskId) {
			removedTask = task;
			return true;
		} else {
			return false;
		}
	});
	list.tasks.splice(pos, 0, removedTask);

	//Change the order of all the tasks in the new list
	var order = 0;
	_.each(list.tasks, function(task) {
		imdone.pause(task.path);
		//open the file and change the order of the tasks
		imdone.modifyTask(task, {order:order});
		order += 10;
	});

	//unpause all paths in the list
	_.each(list.tasks, function(task) {
		if (imdone.isPaused(task.path)) {
			imdone.unpause(task.path);
		}
	});
	return imdone.getSortedLists();
};

imdone.modifyTask = function(task, changes) {
	task = _.extend(task, changes);
	var data = fs.readFileSync(task.path, 'utf8');
	var n = 0;
	data = data.replace(taskregx, function(md, text, list, order) {
		if (n == task.pathTaskId) {
			md = "[" + text + "](#" + task.list + ":" + task.order + ")";
		} 
		n++;
		return md;
	});

	fs.writeFileSync(task.path, data, 'utf8');
};

imdone.processFiles = function(files, callback) {
	try {
		imdone.processing = true;
		_.each(files, function(file, i) {
			if (imdone.config.include.test(file) == true && imdone.config.exclude.test(file) == false && !fs.statSync(file).isDirectory()) {
				console.log("Extracting tasks from file: " + file);
				//for each file get the tasks
				var data = fs.readFileSync(file, 'utf8');
				var id = 0;
				var lastUpdate = new Date(fs.statSync(file).mtime);
				delete imdone.tasks[file];
				data.replace(taskregx, function(md, text, list, order) {
					if (imdone.tasks[file] == undefined) imdone.tasks[file] = {lastUpdate:lastUpdate,tasks:{}};
					imdone.lastUpdate = lastUpdate;
					var task = {
						path:file,
						url: imdone.getURL(file),
						md:md,
						text:marked(text),
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
				imdone.saveListData();
				imdone.processing = false;
				//check to see if files still exist
				//console.log("tasks:" + JSON.stringify(imdone.tasks, null, "   "));
				if (callback) callback();
			}
		});
	} catch(e) {
		console.log(e.message);
		imdone.processing = false;
	}
};

imdone.update = function(files) {
	_.each(files, function(file) {
		if (!imdone.isPaused(file)) {
			//[Store last updated time, and check to see if we should process](#done:0)
			imdone.processFiles([file]);	
		}
	});
};

imdone.pause = function(file) {
	console.log("***Pausing: " + file);
	imdone.pause[file] = true;
};

imdone.isPaused = function(file) {
	return imdone.pause[file] != undefined;
}

imdone.unpause = function(file) {
	if (imdone.pause[file]) {
		console.log("***Unpausing: " + file);
		imdone.processFiles([file]);
		delete imdone.pause[file];
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
	            console.error('an error occured:', err);
	        },
	        watching: function(err,watcherInstance,isWatching){
	            //console.log('a new watcher instance finished setting up', arguments);
	            console.log('a new watcher instance finished setting up');
	        },
	        change: function(changeType,filePath,fileCurrentStat,filePreviousStat){
	            //console.log('a change event occured:',arguments);
	            console.log("an " + changeType + " occured on " + filePath);
	            if (filePath.match(imdone.config.exclude) != null) return;
	            switch(changeType) {
	            	case "update":
	            		var process = true;
	            		if (imdone.tasks[filePath]) {
	            			var lastModified = new Date(fileCurrentStat.mtime);
	            			if (lastModified > imdone.tasks[filePath].lastUpdate) {
	            				process = true;
	            			} else {
	            				process = false;
	            			}
	            		}
	            		if (process == true) imdone.update([filePath]);
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
	        console.log('watching for all our paths has completed');
	        //console.log('watching for all our paths has completed', arguments);
	    }
	});

};

imdone.cli = function() {
	// Get the current directory
	var cwd = process.cwd();
	console.log("cwd:" + cwd);
	console.log("args:" + process.argv);
	//[We want to accept a root directory as an argument](#todo:20)
	imdone.start(".");

};

imdone.start = function(dir) {
	imdone.root = dir;
	imdone.tasks = {};
	imdone.initConfig();
	imdone.loadListData();
	imdone.cwd = process.cwd();
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

	marked.setOptions(imdone.config.marked);

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
	
	//console.log("currentLists:" + JSON.stringify(currentLists, null, 2));


	var intersection = _.intersection(imdone.lists, currentLists);

	//console.log("Intersection:" + JSON.stringify(intersection, null, 2));


	imdone.lists = _.union(intersection, currentLists);
	
	console.log("Saving list data: " + JSON.stringify(imdone.lists, null, 2));
	fs.writeFileSync(imdone.dataFile, JSON.stringify(imdone.lists, null, 2), 'utf8');
};
