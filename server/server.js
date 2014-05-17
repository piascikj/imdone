/*
 * imdone
 * https://github.com/piascikj/imdone
 *
 * Copyright (c) 2012 Jesse Piascik
 * Licensed under the MIT license.
 */
  // ARCHIVE:150 Upgrade express - [ExpressJS 4.0: New Features and Upgrading from 3.0 ♥ Scotch](http://scotch.io/bar-talk/expressjs-4-0-new-features-and-upgrading-from-3-0)
  var express      = require('express');
  var bodyParser   = require('body-parser');
  var cookieParser = require('cookie-parser');
  var http         = require('http');
  var fs           = require('fs');
  var _            = require('lodash');
  var util         = require('util');
  var io           = require('socket.io');
  var path         = require('path');
  var server       = module.exports;
  var log          = require('debug')('imdone:server');
  var EVENTS       = {
                       PROJECT_MODIFIED: "project.modified",
                       PROJECT_INITIALIZED: "project.initialized",
                       PROJECT_REMOVED: "project.removed",
                       FILES_PROCESSED: "files.processed"
                     };
  var BUSY_MSG     = "Project Busy";

  function projectNameFromRequest(req) {
    return req.body.project || req.query.project || req.params[0] || req.params.project;
  }

  function isBusy(req,res) {
    var projectName = projectNameFromRequest(req);
    var project = server.imdone.getProject(projectName);
    return (project) ? project.isBusy() : undefined;
  }

  function getProjects(req, res) {
      res.send(server.imdone.getProjects());
  }

  // ARCHIVE:200 use imdone-core
  function getKanban(req, res){
    var project = projectNameFromRequest(req);
    try {
      var kanban = server.imdone.getKanban(project);
      if (kanban) return res.send(kanban);
      return res.send(404);
    } catch (e) {
      if (e.message === BUSY_MSG) return res.send({busy:true});
      res.send(500);
    }
  }

  // ARCHIVE:210 use imdone-core
  function moveTasks(req, res) {
    try {
      var project = projectNameFromRequest(req);    
      var tasks = req.body.tasks;
      var newList = req.body.newList;
      var newPos = req.body.newPos;
      server.imdone.moveTasks(project, tasks, newList, newPos, function() {
        res.send(200);
      });
    } catch (e) {
      if (e.message === BUSY_MSG) return res.send({busy:true});
      res.send(500);
    }
  }

  // ARCHIVE:220 use imdone-core
  function moveList(req, res) {
    try {
      var project = projectNameFromRequest(req);    
      var pos = parseInt(req.body.pos, 0);
      var list = req.body.name;
      server.imdone.moveList(project, list, pos, function(err) {
        if (err) return res.send(500, err);
        res.send(200);
      });
    } catch (e) {
      if (e.message === BUSY_MSG) return res.send({busy:true});
      res.send(500);
    }
  }

  // ARCHIVE:230 use imdone-core
  function removeList(req, res) {
    try {
      var project = projectNameFromRequest(req);    
      var list = req.body.list;
      server.imdone.removeList(project, list, function(err) {
        if (err) return res.send(500, err);
        res.send(200);
      });
    } catch (e) {
      if (e.message === BUSY_MSG) return res.send({busy:true});
      res.send(500);
    }
  }

  // ARCHIVE:240 use imdone-core
  function renameList(req, res) {
    try {
      var project = projectNameFromRequest(req);    
      var name = req.body.name;
      var newName = req.body.newName;
      server.imdone.renameList(project, name, newName, function(err) {
        if (err) return res.send(500, err);
        res.send(200);
      });
    } catch (e) {
      if (e.message === BUSY_MSG) return res.send({busy:true});
      res.send(500);
    }
  }

  // ARCHIVE:250 use imdone-core
  function hideList(req, res) {
    try {
      var project = projectNameFromRequest(req);    
      var list = req.body.list;
      server.imdone.hideList(project, list, function(err) {
        if (err) return res.send(500, err);
        res.send(200);
      });
    } catch (e) {
      if (e.message === BUSY_MSG) return res.send({busy:true});
      res.send(500);
    }
  }

  // ARCHIVE:260 use imdone-core
  function showList(req, res) {
    try {
      var project = projectNameFromRequest(req);    
      var list = req.body.list;
      server.imdone.showList(project, list, function(err) {
        if (err) return res.send(500, err);
        res.send(200);
      });
    } catch (e) {
      if (e.message === BUSY_MSG) return res.send({busy:true});
      res.send(500);
    }
  }

  // ARCHIVE:920 Have this use splat for project name like getFiles
  // ARCHIVE:620 Move getSource to imdone.js
  // ARCHIVE:270 use imdone-core
  function getSource(req, res) {
    try {
      var project = projectNameFromRequest(req);    
      var path = req.query.path;
      var line = req.query.line;
      server.imdone.getFile(project, path, line, function(err, data) {
        if (err) return res.send(500, err);
        res.send(data);
      });
    } catch (e) {
      if (e.message === BUSY_MSG) return res.send({busy:true});
      res.send(500);
    }
  }

  // ARCHIVE:940 Have this use splat for project name like getFiles
  // ARCHIVE:280 use imdone-core
  function saveSource(req, res) {
    try {
      var project = projectNameFromRequest(req);    
      var path = req.body.path;
      var src = req.body.src;
      var repoId = req.body.repoId;
      server.imdone.saveFile(project, repoId, path, src, function(err, file) {
        if (err) return res.send(500, err);
        res.send(file);
      });
    } catch (e) {
      if (e.message === BUSY_MSG) return res.send({busy:true});
      res.send(500);
    }
  }

  // ARCHIVE:870 Move removeSource to imdone.js and add hook    
  // ARCHIVE:170 use imdone-core for removeSource
  function removeSource(req, res) {
    try {
      var project = projectNameFromRequest(req);    
      var path = req.query.path;
      server.imdone.removeFile(project, path, function(err, file) {
        if (err) return res.send(500, err);
        res.send(file);
      });
    } catch (e) {
      if (e.message === BUSY_MSG) return res.send({busy:true});
      res.send(500);
    }
  }

  // ARCHIVE:290 use imdone-core
  function getFiles(req,res) {
    try {
      var project = projectNameFromRequest(req);    
      var files;
      res.send(server.imdone.getFiles(project));
    } catch (e) {
      if (e.message === BUSY_MSG) return res.send({busy:true});
      if (e.message === server.imdone.PROJECT_NOT_FOUND) return res.send(404, server.imdone.PROJECT_NOT_FOUND);
      res.send(500);
    }
  }

  function getDirs(req,res) {
    try {
      res.send(server.imdone.getDirs(req.params[0]));
    } catch (e) {
      if (e.message === BUSY_MSG) return res.send({busy:true});
      if (e.message === server.imdone.DIR_NOT_FOUND) return res.send(404, server.imdone.DIR_NOT_FOUND);
      res.send(500);
    }
  }

  // PLANNING:170 Use imdone-core for md, local and remote
  function md(req,res) {
    var project = projectNameFromRequest(req);
    var _path = req.query.path;
    server.imdone.md(project, _path, function(err, html) {
      if (err) res.send(500);
      else (res.send(html));
    });
  }

  // ARCHIVE:300 use imdone-core for search
  function doSearch(req,res) {
    var project = projectNameFromRequest(req);
    var query = req.query.query;
    var limit = req.query.limit;
    var offset = req.query.offset;
    res.send(server.imdone.doSearch(project, query, offset, limit));
  }

  function addProject(req, res) {
    var dir = req.params[0];
    res.send(server.imdone.addProject(dir));
  }

  function removeProject(req, res) {
    var project = projectNameFromRequest(req);
    server.imdone.removeProject(project);
    res.send(200);
  }

  function addList(req, res) {
    var project = projectNameFromRequest(req);
    var list = req.params.list;
    server.imdone.addList(project, list, function(err) {
      if (err) return res.send(500, err);
      res.send(200);
    });
  }

  server.start = function(imdone, callback) {
    server.imdone = imdone;

    //ARCHIVE:810 migrate to express 3.x <https://github.com/visionmedia/express/wiki/Migrating-from-2.x-to-3.x>
    var app = server.app = express();
    var  xserver = http.createServer(app);

    app.use(cookieParser());
    app.use(bodyParser());

    //Start the api and static content server
    /*
      /api/tasks
      /api/lists
      /api/projects
      /api/source
      /api/files
    */
    // ARCHIVE:960 Make sure we're restful
    app.post("/api/moveTasks", moveTasks);
    app.post("/api/moveList", moveList);
    app.post("/api/removeList", removeList);
    app.post("/api/renameList", renameList);
    app.post("/api/hideList", hideList);
    app.post("/api/showList", showList);
    app.get("/api/kanban/*", getKanban);
    app.post("/api/project/*", addProject);
    app.delete("/api/project/*", removeProject);
    app.get("/api/projects", getProjects);
    app.get("/api/source/*", getSource);
    app.put("/api/source/*", saveSource);
    app.del("/api/source/*", removeSource);
    app.get("/api/files/*", getFiles);
    app.get("/api/dirs/*", getDirs);
    app.get("/api/search/*", doSearch);
    app.get("/api/md/*", md);
    app.post("/api/list/:project/:list", addList);

    app.get("/js/marked.js", function(req,res) {
      log(require.resolve("marked"));
      res.sendfile(require.resolve("marked").toString());
    });

    //Serve static files
    app.use(express.static(__dirname + '/../public'));


    //Start the websocket server
    io = io.listen(xserver);

    io.enable('browser client minification');  // send minified client
    io.enable('browser client etag');          // apply etag caching logic based on version number
    io.set('log level', 1);                    // reduce logging

    io.sockets.on('connection', function(socket) {
      log("connected to:", socket);
      var onProjectModified = function(data) {
        log("emitting:", EVENTS.PROJECT_MODIFIED);
        socket.emit(EVENTS.PROJECT_MODIFIED, data);
      };

      var onProjectInitialized = function(data) {
        log("emitting:", EVENTS.PROJECT_INITIALIZED);
        socket.emit(EVENTS.PROJECT_INITIALIZED, data);
      };

      var onProjectRemoved = function(data) {
        log("emitting:", EVENTS.PROJECT_REMOVED);
        socket.emit(EVENTS.PROJECT_REMOVED, data);
      };

      var onFilesProcessed = function(data) {
        log("emitting:", EVENTS.FILES_PROCESSED);
        socket.emit(EVENTS.FILES_PROCESSED, data);
      };

      server.imdone.emitter.on(EVENTS.PROJECT_INITIALIZED, onProjectInitialized);
      server.imdone.emitter.on(EVENTS.PROJECT_REMOVED, onProjectRemoved);
      server.imdone.emitter.on(EVENTS.PROJECT_MODIFIED, onProjectModified);
      server.imdone.emitter.on(EVENTS.FILES_PROCESSED, onFilesProcessed);

      // ARCHIVE:310 Remove listeners on disconnect
      socket.on('disconnect', function () {
        log('disconnected');
        server.imdone.emitter.removeListener(EVENTS.PROJECT_INITIALIZED, onProjectInitialized);
        server.imdone.emitter.removeListener(EVENTS.PROJECT_REMOVED, onProjectRemoved);
        server.imdone.emitter.removeListener(EVENTS.PROJECT_MODIFIED, onProjectModified);
        server.imdone.emitter.removeListener(EVENTS.FILES_PROCESSED, onFilesProcessed);
      });
    });    

    if (callback) app.on('listening', callback);
    xserver.listen(imdone.config.port);

    //ARCHIVE:410 Move open board to command line option **open**
  };
  