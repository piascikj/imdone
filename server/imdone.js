/*
 * imdone
 * https://github.com/piascikj/imdone
 *
 * Copyright (c) 2012 Jesse Piascik
 * Licensed under the MIT license.
 */
//ARCHIVE:450 Implement hide functionality to hide a list from board
// Nodejs libs.
var fs               = require('fs');
var path             = require('path');
var events           = require('events');
var program          = require("commander");
var wrench           = require('wrench');
var _                = require('lodash');
var marked           = require('marked');
var open             = require('open');
var request          = require('request');
var express          = require('express');
var bodyParser       = require('body-parser');
var cookieParser     = require('cookie-parser');
var http             = require('http');
var server           = require("./server");
var Search           = require('imdone-core').Search;
var async            = require('async');
var Keen             = require('keen.io');
var tree             = require('./util/tree');
var log              = require('debug')('imdone:imdone');
var core             = require("imdone-core");
var Repo             = require('imdone-core/lib/watched-repository');
var Project          = require('imdone-core/lib/fs-project');
var tools            = core.Tools;
var sanitize;

var imdone = module.exports = {pause:{}};
var pkginfo = require('pkginfo')(module);
var PROJECT_NOT_FOUND = imdone.PROJECT_NOT_FOUND = "Project not found";
var DIR_NOT_FOUND = imdone.DIR_NOT_FOUND = "Directory not found";
var keen = Keen.configure({
              projectId: "5550efecd2eaaa7efde1f138",
              writeKey: "57032d04b2b29b693ef0e06aa3c7f295ead6daf33f51696b99dffdc1ad3e52898a22578b58a2f2138d370e626c497a93ecbb6629ec4dc6f7d4b34a64158121afeec493adef9a069b4385ead8861e852acd66489a049084e75dbb72e1cea5dfc0f584eac15dd91ca7a58c357656cb36eb"
            });

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

imdone.isInitialized = function() {
  return imdone.inititalized;
};

imdone.start = function(dirs, _open, noServer, cb) {
  keen.addEvent("imdone started", {
    openCLI: _open ? true :false
  }, function(err, result) {

  });

  if (_.isFunction(noServer)) {
    cb = noServer;
    noServer = null;
  }
  cb = _.isFunction(cb) ? cb : _.noop;

  if (imdone.isInitialized()) return cb();
  
  // Merge dirs with dirs in config
  dirs = _.union(imdone.getConfig().projects, dirs);

  function init() {
    // DONE:40 Should be able to start without server
    if (!noServer) server.start(imdone);
    var funcs = [];
    _.each(dirs, function(d) {
      funcs.push(function(cb) { imdone.addProject(d, cb); }); 
    });
    async.parallel(funcs, function(err, result) {
      log('All projects initialized');
      if (_open) open('http://localhost:' + imdone.config.port);
      imdone.initialized = true;
      cb(err, result);
    });
  }

  if (noServer) init();
  else {
    log('Begin initializing projects');
    imdone.checkCLIService(function() {
      console.log("iMDone service is already running!");
      if (_open) imdone.cliOpen();
      cb();
      _.each(dirs, function(d) {
        imdone.cliAddProject(d);
      });
    }, function() {
      imdone.startCLIService(function() {
        init();
      });
    });

  }
};

// PLANNING:80 Use axon-rpc for cli service and move to it's own module
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
    imdone.addProject(req.body.cwd, function(err, project) {
      res.send(project.getName());
    });
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
      console.log('Added project:', body);
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

imdone.addProject = function(dir, cb) {
  cb = _.isFunction(cb) ? cb : _.noop;
  var name = dir.replace(/^([A-Za-z]:(\\)?|\/?)/, "").split(path.sep).join("-");
  console.log("Adding project at:" + dir);
  if (imdone.projects[name]) delete imdone.projects[name];
  if (!fs.existsSync(dir)) wrench.mkdirSyncRecursive(dir);
  var repo = new Repo(dir);
  var project = imdone.projects[name] = new Project(tools.user(), name, [repo]);
  project.on('project.initialized', function(data) {
    imdone.emitter.emit('project.initialized', data);
  });
  project.on('project.modified', function(data) {
    imdone.emitter.emit('project.modified', data);
  });
  project.on('files.processed', function(data) {
    imdone.emitter.emit('files.processed', data);
  });
  project.init(function(err) {
    if (!err) imdone.addProjectToConfig(dir);
    cb(err,project);
  });
};

imdone.getConfigFile = function() {
  var dir = path.join(tools.userHome(), '.imdone');
  if (!fs.existsSync(dir)) wrench.mkdirSyncRecursive(dir);

  var file = path.join(dir, 'config.json');
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({projects:[]}, null, 2));

  return file;
};

imdone.getConfig = function() {
  var json = fs.readFileSync(this.getConfigFile());
  return JSON.parse(json);
};

imdone.addProjectToConfig = function(dir) {
  var config = this.getConfig();
  config.projects = _.without(config.projects, dir);
  config.projects.push(dir);
  fs.writeFileSync(this.getConfigFile(), JSON.stringify(config, null, 2));
};

imdone.removeProjectFromConfig = function(dir) {
  var config = this.getConfig();
  config.projects = _.without(config.projects, dir);
  fs.writeFileSync(this.getConfigFile(), JSON.stringify(config, null, 2));
};

// PLANNING:40 Set a default project in config to be opened when iMDone starts

imdone.removeProject = function(name) {
  console.log("Removing project with name:" + name);
  var project = imdone.getProject(name);
  if (project) {
    if (project.isBusy()) throw new Error("Project Busy");
    var repo = imdone.getRepo(name);
    this.removeProjectFromConfig(repo.getPath());
    project.destroy();
    delete imdone.projects[name];
  }

  imdone.emitter.emit("project.removed", {project:name});
};

