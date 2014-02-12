[![Build Status](https://travis-ci.org/piascikj/imdone.png?branch=master)](https://travis-ci.org/piascikj/imdone)
[![Dependency Status](https://gemnasium.com/piascikj/imdone.png)](https://gemnasium.com/piascikj/imdone)
[![Gittip donate button](http://img.shields.io/gittip/piascikj.png)](https://www.gittip.com/piascikj/ "Donate weekly to this project using Gittip")
[![Flattr donate button](http://img.shields.io/flattr/donate.png?color=yellow)](http://flattr.com/thing/1286067/iMDone "Donate monthly to this project using Flattr")

[![NPM](https://nodei.co/npm/imdone.png)](https://nodei.co/npm/imdone/)

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
- [Use gollum link syntax](https://github.com/gollum/gollum/wiki#page-links) - Great for managing github wikis
- Execute an event listener for modified files

Quickstart
----
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

Configuration
----
After running imdone for the first time, modify imdone/imdone.js in your project directory.  The default config looks like this.  Your imdone.js will extend this.
```javascript
module.exports = {
  include:/^.*$/,
  exclude:/^(node_modules|bower_components|imdone|target|build)\/|\.(git|svn|imdone)|\~$|\.(jpg|png|gif|swp|ttf|otf)$/,
  marked : {
    gfm: true,
    pedantic: false,
    sanitize: true
  },
  events : {
    modified: function(params) {
      console.log("Files modified in project:", params.project.path);
      console.log(params.files);
    }
  }
};
```

How you can help
----
If you like iMDone and want to help me make it better, you can make a contribution at Gittip.  Every donation is very much appreciated.  

[![Support via Gittip](https://rawgithub.com/twolfson/gittip-badge/0.1.0/dist/gittip.png)](https://www.gittip.com/piascikj/)

If you have some spare time, then there is no better way to help an open source project than to get involved in one of the following ways.

- Help diagnose and report problems
- Suggest fixes by sending in patches
- Improve the code
- Help with unit and end-to-end testing
- Provide peer support on our forum
- Publish an article on your blog (send the link) to educate others regarding some aspect of the project
- Help with missing documentation

Tips
----
### Tasks are sorted by the number after the colon
### Keep tasks in code  
```javascript
//[this is a todo task in javascript code](#todo:0)
```

###Embed a filter link in a task
```
[Filter by [src/main/java](#filter/src/main/java)](#filters:0)
```  
This would create a filters list containing this task and a link that will populate the filter box with *src/main/java*

### Keep the .imdone folder in source control!
- It contains your configuration and list order

### If tracking a large number of files
  - Increase the "watch handle limit" to 512k**
  - As root edit /etc/sysctl.conf, add the following line
```
fs.inotify.max_user_watches = 524288
```
  - Apply the change
```
sudo sysctl -p
```

### Checkout a github wiki to manage with imdone
  - If the github clone url is https://github.com/piascikj/imdone.git then
```
git clone https://github.com/piascikj/imdone.wiki.git
```

### Configuration for running git add and commit after files are modified
```javascript
var exec = require('child_process').exec;
var util = require('util');

/*
 * imdone
 * https://github.com/piascikj/imdone
 *
 * Copyright (c) 2012 Jesse Piascik
 * Licensed under the MIT license.
 */
module.exports = {
  include:/^.*$/,
  exclude:/^(node_modules|bower_components|imdone|target|build)\/|\.(git|svn|imdone)|\~$|\.(jpg|png|gif|swp|ttf|otf)$/,
  marked : {
    gfm: true,
    pedantic: false,
    sanitize: true
  },
  events : {
    modified: function(params) {
      console.log("Files modified in project:", params.project.path);
      var statusCmd = "git status -s";
      var addCmd = "git add -A";
      var commitCmd = 'git commit -a -m "Update to notes from imdone"';
      var opts = { cwd: params.project.path };
      console.log("---Running ", statusCmd);
      exec(statusCmd, opts, function(err, stdout, stderr) {
        if (err || stderr) {
          console.log("Error executing ", statusCmd);
          console.log("err:", err);
          console.log("stderr:", stderr);
          return;
        }

        if (/^\s*(\?|M|A|D|R|C|U)/g.test(stdout)) {
          console.log("Found changes to commit!");
          console.log(stdout);
          console.log("---Running ", addCmd);
          exec(addCmd, opts, function(err, stdout, stderr) {
            if (err || stderr) {
              console.log("Error executing ", addCmd);
              console.log("err:", err);
              console.log("stderr:", stderr);
              return;
            }
            console.log("stdout:", stdout);

            console.log("---Running ", commitCmd);
            exec(commitCmd, opts, function(err, stdout, stderr) {
              if (err || stderr) {
                console.log("Error executing ", commitCmd);
                console.log("err:", err);
                console.log("stderr:", stderr);
                return;
              }
              console.log("stdout:", stdout);
            });
          });
        } else {
          console.log("No changes detected.");
        }
      });

    }
  }
};
```

Common Errors
----
- If you are using bower in your project be sure to exclude the directory defined in your .bowerrc file (usually bower_components), otherwise you'll end up with too many open files errors.

See it in action!
----
Fork this repository and run imdone in your local copy.  I use imdone for keeping track of imdone development.

Testing
----
- I use iMDone every day on Ubuntu 13.04 and the latest version of chrome.  It should work on any machine that has nodejs and npm installed and for auto update of boards, a browser that supports websockets.
- I us [jasmine](http://pivotal.github.io/jasmine/) and [mhevery/jasmine-node](https://github.com/mhevery/jasmine-node) for testing.
