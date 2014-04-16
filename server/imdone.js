/*
 * imdone
 * https://github.com/piascikj/imdone
 *
 * Copyright (c) 2012 Jesse Piascik
 * Licensed under the MIT license.
 */
//ARCHIVE:210 Implement hide functionality to hide a list from board
// Nodejs libs.
var fs               = require('fs');
var path             = require('path');
var events           = require('events');
var program          = require("commander");
var wrench           = require('wrench');
var _                = require('lodash');
var watchr           = require('watchr');
var marked           = require('marked');
var open             = require('open');
var request          = require('request');
var express          = require('express');
var bodyParser       = require('body-parser');
var cookieParser     = require('cookie-parser');
var http             = require('http');
var mkdirp           = require('mkdirp');
var server           = require("./server");
var tasks            = require("./tasks");
var languages        = require("./util/languages");
var isBinaryFileSync = require("isbinaryfile");
var async            = require("async");
var core             = require("imdone-core");
var Repo             = core.Repository;
var Project          = core.Project;
var tools            = core.Tools;
var sanitize

var imdone = module.exports = {pause:{}};
var pkginfo = require('pkginfo')(module);

_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};

imdone.config = {
  port: process.env.IMDONE_PORT || 8080,
  cliPort: process.env.IMDONE_CLI_PORT || 8899
};

imdone.projects = {};

imdone.server = server;

/*
  `imdone` will add the current working directory to imdone projects and start imdone if not already up
  `imdone stop` will stop imdone
*/
imdone.startFromCLI = function(dir) {
  program
  .usage("[options]")
  .version(imdone.version)
  .option('-o, --open', 'Open imdone in the default browser')
  .option('-s, --stop', 'Stop imdone server')
  .option('-d, --dirs <directories>', 'A comma separated list of project directories', function list(val) {
    return val.split(',');
  });

  program.on('--help', function(){
    console.log('  Examples:');
    console.log('');
    console.log('    Open imdone in a browser with the current working directory as the project root');
    console.log('');
    console.log('    $ imdone -o');
    console.log('');
    console.log('    Open imdone in a browser with list of project directories');
    console.log('');
    console.log('    $ imdone -o -d projects/imdone,projects/myproject');
  });

  console.log("  _   __  __   _____                         ");
  console.log(" (_) |  \\/  | |  __ \\                        ");
  console.log("  _  | \\  / | | |  | |   ___    _ __     ___ ");
  console.log(" | | | |\\/| | | |  | |  / _ \\  | '_ \\   / _ \\");
  console.log(" | | | |  | | | |__| | | (_) | | | | | |  __/");
  console.log(" |_| |_|  |_| |_____/   \\___/  |_| |_|  \\___|");

  program.parse(process.argv);

  var dirs = _.map(program.dirs || [dir], function(dir) { return path.resolve(dir); } );
  
  if (program.stop) {
    imdone.cliStop();
  } else {
    imdone.start(dirs, program.open);
  }
};

imdone.start = function(dirs, open, cb) {
  imdone.checkCLIService(function() {
    console.log("iMDone service is already running!");
    if (open) imdone.cliOpen();
    if (_.isFunction(cb)) cb();
    _.each(dirs, function(d) {
      imdone.cliAddProject(d);
    });
  }, function() {
    imdone.startCLIService(function() {
      if (open) imdone.cliOpen();
      if (_.isFunction(cb)) cb();
      _.each(dirs, function(d) {
        imdone.addProject(d);
      });
    });
  });
};

// PLANNING:0 Use axon-rpc for cli service and move to it's own module
imdone.startCLIService = function(callback) {
  //Start a service on 8899 for cli to interact with
  //Access imdone data through getters and setters that require project path
  var app = imdone.cliService = express();
  var xserver = http.createServer(app);
  app.use(cookieParser());
  app.use(bodyParser());

  //Start the api and static content server
  app.get("/cli", function(req, res) {
    res.send({ok:imdone.up});
  });
  app.post("/cli/project", function(req, res) {
    res.send(imdone.addProject(req.body.cwd));
  });
  app.delete("/cli/project", function(req, res) {
    res.send(imdone.removeProject(req.body.cwd));
  });
  app.post("/cli/stop", function(req, res) {
    res.send({ok:true});
    process.exit();
  });
  app.post("/cli/open", function(req, res) {
    open('http://localhost:' + imdone.config.port);
    res.send({ok:true});
  });

  xserver.on('listening', function() {
    imdone.up = true;
    if (callback) callback();
  });
  xserver.listen(imdone.config.cliPort);

  server.start(imdone);
};

