iMDone
==========
##Create tasks in any file using markdown syntax and organize them with a local kanban board.  
##Your tasks are in your files, so you can share your board on [github](http://www.github.com), [dropbox](http://www.dropbox.com), or any other cloud storage provider.

##Prerequisites 
- [nodejs](http://nodejs.org/) is [installed](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager)
- [npm](https://npmjs.org/) is [installed](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager)


##Disclaimer
iMDone has only been tested on my Ubuntu 12.04 desktop using chrome 23.0.x as the default browser.  It should work on any machine that has nodejs and npm installed and for auto update of boards, a browser that supports websockets.

##Install
   `npm install -g imdone`

##And run!
- open a terminal window and navigate to your local project folder and run:  
   `imdone`

- You can start it in multiple directories and switch between projects in the UI

- open another terminal window and run:  
	`imdone open` or go to <http://localhost:8080>

- stop imdone with ctrl+c in the console you started it initialy, or by running:  
	`imdone stop`

###See it in action!
- fork this repository and run imdone in your local copy.  I use imdone for keep track of development of imdone
###Tasks are just markdown links

**Put a task at the top of a list called "todo"**  
   `[this is a task](#todo:0)`  

**In javascript code**  
   `//[this is a task in javascript code](#todo:0)`  

**Put a task on the bottom of a list called "doing" (giving it a sort value of 1000 will put it at the bottom unless you have tons of tasks in the list)**  
   `[this is a task in doing](#doing:1000)`  

**Tasks are sorted by the number after the `:`**  

**imdone will create a directory named imdone that will contain your custom configuration and a file to keep your lists in order**  
- you should keep the imdone directory in source control  
  
**Filter by file name**  
- You can filter by the file name the task are in.  
- As you type in the "filter by file name" field, tasks are filtered
  
##Configuration
After running imdone for the first time, modify imdone/imdone.js in your project directory.  The default config looks like this.  Your imdone.js will extend this.
  
	module.exports = {
		include:/^.*$/,
		exclude:/^(node_modules|imdone|target)\/|^\.(git|svn)\/|\~$|\.(jpg|png|gif|swp)$/,
		//github : {url : "http://www.github.com/piascikj/imdone"}, //Use this if you want links to point at github
		marked : {
			gfm: true,
			pedantic: false,
			sanitize: true
		}
	};

###Release notes
####0.1.14
- replace mu2 with Handlebars

####0.1.13
- Moved open page to open cli option
- switched to socket.io for near real-time updates

####0.1.11
- Now able to hide a list from board using hidden
#####imdone/data.js is now formatted like this  
  
	{
		lists:[Array of list names],
		hidden:[Array of list names to hide]
	}

####0.1.10
- Source view if github is not set
- Default lists are respected if added to imdone/data.js
- Lists won't be removed unless specifically removed in ui or imdone/data.js

####0.1.8
- Sort is fixed for multiple projects

####0.1.7
- Start in multiple project directories

####0.1.6
- Added filter by file name

####0.1.4
- Use line number when loading page in github

####0.1.3
- include added to config for files to include.  Order is include > Exclude

####0.1.2
- Using websockets to refresh board on changes

