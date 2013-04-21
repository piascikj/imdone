imdone notes for development
==========
###Some of this should probably be in [README.md](README.md)
###Local kanban board 
- [Use ***Global install so command line will execute server*** > <http://blog.nodejs.org/2011/03/23/npm-1-0-global-vs-local-installation/>](#archive:420)
   - <http://package.json.jit.su/>
- [How will this work in github?](#archive:430)
- [Create Kanban board functionality](#archive:450)

###Writing a node package
- <http://javascriptplayground.com/blog/2012/08/writing-a-command-line-node-tool>

###UI
- [use this for sortable <http://farhadi.ir/projects/html5sortable/> decided to use jquery](#archive:410)
- [Keep a file in ~/.imdone with project folders](#archive:310)
- [Use ace editor for file display and edit <http://ace.ajax.org> <https://github.com/ajaxorg/ace/issues/1017>](#archive:80)

###Config
- [Do allow, deny - add include regex to config](#archive:400)

###websockets
- [websockets multiuser example](https://github.com/einaros/ws/blob/master/examples/fileapi/server.js)

###cli
- [forever-monitor for cli <https://github.com/nodejitsu/forever-monitor>](#todo:100)
- [implement **add** cli option](#archive:330)
	- **start:** starts the process if not started and opens the board
	- **stop:** stops the process
	- **restart:** restarts the process
	- **add** adds a project to the board

###Misc
- [Create github site](#archive:440)
- [Use ***context menu api*** > <http://developer.chrome.com/beta/extensions/contextMenus.html#examples> for chrome extension that opens the live kanban board](#todo:110)
	- On links that look like tasks include something in markdown that defines the source of the content

	`[whatever you want](http://link/to/project/root "imdone:source")`

- [Start using travis for CI <https://travis-ci.org/>](#todo:20)
    - <http://stackoverflow.com/questions/12336566/travis-ci-with-jasmine-node>
- [Implement find and replace <https://github.com/ajaxorg/ace/issues/56>](#todo:60)
- [Spell check in Ace <http://www.chrisfinke.com/2011/03/31/announcing-typo-js-client-side-javascript-spellchecking/>](#planning:50)
- [use [doco languages.js](https://github.com/jashkenas/docco/blob/master/resources/languages.json) to detect TODO and FIXME style comments and convert but keep the TODO or FIXME or whatever in the front.](#planning:0)
- [Leave manage lists open when hiding/showing list](#archive:140)
- [Add links to imdone website, pledgie and [twitter](https://twitter.com/about/resources/buttons#tweet), also use flattr](#planning:40)
- [Enable browsing of markdown files use action: #file?project={{project}}&path={{path}}&line={{line}}, if in preview and next file opened is md, stay in preview <http://stackoverflow.com/questions/11671400/navigate-route-with-querystring>](#archive:20)
- [Add search for files and tasks <https://github.com/visionmedia/search>](#planning:30)
- [Block entry and ask the user to load changes if a file changes while editing](#doing:20)

###Bugs
- [Renaming lists is broken with multiple projects loaded](#archive:90)








