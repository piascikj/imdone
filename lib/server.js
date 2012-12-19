/*
 * imdone
 * https://github.com/piascikj/imdone
 *
 * Copyright (c) 2012 Jesse Piascik
 * Licensed under the MIT license.
 */
	var express = require('express');
 	var fs = require('fs');
 	var server = module.exports; 

	function onRequest(req, res){
		//console.log("request body:",req.body);
		res.send(server.imdone.tasks);
	}

	server.start = function(imdone) {
		server.imdone = imdone;

		imdone.app = express.createServer();

		imdone.app.use(express.cookieParser());
		imdone.app.use(express.bodyParser());

		imdone.app.get('/', onRequest);

		imdone.app.listen(imdone.config.port);

		var open = require('open');
		open('http://localhost:' + imdone.config.port);
	};
