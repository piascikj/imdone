iMDone
==========
##Keep your tasks in your files and organize using kanban
Create tasks in any file using markdown syntax and organize them with a local kanban board.  Share your board on [github](http://www.github.com), [dropbox](http://www.dropbox.com), and other cloud providers.

##Install
   npm install -g imdone

##And run!
navigate to your local project folder and run:  
   imdone

###Put a task at the top of a list called "to-do"
   `[this is a task](#todo:10)`
###In javascript code
   `//[this is a task in javascript code](#done:50)`
###Put a task on the bottom of a list called "doing"
   `[this is a task in doing](#doing:50)` 
###Tasks are sorted by the number after the `:`
###imdone will create a folder named imdone that will contain your custom configuration and a file to keep your lists in order
   - you should keep imdone in source control

##Configuration
Create a file called imdone.js in your project directory.  The default config looks like this.  Your imdone.js will extend this.

	module.exports = {
		exclude:/^(node_modules|imdone|target)\/|^\.(git|svn)\/|\~$|\.(jpg|png|gif|swp)$/,
		port:8080,
		//github : {url : "http://www.github.com/piascikj/imdone"}, //Use this if you want links to point at github
		marked : {
			gfm: true,
			pedantic: false,
			sanitize: true
		}
	};

##TODO
- [Page needs to refresh when tasks have been modified, deleted or added](#doing:0)