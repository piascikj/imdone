[![Dependency Status](https://gemnasium.com/piascikj/imdone.png)](https://gemnasium.com/piascikj/imdone)
[![NPM version](https://badge.fury.io/js/imdone.png)](https://npmjs.org/package/imdone)
[![Flattr this](http://api.flattr.com/button/flattr-badge-large.png)](http://flattr.com/thing/1286067/iMDone)

Introduction
----
When working on a software project in code or writing project in markdown, there are always tasks you need to record.
Most people use a separate tool to record tasks and sort them into lists.
That's where iMDone comes in.  Tasks are just markdown links!

Features
----
- Create tasks in any text file using markdown link syntax
- Sort tasks and move them between lists using drag and drop
- Reorder lists
- Hide and show lists
- Task filters
- Search
- Create, delete and edit files
- Markdown preview with table of contents
- Syntax highlighting in markdown code blocks

Quickstart
----
iMDone is written in javascript and runs on [nodejs](http://nodejs.org/).  You'll need to install nodejs to use iMDone

- Install
```
npm install -g imdone
```
- Run iMDone by opening a terminal window, navigate to your local project directory and run...
```
imdone -o
```
- or for help...
```
imdone -h
```
- Open a file by clicking on the folder icon and create a task like this
```
[Use imdone to manage tasks in my project](#doing:0)
```

Tips
----
- **Tasks are sorted by the number after the colon**
- **Put a task at the top of a list called "todo"**  
```
[this is a task](#todo:0)
[this is another task](#todo:10)
```  
- **In javascript code**  
```javascript
//[this is a todo task in javascript code](#todo:0)
```  
- **Put a task at the bottom of a list called "doing"**
```
[this is a task in doing](#doing:1000)
```
- **Embed a filter link in a task like this:**  
```
[Filter by [src/main/java](#filter/src/main/java)](#filters:0)
```  
This would create a filters list containing this task and a link that will populate the filter box with *src/main/java*


Common Errors
----
- If you are using bower in your project be sure to exclude the directory defined in your .bowerrc file (usually bower_components), otherwise you'll end up with too many open files errors.

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
Fork this repository and run imdone in your local copy.  I use imdone for keeping track of imdone development.

**imdone will create a directory named imdone that will contain your custom configuration and a file to keep your lists in order**  
- you should keep the imdone directory in source control  
  
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

