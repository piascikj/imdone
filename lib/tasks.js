var marked = require('marked');
var _ = require('underscore');
var taskregex = /\[(.+?)\]\(#([\w\-]+?):(\d+?\.{0,1}\d*?)\)/g;

var utils = module.exports = {
    dataPath: "imdone/data.js",
    getHtml: function(md) {
    	var html = marked(md);
    	return html;
    },
	getTasks: function(data, taskProcessor) {
		var tasks = {};
		var id = 0;
		data.replace(taskregex, function(md, text, list, order, pos) {
			if (!utils.isCode(data, pos)) {
				//[add the line number of the task by finding position and counting newlines prior - 0.1.4](#archive:360)
				//[Use line number when loading page in github - 0.1.4](#archive:330)
				var line = (data.substring(0,pos).match(/\n/g)||[]).length + 1;
				//[For task modification, store text as text and create another property for html](#done:0)
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

	isCode: function(data,pos) {
		var done = false, code = false, char = "";
		
		for (var i = pos-1; done === false; i--) {
			char = data.substring(i, i+1);
			if (/`/.test(char)) done = true, code = true;
			if (/\n/.test(char)) done = true;
			if (i <= 0) done = true;
		}
		return code;
	},

	modifyTask: function(file, task) {
		console.log("mofifyTask called for file:" + file.path + " and task:" + task.md);
		var n = 0;
		file.content = file.content.replace(taskregex, function(md, text, list, order, pos) {
			if (utils.isCode(file.content, pos)) {
				console.log("***CODE***");
				return md;
			}

			var newMD = md;
			if (n == task.pathTaskId) {
				newMD = "[" + text + "](#" + task.list + ":" + task.order + ")";
				task.md = newMD;
				file.modified = true;
			} 
			n++;
			return newMD;
		});

	}
};