imdone notes for development
==========
###Local kanban board 
- [Use ***Global install so command line will execute server*** > <http://blog.nodejs.org/2011/03/23/npm-1-0-global-vs-local-installation/>](#archive:230)
   - <http://package.json.jit.su/>
- [How will this work in github?](#archive:240)
- [Create Kanban board functionality](#archive:260)

###Writing a node package
- <http://javascriptplayground.com/blog/2012/08/writing-a-command-line-node-tool>

###UI
- [use this for sortable <http://farhadi.ir/projects/html5sortable/> decided to use jquery](#archive:220)
- [Keep a file in ~/.imdone with project folders](#archive:110)
- [Use ace editor for file display and edit <http://ace.ajax.org> <https://github.com/ajaxorg/ace/issues/1017>](#doing:10)

###Config
- [Do allow, deny - add include regex to config](#archive:210)

###websockets
- [websockets multiuser example](https://github.com/einaros/ws/blob/master/examples/fileapi/server.js)

###cli
- [forever-monitor for cli <https://github.com/nodejitsu/forever-monitor>](#todo:90)
- [implement **add** cli option](#archive:140)
	- **start:** starts the process if not started and opens the board
	- **stop:** stops the process
	- **restart:** restarts the process
	- **add** adds a project to the board

###Misc
- [Create github site](#archive:250)
- [Use ***context menu api*** > <http://developer.chrome.com/beta/extensions/contextMenus.html#examples> for chrome extension that opens the live kanban board](#todo:100)
	- On links that look like tasks include something in markdown that defines the source of the content

	`[whatever you want](http://link/to/project/root "imdone:source")`

- [Start using travis for CI <https://travis-ci.org/>](#todo:60)






