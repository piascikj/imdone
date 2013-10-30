```

	  _   __  __   _____                         
	 (_) |  \/  | |  __ \                        
	  _  | \  / | | |  | |   ___    _ __     ___ 
	 | | | |\/| | | |  | |  / _ \  | '_ \   / _ \
	 | | | |  | | | |__| | | (_) | | | | | |  __/
	 |_| |_|  |_| |_____/   \___/  |_| |_|  \___|
```

[![Dependency Status](https://gemnasium.com/piascikj/imdone.png)](https://gemnasium.com/piascikj/imdone)
[![NPM version](https://badge.fury.io/js/imdone.png)](https://npmjs.org/package/imdone)
[![Flattr this](http://api.flattr.com/button/flattr-badge-large.png)](http://flattr.com/thing/1286067/iMDone)

Keep your tasks in your work!!!
----
A simple scrum board and markdown wiki for geeks.  No DB needed!  Your tasks are in your source code, so you can share your board on [github](http://www.github.com).

### Tasks are just markdown links!!!


**Put a task at the top of a list called "todo"**  
```
[this is a task](#todo:0)
[this is another task](#todo:10)
```  

**In javascript code**  
```javascript
//[this is a task in javascript code](#todo:0)
```  

**Put a task on the bottom of a list called "doing" (giving it a sort value of 1000 will put it at the bottom unless you have tons of tasks in the list)**  
```
[this is a task in doing](#doing:40)
```

**Tasks are sorted by the number after the `:`**

### Filter by path
You can filter by path using the filter box in the top right corner, or by embedding a filter link in a task like this:  

```
[Filter by [src/main/java](#filter/src/main/java)](#filters:0)
```  

This would create a filters list containing this task and a link that will populate the filter box with *src/main/java*

Search and more!
----
- **Edit and create files directly in iMDone using the [Ace editor](http://ace.ajax.org)!**
- **Stay focused on your current task!  It's always there in the bottom right corner.**
- **Create files by just linking to them in markdown files**
- **Preview markdown files and print them as markdown or html!**
- **Hide and show lists**
- **Delete files**
- **Search with highlighted results**

Keyboard shortcuts
----
```
Shift+Ctrl+s    Save file
Shift+Ctrl+x    Remove file
esc             File View - exit editor/preview
                List View - clear filter
i               When in preview, edit file
Shift+Ctrl+f    Open project search dialog
Ctrl+f          When in edit mode, search current file
```

Prerequisites 
----
- [nodejs](http://nodejs.org/) is [installed](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager)
- [npm](https://npmjs.org/) is [installed](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager)


Install
----
```
npm install -g imdone
```

Run
----
- open a terminal window and navigate to your local project directory and run:  

```
imdone -o
```

- Here's the help output

```
Usage: imdone [options]

Options:

  -h, --help                output usage information
  -V, --version             output the version number
  -o, --open                Open imdone in the default browser
  -s, --stop                Stop imdone server
  -d, --dirs <directories>  A comma separated list of project directories

Examples:

  Open imdone in a browser with the current working directory as the project root

  $ imdone -o

  Open imdone in a browser with list of project directories

  $ imdone -o -d projects/imdone,projects/myproject
```

Common Errors
----
- If you are using bower in your project be sure to exclude the directory defined in your .bowerrc file, otherwise you'll end up with too many open files errors.

How you can help
----
If you like iMDone and want to help me make it better, you can make a contribution at pledgie.  Every donation is very much appreciated.  

<a href='http://www.pledgie.com/campaigns/19536'><img alt='Click here to lend your support to: iMDone - TODO, doing, done! and make a donation at www.pledgie.com !' src='http://www.pledgie.com/campaigns/19536.png?skin_name=chrome' border='0' /></a>

If you have some spare time, then there is no better way to help an open source project than to get involved in one of the following ways.

- Help diagnose and report problems
- Suggest fixes by sending in patches
- Improve the code
- Help with unit and end-to-end testing
- Provide peer support on our forum
- Publish an article on your blog (send the link) to educate others regarding some aspect of the project
- Help with missing documentation

See it in action!
----
Fork this repository and run imdone in your local copy.  I use imdone for keep track of imdone development.

**imdone will create a directory named imdone that will contain your custom configuration and a file to keep your lists in order**  
- you should keep the imdone directory in source control  
  
**Filter by file name**  
- You can filter by the file name the task are in.  
- As you type in the "filter by file name" field, tasks are filtered
  
Configuration
----
After running imdone for the first time, modify imdone/imdone.js in your project directory.  The default config looks like this.  Your imdone.js will extend this.
```javascript
	module.exports = {
		include:/^.*$/,
		exclude:/^(node_modules|imdone|target)\/|\.(git|svn)\/|\~$|\.(jpg|png|gif|swp)$/,
		marked : {
			gfm: true,
			pedantic: false,
			sanitize: true
		}
	};
```

Testing
----
- iMDone has been tested on my Ubuntu 12.04 desktop using chrome 23.0.x and Firefox 19.x.  It should work on any machine that has nodejs and npm installed and for auto update of boards, a browser that supports websockets.
- We us [jasmine](http://pivotal.github.io/jasmine/) and [mhevery/jasmine-node](https://github.com/mhevery/jasmine-node) for testing.

Roadmap
----

- [Enable svn and git commit after file changes](#planning:180)
- [Convert front end to use backbone.js](#planning:250)
- [respect marked configuration in client javascript](#todo:130)
- [User should be able to remove task syntax with hotkey when in task text](#planning:100)
- [User should be able to use TOC in preview mode for md files](#planning:80)
- [User should be able to quickly add a date and assigned to tasks using @&lt;user&gt; @&lt;date&gt;](#planning:190)
- [User should be able to get quick help with keyboard shortcuts](#planning:260)
- [User should get a guided tour](#todo:120)
- [Enable vfs <https://github.com/c9/vfs-socket> as method of interacting with other storage providers.](#planning:30)
- [Use [Broadway](https://npmjs.org/package/broadway) for IOC.](#planning:0)

Future Design CRC
----

###Repository

####Responsibilities
- Save and load source files
- Handle authentication for accessing files
- Handle text search

####Collaborators
- Project

###RepositoryFactory

####Responsibilities
- Return a repository object capable of storing and retrieving files

####Collaborators
- Repository

###Project

####Responsibilities
- Container for information
    - User(s)
    - Role(s)
    - Repositories

###User

####Responsibilities
- Container for information
    - Projects

###SearchFacade

####Responsibilities
- Run a text search in a given repository
- Ask the RepositoryFactory for a Repository
- If there are multiple Repositories for a project delegate to each for searhing

####Collaborators
- RepositoryFactory
- Repository
- Project

