iMDone
==========
##Keep your tasks in your files and organize using kanban
Create tasks in any file using markdown syntax and organize them with a local kanban board.  Share your board on github, dropbox, and other cloud providers.

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
   `[this is a task](#todo:10)`
###In javascript code
   `//[this is a task in javascript code](#done:40)`
###Put a task on the bottom of a list called "doing"
   `[this is a task in doing](#doing:50)` 
###Tasks are sorted by the number after the `:`
###imdone will create a folder named imdone that will contain your custom configuration and a file to keep your lists in order
   - you should keep imdone in source control