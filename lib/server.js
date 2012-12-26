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
		if (server.imdone.processing == true) {
			res.send({processing:true});
			return;
		}

		res.send({lists:server.imdone.getSortedLists(), cwd:server.imdone.cwd});
	};

	function moveTask(req, res) {
		if (server.imdone.processing == true) {
			res.send({processing:true});
			return;
		}

		res.send(server.imdone.moveTask(req.body));

	}

	server.start = function(imdone) {
		server.imdone = imdone;

		var app = imdone.app = express.createServer();

		app.use(express.cookieParser());
		app.use(express.bodyParser());

		//Start the api and static content server
		app.post("/api/moveTask", moveTask);

		app.get("/api/kanban", getKanban);

		//[Maybe use **Mu - <https://github.com/raycmorgan/Mu>** or **HandleBars** - <http://handlebarsjs.com/> for templating.](#done:10)
		app.use(express.static(__dirname + '/static'));
		
		app.listen(imdone.config.port);

		var open = require('open');
		open('http://localhost:' + imdone.config.port);
	};
	