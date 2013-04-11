imdone notes for development
==========
###Local kanban board 
- [Use ***Global install so command line will execute server*** > <http://blog.nodejs.org/2011/03/23/npm-1-0-global-vs-local-installation/>](#archive:260)
   - <http://package.json.jit.su/>
- [How will this work in github?](#archive:270)
- [Create Kanban board functionality](#archive:290)

###Writing a node package
- <http://javascriptplayground.com/blog/2012/08/writing-a-command-line-node-tool>

###UI
- [use this for sortable <http://farhadi.ir/projects/html5sortable/> decided to use jquery](#archive:250)
- [Keep a file in ~/.imdone with project folders](#archive:140)
- [Use ace editor for file display and edit <http://ace.ajax.org> <https://github.com/ajaxorg/ace/issues/1017>](#done:100)

###Config
- [Do allow, deny - add include regex to config](#archive:240)

###websockets
- [websockets multiuser example](https://github.com/einaros/ws/blob/master/examples/fileapi/server.js)

###cli
- [forever-monitor for cli <https://github.com/nodejitsu/forever-monitor>](#todo:120)
- [implement **add** cli option](#archive:170)
	- **start:** starts the process if not started and opens the board
	- **stop:** stops the process
	- **restart:** restarts the process
	- **add** adds a project to the board

###Misc
- [Create github site](#archive:280)
- [Use ***context menu api*** > <http://developer.chrome.com/beta/extensions/contextMenus.html#examples> for chrome extension that opens the live kanban board](#todo:130)
	- On links that look like tasks include something in markdown that defines the source of the content

	`[whatever you want](http://link/to/project/root "imdone:source")`

- [Start using travis for CI <https://travis-ci.org/>](#todo:30)
    - <http://stackoverflow.com/questions/12336566/travis-ci-with-jasmine-node>
- [Implement find and replace <https://github.com/ajaxorg/ace/issues/56>](#todo:70)
- [Spell check in Ace](#todo:100)
- [use [doco languages.js](https://github.com/jashkenas/docco/blob/master/resources/languages.json) to detect TODO and FIXME style comments and convert](#todo:0)
- [Leave manage lists open when hiding/showing list](#planning:30)
- [Add links to imdone website, pledgie and twitter](#doing:0)
- [Enable browsing of markdown files](#doing:10)
- [Add search for files and tasks](#todo:50)

###Bugs
- [Renaming lists is broken with multiple projects loaded](#done:90)







