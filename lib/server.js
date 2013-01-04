/*
 * imdone
 * https://github.com/piascikj/imdone
 *
 * Copyright (c) 2012 Jesse Piascik
 * Licensed under the MIT license.
 */
	var express = require('express');
 	var fs = require('fs');
 	var path = require('path');
 	var nsh = require('node-syntaxhighlighter');
 	var nshPath = require.resolve('node-syntaxhighlighter').split("/").slice(0, -1).join("/");
 	var _ = require('underscore');
 	var mu = require('mu2');
 	var util = require('util');

 	var server = module.exports; 

 	function getProjects(req, res) {
 		res.send(server.imdone.getProjects());
 	}

	function getKanban(req, res){
		if (isProcessing(req,res)) {
			res.send({processing:true});
			return;
		}
		project = req.query.project;

		res.send({lists:server.imdone.getProject(project).getSortedLists(), lastUpdate:server.imdone.getProject(project).lastUpdate});
	}

	function moveTask(req, res) {
		if (isProcessing(req,res)) {
			res.send({processing:true});
			return;
		}

		res.send(server.imdone.getProject(req.body.project).moveTask(req.body));

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

	function getSource(req,res) {
		if (isProcessing(req,res)) {
			res.send({processing:true});
			return;
		}
		var path = req.query.path;
		var lang = "text";
		var pat = /\.([0-9a-z]{1,5})$/i; //Pattern to match file extension
		if (path.match(pat) != null) lang = path.match(pat)[1];
		var line = req.query.line;
		var project = server.imdone.getProject(req.query.project);
		var filePath = project.path + "/" + path;

		//[Make sure this source file is in one of the projects paths](#done:0)

		// Choose random style for kicks
		var styles =  nsh.getStyles()
		  , index  =  Math.floor(Math.random() * styles.length)
		  , style  =  styles[index]
		  ;
		//[Use the RDark style <http://alexgorbatchev.com/SyntaxHighlighter/manual/themes/rdark.html>](#done:20)
		//[Maybe use **Mu - <https://github.com/raycmorgan/Mu>** for templating.](#done:10)
		fs.readFile(filePath, 'utf-8', function(err,data) {
			if (err) {
				res.send({error:"Unable to get source"});
				return;
			}
			// Highlight code and generate html with style reference included
			var language        =  nsh.getLanguage(lang) || nsh.getLanguage('text')
			  , highlightedCode =  nsh.highlight(data, language, {highlight:line});
			
			var template = __dirname + '/templates/source.html';
			//console.log("lang:" + lang);
			//console.log("template:" + template);
			//console.log("nshPath:" + nshPath);
			var html = mu.compileAndRender(template, {source:highlightedCode, path:path});
			util.pump(html,res);
			//res.send({source:highlightedCode, path:path});
		});
	}

	function isProcessing(req,res) {
		var project = req.body.project || req.query.project;
		return server.imdone.getProject(project).processing;
	}

	server.start = function(imdone, callback) {
		server.imdone = imdone;

		var app = imdone.app = express.createServer();

		app.use(express.cookieParser());
		app.use(express.bodyParser());

		//Start the api and static content server
		app.post("/api/moveTask", moveTask);
		app.post("/api/moveList", moveList);
		app.post("/api/removeList", removeList);
		app.post("/api/renameList", renameList);
		app.get("/api/kanban", getKanban);
		app.get("/api/projects", getProjects);
		app.get("/api/source", getSource);

		//Set up styles directory for highlight
		app.use('/nsh-css',express.static(nshPath + '/lib/styles'));
		app.use(express.static(__dirname + '/static'));

		app.on('listening', callback);
		app.listen(imdone.config.port);

		//Start the websocket server
		var WebSocketServer = require('ws').Server;
		var wss = new WebSocketServer({server: app});
		wss.on('connection', function(ws) {
		  var id = setInterval(function() {
		    ws.send(JSON.stringify(server.imdone.getLastUpdate()), function() { /* ignore errors */ });
		  }, 300);
		  console.log('started client interval');
		  ws.on('close', function() {
		    console.log('stopping client interval');
		    clearInterval(id);
		  });
		});		

		//[Move open board to command line option **open**](#todo:20)
	};
	