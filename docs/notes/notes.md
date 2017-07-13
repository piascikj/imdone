imdone notes for development
==========
- [[link to a file]]
- [test task id:4311](#ARCHIVE:930)
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
- [forever-monitor for cli <https://github.com/nodejitsu/forever-monitor> id:4322](#ARCHIVE:850)

### Misc
- [Add filter link on each task to filter by file task is in id:4312](#ARCHIVE:460)
- [parse github wiki links to point at files id:4313](#ARCHIVE:590)
- [Move task causes multiple updates to board id:4319](#ARCHIVE:600)
- [Filter should stick with project, but clear when project changes id:4314](#ARCHIVE:540)
- [Fix include and excludes id:4323](#ARCHIVE:580)
- [Fix show list on task-link id:4315](#ARCHIVE:630) 
- [User should be able to execute a javscript callback when a files are modified in the editor or by moving a task id:4316](#ARCHIVE:570)
- [User should be able to jump back to the task in the board if the task is clicked in the file view task notification id:4320](#ARCHIVE:610)
- [User should be able to rename a file including it's path id:4324](#PLANNING:130)
- [User should be able archive tasks id:4409](#ARCHIVE:420)
- [Use json for configuration, not module id:4326](#ARCHIVE:140)
- [User should be able to batch move tasks to another list id:4325](#ARCHIVE:430)
- [Switch from flattr to gittip id:4327](#ARCHIVE:560)
- [User should get a modal confirmation if closing a file that has been edited #feature id:4328](#ARCHIVE:670)
- [User should be able to add #hashtags to a #task and filter by them #feature id:4410](#PLANNING:100)
    - They could be after the list name like #doing#feature and apear as a pill or badge on the front end
- [User should be able to jump to task by clicking it in preview and if list is hidden it should show and task should be highlighted id:4329](#ARCHIVE:660)
- [Use prism for syntax highlighting [Prism](http://prismjs.com/) id:4330](#ARCHIVE:700)
- [User should be able to create .md files and have them open in the editor id:4331](#ARCHIVE:480)
- [Modularize code [Organizing your application using Modules (require.js) - Backbone.js Tutorials](http://backbonetutorials.com/organizing-backbone-using-modules/) id:4332](#TODO:110)
- [Use ***context menu api*** > <http://developer.chrome.com/beta/extensions/contextMenus.html#examples> for chrome extension that opens the live kanban board id:4411](#TODO:160)
	- On links that look like tasks include something in markdown that defines the source of the content

	`[whatever you want](http://link/to/project/root "imdone:source")`

- [Start using travis for CI <https://travis-ci.org/> id:4333](#ARCHIVE:550)
    - <http://stackoverflow.com/questions/12336566/travis-ci-with-jasmine-node>
- [Implement find and replace <https://github.com/ajaxorg/ace/issues/56> id:4334](#TODO:150)
- [Spell check in Ace <http://www.chrisfinke.com/2011/03/31/announcing-typo-js-client-side-javascript-spellchecking/> <http://jasonaclark.com/2011/05/04/ode-to-my-spell-checker/> <https://npmjs.org/package/spellcheck> id:4335](#TODO:130)
- [If links to files exist in tasks, open the file on click id:4338](#ARCHIVE:760)
- [User should be able to create a task with a macro/hotkey that renders `[]()` and finds the first letter in the line to apply it id:4412](#ARCHIVE:0)
- [Leave manage lists open when hiding/showing list id:4336](#ARCHIVE:910)
- [Add links to imdone website, pledgie and [twitter](https://twitter.com/about/resources/buttons#tweet), also use flattr id:4339](#ARCHIVE:650)
- [Add search for files and tasks <https://github.com/visionmedia/search> or <https://github.com/visionmedia/reds> id:4337](#ARCHIVE:720)
- [Block entry and ask the user to load changes if a file changes while editing id:4341](#DONE:0)
- [When a user clicks task link in MD, current task should change id:4414](#ARCHIVE:640)
- [On opening of file, set the project at the global level id:4340](#ARCHIVE:440)
- [User should be able to print board as lists of tasks id:4343](#ARCHIVE:730)
- [If a README.md exists, show notification with link id:4342](#ARCHIVE:780)
- [Create docs site <http://blog.jetstrap.com/2013/03/building-a-docs-site-with-jekyll-github-pages/> id:4344](#ARCHIVE:690)
    - [Getting to Know GitHub Pages: Static Project Pages, Fast | Webdesigntuts+](http://webdesign.tutsplus.com/tutorials/applications/getting-to-know-github-pages-static-project-pages-fast/) 
- [Add link to Asciiflow <http://www.asciiflow.com/#Draw> id:4416](#TODO:120)
- [Make html and xml files printable id:4345](#ARCHIVE:740)
- [Upgrade to [font-awesome 3.1.1 ](http://fortawesome.github.io/Font-Awesome/icons/) id:4346](#ARCHIVE:500)
- [accept more data about a task with `#key:value` id:4347](#PLANNING:150)
- [Use icon-asterisk for menu of more options when editing id:4348](#PLANNING:160)
- [Set up user page and point leannotes.com to it id:4418](#ARCHIVE:530)
    - [Setting up a custom domain with Pages · GitHub Help](https://help.github.com/articles/setting-up-a-custom-domain-with-pages)
    - [User, Organization and Project Pages · GitHub Help](https://help.github.com/articles/user-organization-and-project-pages)
### Bugs
- [When a file is modified and a search link is clicked, changes are lost id:4349](#ARCHIVE:470)
- [Renaming lists is broken with multiple projects loaded #bug id:4350](#ARCHIVE:860)
- [Open editor for new files #bug id:4352](#ARCHIVE:510) 
- [Move search to a dialog that's always available with ctrl+shift+f #bug id:4351](#ARCHIVE:710)

### Labels and Badges
- Default <span class="label">Default</span>
- Success <span class="label label-success">Success</span>
- Warning <span class="label label-warning">Warning</span>
- Important	<span class="label label-important">Important</span>
- Info <span class="label label-info">Info</span>
- Inverse <span class="label label-inverse">Inverse</span>

Roadmap
----
- [Enable svn and git commit after file changes id:4420](#ARCHIVE:490)
- [Convert front end to use backbone.js id:4354](#TODO:140)
- [respect marked configuration in client javascript id:4353](#TODO:170)
- [User should be able to remove task syntax with hotkey when in task text id:4356](#PLANNING:140)
- [User should be able to use TOC in preview mode for md files id:4355](#ARCHIVE:680)
- [User should get a guided tour id:4422](#ARCHIVE:120)
- [Enable vfs <https://github.com/c9/vfs-socket> as method of interacting with other storage providers. id:4357](#ARCHIVE:520)
- [User should be able to remove all tasks in the archive id:4358](#PLANNING:50)
- [User should be able to add and remove projects in the UI id:4359](#ARCHIVE:70)

Must do
----
- #TODO:30 Store last place a user was in a project and bring them back there when they switch to the project id:4321
- #TODO:10 Use [imagemagick - How to convert a SVG to a PNG with Image Magick? - Stack Overflow](http://stackoverflow.com/questions/9853325/how-to-convert-a-svg-to-a-png-with-image-magick) to convert new logo id:4309
  - [Using SVG | CSS-Tricks](http://css-tricks.com/using-svg/)
- #TODO:0 Upgrade [Socket.IO — Migrating from 0.9](http://socket.io/docs/migrating-from-0-9/) id:4310
- #DONE:10 Release new version id:4318
- [User should be able to select the color of lists by [tkrotoff/jquery-simplecolorpicker](https://github.com/tkrotoff/jquery-simplecolorpicker) id:4361](#PLANNING:10)
- [email tasks using mailto id:4424](#PLANNING:20)
- [javascript - Automically open default email client and pre-populate content - Stack Overflow](http://stackoverflow.com/questions/13231125/automically-open-default-email-client-and-pre-populate-content)
  - each task should be in the proper order under it's list


- [Fix all modals, so they have element focus id:4360](#ARCHIVE:50)

- [User should be able to get quick help with keyboard shortcuts id:4363](#ARCHIVE:40)

- [Add recent projects history id:4362](#ARCHIVE:10)

- [Create tutorials for different flows id:4365](#ARCHIVE:30)
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
