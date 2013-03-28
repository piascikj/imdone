/*
 * imdone
 * https://github.com/piascikj/imdone
 *
 * Copyright (c) 2012 Jesse Piascik
 * Licensed under the MIT license.
 */
// [add include option for processing tasks - introduced in 0.1.3](#archive:200)
// [if running localy it should give the option to open the file in the browser even if github is set](#todo:70)
module.exports = {
	include:/^.*$/,
	exclude:/^(node_modules|imdone|target)\/|^\.(git|svn)\/|\~$|\.(jpg|png|gif|swp)$/,
	//github : {url : "http://www.github.com/piascikj/imdone"}, //Use this if you want file links to point at github, put the path to your repository here
	marked : {
		gfm: true,
		pedantic: false,
		sanitize: true
	}
	//[add a lists property for lists that are always displayed, even if there are no tasks in them](#archive:80)
};