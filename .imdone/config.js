var _ = require("lodash");
/*
 * imdone
 * https://github.com/piascikj/imdone
 *
 * Copyright (c) 2012 Jesse Piascik
 * Licensed under the MIT license.
 */
module.exports = {
	include:/^.*$/,
	exclude:/^(node_modules|bower_components|imdone|target|build|public\/lib)\/|\.(git|svn|imdone)|\~$|\.(log|jpg|png|gif|swp|ttf|otf)$/,
	marked : {
		gfm: true,
		pedantic: false,
		sanitize: true
	},
  events : {
    modified: function(params) {
      console.log("Files modified in project:", params.project.path);
      console.log(_.keys(params.files));
    }
  }
};
