var marked = require('marked');
var _ = require('underscore');
var languages = require("./util/languages");

var taskregex = /\[(.+?)\]\(#([\w\-]+?):(\d+?\.{0,1}\d*?)\)/g;
var codeStylePattern = "\\s*([A-Z]{2,})\\s+(.*)$"
// [Support TODO and FIXME type tasks in code.](#doing:0)

//for ignoring code search for code and replace with empty string or blacnk lines if it's a block before finding tasks
var codeRegExp = {
  inline: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
  block: /`{3}[\s\S]*?`{3}/gm
}

var utils = module.exports = {
  taskRegex: taskregex,

  getHtml: function(md) {
      var html = marked(md);
      return html;
  },

  ignoreCode: function(data, file) {
    var cleanData = data;
    if (utils.isMarkDownFile(file)) {
      cleanData = data.replace(codeRegExp.block, function(block) {
        return block.replace(taskregex, "**TASK**");
      });
    }
    return cleanData;
  },

  getTasks: function(data, file, taskProcessor) {
    var tasks = {};
    var id = 0;
    var clone = utils.ignoreCode(new String(data), file);

    // var symbol = this.getLang(file).symbol;
    // if (symbol !== "") {
    //   var defactoPattern = "^\\s*" + symbol + codeStylePattern;
    //   var defactoRegex = new RegExp(defactoPattern, "m");
    //   clone.replace(defactoRegex, function(match, list, order, text, pos) {
    //     var line = (clone.substring(0,pos).match(/\n/g)||[]).length + 1;
    //     var task = {
    //       //md:md,
    //       text:text,
    //       html:utils.getHtml(text),
    //       list:list,
    //       order:parseFloat(order),
    //       line:line,
    //       pathTaskId:id
    //     };
    //     //Run the task through the callers processor
    //     if (_.isFunction(taskProcessor)) task = taskProcessor(task);
    //     tasks[id] = task;
    //     id++;
    //   });
    // }

    clone.replace(taskregex, function(md, text, list, order, pos) {
      if (utils.isValidTask(clone, file, pos)) {
        var line = (clone.substring(0,pos).match(/\n/g)||[]).length + 1;
        var task = {
          //md:md,
          text:text,
          html:utils.getHtml(text),
          list:list,
          order:parseFloat(order),
          line:line,
          pathTaskId:id
        };
        //Run the task through the callers processor
        if (_.isFunction(taskProcessor)) task = taskProcessor(task);
        tasks[id] = task;
        id++;
      }
    });
    return tasks;
  },

  isMarkDownFile: function(file) {
    var lang = utils.getLang(file);
    return lang && lang.name === "markdown";
  },

  getLang: function(file) {
    var dotPos = file.indexOf(".");
    var suffix = file.substring(dotPos);
    var lang = languages[suffix];
    return lang || {name:"text",symbol:""};
  },

  isValidTask: function(data, file, pos) {
    var done = false, 
      beforeTask = "",
      valid = false,
      lang = utils.getLang(file),
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

  modifyTask: function(file, task) {
    console.log("mofifyTask called for file:" + file.path + " and task:" + task.md);
    var n = 0;
    file.content = file.content.replace(taskregex, function(md, text, list, order, pos) {
      if (!utils.isValidTask(file.content, file.path, pos)) {
        return md;
      }

      var newMD = md;
      if (n === task.pathTaskId) {
        newMD = "[" + text + "](#" + task.list + ":" + task.order + ")";
        task.md = newMD;
        file.modified = true;
      } 
      n++;
      return newMD;
    });

  }
};