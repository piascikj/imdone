/*
 * imdone
 * https://github.com/piascikj/imdone
 *
 * Copyright (c) 2012 Jesse Piascik
 * Licensed under the MIT license.
 */
//[Implement hide functionality to hide a list from board](#doing:0)
// Nodejs libs.
var fs = require('fs');
var wrench = require('wrench');
var _ = require('underscore');
var watchr = require('watchr');
var marked = require('marked');
var open = require('open');
var request = require('request');
var express = require('express');
var path = require('path-extra');
var git = require('./git');

var imdone = module.exports = {pause:{}};

imdone.config = {
	port:8080,
	cliPort:8899
};

imdone.projects = {};

/*
	`imdone` will add the current working directory to imdone projects and start imdone if not already up
	`imdone stop` will stop imdone

	- [Modify $HOME/.imdone/config.js to edit the project directories watched by imdone](#todo:30)
*/
imdone.start = function(dir, args) {
	console.log(args);

	var arg = args[2];
	if (arg == "stop") {
		imdone.cliStop();
	} else {
		imdone.checkCLIService(function() {
			console.log("iMDone service is already running!")
			imdone.cliAddProject(dir);
		}, function() {
			imdone.startCLIService();
			imdone.addProject(dir);
		});
	}
};

imdone.startCLIService = function() {
	//Start a service on 8899 for cli to interact with
	//Access imdone data through getters and setters that require project path
	var app = imdone.cliService = express.createServer();
	app.use(express.cookieParser());
	app.use(express.bodyParser());

	//Start the api and static content server
	app.get("/cli", function(req, res) {
		res.send({ok:imdone.up});
	});
	app.post("/cli/project", function(req, res) {
		res.send(imdone.addProject(req.body.cwd));
	});
	app.post("/cli/stop", function(req, res) {
		res.send({ok:true});
		process.exit();
	});
	
	app.on('listening', function() {
		imdone.up = true;
	});
	app.listen(imdone.config.cliPort);

	require("./server").start(imdone, function() {
		open('http://localhost:' + imdone.config.port);
	});
};

imdone.cliAddProject = function(dir) {
	request.post({
		url:"http://localhost:" + imdone.config.cliPort + "/cli/project",
		json:{cwd:dir}
	}, function(error, res, body) {
		if (!res) {
			console.log("failed to add project");
		} else {
			console.log(body);
		}
	});

};

imdone.cliStop = function() {
	request.post({
		url:"http://localhost:" + imdone.config.cliPort + "/cli/stop"
	}, function(error, res, body) {
		if (!res) {
			console.log("failed to stop service");
		} else {
			console.log(body);
		}
	});

};


imdone.checkCLIService = function(success, failure) {
	request.get({
		url:"http://localhost:" + imdone.config.cliPort + "/cli",
	}, function(error, res, body) {
		if (!res) {
			failure();
		} else {
			console.log(body);
			success();
		}
	});
};

imdone.addProject = function(dir) {
	imdone.projects[dir] = imdone.projects[dir] || new imdone.Project(dir);
	return imdone.projects[dir];
};

imdone.getProject = function(dir) {
	return imdone.projects[dir];
};

imdone.getProjects = function() {
	return _.keys(imdone.projects);
};

imdone.getLastUpdate = function() {
	return _.map(imdone.projects, function(project, key){ return {project:project.path, lastUpdate:project.lastUpdate} });
};

/*

	This is the Project class

*/

imdone.Project = function(path) {
	var self = this;
	this.path = path;
	this.tasks = {};
	this.initConfig( function() {
		self.loadListData(function() {
			self.cwd = self.path; //[Stop using process.cwd, use the path instead](#archive:10)

			if (self.config.github) self.github = new git.GitProject(self.config.github);
			
			self.processFiles(wrench.readdirSyncRecursive(self.path), function() {
				//set up watcher
				self.watchFiles(self.path);
			});
		});
	});
};

