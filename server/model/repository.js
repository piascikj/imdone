/*
 * imdone
 * https://github.com/piascikj/imdone
 *
 * Copyright (c) 2012 Jesse Piascik
 * Licensed under the MIT license.
 */
//ARCHIVE:450 Implement base repository functionality with [declare.js](https://npmjs.org/package/declare.js) 
var fs = require('fs');
var _  = require('lodash');

/*
Repository = module.exports = {
  name:"", //The repository name e.g. github
  getSource:function(project, path) {
    //Get the file source for the given path
  },
  getFiles:function(project) {
    //Get the files
  },
  getKanban:function(project) {
    //Get the project kanban
  }
}
*/

var Repository = module.exports = function(config) {
  this.config = config || {};
  this._type = "FILE";
};

Repository.prototype = {
  //Overide
  getSource:function(project, path) {
    //Get the file source for the given path
  },

  //Overide
  getFiles:function(project) {
    return this.getFilesInDir(project, project);
  },

  //Overide
  getKanban:function(project) {
    //Get the project kanban
  },

  getType: function() {
    return this._type;
  },

  //----------------------------Functions for default FILE type--------------------------
  getFilesInDir: function(project, path, sub) {
    //Get the files
    var self = this,
      out = {};
    var files =  fs.readdirSync(path);

    if (sub) {
      _.each(files, function(val,i) {
        files[i] = path + "/" + val;
      });
    }

    files = self.filesToProcess(path, files, true).sort();
    if (!sub) out.path="/";
    _.each(files, function(file) {
      var name = file.split("/").pop();
      var relPath = self.relativePath(path, file);
      if (fs.statSync(file).isDirectory()) {
        if (!self.config.exclude.test(relPath + "/")) {
          if(!out.dirs) out.dirs = [];
          out.dirs.push(_.extend({name:name,path:relPath},
            self.getFilesInDir(project, file, true)));
        }
      } else if (fs.statSync(file).isFile()) {
        if(!out.files) out.files = [];

        out.files.push({name:name,path:relPath,project:project});
      }
    });
    return out;

  },

  filesToProcess: function(path, files, showDirs) {
    var self = this;
    var passed = [];

    _.each(files, function(file, i) {
      file = self.fullPath(path, file);
      var relPathFile = self.relativePath(path, file);
      if ( self.config.include.test(relPathFile) && 
           !self.config.exclude.test(relPathFile) &&
           (fs.statSync(file).isFile() || showDirs) ) {
        passed.push(file);
      }
    });

    return passed;
  },

  relativePath: function(path, file) {
    return file.replace(path + "/", "");
  },

  fullPath: function(path, file) {
    if (file.indexOf(path) < 0) file = path + "/" + file;
    return file;
  }
};