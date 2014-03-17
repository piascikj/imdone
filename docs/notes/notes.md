imdone notes for development
==========
- [[link to a file]]
- [test task](#archive:530)
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
- [forever-monitor for cli <https://github.com/nodejitsu/forever-monitor>](#archive:450)

### Misc
- [Add filter link on each task to filter by file task is in](#archive:10)
- [parse github wiki links to point at files](#archive:170)
- [Move task causes multiple updates to board](#archive:180)
- [Filter should stick with project, but clear when project changes](#archive:100)
- [Fix include and excludes](#archive:150)
- [Fix show list on task-link](#archive:210) 
- [User should be able to execute a javscript callback when a files are modified in the editor or by moving a task](#archive:140)
- [User should be able to jump back to the task in the board if the task is clicked in the file view task notification](#archive:190)
- [User should be able to rename a file including it's path](#doing:40)
- [User should be able archive tasks](#archive:0)
- [Use json for configuration, not module](#doing:50)
- [User should be able to batch move tasks to another list](#archive:0)
- [Switch from flattr to gittip](#archive:130)
- [User should get a modal confirmation if closing a file that has been edited #feature](#archive:260)
- [User should be able to add #hashtags to a #task and filter by them #feature](#todo:150)
    - They could be after the list name like #doing#feature and apear as a pill or badge on the front end
- [User should be able to jump to task by clicking it in preview and if list is hidden it should show and task should be highlighted](#archive:250)
- [Use prism for syntax highlighting [Prism](http://prismjs.com/)](#archive:290)
- [User should be able to create .md files and have them open in the editor](#archive:30)
- [Modularize code [Organizing your application using Modules (require.js) - Backbone.js Tutorials](http://backbonetutorials.com/organizing-backbone-using-modules/)](#todo:50)
- [Use ***context menu api*** > <http://developer.chrome.com/beta/extensions/contextMenus.html#examples> for chrome extension that opens the live kanban board](#todo:210)
	- On links that look like tasks include something in markdown that defines the source of the content

	`[whatever you want](http://link/to/project/root "imdone:source")`

- [Start using travis for CI <https://travis-ci.org/>](#archive:110)
    - <http://stackoverflow.com/questions/12336566/travis-ci-with-jasmine-node>
- [Implement find and replace <https://github.com/ajaxorg/ace/issues/56>](#todo:190)
- [Spell check in Ace <http://www.chrisfinke.com/2011/03/31/announcing-typo-js-client-side-javascript-spellchecking/> <http://jasonaclark.com/2011/05/04/ode-to-my-spell-checker/> <https://npmjs.org/package/spellcheck>](#todo:80)
- [If links to files exist in tasks, open the file on click](#archive:360)
- [User should be able to select the color of lists by bootstrap badge class](#todo:120)
- [Leave manage lists open when hiding/showing list](#archive:510)
- [Add links to imdone website, pledgie and [twitter](https://twitter.com/about/resources/buttons#tweet), also use flattr](#archive:240)
- [Add search for files and tasks <https://github.com/visionmedia/search> or <https://github.com/visionmedia/reds>](#archive:320)
- [Block entry and ask the user to load changes if a file changes while editing](#todo:100)
- [When a user clicks task link in MD, current task should change](#archive:220)
- [On opening of file, set the project at the global level](#archive:0)
- [User should be able to print board as lists of tasks](#archive:330)
- [If a README.md exists, show notification with link](#archive:380)
- [Create docs site <http://blog.jetstrap.com/2013/03/building-a-docs-site-with-jekyll-github-pages/>](#archive:280)
    - [Getting to Know GitHub Pages: Static Project Pages, Fast | Webdesigntuts+](http://webdesign.tutsplus.com/tutorials/applications/getting-to-know-github-pages-static-project-pages-fast/) 
- [Add link to Asciiflow <http://www.asciiflow.com/#Draw>](#todo:60)
- [Make html and xml files printable](#archive:340)
- [Upgrade to [font-awesome 3.1.1 ](http://fortawesome.github.io/Font-Awesome/icons/)](#archive:60)
- [accept more data about a task with `#key:value`](#planning:10)
- [Use icon-asterisk for menu of more options when editing](#planning:20)
- [Set up user page and point leannotes.com to it](#archive:90)
    - [Setting up a custom domain with Pages · GitHub Help](https://help.github.com/articles/setting-up-a-custom-domain-with-pages)
    - [User, Organization and Project Pages · GitHub Help](https://help.github.com/articles/user-organization-and-project-pages)
### Bugs
- [When a file is modified and a search link is clicked, changes are lost](#archive:20)
- [Renaming lists is broken with multiple projects loaded #bug](#archive:460)
- [Open editor for new files #bug](#archive:70) 
- [Move search to a dialog that's always available with ctrl+shift+f #bug](#archive:310)

### Labels and Badges
- Default <span class="label">Default</span>
- Success <span class="label label-success">Success</span>
- Warning <span class="label label-warning">Warning</span>
- Important	<span class="label label-important">Important</span>
- Info <span class="label label-info">Info</span>
- Inverse <span class="label label-inverse">Inverse</span>

Roadmap
----
- [Enable svn and git commit after file changes](#archive:50)
- [Convert front end to use backbone.js](#todo:110)
- [respect marked configuration in client javascript](#todo:230)
- [User should be able to remove task syntax with hotkey when in task text](#doing:60)
- [User should be able to use TOC in preview mode for md files](#archive:270)
- [User should be able to quickly add a date and assigned to tasks using @&lt;user&gt; @&lt;date&gt;](#planning:30)
- [User should be able to get quick help with keyboard shortcuts](#planning:40)
- [User should get a guided tour](#todo:220)
- [Enable vfs <https://github.com/c9/vfs-socket> as method of interacting with other storage providers.](#archive:80)
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









