imdone
==========

##Create tasks in files using markdown syntax and organize them with kanban
- uses node.js to listen for file changes and a simple format that looks like this
  
###Put a task at the top of a list called "to-do"
   `[this is a task](#to-do:0)`
####In code
   `//[this is a task in javascript code](#doing:0)`

###Put a task on the bottom of a list called "doing"
   `[this is a task](#doing:1000)`

###Tasks are sorted by the number after the :

###imdone.md at the root folder contains list names
- When lists are reordered in kanban imdone.md is moddified
- When a file is saved, the imdone.md file will be checked for list names that exist in files

###Local kanban board 
- [Use ***Global install so command line will execute server***<http://blog.nodejs.org/2011/03/23/npm-1-0-global-vs-local-installation/>](#doing?t0)
   - <http://package.json.jit.su/>


###Chrome extension for kanban 
- [Use ***context menu api***(<http://developer.chrome.com/beta/extensions/contextMenus.html#examples>) for chrome extension that opens the live kanban board](#doing?t0)
- [How will this work in github?](#doing?t0)

###Writing a node package
- <http://javascriptplayground.com/blog/2012/08/writing-a-command-line-node-tool>