imdone.cliOpen = function() {
  request.post({
    url:"http://localhost:" + imdone.config.cliPort + "/cli/open"
  }, function(error, res, body) {
    if (!res) {
      console.log("failed to open browser");
    }
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
      console.log('Added project:', body.path);
    }
  });

};

imdone.cliRemoveProject = function(dir) {
  request.delete({
    url:"http://localhost:" + imdone.config.cliPort + "/cli/project",
    json:{cwd:dir}
  }, function(error, res, body) {
    if (!res) {
      console.log("failed to remove project");
    } else {
      console.log('Removed project:', body.path);
    }
  });

};

imdone.cliStop = function() {
  request.post({
    url:"http://localhost:" + imdone.config.cliPort + "/cli/stop"
  }, function(error, res, body) {
    if (!res) {
      console.log("failed to stop imdone service");
    } else {
      console.log("imdone service has been stopped");
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
      success();
    }
  });
};

imdone.addProject = function(dir) {
  console.log("Adding project at:" + dir);
  var name = dir.split(path.sep).join("-");
  if (imdone.projects[name]) delete imdone.projects[name];
  var repo = new Repo(dir);
  var project = imdone.projects[name] = new Project(tools.user(), name, [repo]);
  project.init();

  return imdone.getProject(name);
};

imdone.removeProject = function(dir) {
  console.log("Removing project at:" + dir);
  if (imdone.projects[dir]) delete imdone.projects[dir];
  imdone.emitter.emit("project.removed", {project:dir});
};

imdone.getProject = function(name) {
  return imdone.projects[name] || {};
};

imdone.getProjects = function() {
  return _.keys(imdone.projects);
};

imdone.emitter = new events.EventEmitter();

/*

  This is the Project class

*/

imdone.Project = function(path) {
  events.EventEmitter.call(this);
  this.id = this.cwd = this.path = path;
  this.tasks = {};
  this.config = {};
};

imdone.Project.prototype.__proto__ = events.EventEmitter.prototype;

imdone.Project.prototype.emitModified = function(files) {
  var self = this;
  this.emit('modified', {files:files, project:self});
  imdone.emitter.emit('project.modified', {project:self.path});
};

imdone.Project.prototype.emitInitialized = function() {
  var self = this;
  this.emit('initialized', {project:self});
  imdone.emitter.emit('project.initialized', {project:self.path});
};

imdone.Project.prototype.init = function() {
  var self = this;
  console.log("Initializing project:" + this.path);
  this.initConfig(function() {

    self.config.cwd = self.cwd;

    self.loadListData(function() {

      console.log(self.path);
      self.processFiles(wrench.readdirSyncRecursive(self.path), function() {
        //set up watcher
        self.watchFiles(self.path);
        self.emitInitialized();
      });
    });
  });
};

imdone.Project.prototype.getURL = function(file, line) {
  return "/api/source" + this.path + "?path=" + file + "&line=" + line;
};

imdone.Project.prototype.location = function() {
  return "local";
};

imdone.Project.prototype.getReadme = function() {
  var files = fs.readdirSync(this.path);
  var readme;
  _.each(files, function(file) {
    if (/(README|HOME)\.(MD|MARKDOWN)/.test(file.toUpperCase())) readme = file; 
  });
  return readme;
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
    if (_.contains(self.hidden, list)) {
      listObj.hidden = true;
    } else {
      listObj.tasks = _.sortBy(tasks, "order");
    }
    out.push(listObj);
  });

  out = _.sortBy(out, function(listObj) {
    return _.indexOf(self.lists,listObj.name);
  });

  return out;  
};

