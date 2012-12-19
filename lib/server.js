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
 	var server = module.exports; 

	function onRequest(req, res){
		//console.log("request body:",req.body);
		var out = server.imdone.tasks;
		out.server = {path:path.resolve(__dirname)};
		res.send(out);
	};

	server.start = function(imdone) {
		server.imdone = imdone;

		var app = imdone.app = express.createServer();

		app.use(express.cookieParser());
		app.use(express.bodyParser());

		//Start the api and static content server
		app.post("/api/kanban", function(req, res) {

		});

		app.get("/api/kanban", function(req, res) {
			var out = server.imdone.tasks;
			out.server = {path:path.resolve(__dirname)};
			res.send(out);
		});

		//[Maybe use **Mu - <https://github.com/raycmorgan/Mu>** or **HandleBars**<http://handlebarsjs.com/> for templating.](#todo:0)
		app.use(express.static(__dirname + '/static'));
		
		app.listen(imdone.config.port);

		var open = require('open');
		open('http://localhost:' + imdone.config.port);
	};
	