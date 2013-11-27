/*
 * imdone
 * https://github.com/piascikj/imdone
 *
 * Copyright (c) 2012 Jesse Piascik
 * Licensed under the MIT license.
 */
  var express = require('express');
  var http = require('http');
  var fs = require('fs');
  var nsh = require('node-syntaxhighlighter');
  var nshPath = require.resolve('node-syntaxhighlighter').split("/").slice(0, -1).join("/");
  var _ = require('underscore');
  var Handlebars = require('handlebars');
  var util = require('util');
  var io = require('socket.io');
  var mkdirp = require('mkdirp');
  var search = require('./search');
  var server = module.exports; 

  function isProcessing(req,res) {
    var project = req.body.project || req.query.project;
    return server.imdone.getProject(project).processing;
  }

  function getProjects(req, res) {
      res.send(server.imdone.getProjects());
  }

  function getKanban(req, res){
    if (isProcessing(req,res)) {
      res.send({processing:true});
      return;
    }
    project = server.imdone.getProject(req.params[0]);
    //console.log(project);

    res.send({
      lists:project.getSortedLists(),
      lastUpdate:project.lastUpdate,
      readme:project.getReadme()
    });
  }

  function moveTask(req, res) {
    if (isProcessing(req,res)) {
      res.send({processing:true});
      return;
    }
    var project = server.imdone.getProject(req.body.project);
    project.moveTask(req.body, function() {
      res.send(200);
    });
  }

  function moveList(req, res) {
    if (isProcessing(req,res)) {
      res.send({processing:true});
      return;
    }

    res.send({lists:server.imdone.getProject(req.body.project).moveList(req.body)});
  }

  function removeList(req, res) {
    if (isProcessing(req,res)) {
      res.send({processing:true});
      return;
    }

    res.send({lists:server.imdone.getProject(req.body.project).removeList(req.body)});

  }

  function renameList(req, res) {
    if (isProcessing(req,res)) {
      res.send({processing:true});
      return;
    }

    res.send({lists:server.imdone.getProject(req.body.project).renameList(req.body)});
  }

  function hideList(req, res) {
    if (isProcessing(req,res)) {
      res.send({processing:true});
      return;
    }

    res.send({lists:server.imdone.getProject(req.body.project).hideList(req.body)});
  }

  function showList(req, res) {
    if (isProcessing(req,res)) {
      res.send({processing:true});
      return;
    }

    res.send({lists:server.imdone.getProject(req.body.project).showList(req.body)});
  }

  //[Have this use splat for project name like getFiles](#archive:180)
  //[Move getSource to imdone.js](#done:80)
  function getSource(req, res) {
    if (isProcessing(req,res)) {
      res.send({processing:true});
      return;
    }

    var path = req.query.path;
    var line = req.query.line;
    var project = server.imdone.getProject(req.params[0]);
    project.getSource(path, line, function(resp) {
      res.send(resp);
    });
  }

  // [Have this use splat for project name like getFiles](#archive:150)
  function saveSource(req, res) {
    if (isProcessing(req,res)) {
      res.send({processing:true});
      return;
    }

    var path = req.body.path,
        src = req.body.src,
        project = server.imdone.getProject(req.params[0]);

    project.saveSource(path, src, function(resp) {
      res.send(resp);
    });
  }

  // [Move removeSource to imdone.js and add hook](#doing:10)    
  function removeSource(req, res) {
    if (isProcessing(req,res)) {
      res.send({processing:true});
      return;
    }

    var path = req.query.path,
      project = server.imdone.getProject(req.params[0]),
      filePath = project.path + "/" + path;

    console.log("Removing file:" + filePath);
    if (project.path && !/^\.\./.test(path)) {
      fs.unlink(filePath, function(err, data) {
        if (err) {
          res.send(409,"Unable to remove source");
          return;
        }      

        res.send({path:path, ok:1});
      });
    } else {
      res.send(409,"Unable to remove source");
      return;
    }
  }

  function getFiles(req,res) {
    var project = server.imdone.getProject(req.params[0]);
    if (project.path) {
      res.send(project.getFiles());
    } else {
      res.send(404, "Project not found");
    }
  }

  function doSearch(req,res) {
    var opts = {project:server.imdone.getProject(req.params[0])};
    var query = req.query.query;
    var limit = req.query.limit;
    var offset = req.query.offset;
    if (query) opts.query = query;
    if (limit) opts.limit = limit;
    if (offset) opts.offset = offset;
    var s = search.newSearch(opts);
    s.execute();
    s.opts.project = undefined;
    res.send(s);

  }

  server.start = function(imdone, callback) {
    server.imdone = imdone;

    //[migrate to express 3.x <https://github.com/visionmedia/express/wiki/Migrating-from-2.x-to-3.x>](#archive:100)
    var app = server.app = express();
    var  xserver = http.createServer(app);

    app.use(express.cookieParser());
    app.use(express.bodyParser());

    //Start the api and static content server
    /*
      /api/tasks
      /api/lists
      /api/projects
      /api/source
      /api/files
    */
    // [Make sure we're restful](#planning:80)
    app.post("/api/moveTask", moveTask);
    app.post("/api/moveList", moveList);
    app.post("/api/removeList", removeList);
    app.post("/api/renameList", renameList);
    app.post("/api/hideList", hideList);
    app.post("/api/showList", showList);
    app.get("/api/kanban/*", getKanban);
    app.get("/api/projects", getProjects);
    app.get("/api/source/*", getSource);
    app.put("/api/source/*", saveSource);
    app.del("/api/source/*", removeSource);
    app.get("/api/files/*", getFiles);
    app.get("/api/search/*", doSearch);

    app.get("/js/marked.js", function(req,res) {
      console.log(require.resolve("marked"));
      res.sendfile(require.resolve("marked").toString());
    });

    //Serve static files
    app.use(express.static(__dirname + '/../public'));


    //Start the websocket server
    io = io.listen(xserver);

    io.enable('browser client minification');  // send minified client
    io.enable('browser client etag');          // apply etag caching logic based on version number
    io.enable('browser client gzip');          // gzip the file
    io.set('log level', 1);                    // reduce logging

    // enable all transports (optional if you want flashsocket support, please note that some hosting
    // providers do not allow you to create servers that listen on a port different than 80 or their
    // default port)
    io.set('transports', [
      'websocket',
      'flashsocket',
      'htmlfile',
      'xhr-polling',
      'jsonp-polling'
    ]);    

    io.sockets.on('connection', function(socket) {
            var id = setInterval(function() {
        socket.emit('last-update',server.imdone.getLastUpdate());
      }, 300);
            console.log('started client interval');
            socket.on('disconnect', function() {
              console.log('stopping client interval');
              clearInterval(id);
            });
    });    

    if (callback) app.on('listening', callback);
    xserver.listen(imdone.config.port);

    //[Move open board to command line option **open**](#archive:200)
  };
  