// ARCHIVE:0 renameList is not renaming list for all tasks in list
imdone.Project.prototype.renameList = function(request) {
  var self = this;
  var name = request.name;
  var newName = request.newName;
  var pos = _.indexOf(this.lists, name);
  var list = _.where(this.getSortedLists(),{name:name})[0];

  // replace the list name
  var lists = _.without(this.lists, name, newName);
  lists.splice(pos,0,newName);
  this.lists = lists;

  // modify the files
  var files = [];
  var paths = _.uniq(_.pluck(list.tasks, "path"));
  _.each(paths, function(path) {
    self.tasks[path] = [];
    var fullPath = self.fullPath(path);
    self.pause(path);
    var file = {fullPath: fullPath, content:fs.readFileSync(fullPath, "utf8"), path:path};
    files.push(file);
    tasks.modifyListName(file, name, newName);
    fs.writeFileSync(fullPath, file.content, "utf8");
    self.unpause(path);
  });
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
  var pos = parseInt(request.position, null);
  var lists = _.without(this.lists, list);
  lists.splice(pos, 0, list);
  this.lists = lists;
  this.saveListData();
  return this.lists;
};

imdone.Project.prototype.hideList = function(request) {
  var list = request.list;
  console.log("Hiding list:" + list);
  this.hidden.push(list);
  this.hidden = _.uniq(this.hidden);
  this.lastUpdate = new Date();
  this.saveListData();
  return this.hidden;
};

imdone.Project.prototype.showList = function(request) {
  var list = request.list;
  this.hidden = _.without(this.hidden, list);
  this.lastUpdate = new Date();
  this.saveListData();
  return this.hidden;
};

// ARCHIVE:140 Move multiple tasks in sequence
imdone.Project.prototype.moveTasks = function(request, callback) {
  var self = this;
  var funcs = [];
  _.each(request, function(val) {
    funcs.push(function(cb) {
      self.moveTask(val, cb(null));
    });
  });
  async.series(funcs,
  function(err, results){
    if (_.isFunction(callback)) callback();
  });
};

imdone.Project.prototype.moveTask = function(request, callback) {
  var self = this;
  var path = request.path;
  var from = request.from;
  var to = request.to;
  var pos = parseInt(request.pos, null);
  var pathId = parseInt(request.pathId, null);

  //Get the current task from the data
  var pathObj = this.tasks[path],
    task = pathObj.tasks[pathId];

  task.list = to;
  
  if (_.indexOf(this.lists, to) < 0) this.lists.push(to);
  //console.log("------------------Moving Task---------------------");
  //console.log(JSON.stringify(task, null, 3));

  var lists = self.getSortedLists();
  var toList = _.findWhere(lists, {name:to});

  //move the task to the correct position in the list
  toList.tasks = _.reject(toList.tasks, function(task) {
    return task.pathId === pathId && task.path === path;
  });
  toList.tasks.splice(pos,0,task);
  //console.log(JSON.stringify(toList, null,3));

  var files = {};
  //Modify the tasks and files in current list
  _.each(toList.tasks, function(task, index) {
    var fullPath = self.fullPath(task.path);
    //Read the file if we don't have it yet
    if (!files[task.path]) {
      self.pause(task.path);
      files[task.path] = fs.readFileSync(fullPath, "utf8");
    }
    
    task.order = index*10;
    //console.log("modifying task:" + JSON.stringify(task, null,3));
    files[task.path] = self.modifyTask(files[task.path], task);
  });  

  //If task was moved to a new list, modify the old
  //console.log("\nModify the old list\n");
  if (to !== from) {
    var fromList = _.findWhere(lists, {name:from});
    fromList.tasks = _.reject(fromList.tasks, function(task) {
      return task.pathId === pathId && task.path === path;
    });
    _.each(fromList.tasks, function(task, index) {
      var fullPath = self.fullPath(task.path);
      //Read the file if we don't have it yet
      if (!files[task.path]) {
        self.pause(task.path);
        files[task.path] = fs.readFileSync(fullPath, "utf8");
      }
      
      task.order = index*10;
      files[task.path] = self.modifyTask(files[task.path], task);
    });
  }

  //write all files and unpause
  _.each(files, function(data, path) {
    fs.writeFileSync(self.fullPath(path), data, "utf8");
    if (self.isPaused(path)) self.unpause(path);
  });

  this.emitModified(files);

  //process all files
  var fileNames = _.keys(files);
  self.processFiles(fileNames, function() {
    if (_.isFunction(callback)) callback();
  });

};

