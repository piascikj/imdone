imdone notes for development
==========

###Writing a node package
- <http://javascriptplayground.com/blog/2012/08/writing-a-command-line-node-tool>

###UI

###cli
- [forever-monitor for cli <https://github.com/nodejitsu/forever-monitor>](#todo:100)

###Misc
- [Use ***context menu api*** > <http://developer.chrome.com/beta/extensions/contextMenus.html#examples> for chrome extension that opens the live kanban board](#todo:110)
	- On links that look like tasks include something in markdown that defines the source of the content

	`[whatever you want](http://link/to/project/root "imdone:source")`

- [Start using travis for CI <https://travis-ci.org/>](#todo:20)
    - <http://stackoverflow.com/questions/12336566/travis-ci-with-jasmine-node>
- [Implement find and replace <https://github.com/ajaxorg/ace/issues/56>](#todo:60)
- [Spell check in Ace <http://www.chrisfinke.com/2011/03/31/announcing-typo-js-client-side-javascript-spellchecking/>](#planning:90)
- [use [doco languages.js](https://github.com/jashkenas/docco/blob/master/resources/languages.json) to [detect TODO and FIXME](lib/imdone.js) style comments and convert but keep the TODO or FIXME or whatever in the front.](#doing:0)
- [If links to files exist in tasks, open the file on click](#planning:0)
- [User should be able to select the color of lists by bootstrap badge class](#planning:0)
- [Leave manage lists open when hiding/showing list](#archive:140)
- [Add links to imdone website, pledgie and [twitter](https://twitter.com/about/resources/buttons#tweet), also use flattr](#planning:80)
- [Add search for files and tasks <https://github.com/visionmedia/search>](#planning:60)
- [Block entry and ask the user to load changes if a file changes while editing](#planning:20)
- [When a user clicks task link in MD, current task should change](#planning:40)
- [On opening of file, set the project at the global level](#done:20)
- [User should be able to print board as lists of tasks](#planning:10)
- [If a README.md exists, show notification with link](#done:0)
- [Create docs site <http://blog.jetstrap.com/2013/03/building-a-docs-site-with-jekyll-github-pages/>](#planning:0)

###Bugs
- [Renaming lists is broken with multiple projects loaded](#archive:90)

###Labels and Badges
- Default <span class="label">Default</span>
- Success <span class="label label-success">Success</span>
- Warning <span class="label label-warning">Warning</span>
- Important	<span class="label label-important">Important</span>
- Info <span class="label label-info">Info</span>
- Inverse <span class="label label-inverse">Inverse</span>








