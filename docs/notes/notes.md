imdone notes for development
==========
- [[link to a file]]
- [test task](#ARCHIVE:930)
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
- [forever-monitor for cli <https://github.com/nodejitsu/forever-monitor>](#ARCHIVE:850)

### Misc
- [Add filter link on each task to filter by file task is in](#ARCHIVE:460)
- [parse github wiki links to point at files](#ARCHIVE:590)
- [Move task causes multiple updates to board](#ARCHIVE:600)
- [Filter should stick with project, but clear when project changes](#ARCHIVE:540)
- [Fix include and excludes](#ARCHIVE:580)
- [Fix show list on task-link](#ARCHIVE:630) 
- [User should be able to execute a javscript callback when a files are modified in the editor or by moving a task](#ARCHIVE:570)
- [User should be able to jump back to the task in the board if the task is clicked in the file view task notification](#ARCHIVE:610)
- [User should be able to rename a file including it's path](#PLANNING:110)
- [User should be able archive tasks](#ARCHIVE:420)
- [Use json for configuration, not module](#ARCHIVE:140)
- [User should be able to batch move tasks to another list](#ARCHIVE:430)
- [Switch from flattr to gittip](#ARCHIVE:560)
- [User should get a modal confirmation if closing a file that has been edited #feature](#ARCHIVE:670)
- [User should be able to add #hashtags to a #task and filter by them #feature](#PLANNING:80)
    - They could be after the list name like #doing#feature and apear as a pill or badge on the front end
- [User should be able to jump to task by clicking it in preview and if list is hidden it should show and task should be highlighted](#ARCHIVE:660)
- [Use prism for syntax highlighting [Prism](http://prismjs.com/)](#ARCHIVE:700)
- [User should be able to create .md files and have them open in the editor](#ARCHIVE:480)
- [Modularize code [Organizing your application using Modules (require.js) - Backbone.js Tutorials](http://backbonetutorials.com/organizing-backbone-using-modules/)](#TODO:50)
- [Use ***context menu api*** > <http://developer.chrome.com/beta/extensions/contextMenus.html#examples> for chrome extension that opens the live kanban board](#TODO:140)
	- On links that look like tasks include something in markdown that defines the source of the content

	`[whatever you want](http://link/to/project/root "imdone:source")`

- [Start using travis for CI <https://travis-ci.org/>](#ARCHIVE:550)
    - <http://stackoverflow.com/questions/12336566/travis-ci-with-jasmine-node>
- [Implement find and replace <https://github.com/ajaxorg/ace/issues/56>](#TODO:130)
- [Spell check in Ace <http://www.chrisfinke.com/2011/03/31/announcing-typo-js-client-side-javascript-spellchecking/> <http://jasonaclark.com/2011/05/04/ode-to-my-spell-checker/> <https://npmjs.org/package/spellcheck>](#TODO:70)
- [If links to files exist in tasks, open the file on click](#ARCHIVE:760)
- [User should be able to create a task with a macro/hotkey that renders `[]()` and finds the first letter in the line to apply it](#ARCHIVE:0)
- [Leave manage lists open when hiding/showing list](#ARCHIVE:910)
- [Add links to imdone website, pledgie and [twitter](https://twitter.com/about/resources/buttons#tweet), also use flattr](#ARCHIVE:650)
- [Add search for files and tasks <https://github.com/visionmedia/search> or <https://github.com/visionmedia/reds>](#ARCHIVE:720)
- [Block entry and ask the user to load changes if a file changes while editing](#TODO:80)
- [When a user clicks task link in MD, current task should change](#ARCHIVE:640)
- [On opening of file, set the project at the global level](#ARCHIVE:440)
- [User should be able to print board as lists of tasks](#ARCHIVE:730)
- [If a README.md exists, show notification with link](#ARCHIVE:780)
- [Create docs site <http://blog.jetstrap.com/2013/03/building-a-docs-site-with-jekyll-github-pages/>](#ARCHIVE:690)
    - [Getting to Know GitHub Pages: Static Project Pages, Fast | Webdesigntuts+](http://webdesign.tutsplus.com/tutorials/applications/getting-to-know-github-pages-static-project-pages-fast/) 
- [Add link to Asciiflow <http://www.asciiflow.com/#Draw>](#TODO:60)
- [Make html and xml files printable](#ARCHIVE:740)
- [Upgrade to [font-awesome 3.1.1 ](http://fortawesome.github.io/Font-Awesome/icons/)](#ARCHIVE:500)
- [accept more data about a task with `#key:value`](#PLANNING:130)
- [Use icon-asterisk for menu of more options when editing](#PLANNING:140)
- [Set up user page and point leannotes.com to it](#ARCHIVE:530)
    - [Setting up a custom domain with Pages · GitHub Help](https://help.github.com/articles/setting-up-a-custom-domain-with-pages)
    - [User, Organization and Project Pages · GitHub Help](https://help.github.com/articles/user-organization-and-project-pages)
### Bugs
- [When a file is modified and a search link is clicked, changes are lost](#ARCHIVE:470)
- [Renaming lists is broken with multiple projects loaded #bug](#ARCHIVE:860)
- [Open editor for new files #bug](#ARCHIVE:510) 
- [Move search to a dialog that's always available with ctrl+shift+f #bug](#ARCHIVE:710)

### Labels and Badges
- Default <span class="label">Default</span>
- Success <span class="label label-success">Success</span>
- Warning <span class="label label-warning">Warning</span>
- Important	<span class="label label-important">Important</span>
- Info <span class="label label-info">Info</span>
- Inverse <span class="label label-inverse">Inverse</span>

Roadmap
----
- [Enable svn and git commit after file changes](#ARCHIVE:490)
- [Convert front end to use backbone.js](#TODO:90)
- [respect marked configuration in client javascript](#TODO:160)
- [User should be able to remove task syntax with hotkey when in task text](#PLANNING:120)
- [User should be able to use TOC in preview mode for md files](#ARCHIVE:680)
- [User should get a guided tour](#ARCHIVE:120)
- [Enable vfs <https://github.com/c9/vfs-socket> as method of interacting with other storage providers.](#ARCHIVE:520)
- [User should be able to remove all tasks in the archive](#PLANNING:20)
- [User should be able to add and remove projects in the UI](#ARCHIVE:70)

Must do
----
- [User should be able to select the color of lists by [tkrotoff/jquery-simplecolorpicker](https://github.com/tkrotoff/jquery-simplecolorpicker)](#DOING:0)
- [email tasks using mailto](#DOING:0)
- [javascript - Automically open default email client and pre-populate content - Stack Overflow](http://stackoverflow.com/questions/13231125/automically-open-default-email-client-and-pre-populate-content)
  - each task should be in the proper order under it's list


- [Fix all modals, so they have element focus](#ARCHIVE:50)

- [User should be able to get quick help with keyboard shortcuts](#ARCHIVE:40)

- [Add recent projects history](#ARCHIVE:10)

- [Create tutorials for different flows](#ARCHIVE:30)
  - In the tutorials, show how to create lists without first creating a task
  - Also mention the markdown link plugin for chrome
  - add project
  - Save file
  - create list
  - Move tasks
  - archive tasks
  - filter by tasks
  - rename list
  - move list
  - hide/show list
  - search (I'm here)
  - remove project