imdone.Project.prototype.relativePath = function(file) {
  return file.replace(this.path + "/", "");
};

imdone.Project.prototype.fullPath = function(file) {
  if (file.indexOf(this.path) < 0) file = this.path + "/" + file;
  return file;
};


imdone.Project.prototype.modifyTask = function(data,task) {
  var file = {content:data, path:task.path};

  tasks.modifyTask(file, task);

  return file.content;
};

// ARCHIVE:750 Add includeFiles, excludeFiles, includeDirs, excludeDirs to config
imdone.Project.prototype.shouldProcessFile = function(file) {
  var relPath = this.relativePath(file);
  if (!(new RegExp(this.config.include)).test(relPath)) return false;
  if ((new RegExp(this.config.exclude)).test(relPath)) return false;
  if (isBinaryFileSync(file)) return false;
  return true;
};

imdone.Project.prototype.shouldProcessDir = function(file) {
  var relPath = this.relativePath(file) + "/";
  if (!this.config.include.test(relPath)) return false;
  return !this.config.exclude.test(relPath);
};

imdone.Project.prototype.filesToProcess = function(files, showDirs) {
  var self = this;
  var passed = [];

  _.each(files, function(file, i) {
    file = self.fullPath(file);
    var relPathFile = self.relativePath(file);
    //console.log(relPathFile);
    var stat = fs.statSync(file);

    if (stat && stat.isFile()) {
      if (self.shouldProcessFile(file)) passed.push(file);
    } else if (stat && stat.isDirectory()) {
      if (showDirs && self.shouldProcessDir(file)) passed.push(file);
    }
  });

  return passed;
};

imdone.Project.prototype.getFiles = function(path) {
  var self = this,
      out = {},
      sub = false;

  if (path) {
    sub = true;
  } else {
    path = this.path;
  }
  
  var files =  fs.readdirSync(path);

  if (sub) {
    _.each(files, function(val,i) {
      files[i] = path + "/" + val;
    });
  }

  files = self.filesToProcess(files,true).sort();
  if (!sub) out.path="/";
  _.each(files, function(file) {
    var name = file.split("/").pop();
    var relPath = self.relativePath(file);
    if (fs.statSync(file).isDirectory()) {
      if(!out.dirs) out.dirs = [];
      out.dirs.push(_.extend({name:name,path:relPath},self.getFiles(file)));
    } else {
      if(!out.files) out.files = [];
      out.files.push({name:name,path:relPath,project:self.path});
    }
  });
  return out;
};

