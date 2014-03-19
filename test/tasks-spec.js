var tasks = require('../server/tasks.js');

describe("tasks helper", function() {
	var mdFile = {
		file: "test.md",
		data: ''
	}

	it("should find all tasks in text", function() {
		var file = "test.md";
		var data = [
					'- [Show file explorer when editing files](#todo:0)',
					'- [Enable svn and git commit after file changes](#planning:0)',
					'- [Convert front end to use backbone.js](#planning:80)',
					'- [respect marked configuration in client javascript](#todo:130)',
					'- [User should be able to use TOC in preview mode for md files](#doing:0)',
					'- [User should be able to quickly add a date and assigned to tasks using @&lt;user&gt; @&lt;date&gt;](#planning:10)',
					'- [User should be able to get quick help with keyboard shortcuts](#planning:90)',
					'- [User should get a guided tour](#todo:120)',
					'- [Enable vfs <https://github.com/c9/vfs-socket> as method of interacting with other storage providers.](#doing:80)',
					'- [Use [Broadway](https://npmjs.org/package/broadway) for IOC.](#doing:90)'
					]
		
		var tasksAry = tasks.getTasks(data.join('\n'), file);
		console.log(tasksAry);
		expect(Object.keys(tasksAry).length).toBe(10);

	});

	it("should not find tasks in javscript code", function() {
		
		var file = "test.js";
		var data = [
					'// TODO:160 Show file explorer when editing files',
					'var task = "- [Enable svn and git commit after file changes](#planning:0)";']
		var tasksAry = tasks.getTasks(data.join('\n'), file);
		console.log(tasksAry);
		expect(Object.keys(tasksAry).length).toBe(1);

	});

	it("should not find tasks in shell code", function() {
		
		var file = "test.sh";
		var data = [
					'this is a task #- [Show file explorer when editing files](#todo:0)',
					'task = "- [Enable svn and git commit after file changes](#planning:0)";']
		var tasksAry = tasks.getTasks(data.join('\n'), file);
		console.log(tasksAry);
		expect(Object.keys(tasksAry).length).toBe(1);

	});

});