var path  = require('path'),
    _     = require('lodash'),
    fs    = require('fs'),
    log   = require('debug')('tree'),
    tools = require('imdone-core').Tools;

function getFiles(_path) {
  if (!_path) _path = tools.userHome();
  
  log("Path:", _path);
  var files =  fs.readdirSync(_path);
  log("raw files:", files);
  files = _.map(files, function(file) { return path.join(_path, file); } ).sort();

  var up = path.resolve(_path + path.sep + '..' + path.sep);
  var name = path.basename(_path);
  var hidden = /^\./.test(name);
  var out = { path:_path, name: name, hidden: hidden, up: up};

  _.each(files, function(file) {
    log(file);
    var name = path.basename(file);
    var hidden = /^\./.test(name);
    if (fs.statSync(file).isDirectory()) {
      if(!out.dirs) out.dirs = [];
      out.dirs.push({name:name, hidden:hidden, path:file});
    } else {
      if(!out.files) out.files = [];
      out.files.push({name:name, hidden:hidden, path:file});
    }
  });
  return out;
}

module.exports = {
  getFiles: getFiles
};