//[Fix task regex so that tasks that appear in markdown as code aren't displayed - 0.1.6](#archive:30)
imdone.Project.taskregx = /\[(.+?)\]\(#([\w-]+?):(\d+?\.{0,1}\d*?)\)/g;


imdone.Project.isCode = function(data,pos) {
	var done = false, code = false, char = "";
	
	for (i=pos-1; done == false;i--) {
		char = data.substring(i, i+1);
		if (/`/.test(char)) done = true, code = true;
		if (/\n/.test(char)) done = true;
		if (i <= 0) done = true;
	}
	return code;
};

imdone.Project.prototype.getURL = function(file, line) {
	if (this.github) {
		return this.github.getURL(file,line);
	} else {
		return file;
	}
};

imdone.Project.prototype.getSortedLists = function() {
	var lists = {}, out = [], self = this;
	_.each(this.lists, function(list) {
		lists[list] = [];
	});
	_.each(this.tasks, function(fileTasks, file){
		_.each(fileTasks.tasks,function(task, id) {
			var list = task.list;
			lists[list].push(task);
		});
	});

	_.each(lists, function(tasks, list) {
		var listObj = {name:list};
		listObj.tasks = _.sortBy(tasks, "order");
		out.push(listObj);
	});

	out = _.sortBy(out, function(listObj) {
		return _.indexOf(self.lists,listObj.name);
	});

	return out;	
}

imdone.Project.prototype.renameList = function(request) {
	var self = this;
	var name = request.name;
	var newName = request.newName;
	var pos = _.indexOf(this.lists, name);
	var list = _.where(this.getSortedLists(),{name:name})[0];
	//console.log(JSON.stringify(list, null, 3));
	
	_.each(list.tasks, function(task) {
		self.pause(task.path);
		//open the file and change the order of the tasks
		self.modifyTask(task, {list:newName});
	});

	//unpause all paths in the list
	_.each(list.tasks, function(task) {
		if (self.isPaused(task.path)) {
			self.unpause(task.path);
		}
	});

	var lists = _.without(this.lists, name, newName);
	lists.splice(pos,0,newName);
	this.lists = lists;
	this.saveListData();

	return imdone.lists;
};

imdone.Project.prototype.removeList = function(request) {
	var list = request.list;
	console.log("removing list:" + list);
	this.lists = _.without(this.lists, list);
	this.saveListData();
	return this.lists;
};

imdone.Project.prototype.moveList = function(request) {
	var list = request.list;
	var pos = parseInt(request.position);
	var lists = _.without(this.lists, list);
	lists.splice(pos, 0, list);
	this.lists = lists;
	this.saveListData();
	return this.lists;
};

imdone.Project.prototype.moveTask = function(request) {
	var self = this;
	var path = request.path;
	var from = request.from;
	var to = request.to;
	var lastUpdate = request.lastUpdate;
	var pos = parseInt(request.pos);
	var pathTaskId = parseInt(request.pathTaskId);

	//Get the current task from the data
	var pathObj = this.tasks[path];
	var task = pathObj.tasks[pathTaskId];

	//if the lastUpdate is different return need refresh
	if (new Date(lastUpdate) < pathObj.lastUpdate) {
		return {refresh:true};
	}


	//Change the list of the task
	if (to != from) {
		console.log("Moving task:" + JSON.stringify(task, null, 3));
		this.pause(path);
		this.modifyTask(task, {list:to});
		//process the file but leave it paused
		this.processFiles([path]);
	}

	//Pause processing for all files that have tasks in the list
	var list = _.where(this.getSortedLists(),{name:to})[0];
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
		self.pause(task.path);
		//open the file and change the order of the tasks
		self.modifyTask(task, {order:order});
		order += 10;
	});

	//unpause all paths in the list
	_.each(list.tasks, function(task) {
		if (self.isPaused(task.path)) {
			self.unpause(task.path);
		}
	});
	return this.getSortedLists();
};

imdone.Project.prototype.relativePath = function(file) {
	return file.replace(this.path + "/", "");
};

imdone.Project.prototype.fullPath = function(file) {
	if (file.indexOf(this.path) < 0) file = this.path + "/" + file;
	return file;
};


imdone.Project.prototype.modifyTask = function(task, changes) {
	task = _.extend(task, changes);
	var fullPath = this.fullPath(task.path);
	var data = fs.readFileSync(fullPath, 'utf8');
	var n = 0;
	data = data.replace(imdone.Project.taskregx, function(md, text, list, order) {
		if (n == task.pathTaskId) {
			md = "[" + text + "](#" + task.list + ":" + task.order + ")";
		} 
		n++;
		return md;
	});

	fs.writeFileSync(fullPath, data, 'utf8');
};

imdone.Project.prototype.filesToProcess = function(files) {
	var self = this;
	var passed = [];
	_.each(files, function(file, i) {
		file = self.fullPath(file);
		var relPathFile = self.relativePath(file);
		if (self.config.include.test(relPathFile) == true && self.config.exclude.test(relPathFile) == false && !fs.statSync(file).isDirectory()) {
			passed.push(file);
		}
	});

	return passed;
}

imdone.Project.prototype.processFiles = function(files, callback) {
	try {
		var self = this;
		files = this.filesToProcess(files);

		var remaining = _.without(files);
		var isComplete = function(val) {
			remaining = _.without(remaining, val);
			//console.log("fles left to process:" + remaining.length);
			self.processing = (remaining.length > 0);
			return !self.processing;
		}

		_.each(files, function(file, i) {
			self.processing = true;
			var fullPathFile = self.fullPath(file);
			var relPathFile = self.relativePath(file);
			console.log("Extracting tasks from file: " + fullPathFile);
			//for each file get the tasks
			//[Make this an async file read](#done:20)
			var data = fs.readFile(fullPathFile, 'utf8', function (err, data) {
				if (err) throw err;
				var id = 0;
				var lastUpdate = new Date(fs.statSync(fullPathFile).mtime);
				delete self.tasks[relPathFile];
				data.replace(imdone.Project.taskregx, function(md, text, list, order, pos) {
					if (!imdone.Project.isCode(data, pos)) {
						self.tasks[relPathFile] = self.tasks[relPathFile] || {lastUpdate:lastUpdate,tasks:{}};
						self.lastUpdate = lastUpdate;
						//[add the line number of the task by finding position and counting newlines prior - 0.1.4](#archive:60)
						//[Use line number when loading page in github - 0.1.4](#archive:50)
						var line = (data.substring(0,pos).match(/\n/g)||[]).length;
						if (line > 0) line++;
						var task = {
							path:relPathFile,
							url: self.getURL(relPathFile, line),
							md:md,
							text:marked(text),
							list:list,
							order:new Number(order),
							line:line,
							pathTaskId:id,
							lastUpdate:lastUpdate
						};
						self.tasks[relPathFile].tasks[id] = task;
						console.log("Found task:" + JSON.stringify(task, null, 3));
						id++;
					}
				});

				if (isComplete(file)) {
					self.saveListData();
					//check to see if files still exist
					//console.log("tasks:" + JSON.stringify(self.tasks, null, "   "));
					if (callback) callback();
				}
			});
		});
	} catch(e) {
		console.log(e.message);
		this.processing = false;
	}
};

imdone.Project.prototype.update = function(files) {
	var self = this;
	_.each(files, function(file) {
		if (!self.isPaused(file)) {
			//[Store last updated time, and check to see if we should process - 0.1.3](#archive:70)
			self.processFiles([file]);	
		}
	});
};

imdone.Project.prototype.pause = function(file) {
	console.log("***Pausing: " + file);
	this.pause[file] = true;
};

imdone.Project.prototype.isPaused = function(file) {
	return this.pause[file] != undefined;
}

imdone.Project.prototype.unpause = function(file) {
	if (this.pause[file]) {
		console.log("***Unpausing: " + file);
		this.processFiles([file]);
		delete this.pause[file];
	}
};

imdone.Project.prototype.watchFiles = function(path) {
	var self = this;
	watchr.watch({
    	path: path,
    	ignoreCommonPatterns:true,
    	//[Use ignoreCustomPatterns](#done:10)
    	ignoreCustomPatterns:self.config.exclude,
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
	            if (filePath.match(self.config.exclude) != null) return;
	            switch(changeType) {
	            	case "update":
	            		var process = true;
	            		if (self.tasks[filePath]) {
	            			var lastModified = new Date(fileCurrentStat.mtime);
	            			if (lastModified > self.tasks[filePath].lastUpdate) {
	            				process = true;
	            			} else {
	            				process = false;
	            			}
	            		}
	            		if (process == true) self.update([filePath]);
	            		break;
	            	case "create":
	            		self.processFiles([filePath]);
	            		break;
	            	case "delete":
				    	delete self.tasks[filePath];
				    	self.saveListData();
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

imdone.Project.prototype.initConfig = function(callback) {
	this.dataDir = this.path + "/imdone";
	var self = this;
	var doInit = function() {
		self.configFile = self.dataDir + "/config.js";
		self.defaultConfig = "./config";
		
		//Extend the default config
		self.config = require(self.defaultConfig);
		fs.exists(self.configFile, function(exists) {
			if (exists) {
				console.log("Found imdone config file:" + self.configFile);
				self.config = _.extend(self.config,require(self.configFile));
			} else {
				var defaultConfigPath = require.resolve(self.defaultConfig);
				var inStr = fs.createReadStream(defaultConfigPath);
				var outStr = fs.createWriteStream(self.configFile);
				console.log("copying " + defaultConfigPath + " to " + self.configFile);
				inStr.pipe(outStr);	
			}
			marked.setOptions(self.config.marked);

			self.config.lists = self.config.lists || [];

			console.log("config:" + JSON.stringify(self.config, null, 3));

			self.dataFile = self.dataDir + "/data.js";
			if (callback) callback();
		});
	};

	//Check for the imdone directory
	fs.exists(this.dataDir, function(exists) {
		if (exists) {
			doInit();
		} else {
			fs.mkdir(self.dataDir, doInit);
		}
	});
};

imdone.Project.prototype.loadListData = function(callback) {
	var self = this;
	this.lists = [];
	//Get the lists from the data file
	fs.exists(this.dataFile, function(exists) {
		if (exists) {
			fs.readFile(self.dataFile, 'utf8', function(error, data) {
				self.config.lists = self.config.lists || [];
				self.lists = JSON.parse(data);
				//printjson(imdone.lists);
				if (callback) callback();
			});
		} else {
			if (callback) callback();
		}
	});
};

imdone.Project.prototype.saveListData = function() {
	var currentLists = this.lists;
	var self = this;

	_.each(self.tasks, function(fileTasks, file){
		_.each(fileTasks.tasks,function(task, id) {
			if (!_.contains(currentLists, task.list)) currentLists.push(task.list);
		});
	});
	
	//console.log("currentLists:" + JSON.stringify(currentLists, null, 2));


	var intersection = _.intersection(this.lists, currentLists);

	//console.log("Intersection:" + JSON.stringify(intersection, null, 2));


	this.lists = _.union(intersection, currentLists);
	
	console.log("Saving list data: " + JSON.stringify(this.lists, null, 2));
	fs.writeFileSync(this.dataFile, JSON.stringify(this.lists, null, 2), 'utf8');
};
