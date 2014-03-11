imdone notes for development
==========
- [test task](#archive:170)
## npm

Markdown | Less | Pretty
--- | :---: | ---:
*Still* | `renders` | **nicely**
1 | 2 | 3

### Stats  
- [NPM stats for imdone](http://isaacs.iriscouch.com/downloads/_design/app/_view/pkg?group_level=3&end_key=[%22imdone%22]&start_key=[%22imdone%22,{}]&descending=true)
- [NPM stats for imdone total downloads](http://isaacs.iriscouch.com/downloads/_design/app/_view/pkg?group_level=1&start_key=["imdone"]&end_key=["imdone",{}])
- [npm-stat | vorb.de - imdone](http://npm-stat.vorb.de/charts.html?package=imdone)
    - [pvorb/npm-stat](https://github.com/pvorb/npm-stat)

### Writing a node package
- <http://javascriptplayground.com/blog/2012/08/writing-a-command-line-node-tool>

### cli
- [forever-monitor for cli <https://github.com/nodejitsu/forever-monitor>](#archive:90)

### Misc
- [Add filter link on each task to filter by file task is in](#done:0)
- [parse github wiki links to point at files](#done:160)
- [Move task causes multiple updates to board](#done:170)
- [Filter should stick with project, but clear when project changes](#done:90)
- [Fix include and excludes](#done:140)
- [Fix show list on task-link](#done:200) 
- [User should be able to execute a javscript callback when a files are modified in the editor or by moving a task](#done:130)
- [User should be able to jump back to the task in the board if the task is clicked in the file view task notification](#done:180)
- [User should be able to rename a file including it's path](#doing:10)
- [Use json for configuration, not module](#doing:20)
- [User should be able to batch move tasks to another list](#doing:0)
- [Switch from flattr to gittip](#done:120)
- [User should get a modal confirmation if closing a file that has been edited #feature](#done:250)
- [User should be able to add #hashtags to a #task and filter by them #feature](#todo:150)
    - They could be after the list name like #doing#feature and apear as a pill or badge on the front end
- [User should be able to jump to task by clicking it in preview and if list is hidden it should show and task should be highlighted](#done:240)
- [Use prism for syntax highlighting [Prism](http://prismjs.com/)](#done:280)
- [User should be able to create .md files and have them open in the editor](#done:20)
- [Modularize code [Organizing your application using Modules (require.js) - Backbone.js Tutorials](http://backbonetutorials.com/organizing-backbone-using-modules/)](#todo:50)
- [Use ***context menu api*** > <http://developer.chrome.com/beta/extensions/contextMenus.html#examples> for chrome extension that opens the live kanban board](#todo:210)
	- On links that look like tasks include something in markdown that defines the source of the content

	`[whatever you want](http://link/to/project/root "imdone:source")`

- [Start using travis for CI <https://travis-ci.org/>](#done:100)
    - <http://stackoverflow.com/questions/12336566/travis-ci-with-jasmine-node>
- [Implement find and replace <https://github.com/ajaxorg/ace/issues/56>](#todo:190)
- [Spell check in Ace <http://www.chrisfinke.com/2011/03/31/announcing-typo-js-client-side-javascript-spellchecking/> <http://jasonaclark.com/2011/05/04/ode-to-my-spell-checker/> <https://npmjs.org/package/spellcheck>](#todo:80)
- [use [doco languages.js](https://github.com/jashkenas/docco/blob/master/resources/languages.json) to [detect TODO and FIXME](lib/imdone.js) style comments and convert but keep the TODO or FIXME or whatever in the front.](#planning:0)
- [If links to files exist in tasks, open the file on click](#done:350)
- [User should be able to select the color of lists by bootstrap badge class](#todo:120)
- [Leave manage lists open when hiding/showing list](#archive:150)
- [Add links to imdone website, pledgie and [twitter](https://twitter.com/about/resources/buttons#tweet), also use flattr](#done:230)
- [Add search for files and tasks <https://github.com/visionmedia/search> or <https://github.com/visionmedia/reds>](#done:310)
- [Block entry and ask the user to load changes if a file changes while editing](#todo:100)
- [When a user clicks task link in MD, current task should change](#done:210)
- [On opening of file, set the project at the global level](#archive:0)
- [User should be able to print board as lists of tasks](#done:320)
- [If a README.md exists, show notification with link](#archive:20)
- [Create docs site <http://blog.jetstrap.com/2013/03/building-a-docs-site-with-jekyll-github-pages/>](#done:270)
    - [Getting to Know GitHub Pages: Static Project Pages, Fast | Webdesigntuts+](http://webdesign.tutsplus.com/tutorials/applications/getting-to-know-github-pages-static-project-pages-fast/) 
- [Add link to Asciiflow <http://www.asciiflow.com/#Draw>](#todo:60)
- [Make html and xml files printable](#done:330)
- [Upgrade to [font-awesome 3.1.1 ](http://fortawesome.github.io/Font-Awesome/icons/)](#done:50)
- [accept more data about a task with `#key:value`](#planning:20)
- [Use icon-asterisk for menu of more options when editing](#planning:30)
- [Set up user page and point leannotes.com to it](#done:80)
    - [Setting up a custom domain with Pages · GitHub Help](https://help.github.com/articles/setting-up-a-custom-domain-with-pages)
    - [User, Organization and Project Pages · GitHub Help](https://help.github.com/articles/user-organization-and-project-pages)
### Bugs
- [When a file is modified and a search link is clicked, changes are lost](#done:10)
- [Renaming lists is broken with multiple projects loaded #bug](#archive:100)
- [Open editor for new files #bug](#done:60) 
- [Move search to a dialog that's always available with ctrl+shift+f #bug](#done:300)

### Labels and Badges
- Default <span class="label">Default</span>
- Success <span class="label label-success">Success</span>
- Warning <span class="label label-warning">Warning</span>
- Important	<span class="label label-important">Important</span>
- Info <span class="label label-info">Info</span>
- Inverse <span class="label label-inverse">Inverse</span>

Roadmap
----
- [Enable svn and git commit after file changes](#done:40)
- [Convert front end to use backbone.js](#todo:110)
- [respect marked configuration in client javascript](#todo:230)
- [User should be able to remove task syntax with hotkey when in task text](#doing:30)
- [User should be able to use TOC in preview mode for md files](#done:260)
- [User should be able to quickly add a date and assigned to tasks using @&lt;user&gt; @&lt;date&gt;](#planning:40)
- [User should be able to get quick help with keyboard shortcuts](#planning:50)
- [User should get a guided tour](#todo:220)
- [Enable vfs <https://github.com/c9/vfs-socket> as method of interacting with other storage providers.](#done:70)
- [Use [Broadway](https://npmjs.org/package/broadway) for IOC.](#todo:140)

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









