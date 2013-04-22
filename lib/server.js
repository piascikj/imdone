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

    var server = module.exports; 

    function getProjects(req, res) {
        res.send(server.imdone.getProjects());
    }

	function getKanban(req, res){
		if (isProcessing(req,res)) {
			res.send({processing:true});
			return;
		}
		var project = "/" + req.params[0];

		res.send({lists:server.imdone.getProject(project).getSortedLists(), lastUpdate:server.imdone.getProject(project).lastUpdate});
	}

	function moveTask(req, res) {
		if (isProcessing(req,res)) {
			res.send({processing:true});
			return;
		}
		var project = server.imdone.getProject(req.body.project);
		project.moveTask(req.body, function() {
			res.send(project.getSortedLists());
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
	function getSource(req, res) {
		if (isProcessing(req,res)) {
			res.send({processing:true});
			return;
		}

		var path = req.query.path;
		var lang = "text";
		var pat = /\.([0-9a-z]{1,5})$/i; //Pattern to match file extension
		if (path.match(pat) !== null) lang = path.match(pat)[1];
		var line = req.query.line;
		var project = server.imdone.getProject("/" + req.params[0]);
		if (project.path && /^\.\./.test(path) == false && /\/$/.test(path) == false) {
			var filePath = project.path + "/" + path;

			//[Make sure this source file is in one of the projects paths](#archive:270)

			//[Use the RDark style <http://alexgorbatchev.com/SyntaxHighlighter/manual/themes/rdark.html>](#archive:230)
			//[Maybe use **Mu - <https://github.com/raycmorgan/Mu>** for templating.](#archive:240)
			if (fs.existsSync(filePath)) {
				fs.readFile(filePath, 'utf-8', function(err,data) {
					if (err) {
						res.send({error:"Unable to get source"});
						return;
					}

					res.send({
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
				console.log(dir);
				console.log(name);
				mkdirp(dir, function (err) {
					if (err) {
						res.send({error:"Unable to get source"});
					} else {
						fs.writeFile(filePath, "", function(err) {
						    if(err) {
						        res.send({error:"Unable to get source"});
						    } else {
								res.send({
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
			res.send({error:"Unable to get source"});
			return;
		}
	}

	//[Have this use splat for project name like getFiles](#archive:150)
	function saveSource(req, res) {
		if (isProcessing(req,res)) {
			res.send({processing:true});
			return;
		}

		var path = req.body.path,
			src = req.body.src,
			project = server.imdone.getProject("/" + req.params[0]),
			filePath = project.path + "/" + path;

		if (project.path && /^\.\./.test(path) == false) {
			fs.writeFile(filePath, src, 'utf8', function(err, data) {
				if (err) {
					res.send({error:"Unable to save source"});
					return;
				}			

				res.send({path:path, ok:1});
			});
		} else {
			res.send({error:"Unable to get source"});
			return;
		}
	}

	function getFiles(req,res) {
		var project = server.imdone.getProject("/" + req.params[0]);
		if (project.path) {
			res.send(project.getFiles());
		} else {
			res.send(404, "Project not found");
		}
	}

	function isProcessing(req,res) {
		var project = req.body.project || req.query.project;
		return server.imdone.getProject(project).processing;
	}

	server.start = function(imdone, callback) {
		server.imdone = imdone;

		//[migrate to express 3.x <https://github.com/visionmedia/express/wiki/Migrating-from-2.x-to-3.x>](#archive:100)
		var app = server.app = express();
		var	xserver = http.createServer(app);

		app.use(express.cookieParser());
		app.use(express.bodyParser());

		//Start the api and static content server
		//[API should be more RESTful](#planning:80)
		/*
			/api/tasks
			/api/lists
			/api/projects
			/api/source
			/api/files
		*/
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
		app.get("/api/files/*", getFiles);

		app.get("/js/marked.js", function(req,res) {
			console.log(require.resolve("marked"));
			res.sendfile(require.resolve("marked").toString());
		});

		//Set up styles directory for highlight
		app.use('/nsh-css',express.static(nshPath + '/lib/styles'));
		app.use(express.static(__dirname + '/static'));


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
		    'websocket'
		  , 'flashsocket'
		  , 'htmlfile'
		  , 'xhr-polling'
		  , 'jsonp-polling'
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
	