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
 	var _ = require('underscore');

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

	function renameList(req, res) {
		if (isProcessing(req,res)) {
			res.send({processing:true});
			return;
		}

		res.send({lists:server.imdone.getProject(req.body.project).renameList(req.body)});
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
		app.post("/api/renameList", renameList);
		app.get("/api/kanban", getKanban);
		app.get("/api/projects", getProjects);

		//[Maybe use **Mu - <https://github.com/raycmorgan/Mu>** or **HandleBars** - <http://handlebarsjs.com/> for templating.](#archive:80)
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

		//[Move open board too command line option **open**](#todo:0)
	};
	