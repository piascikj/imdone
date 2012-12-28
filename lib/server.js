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

	function getKanban(req, res){
		if (isProcessing()) {
			res.send({processing:true});
			return;
		}

		res.send({lists:server.imdone.getSortedLists(), cwd:server.imdone.cwd, lastUpdate:server.imdone.lastUpdate});
	}

	function moveTask(req, res) {
		if (isProcessing()) {
			res.send({processing:true});
			return;
		}

		res.send(server.imdone.moveTask(req.body));

	}

	function moveList(req, res) {
		if (isProcessing()) {
			res.send({processing:true});
			return;
		}

		res.send({lists:server.imdone.moveList(req.body)});
	}

	function renameList(req, res) {
		if (isProcessing()) {
			res.send({processing:true});
			return;
		}

		res.send({lists:server.imdone.renameList(req.body)});
	}

	function isProcessing(res) {
		return server.imdone.processing;
	}

	server.start = function(imdone) {
		server.imdone = imdone;

		var app = imdone.app = express.createServer();

		app.use(express.cookieParser());
		app.use(express.bodyParser());

		//Start the api and static content server
		app.post("/api/moveTask", moveTask);
		app.post("/api/moveList", moveList);
		app.post("/api/renameList", renameList);
		app.get("/api/kanban", getKanban);

		//[Maybe use **Mu - <https://github.com/raycmorgan/Mu>** or **HandleBars** - <http://handlebarsjs.com/> for templating.](#done:80)
		app.use(express.static(__dirname + '/static'));
		
		app.listen(imdone.config.port);

		//Start the websocket server
		var WebSocketServer = require('ws').Server;
		var wss = new WebSocketServer({server: app});
		wss.on('connection', function(ws) {
		  var id = setInterval(function() {
		    ws.send(JSON.stringify({lastUpdate:server.imdone.lastUpdate}), function() { /* ignore errors */ });
		  }, 300);
		  console.log('started client interval');
		  ws.on('close', function() {
		    console.log('stopping client interval');
		    clearInterval(id);
		  })
		});		

		var open = require('open');
		open('http://localhost:' + imdone.config.port);
	};
	