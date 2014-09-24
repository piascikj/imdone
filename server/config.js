/*
 * imdone
 * https://github.com/piascikj/imdone
 *
 * Copyright (c) 2012 Jesse Piascik
 * Licensed under the MIT license.
 */
module.exports = {
  include:/^.*$/,
  exclude:/^(node_modules|bower_components|\.imdone|target|build|dist)\/|\.(git|svn)|\~$|\.(jpg|png|gif|swp|ttf|otf)$/,
  marked : {
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    langPrefix: 'language-',
  },
  events : {
    modified: function(params) {
      console.log("Files modified in project:", params.project.path);
    }
  }
};