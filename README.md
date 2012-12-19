imdone
==========
##Distributed kanban for engineering teams
Create tasks in any file using markdown syntax and organize them with a local kanban board and commit them to source control.

##Install
   npm install -g imdone

##Configuration
Create a file called imdone.js in your project directory.  The default config looks like this.  WYour imdone.js will extend this.

	module.exports = {
		exclude:/^node_modules\/|^\.git\/|^\.svn\/|\~$|\.swp$|^\.imdone\//,
		pollingInterval:500,
		port:8080,
		github : {
			url : "http://www.github.com/piascikj/imdone"
		}
	};

  
###Put a task at the top of a list called "to-do"
   `[this is a task](#to-do:0)`
####In code
   `//[this is a task in javascript code](#doing:0)`

###Put a task on the bottom of a list called "doing"
   `[this is a task](#doing:10001)`

###Tasks are sorted by the number after the :

###imdone will create a folder named imdone that will contain your custom configuration and a file to keep your lists in order
   - you should keep imdone in source control