imdone.Project.prototype.processFiles = function(files, callback) {
  try {
    var self = this;
    files = this.filesToProcess(files);
    //console.log("Processing files:", files);

    var remaining = _.without(files);
    var isComplete = function(val) {
      remaining = _.without(remaining, val);
      //console.log("fles left to process:" + remaining.length);
      self.processing = (remaining.length > 0);
      return !self.processing;
    };

    _.each(files, function(file, i) {
      self.processing = true;
      var fullPathFile = self.fullPath(file);
      var relPathFile = self.relativePath(file);
      //console.log("Extracting tasks from file: " + fullPathFile);
      //for each file get the tasks
      //ARCHIVE:760 Make this an async file read
      var data = fs.readFile(fullPathFile, 'utf8', function (err, data) {
        if (err) {
          console.log("Unable to open file:", err);
          return;
        }
        var lastUpdate = new Date(fs.statSync(fullPathFile).mtime);
        delete self.tasks[relPathFile];
        self.tasks[relPathFile] = {lastUpdate:lastUpdate};
        self.lastUpdate = lastUpdate;

        self.tasks[relPathFile].tasks = tasks.getTasks(data, file, function(task) {
          _.extend(task, {
            path:relPathFile,
            project:self.path,
            location: self.location(),
            url: self.getURL(relPathFile, task.line),
            lastUpdate:lastUpdate
          });

          return task;
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
      //ARCHIVE:770 Store last updated time, and check to see if we should process - 0.1.3
      self.processFiles([file], function() {
        self.emitModified([file]);
      });  
    }
  });
};

imdone.Project.prototype.pause = function(file) {
  console.log("***Pausing: " + file);
  this.pause[file] = true;
};

imdone.Project.prototype.isPaused = function(file) {
  return this.pause[file] !== undefined;
};

imdone.Project.prototype.unpause = function(file) {
  if (this.pause[file]) {
    console.log("***Unpausing: " + file);
    this.processFiles([file]);
    delete this.pause[file];
  }
};

imdone.Project.taskHtmlTemplate = '<span class="label label-info task-label">{{list}}</span>' +
      '{{head}}{{href}}{{tail}} class="task-link" data-list="{{list}}"> <span class="task-content">{{content}}</span>{{end}}';

imdone.Project.prototype.taskHtml = function(opts) {
  return _.template(imdone.Project.taskHtmlTemplate, opts);
};

imdone.Project.prototype.getFileHref = function(path, line, preview) {
  if (_.isObject(preview)) preview = undefined;
  if (_.isObject(line)) line = undefined;
  if (line && isNaN(line)) preview = line;
  project = encodeURIComponent(this.id);
  path = encodeURIComponent(path);
  var href = _.template('#file/{{project}}/{{path}}',{project:project, path:path});
  if (line) href+= ("/" + line);
  if (preview) href += "/true";
  return href;
};

imdone.Project.prototype.md = function(path, cb) {
  var self = this;
  this.getSource(path,undefined, function(file) {
    md = file.src;
    var html = marked(md);
    var links = /(<a.*?href=")(.*?)(".*?)>(.*)(<\/a>)/ig,
        externalLinks = /^http/,
        mailtoLinks = /^mailto/,
        taskLinks = /#([\w\-]+?):(\d+?\.{0,1}\d*?)/,
        filterLinks = /#filter\//,
        inPageLinks = /^#.*$/,
        gollumLinks = /(\[\[)(.*?)(\]\])/ig;
    // Replace any script elements
    html = html.replace(/<script.*?>([\s\S]*?)<\/.*?script>/ig,"$1").replace(/(href=["|'].*)javascript:.*(["|'].?>)/ig,"$1#$2");
    // Make all links with http open in new tab
    // ARCHIVE:600 For markdown files, find tasks links and give them a badge
    // ARCHIVE:60 For internal inks, take them to the page
    var replaceLinks = function(anchor, head, href, tail, content, end) {
      if (links.test(content)) content = content.replace(links, replaceLinks);
      var out = html;
      // Check for external links
      if (externalLinks.test(href)) {
        out = head + href + tail + ' target="_blank">' + content + end;
      // Check for task links
      } else if (taskLinks.test(href)) {
        var list;
        href.replace(taskLinks, function(href, taskList, order) {
          list = taskList;
          out = href;
        });
        out = self.taskHtml({
          list:list,
          head:head,
          href:href,
          tail:tail,
          content:content,
          end:end
        });
      // Check for filter links
      } else if (filterLinks.test(href)) {
        var filterBy = href.split("/")[1];
        out = head + href + tail + ' title="Filter by ' + filterBy + '">' + content + end;   
      // Check for mailto links
      } else if (mailtoLinks.test(href)) { // || mailtoLinks.test($('<div />').html(href).text())) {
        out = anchor;
      // If not an in page link then it must be a link to a file
      } else if (!inPageLinks.test(href)) {
        var preview = (/.*\.md$/.test(href)) ? true : false;
        out = head + self.getFileHref(href,preview) + tail + '>' + content + end;
      }

      return out;
    }

    html = html.replace(links, replaceLinks);

    // Replace all gollum links
    html = html.replace(gollumLinks, function(link, open, name, close) {
      var file = name;
      if (/\|/.test(name)) {
        var pieces = name.split("|");
        file = pieces[1];
        name = pieces[0];
      }
      var file = file.replace(/(\s)|(\/)/g,"-") + ".md";
      var href = self.getFileHref(file,true);
      return '<a href="{}">{}</a>'.tokenize(href, name);
    });
    return cb(html);
  });
};

// ARCHIVE:780 add hook to saveSource    
imdone.Project.prototype.saveSource = function(path, src, callback) {
  var project = this;
  var filePath = project.path + "/" + path;

  if (project.path && !/\.\.\//.test(path)) {
    fs.writeFile(filePath, src, 'utf8', function(err, data) {
      if (err) {
        callback({error:"Unable to save source"});
        return;
      }
      var files = {};
      files[filePath] = src;
      project.processFiles([path],function() {
        project.emitModified(files);
        callback({path:path, ok:1});
      });
    });
  } else {
    callback({error:"Unable to get source"});
    return;
  }
};

imdone.Project.prototype.getSource = function(path, line, callback) {
  var project = this;
  var lang = "text";
  var pat = /\.([0-9a-z]{1,5})$/i; //Pattern to match file extension
  if (path.match(pat) !== null) lang = path.match(pat)[1];
  if (project.path && !/^\.\./.test(path) && !/\/$/.test(path)) {
    var filePath = project.path + "/" + path;

    //ARCHIVE:150 Make sure this source file is in one of the projects paths
    if (fs.existsSync(filePath)) {
      fs.readFile(filePath, 'utf-8', function(err,data) {
        if (err) {
          callback({error:"Unable to get source"});
          return;
        }

        callback({
          src:data, 
          line:line,
          lang:lang,
          project:project.path,
          path:path
        });
      });
    } else {
      var pathAry = filePath.split("/");
      var name = pathAry.pop();
      var dir = pathAry.join("/");
      // console.log(dir);
      // console.log(name);
      mkdirp(dir, function (err) {
        if (err) {
          callback({error:"Unable to get source"});
        } else {
          fs.writeFile(filePath, "", function(err) {
              if(err) {
                callback({error:"Unable to get source"});
              } else {
                callback({
                  src:"", 
                  line:0,
                  lang:lang,
                  project:project.path,
                  path:path
                });
              }
          }); 
        }
      });  

    }
  } else {
    callback({error:"Unable to get source"});
    return;
  }

}

imdone.Project.prototype.watchFiles = function(path) {
  //ARCHIVE:160 Test watchr on hundreds of directories
  var self = this;
  watchr.watch({
      path: path,
      ignoreCommonPatterns:true,
      //ARCHIVE:170 Use ignoreCustomPatterns
      ignoreCustomPatterns:self.config.exclude,
      listeners: {
          /*
          log: function(logLevel){
              console.log('a log message occured:', arguments);
          },
          */
          error: function(err){
              if (err) console.error('an error occured:', err);
          },
          watching: function(err,watcherInstance,isWatching){
              //console.log('a new watcher instance finished setting up', arguments);
              console.log('A new watcher instance finished setting up for project:', path);
          },
          change: function(changeType,filePath,fileCurrentStat,filePreviousStat){
              //console.log('a change event occured:',arguments);
              console.log("An " + changeType + " occured on " + filePath);
              var stat = fileCurrentStat || filePreviousStat;
              if (!stat) return;
              if (!stat.isFile() && !stat.isDirectory()) return;
              else if (stat.isFile() && !self.shouldProcessFile(filePath)) return;
              else if (stat.isDirectory() && !self.shouldProcessDir(filePath)) return;

              switch(changeType) {
                case "update":
                  console.log("Processing update to:",filePath);
                  var process = true;
                  if (self.tasks[filePath]) {
                    var lastModified = new Date(fileCurrentStat.mtime);
                    if (lastModified > self.tasks[filePath].lastUpdate) {
                      process = true;
                    } else {
                      process = false;
                    }
                  }
                  if (process) self.update([filePath]);
                  break;
                case "create":
                  console.log("Processing create of:",filePath);
                  self.processFiles([filePath], function() {
                    self.lastUpdate = new Date();
                    self.emitModified([file]);
                  });
                  break;
                case "delete":
                  console.log("Processing delete of:",self.relativePath(filePath));
                  delete self.tasks[self.relativePath(filePath)];
                  self.lastUpdate = new Date();
                  self.saveListData();
                  break;
              }
          }
      },
      next: function(err,watchers){
          console.log('watching for all our paths has completed for project:', path);
          //console.log('watching for all our paths has completed', arguments);
      }
  });

};

/*
  - [Modify $HOME/.imdone/config.js to edit the project directories watched by imdone](#todo:90)
  - [Modify process.env to contain the port info for cliService](#archive:220)

*/
imdone.Project.prototype.initConfig = function(callback) {
  this.dataDir = this.path + "/.imdone";
  var self = this;

  //Rename legacy data dir if it exists
  var legacyDataDir = this.path + "/imdone";
  if (fs.existsSync(legacyDataDir)) {
    fs.renameSync(legacyDataDir, this.dataDir);
  }

  //Check for the imdone directory
  if (!fs.existsSync(this.dataDir)) fs.mkdirSync(this.dataDir);

  this.configFile = this.dataDir + "/config.js";
  this.defaultConfig = "./config";
  
  //Extend the default config
  var config = require(this.defaultConfig);
  this.config = _.extend({}, config);

  //Create config if it doesn't exist 
  if (!fs.existsSync(this.configFile)) {
    var defaultConfigPath = require.resolve(this.defaultConfig);
    var inStr = fs.createReadStream(defaultConfigPath);
    var outStr = fs.createWriteStream(this.configFile);
    console.log("copying " + defaultConfigPath + " to " + this.configFile);
    inStr.pipe(outStr);
  }

  _.extend(this.config,require(this.configFile));

  //set marked options
  marked.setOptions(this.config.marked);

  //setup event listeners
  _.each(this.config.events, function(listener, event) {
    console.log("registering listener for: ", event);
    self.on(event, listener);
  });

  this.config.lists = this.config.lists || [];
  this.config.path = this.path;
  console.log("Loaded config:" + JSON.stringify(this.config, function(key, val) {
    if (/(include|exclude)/.test(key) || _.isFunction(val)) {
      return val.toString();
    } else {
      return val;
    }
  }, 3));

  this.dataFile = this.dataDir + "/data.js";

  if (callback) callback();

};

imdone.Project.prototype.loadListData = function(callback) {
  var self = this;
  this.lists = [];
  //Get the lists from the data file
  fs.exists(this.dataFile, function(exists) {
    if (exists) {
      fs.readFile(self.dataFile, 'utf8', function(error, data) {
        self.config.lists = self.config.lists || [];
        var fileData  = JSON.parse(data);
        if (_.isArray(fileData)) {
          //for backward compatability
          self.lists = fileData;
        } else if (_.isObject(fileData)) {
          self.lists = fileData.lists;
          self.hidden = fileData.hidden || [];
        }
        //printjson(imdone.lists);
        if (callback) callback();
      });
    } else {
      if (callback) callback();
    }
  });
};

imdone.Project.prototype.saveListData = function() {
  var self = this;
  var currentLists = this.lists;

  _.each(self.tasks, function(fileTasks, file){
    _.each(fileTasks.tasks,function(task, id) {
      if (!_.contains(currentLists, task.list)) {
        console.log("Adding list from task:", task);
        currentLists.push(task.list);
      }
    });
  });
  
  //console.log("currentLists:" + JSON.stringify(currentLists, null, 2));


  var intersection = _.intersection(this.lists, currentLists);

  //console.log("Intersection:" + JSON.stringify(intersection, null, 2));

  this.lists = _.union(intersection, currentLists);
  this.hidden = this.hidden || [];
  //now find the hidden lists that aren't in the lists and remove them from both
  var defunct = _.difference(self.hidden, self.lists);
  if (defunct.length > 0) {
    console.log("Defunct hidden lists:" + JSON.stringify(defunct, null, 2));
    _.each(defunct, function(list) {
      console.log("Removing " + list + " from hidden lists.");
      self.hidden = _.without(self.hidden, list);
    });
  }

  var fileData = {lists:self.lists, hidden:self.hidden};

  var exists = fs.existsSync(self.dataFile)
  var currentFileData;
  if (exists) currentFileData = JSON.parse(fs.readFileSync(self.dataFile, 'utf8'));

  if (!_.isEqual(fileData,currentFileData)) {
    var fileDataSrc = JSON.stringify(fileData, null, 2);
    console.log("Saving iMDone data: " + fileDataSrc);
    console.log(self.dataFile);
    fs.writeFileSync(self.dataFile, fileDataSrc, 'utf8');

    var files={}; files[self.dataFile]=fileDataSrc; self.emitModified(files);
  }

};
