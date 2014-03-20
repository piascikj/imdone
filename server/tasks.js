var marked = require('marked');
var _ = require('underscore');
var languages = require("./util/languages");

var taskregex = /\[(.+?)\]\(#([\w\-]+?):(\d+?\.?\d*?)\)/g;
var codeStylePattern = "\\s*)([A-Z]{2,}):?(\\d+?\\.?\\d*?)?\\s+(.*)$"
// ARCHIVE:0 Support TODO and FIXME type tasks in code.
// PLANNING:50 Support @username and @Date in tasks

// for ignoring code search for code and replace with empty string or blacnk lines if it's a block before finding tasks
var codeRegExp = {
  inline: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
  block: /`{3}[\s\S]*?`{3}/gm
}

var utils = module.exports = {
  getHtml: function(md) {
      var html = marked(md);
      return html;
  },

  ignoreCode: function(data, path) {
    var cleanData = data;
    if (utils.isMarkDownFile(path)) {
      cleanData = data.replace(codeRegExp.block, function(block) {
        return block.replace(taskregex, "**TASK**");
      });
    }
    return cleanData;
  },

  isMarkDownFile: function(path) {
    var lang = utils.getLang(path);
    return lang && lang.name === "markdown";
  },

  getLang: function(path) {
    var dotPos = path.indexOf(".");
    var suffix = path.substring(dotPos);
    var lang = languages[suffix];
    return lang || {name:"text",symbol:""};
  },

  getCodeStyleRegex: function(path) {
    var symbol = this.getLang(path).symbol;
    if (symbol !== "") {
      symbol.replace("/", "\\/");
      var defactoPattern = "^(\\s*" + symbol + codeStylePattern;
      return new RegExp(defactoPattern, "mg");
    }
  },

  getTasks: function(data, path, taskProcessor) {
    var tasks = {};
    var id = 0;
    var clone = utils.ignoreCode(new String(data), path);

    // Check for codestyle tasks
    var codeStyleRegex = utils.getCodeStyleRegex(path);
    if (codeStyleRegex) {
      clone.replace(codeStyleRegex, function(match, start, list, order, text, pos) {
        if ((text.toUpperCase() == text) || (text.replace(" ", "") == "")) return;
        order = (order !== undefined) ? parseFloat(order) : 0;
        var line = (clone.substring(0,pos).match(/\n/g)||[]).length + 1;
        var task = {
          codeStyle: true,
          text:text,
          html:utils.getHtml(text),
          list:list,
          order: order,
          line:line,
          pathId:id
        };
        //Run the task through the callers processor
        if (_.isFunction(taskProcessor)) task = taskProcessor(task);
        tasks[id] = task;
        id++;
      });
    }

    clone.replace(taskregex, function(md, text, list, order, pos) {
      if (utils.isValidTask(clone, path, pos)) {
        var line = (clone.substring(0,pos).match(/\n/g)||[]).length + 1;
        var task = {
          text:text,
          html:utils.getHtml(text),
          list:list,
          order:parseFloat(order),
          line:line,
          pathId:id
        };
        //Run the task through the callers processor
        if (_.isFunction(taskProcessor)) task = taskProcessor(task);
        tasks[id] = task;
        id++;
      }
    });
    return tasks;
  },

  isValidTask: function(data, path, pos) {
    var done = false, 
      beforeTask = "",
      valid = false,
      lang = utils.getLang(path),
      symbol = lang.symbol,
      symbolRegex = new RegExp(symbol);

    if (lang && symbol) {
      for(var i=pos-1; !done; i--) {
        beforeTask = data.substring(i,pos);
        if (/\n/.test(beforeTask)) {
          done = true;
        } else if (symbolRegex.test(beforeTask)) {
          done = true, valid = true;
        }
      }
    } else {
      valid = true;
    }
    
    return valid;
  },
  
  taskText: function(start, text, list, order, codeStyle) {
    if (codeStyle) return start + list + ":" + order + " " + text;
    return start + "[" + text + "](#" + list + ":" + order + ")";
  },

  modifyTask: function(file, task) {
    self = this;
    var n = 0;

    // Check for codestyle tasks
    var codeStyleRegex = utils.getCodeStyleRegex(file.path);
    if (codeStyleRegex) {
      file.content = file.content.replace(codeStyleRegex, function(match, start, list, order, text, pos) {

        var newText = match;
        if (n === task.pathId) {
          // if the new list is not all upercase use md style
          if (/[A-Z]+/.test(task.list)) {
            newText = self.taskText(start, text, task.list, task.order, true);
          } else {
            newText = self.taskText(start, text, task.list, task.order);
            delete task.codeStyle;
          }
          file.modified = true;
        } 
        n++;
        return newText;
      });
    } 

    file.content = file.content.replace(taskregex, function(md, text, list, order, pos) {
      if (!utils.isValidTask(file.content, file.path, pos)) {
        return md;
      }

      var newMD = md;
      if (n === task.pathId) {
        if (/[A-Z]+/.test(task.list) && codeStyleRegex) {
          delete task.md;
          newMD = self.taskText("", text, task.list, task.order, true);
          task.codeStyle = true;
        } else {
          newMD = self.taskText("", text, task.list, task.order);
          task.md = newMD;
        }
        file.modified = true;
      } 
      n++;
      return newMD;
    });
  },

  // PLANNING:30 Create Classes for file and task
  modifyListName: function(file, oldList, newList) {
    var self = this;
    // Check for codestyle tasks
    var codeStyleRegex = utils.getCodeStyleRegex(file.path);
    if (codeStyleRegex) {
      file.content = file.content.replace(codeStyleRegex, function(match, start, list, order, text, pos) {

        var newText = match;
        if (oldList == list) {
          if (order === undefined) order = "";
          // if the new list is not all upercase use md style
          if (/[A-Z]+/.test(newList)) {
            newText = self.taskText(start, text, newList, order, true);
          } else {
            newText = self.taskText(start, text, newList, order);
          }
          file.modified = true;
        }
        return newText;
      });
    } 

    file.content = file.content.replace(taskregex, function(md, text, list, order, pos) {
      if (!utils.isValidTask(file.content, file.path, pos)) {
        return md;
      }

      var newMD = md;
      if (oldList == list) {
        if (/[A-Z]+/.test(newList) && codeStyleRegex) {
          newMD = self.taskText("", text, newList, order, true);
        } else {
          newMD = self.taskText("", text, newList, order);
        }
        file.modified = true;
      }
      return newMD;
    });
  }

};