imdone.getProject = function(name) {
  return imdone.projects[name] || undefined;
};

imdone.getKanban = function(name) {
  var project = imdone.getProject(name);
  if (project) {
    if (project.isBusy()) throw new Error("Project Busy");
    return {
      lists: project.getTasks(null, true),
      readme: imdone.getRepo(project).getDefaultFile()
    };
  }
};

imdone.moveTasks = function(name, tasks, newList, newPos, cb) {
  cb = _.isFunction(cb) ? cb : _.noop;
  var project = imdone.getProject(name);
  if (project) {
    if (project.isBusy()) throw new Error("Project Busy");
    project.moveTasks(tasks, newList, newPos, cb);  
  }
};

imdone.moveList = function(name, list, pos, cb) {
  cb = _.isFunction(cb) ? cb : _.noop;
  var project = imdone.getProject(name);
  if (project) {
    if (project.isBusy()) throw new Error("Project Busy");
    project.moveList(list, pos, cb);
  }
};

imdone.removeList = function(name, list, cb) {
  cb = _.isFunction(cb) ? cb : _.noop;
  var project = imdone.getProject(name);
  if (project) {
    if (project.isBusy()) throw new Error("Project Busy");
    project.removeList(list, cb);
  }
};

imdone.renameList = function(name, list, newList, cb) {
  cb = _.isFunction(cb) ? cb : _.noop;
  var project = imdone.getProject(name);
  if (project) {
    if (project.isBusy()) throw new Error("Project Busy");
    project.renameList(list, newList, cb);
  } else cb(new Error(PROJECT_NOT_FOUND));
};

imdone.hideList = function(name, list, cb) {
  cb = _.isFunction(cb) ? cb : _.noop;
  var project = imdone.getProject(name);
  if (project) {
    if (project.isBusy()) throw new Error("Project Busy");
    project.hideList(list, cb);
  } else cb(new Error(PROJECT_NOT_FOUND));
};

imdone.showList = function(name, list, cb) {
  cb = _.isFunction(cb) ? cb : _.noop;
  var project = imdone.getProject(name);
  if (project) {
    if (project.isBusy()) throw new Error("Project Busy");
    project.showList(list, cb);
  } else cb(new Error(PROJECT_NOT_FOUND));
};


imdone.md = function(name, _path, cb) {
  cb = _.isFunction(cb) ? cb : _.noop;
  var project = imdone.getProject(name);
  if (project) {
    var repo = imdone.getRepo(project);
    repo.md(repo.getFile(_path), cb);
  } else return cb("Project is undefined");
};

imdone.getFile = function(name, _path, line, cb) {
  cb = _.isFunction(cb) ? cb : _.noop;
  var project = imdone.getProject(name);
  if (project) {
    if (project.isBusy()) throw new Error("Project Busy");
    var repoId = imdone.getRepo(project).getId();
    var file = project.getFileWithContent(repoId, _path);
    if (file) {
      cb(null, {
          repoId: file.getRepoId(),
          src:file.getContent(), 
          line:line,
          lang:file.getLang().name,
          ext:file.getExt(),
          project:project.path,
          path:file.getPath()
      });
    } else {
      project.saveFile(repoId, _path, "", function(err, file) {
        if (err) return cb(err);
        cb(null,{
          repoId: file.getRepoId(),
          src:"", 
          line:line,
          lang:file.getLang().name,
          ext:file.getExt(),
          project:project.path,
          path:file.getPath()
        });
      });
    }
  } else cb(new Error(PROJECT_NOT_FOUND));
};

imdone.saveFile = function(name, repoId, _path, src, cb) {
  cb = _.isFunction(cb) ? cb : _.noop;
  var project = imdone.getProject(name);
  if (project) {
    if (project.isBusy()) throw new Error("Project Busy");
    project.saveFile(repoId, _path, src, cb);
  } else cb(new Error(PROJECT_NOT_FOUND));
};

imdone.removeFile = function(name, _path, cb) {
  cb = _.isFunction(cb) ? cb : _.noop;
  var project = imdone.getProject(name);
  if (project) {
    if (project.isBusy()) throw new Error("Project Busy");
    var repoId = imdone.getRepo(project).getId();
    project.deleteFile(repoId, _path, function(err, file) {
      cb(err, {file:file, deleted:true});
    });
  } else cb(new Error(PROJECT_NOT_FOUND));
};

imdone.getFiles = function(name) {
  var project = imdone.getProject(name);
  var files;
  if (project) {
    return project.getFileTree(imdone.getRepo(project).getId());
  } else throw new Error(PROJECT_NOT_FOUND);
};

imdone.getDirs = function(_path) {
  var files = tree.getFiles(_path);
  if (files) {
    return files;
  } else throw new Error(DIR_NOT_FOUND);
};

imdone.doSearch = function(name, query, offset, limit) {
  var opts = {project:imdone.getProject(name)};
  if (query) opts.query = query;
  if (limit) opts.limit = limit;
  if (offset) opts.offset = offset;
  var s = new Search(opts);
  s.execute();
  return s;
};

imdone.addList = function(name, list, cb) {
  cb = _.isFunction(cb) ? cb : _.noop;
  var project = imdone.getProject(name);
  project.addList(list, cb);
};

imdone.getRepo = function(name) {
  if (name instanceof Project) return name.getRepos()[0];
  return imdone.getProject(name).getRepos()[0];
};

imdone.getProjects = function() {
  return _.keys(imdone.projects);
};

imdone.emitter = new events.EventEmitter();
