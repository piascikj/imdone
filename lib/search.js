var util   = require('util'),
    fs     = require('fs'),
    _      = require('underscore'),
    path   = require('path'),
    join   = path.join,
    Errors = require('./errors');

var MissingQueryError = function (msg) {
  MissingQueryError.super_.call(this, msg, this.constructor);
};
util.inherits(MissingQueryError, Errors.AbstractError);
MissingQueryError.prototype.message = 'query is a required option';

var MissingProjectError = function (msg) {
  MissingProjectError.super_.call(this, msg, this.constructor);
};
util.inherits(MissingProjectError, Errors.AbstractError);
MissingProjectError.prototype.message = 'project is a required option';

var Search = function(opts) {
  opts = !opts?{}:opts;
  opts = _.extend({
    offest:0,
    limit: 200
  }, opts);

  if (!opts.project) throw new MissingProjectError();

  if (!opts.query) throw new MissingQueryError();

  opts.re = new RegExp('(' + opts.query + ')', 'i');
  this.opts = opts;
  this.result = [];
  this.hits = 0;
  this.filesSearched = 0;
  this.filesNotSearched = 0;
};

Search.prototype.execute = function() {
  this.find(this.opts.project.path);
  return this.result;
};

Search.prototype.find = function(path) {
  var self = this;
  var project = this.opts.project;
  var stat = fs.statSync(path);
  if (stat.isDirectory() && project.shouldProcessDir(path)) {
    var files = fs.readdirSync(path);
    files.map(function(file){
      return join(path, file);
    }).forEach(function(path) {
      self.find(path);
    });

  } else if (stat.isFile() && project.shouldProcessFile(path)) {
    if (this.hits >= this.opts.limit) {
      this.filesNotSearched++;
      return;
    }

    this.filesSearched++;

    var lines = [];
    var str = fs.readFileSync(path, 'utf8');
    str.split('\n').forEach(function(line, i){
      var pos = line.search(self.opts.re);
      if (pos > -1) {
        if (line.length > 120) {
          if (pos > 120) {
            var truncated = line.substring(pos-60, pos+60);
            if (truncated.length < 120) {
              truncated = line.substring(line.length-120);
              line = "... " + truncated;
            } else {
              line = "... " + truncated + " ...";
            }
          } else {
            line = line.substring(0,120) + "...";
          }
        }
        lines.push([i, line]);
      }
    });

    if (lines.length > 0) {
      var fileResult = {path:project.relativePath(path), lines:[]};
      lines.forEach(function(line){
        if (self.hits < self.opts.limit) {
          self.hits++;
          fileResult.lines.push({line:line[0], text:line[1]});
        }
      });
      self.result.push(fileResult);
    }
  }
};

var search = module.exports = {
  errors: {
    MissingQueryError: MissingQueryError,
    MissingProjectError : MissingProjectError
  },

  newSearch: function(opts) {
    return new Search(opts);
  }

};