/*
 * imdone
 * https://github.com/piascikj/imdone
 *
 * Copyright (c) 2012 Jesse Piascik
 * Licensed under the MIT license.
 */
// [add include option for processing tasks](#doing:0)


module.exports = {
	exclude:/^(node_modules|imdone|target)\/|^\.(git|svn)\/|\~$|\.(jpg|png|gif|swp)$/,
	port:8080,
	//github : {url : "http://www.github.com/piascikj/imdone"}, //Use this if you want links to point at github
	marked : {
		gfm: true,
		pedantic: false,
		sanitize: true
	}
};