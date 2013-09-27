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

var MissingPathError = function (msg) {
  MissingPathError.super_.call(this, msg, this.constructor);
};
util.inherits(MissingPathError, Errors.AbstractError);
MissingPathError.prototype.message = 'path is a required option';

var Search = function(opts) {
  opts = !opts?{}:opts;
  _.extend({
    offest:0,
    limit: 200 
  }, opts);

  if (!opts.path) throw new MissingPathError();

  if (!opts.query) throw new MissingQueryError();

  opts.re = new RegExp('(' + opts.query + ')', 'i');
  this.opts = opts;
  this.result = [];
  this.total = 0;
  this.filesNotSearched = 0;
};

Search.prototype.execute = function() {
  this.find(this.opts.path);
  return this.result;
};

Search.prototype.find = function(path) {
  var self = this;
  var stat = fs.statSync(path);
  if (stat.isDirectory()) {
    var files = fs.readdirSync(path);
    files.map(function(file){
      return join(path, file);
    }).forEach(function(path) {
      self.find(path);
    });

  } else if (stat.isFile()) {
    if (this.total >= this.opts.limit) {
      this.filesNotSearched++;
      return;
    }

    var lines = [];
    var str = fs.readFileSync(path, 'utf8');
    str.split('\n').forEach(function(line, i){
      if (self.opts.re.test(line)) lines.push([i, line]);
    });

    if (lines.length > 0) {
      var fileResult = {path:path, lines:[]};
      lines.forEach(function(line){
        if (self.total < self.opts.limit) {
          self.total++;
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
    MissingPathError : MissingPathError
  },

  newSearch: function(opts) {
    return new Search(opts);
  }

};