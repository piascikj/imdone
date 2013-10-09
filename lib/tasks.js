var marked = require('marked');
var _ = require('underscore');
var languages = require("./util/languages");

var taskregex = /\[(.+?)\]\(#([\w\-]+?):(\d+?\.{0,1}\d*?)\)/g;

var utils = module.exports = {
  taskRegex: taskregex,
  dataPath: "imdone/data.js",
  
  getHtml: function(md) {
      var html = marked(md);
      return html;
  },

  getTasks: function(data, file, taskProcessor) {
    var tasks = {};
    var id = 0;
    data.replace(taskregex, function(md, text, list, order, pos) {
      if (utils.isValidTask(data, file, pos)) {
        //[add the line number of the task by finding position and counting newlines prior - 0.1.4](#archive:360)
        //[Use line number when loading page in github - 0.1.4](#archive:330)
        var line = (data.substring(0,pos).match(/\n/g)||[]).length + 1;
        //[For task modification, store text as text and create another property for html](#done:80)
        var task = {
          md:md,
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

  isValidTask: function(data, file, pos) {
    var done = false, code = false, char = "";
    
    //Check the file suffix
    var dotPos = file.indexOf(".");
    var suffix = file.substring(dotPos);
    var lang = languages[suffix];
    if (lang && lang.name === "markdown") {
      return !this.isMarkdownCodeBlock(data, pos);
    } else if (lang) {
      var comment = this.isComment(data, lang.symbol, pos);
      return comment;
    }

    return false;
  },

  //[Test isValidTask and isComment](#done:30)
  isComment: function(data, symbol, pos) {
    var done = false, 
      beforeTask = "",
      comment = false,
      symbolRegex = new RegExp(symbol);
    for(var i=pos-1; !done; i--) {
      beforeTask = data.substring(i,pos);
      if (/\n/.test(beforeTask)) {
        done = true;
      } else if (symbolRegex.test(beforeTask)) {
        done = true, comment = true;
      }
    }
    return comment;
  },

  isMarkdownCodeBlock: function(data, pos) {
    var done = false, code = false, char = "";

    for (var i = pos-1; !done; i--) {
      char = data.substring(i, i+1);
      if (/`/.test(char)) done = true, code = true;
      if (/\n/.test(char)) {
        if (/`/.test(char)) code = true;
        done = true;
      }

      if (i <= 0) done = true;
    }
    return code;
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