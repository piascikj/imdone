iMDone
==========
##Create tasks in any file using markdown syntax and organize them with a local kanban board.  
##Your tasks are in your files, so you can share your board on [github](http://www.github.com), [dropbox](http://www.dropbox.com), or any other cloud storage provider.

###Prerequisites 
- [nodejs](http://nodejs.org/) is [installed](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager)
- [npm](https://npmjs.org/) is [installed](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager)


###Disclaimer
iMDone has only been tested on my Ubuntu 12.04 desktop using chrome 23.0.x as the default browser.  It should work on any machine that has nodejs and npm installed and for auto update of boards, a browser that supports websockets.

###Install
   `npm install -g imdone`

###And run!
navigate to your local project folder and run:  
   `imdone`

####Put a task at the top of a list called "to-do"
   `[this is a task](#todo:0)`
####In javascript code
   `//[this is a task in javascript code](#done:120)`
####Put a task on the bottom of a list called "doing"
   `[this is a task in doing](#doing:20)` 
####Tasks are sorted by the number after the `:`
####imdone will create a folder named imdone that will contain your custom configuration and a file to keep your lists in order
   - you should keep imdone in source control

###Configuration
After running imdone for the first time, modify imdone/imdone.js in your project directory.  The default config looks like this.  Your imdone.js will extend this.

	module.exports = {
		include:/^.*$/,
		exclude:/^(node_modules|imdone|target)\/|^\.(git|svn)\/|\~$|\.(jpg|png|gif|swp)$/,
		port:8080,
		//github : {url : "http://www.github.com/piascikj/imdone"}, //Use this if you want links to point at github
		marked : {
			gfm: true,
			pedantic: false,
			sanitize: true
		}
	};

###Release notes

####0.1.2
- [Page needs to refresh when tasks have been modified, deleted or added.  Use <https://npmjs.org/package/ws>](#done:50)

####0.1.3
- include added to config