define([
  'underscore',
  'jquery',
  'backbone',
  'handlebars',
  'json2',
  'socketio',
  'marked',
  'prism',
  'store',
  'search',
  'client',
  'zeroclipboard',
  'ace',
  'tour',
  'keen',
  'ace-language-tools',
  'ace-spellcheck',
  'jqueryui',
  'bootstrap',
  'printThis',
  'pnotify',
  'hotkeys',
  'toc',
  'scrollTo',
  'wiggle'
], function(_, $, Backbone, Handlebars, JSON, io, marked, Prism, store, Search, client, ZeroClipboard, ace, Tour, Keen) {

  var imdone = window.imdone = {
    data:{},
    board:           $("#board"),
    listsMenu:       $("#lists-menu"),
    projectsMenu:    $("#projects-dropdown"),
    editorEl:        $("#editor"),
    editor:          ace.edit("editor"),
    editBar:         $(".edit-bar"),
    boardBar:        $(".board-bar"),
    fileContainer:   $("#file-container"),
    preview:         $("#preview"),
    previewContainer:$("#preview-container"),
    editBtn:         $("#edit-btn"),
    previewToggle:   $("#preview-toggle"),
    previewBtn:      $("#preview-btn"),
    printBtn:        $("#print-btn"),
    filterField:     $("#filter-field"),
    searchDialog:    $("#search-dialog"),
    searchBtn:       $("#search-dialog-btn"), 
    searchForm:      $("#search-form"),
    searchField:     $("#search-field"),
    searchResults:   $("#search-results"),
    searchResultsBtn:$("#search-results-btn"),
    filename:        $('#filename'),
    fileField:       $('#file-field'),
    fileOpenBtn:     $('#file-open'),
    contentNav:      $("#content-nav"),
    closeFileBtn:    $('#close-file-btn'),
    removeFileModal: $('#remove-file-modal').modal({show:false}),
    removeFileBtn:   $('#remove-file-btn'),
    removeFileOkBtn: $('#remove-file-ok-btn'),
    removeFileName:  $('#remove-file-name'),
    closeFileModal:  $('#close-file-modal').modal({show:false, keyboard:false}),
    closeFileOkBtn:  $('#close-file-ok-btn'),
    closeFileCancelBtn: $('#close-file-cancel-btn'),
    reloadFileModal:  $('#reload-file-modal').modal({show:false, keyboard:false}),
    reloadFileOkBtn:  $('#reload-file-ok-btn'),
    reloadFileCancelBtn: $('#reload-file-cancel-btn'),
    nameFld:            $('#list-name-field'),
    nameModal:          $('#list-name-modal'),
    newListField:       $('#new-list-field'),
    newListModal:       $('#new-list-modal'),
    newListSave:        $('#new-list-save'),
    openReadmeBtn:      $("#open-readme-btn"),
    archiveBtn:         $("#archive-btn"),
    filterBtn:          $("#filter-btn"),
    closeProjectBtn:    $('#close-project-btn'),
    openProjectBtn:     $('#project-open'),
    addProjectBtn:      $('#open-project-btn'),
    projectNav:         $('.project-nav'),
    showHidden:         false,
    modes : {
      "md":"markdown",
      "markdown":"markdown",
      "js":"javascript",
      "javascript": "javascript",
      "html":"html",
      "css":"css",
      "java":"java",
      "json":"json",
      "coffee":"coffee",
      "coffeescript":"coffee",
      "joe":"coffee",
      "php":"php",
      "py":"python",
      "python":"python",
      "txt":"text",
      "text":"text"
    },
    Search: Search,
    copyButton: '<button class="btn btn-inverse pull-right copy-btn" title="Copy text"><i class="icomoon-copy"></i></button>',
    wiggleOpts: {
      randomStart:false,
      limit:10
    },
    pathSep: (navigator.appVersion.indexOf("Win")!=-1) ? "\\" : "/"
  };
  // DOING:0 Show a modal on startup that advertises chrome app and gives a poll
  // DONE:30 Use [spin.js](http://fgnass.github.io/spin.js/#?lines=15&length=24&width=9&radius=60&corners=0.1&rotate=0&trail=60&speed=0.5&direction=1&hwaccel=on) for loading gif
  //pnotify options
  $.extend($.pnotify.defaults,{
      styling: 'bootstrap',
      history: false,
      addclass: 'stack-bottomright',
      stack: {"dir1": "up", "dir2": "left", "firstpos1": 25, "firstpos2": 25}
      //stack: {"dir1": "down", "dir2": "left", "push": "bottom", "firstpos1": 45, "spacing1": 25, "spacing2": 25}
  });

  // Regex selector for filter
  jQuery.expr[':'].regex = function(elem, index, match) {
    var matchParams = match[3].split(','),
        validLabels = /^(data|css):/,
        attr = {
            method: matchParams[0].match(validLabels) ? 
                        matchParams[0].split(':')[0] : 'attr',
            property: matchParams.shift().replace(validLabels,'')
        },
        regexFlags = 'ig',
        regex = new RegExp(matchParams.join('').replace(/^\s+|\s+$/g,''), regexFlags);
    return regex.test(jQuery(elem)[attr.method](attr.property));
  };

  // marked options
  marked.setOptions({
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    langPrefix: 'language-',
  });

  // ZeroClipboard options
  ZeroClipboard.config({ moviePath: "/lib/zeroclipboard/swf/ZeroClipboard.swf" });

  // Handlebars helpers
  Handlebars.registerHelper('markDown', function(md) {
    return imdone.md(md);
  });

  Handlebars.registerHelper('concat', function(data, len) {
    if (data.length > len) return data.substring(0,len-3)+"...";
    return data;
  });

  imdone.lsTemplate = Handlebars.compile($("#files-template").html());
  imdone.dirsTemplate = Handlebars.compile($("#dirs-template").html());

  // #TODO:60 Replace format with _.template 
  String.prototype.format = function (col) {
    col = typeof col === 'object' ? col : Array.prototype.slice.call(arguments, 1);

    return this.replace(/\{\{|\}\}|\{(\w+)\}/g, function (m, n) {
        if (m == "{{") { return "{"; }
        if (m == "}}") { return "}"; }
        return col[n];
    });
  };
  
  String.prototype.tokenize = function() {
    var args = arguments;
    var result = this;
    
    if (args.length > 0) {
      for(var i=0; i<args.length; i++) {
        result = result.replace(/\{\}/, args[i]);
      }   
    }
    
    return result;
  };
  
  // Convert markdown to html **This could be sourced from the server to DRY it up**
  imdone.md = function(md) {
    md = md || imdone.source.src;

    // Find all code blocks and inline code in md files and save the start and end so we can ignore  
    var ignore = [];
    var re = /`[\s\S]*?`/g, result;
    while ((result = re.exec(md)) !== null) {
      ignore.push([result.index, re.lastIndex]);
    }
    re = /`{3}[\s\S]*?`{3}/gm, result = null;
    while ((result = re.exec(md)) !== null) {
      ignore.push([result.index, re.lastIndex]);
    }

    // Replace hash style tasks but ignore code
    md = md.replace(/#([\w\-]+?):(\d+?\.?\d*?)\s+(.*)/g, function(md, list, order, text, pos) {
      if ( _.some(ignore, function(pair) { return ((pair[0] < pos) && (pos < pair[1])); }) ) return md;
      order = (order === undefined) ? "0" : order;
      return "[{0}](#{1}:{2})".format([text, list, order]);
    });
    
    var html = marked(md);
    // #TODO:40 everything above this should be in imdone-core Repository or File
    var links = /(<a.*?href=")(.*?)(".*?)>(.*)(<\/a>)/ig,
        externalLinks = /^http/,
        mailtoLinks = /^mailto/,
        taskLinks = /^#([\w\-]+?):(\d+?\.{0,1}\d*?)/,
        filterLinks = /^#filter\//,
        inPageLinks = /^#.*$/,
        gollumLinks = /(\[\[)(.*?)(\]\])/ig;
    // Replace any script elements
    html = html.replace(/<script.*?>([\s\S]*?)<\/.*?script>/ig,"$1").replace(/(href=["|'].*)javascript:.*(["|'].?>)/ig,"$1#$2");
    // Make all links with http open in new tab
    // ARCHIVE:830 For markdown files, find tasks links and give them a badge
    // ARCHIVE:360 For internal inks, take them to the page
    var replaceLinks = function(anchor, head, href, tail, content, end) {
      // For links within links
      if (new RegExp(links).test(content)) content = content.replace(links, replaceLinks);
      var out = html;
      // Check for external links
      if (new RegExp(externalLinks).test(href)) {
        out = head + href + tail + ' target="_blank">' + content + end;
      // Check for task links
      } else if (new RegExp(taskLinks).test(href)) {
        var list;
        href.replace(new RegExp(taskLinks), function(href, taskList, order) {
          list = taskList;
          out = href;
        });
        var template = '{1}{2}{3} class="task-link" data-list="{0}"> <span class="task-content">{4}</span>' +
                       '<span class="label label-info task-label">{0}</span>{5}';
        
        out = (template).format([list,head,href,tail,content,end]);
      // Check for filter links
      } else if (new RegExp(filterLinks).test(href)) {
        var filterBy = href.split("/")[1];
        out = head + href + tail + ' title="Filter by ' + filterBy + '">' + content + end;   
      // Check for mailto links
      } else if (new RegExp(mailtoLinks).test(href) || mailtoLinks.test($('<div />').html(href).text())) {
        out = anchor;
      // If not an in page link then it must be a link to a file
      } else if (!(new RegExp(inPageLinks).test(href))) {
        if (/.*\.md$/.test(href)) preview = true;
        out = head + imdone.getFileHref(imdone.currentProjectId(),href,preview) + tail + '>' + content + end;
      }

      return out;
    };

    html = html.replace(new RegExp(links), replaceLinks);

    // Replace all gollum links
    html = html.replace(new RegExp(gollumLinks), function(link, open, name, close) {
      var file = name;
      if (/\|/.test(name)) {
        var pieces = name.split("|");
        file = pieces[1];
        name = pieces[0];
      }
      file = file.replace(/(\s)|(\/)/g,"-") + ".md";
      var href = imdone.getFileHref(file,true);
      return '<a href="{}">{}</a>'.tokenize(href, name);
    });
    return html;
  };

  $(document).on('click', 'a.task-link', function(evt) {
    var $el = $(evt.target);
    imdone.scrollToTask = $el.text();
    imdone.scrollToList = $el.attr('data-list') || $el.closest('a.task-link').attr('data-list');
    imdone.navigateToCurrentProject();
    evt.preventDefault();
    evt.stopPropagation();
  });
  
  imdone.getFileHref = function(path, line, preview) {
    if (_.isObject(preview)) preview = undefined;
    if (_.isObject(line)) line = undefined;
    if (line && isNaN(line)) preview = true;
    project = imdone.currentProjectId();
    path = encodeURIComponent(path);
    var href = '#file/{}/{}'.tokenize(project, path);
    if (line) href+= ("/" + line);
    if (preview) href += "/true";
    return href;
  };

  imdone.getSearchHref = function(project,query,offset,limit) {
    var href = "#search/{}/{}/{}".tokenize(encodeURIComponent(project),encodeURIComponent(query),offset);
    if (limit) href += ("/"+limit);
    return href;
  };

  Handlebars.registerHelper('fileHref', imdone.getFileHref);

  Handlebars.registerHelper('highlightCode', function(text, keyword) {
    text = Handlebars.Utils.escapeExpression(text);
    var regex = new RegExp('^(.*)(' + keyword + ')(.*)$', 'i');
    var result = text.replace(regex, '<code>$1</code><code class="highlight">$2</code><code>$3</code>');

    return new Handlebars.SafeString(result);
  });

  //#TODO:70 Take a look at this <https://speakerdeck.com/ammeep/unsuck-your-backbone>, <http://amy.palamounta.in/2013/04/12/unsuck-your-backbone/>
  
  imdone.setProjectData = function(project, data) {
    imdone.data[project] = data;
    imdone.data.cwd = project;
  };

  imdone.currentProjectId = function(projectId) {
    if (projectId) imdone.data.cwd = projectId;
    return imdone.data.cwd;
  };

  imdone.currentProject = function() {
    return imdone.data[imdone.currentProjectId()];
  };

  imdone.currentListNames = function() {
    return _.pluck(imdone.currentProject().lists, "name");
  };

  imdone.isListHidden = function(list) {
    return _.findWhere(imdone.currentProject().lists, {name:list}).hidden;
  };

  imdone.isMD = function(file) {
    if (file) {
      if (/\.md$/i.test(file)) return true;
      else return false;
    }

    if (imdone.source && /^(md|markdown)$/i.test(imdone.source.lang)) return true;

    return false;
  };

  // PLANNING:90 add notify and undo for move
  imdone.moveTasks = function(opts) {
    var tasks = [];
    var toListId = (opts.to) ? opts.to : opts.item.closest(".list").attr("id");
    var pos = (opts.pos !== undefined) ? opts.pos : opts.item.index()-1;
    imdone.selectedTasks.each(function() {
      //var $el = ($(this) == ui.item) ? ui.item : $(this);
      var $el = $(this);
      var taskId = $el.attr("data-id");
      var listId = $el.attr("data-list");
      var path = $el.attr("data-path");
      var list = _.findWhere(imdone.currentProject().lists, {name:listId});
      var task = _.filter(list.tasks, function(task) {
        return task.id == parseInt(taskId, 10) && task.source.path == path;
      })[0];
      tasks.push(task);
    });
    var reqObj = {
      tasks:tasks,
      newList:toListId,
      newPos:pos,
      project:imdone.currentProjectId()
    };

    //Now call the service and call getKanban
    client.moveTasks(reqObj);
  };

  imdone.moveTask = function(item) {
    var taskId = item.attr("data-id");
    var listId = item.attr("data-list");
    var path = item.attr("data-path");
    var toListId = item.closest(".list").attr("id");
    var list = _.findWhere(imdone.currentProject().lists, {name:listId});
    var tasks = _.filter(list.tasks, function(task) {
      return task.id == parseInt(taskId, 10) && task.source.path == path;
    });
    var pos = item.index()-1;
    var reqObj = {
      tasks:tasks,
      newList:toListId,
      newPos:pos,
      project:imdone.currentProjectId()
    };

    //Now call the service and call getKanban
    client.moveTasks(reqObj);
  };

  imdone.moveList = function(e,ui) {
    var name = ui.item.attr("data-list");
    var pos = ui.item.index()-1;
    var reqObj = { name: name, pos: pos, project: imdone.currentProjectId() };
    //Now call the service and call getKanban
    client.moveList(reqObj);
  };

  imdone.hideList = function(list) {
    client.hideList(list, project);
  };

  imdone.showList = function(list, cb) {
    client.showList(list, project);
  };

  imdone.getKanban = function(params) {
    //Clear out all elements and event handlers
    //Load the most recent data
    var project = params && params.project || imdone.currentProjectId();
    if (project) {
      client.getKanban(project, function(data) {
        imdone.setProjectData(project,data);
        imdone.tour.setProject(data);
        if ((params && !params.noPaint) || params === undefined) imdone.paintKanban(data);

        if (params && params.callback && _.isFunction(params.callback)) params.callback(data);
      }, function() {
        imdone.app.navigate('/', {trigger:true});
      });
    }
  };

  imdone.search = function(params) {
    var project = params && params.project || imdone.currentProjectId();
    if (project) {
      var search = new imdone.Search({
        id:project,
        query:params.query, 
        offset:parseInt(params.offset, 10), 
        limit:(params.limit)?parseInt(params.limit, 10):undefined
      });
      search.fetch({success: function(model, response)  {
          // #TODO:90 Put search in a view.  [What is a view? - Backbone.js Tutorials](http://backbonetutorials.com/what-is-a-view/)
          var template = Handlebars.compile($("#search-results-template").html());
          var results = model.toJSON();
          var last = results.total+results.offset;
          var context = {project:project,results:results,last:last};
          if (results.offset > 0) {
            var offset = results.offset - results.opts.limit;
            context.previous = imdone.getSearchHref(project,results.query,offset);
          }

          if (results.filesNotSearched > 0) {
            context.next = imdone.getSearchHref(project,results.query,last);
          }
          imdone.searchResults.html(template(context));
          imdone.showSearchResults();
          if (params && params.callback && _.isFunction(params.callback)) params.callback(data);

        }
      });
    }
  };
  $(document).on('click', '.pager a[href="#"]', function(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  });

  imdone.showSearchResults = function() {
    imdone.hideAllContent();
    imdone.searchResults.show();
    imdone.searchResultsBtn.show()
                           .addClass("active")
                           .attr("title", "Hide search results");
  };

  imdone.hideSearchResults = function(show) {
    imdone.searchResults.hide();
    imdone.searchResultsBtn.removeClass("active");

    if (show) {
      if (imdone.editMode) {
        imdone.showEditor();
      } else {
        imdone.paintKanban(imdone.currentProject());
        imdone.showBoard();
      }
    }

    imdone.searchResultsBtn.removeClass("active")
                           .attr("title", "Show search results");
  };

  imdone.isSearchResultsVisible = function() {
    return imdone.searchResults.is(":visible");
  };

  imdone.showBoard = function() {
    imdone.contentNav.hide();
    imdone.boardBar.show();
    imdone.board.show();
  };

  imdone.hideBoard = function() {
    imdone.boardBar.hide();
    imdone.board.hide();
  };

  imdone.getProjectStore = function() {
    var projects = store.get('projects') || {};
    this.projectStore = projects[this.currentProjectId()] || {};
    
    return this.projectStore;
  };

  imdone.saveProjectStore = function() {
    var projects = store.get('projects') || {};
    projects[this.currentProjectId()] = this.projectStore || {};
    store.set('projects', projects);
  };

  imdone.filter = function(filter) {
    $(".task").show();

    if (_.isString(filter)) this.filterField.val(filter);
    else filter = this.filterField.val();
    
    if (filter) {
      imdone.getProjectStore().filter = filter;
      imdone.saveProjectStore();
      // ARCHIVE:770 Use a regex for filter and create button to filter by files of selected tasks
      // $('.task:not([data-path*="{0}"])'.format([filter])).hide();
      $('.task').hide();
      $('.task:regex(data-path,{0})'.format([filter])).show();
    }
  };

  imdone.filterBySelectedTasks = function() {
    if (imdone.selectedTasks.length > 0) {
      var paths = [];
      imdone.selectedTasks.each(function() {
        var path = $(this).attr("data-path");
        if (_.indexOf(paths, path) < 0) paths.push(path);
      });

      var filter = paths.join("|");
      imdone.app.navigate('#filter/{0}'.format([filter]), true);
    }
  };

  imdone.clearFilter = function() {
    this.filterField.val("");
    delete this.getProjectStore().filter;
    this.saveProjectStore();
    $(".task").show();
  };

  imdone.tasksSelected = function() {
    imdone.selectedTasks = $(".task.selected");
    if (imdone.selectedTasks.length > 0) {
      imdone.archiveBtn.show();
      imdone.filterBtn.show();

      if (imdone.tour.isCompleted("archiveAndFilter")) {
        imdone.archiveBtn.ClassyWiggle("start",imdone.wiggleOpts);
        imdone.filterBtn.ClassyWiggle("start",imdone.wiggleOpts);
      } 
      imdone.tour.start("archiveAndFilter");
    }
    else {
      imdone.archiveBtn.hide();
      imdone.filterBtn.hide();
    }
  };
  
  imdone.paintKanban = function(data) {
    if (!data.busy && !imdone.editMode) {
      imdone.board.empty();
      imdone.contentNav.hide();
      imdone.projectNav.show();
      imdone.searchResults.hide();

      imdone.listsMenu.empty();
      var template = Handlebars.compile($("#list-template").html());
      imdone.board.html(template(data));
      template =  Handlebars.compile($("#lists-template").html());
      imdone.listsMenu.html(template(data));
      
      // Apply existing filter
      var filter = imdone.getProjectStore().filter || "";
      imdone.filter(filter);

      // Add archiveBtn listener
      imdone.archiveBtn.unbind().click(function() {
        var list = "archive";
        _.each(imdone.currentListNames(), function(name) {
          if ((/archive|deleted/i).test(name)) list = name;
        });
        if (imdone.selectedTasks && imdone.selectedTasks.length > 0) imdone.moveTasks({pos:0, to:list});
      });

      // Add filterBtn listener
      imdone.filterBtn.unbind().click(imdone.filterBySelectedTasks);

      // Select tasks and select all
      $(".task-select-all").click(function(evt) {
          var list = $(this).attr("data-list");          
          var tasks = $("#" + list + " .task");
          if ($(this).hasClass("selected")) {
            $(this).removeClass("selected").find("i").removeClass("icomoon-check").addClass("icomoon-check-empty");
            tasks.each(function() {
              $(this).removeClass("selected");
            });
          } else {
            $(this).addClass("selected").find("i").removeClass("icomoon-check-empty").addClass("icomoon-check");
            tasks.each(function() {
              if ($(this).is(':visible')) $(this).addClass("selected");
            });
          }
          imdone.tasksSelected();
       });

      $('.task').mouseup(function(e) {
        if ($(e.target).hasClass("source-link") || $(e.target).attr('target') == '_blank') return;
        var $el = $(this);
        if (!imdone.sortingTasks) {
          if ($el.hasClass("selected")) {
            $el.removeClass("selected");
          } else if ($el.is(':visible')) {
            $el.addClass("selected");
          }
          imdone.tasksSelected();
        }
      });
      // Make Sortable
      $(".list").sortable({
            delay: 300,
            items: ".task",
            connectWith: ".list",
            start: function(evt, ui) {
              imdone.sortingTasks = true;
              if (imdone.selectedTasks && imdone.selectedTasks.length > 0) {
                imdone.selectedTasks.each(function() {
                  if ($(this).attr("id") != ui.item.attr("id")) $(this).hide();
                });
              }
            },
            stop: function(evt, ui) {
              imdone.sortingTasks = false;
              if (imdone.selectedTasks && imdone.selectedTasks.length > 1) {
                imdone.moveTasks({item:ui.item});
              }
              else imdone.moveTask(ui.item);
            }
        }).disableSelection();

      imdone.listsMenu.sortable({
        delay: 300,
        axis: "y",
        items: ".list-item",
        handle:".js-drag-handle",
        stop: imdone.moveList
      }).disableSelection();

      //Set width of board based on number of visible lists
      var totalLists  = _.reject(data.lists,function(list) {
        return list.hidden;
      }).length;
      var width = 362*totalLists;
      imdone.board.css('width',width + 'px');
      imdone.boardBar.show();

      if (!imdone.isSearchResultsVisible()) imdone.board.show();
            
      //$('.list-name-container, .list-hide, .list-show, [title]').tooltip({placement:"bottom"});

      if (data.readme) {
        // ARCHIVE:160 Fix readme href
        var href = imdone.getFileHref(data.readme.path,true);
        imdone.openReadmeBtn.attr("title", "Open " + data.readme.path + " file.")
        .show()
        .unbind()
        .click(function() {
          imdone.app.navigate(href, true);
        });

        if (imdone.tour && imdone.tour.isCompleted('newProject')) imdone.openReadmeBtn.ClassyWiggle("start",imdone.wiggleOpts);
      } else {
        imdone.openReadmeBtn.hide();
      }

      if (imdone.scrollToTask) {
        var task = imdone.scrollToTask, list = imdone.scrollToList;
        delete imdone.scrollToTask;
        delete imdone.scrollToList;

        var scrollToTask = function() {
          var $task = $('.task:contains("{}")'.tokenize(task));
          if ($task.length > 0) {
            $task.addClass('selected');
            $('.app-container').scrollTo($task, 500);
          }
        };

        scrollToTask();
      }

      // Check for selected tasks, there shouldn't be any, but it'll hide the buttone
      imdone.tasksSelected();

    }
  };

  imdone.getProjects = function(callback) {
    client.getProjects(function(data){
      imdone.projects = data;
      if (data.length > 0) imdone.paintProjectsMenu();
      if (_.isFunction(callback)) callback(data);
    });
  };

  imdone.paintProjectsMenu = function() {
    imdone.projectsMenu.empty();

    var template = Handlebars.compile($("#projects-template").html());
    var context = {
      cwd: imdone.currentProjectId(),
      projects:_.without(imdone.projects, imdone.currentProjectId()).sort()
    };
    imdone.projectsMenu.html(template(context)).show();
  };

  imdone.currentFileChanged = function(data) {
    // Check if the current file is being modified
    if (data.mods.length > 0) {
      var fileUpdate = _.find(data.mods, function(mod) { return mod.mod === 'file.update' });
      if (fileUpdate && imdone.source && fileUpdate.file === imdone.source.path) {
        client.getFile(imdone.currentProjectId(), imdone.source.path, function(data) {
          if (data.src !== imdone.source.src) {
            imdone.reloadFileConfirm(function(reload) {
              if (reload) imdone.getSource({
                path: imdone.source.path, 
                preview: imdone.previewMode,
                line: imdone.editor.getCursorPosition().row+1
              });
            });
          }
          // #TODO:20 How do we check for deleted???
        });
      }
    }
  };

  imdone.initUpdate = function() {
    client.initUpdate({
      'project.modified': function(data) {
        var projectId = data.project;
        console.log("Project modified: ", projectId);
        var currentProjectId = imdone.currentProjectId();
        if (_.indexOf(imdone.projects, projectId) < 0) return;
        var boardHidden = !imdone.board.is(':visible');
        // only react if project exists and is current.
        if (projectId == currentProjectId) {
          console.log("boardHidden:", boardHidden);
          imdone.currentFileChanged(data);
          imdone.getKanban({
            project:projectId, 
            noPaint:boardHidden, 
            callback:function() {
              console.log("refresh of " + projectId + " complete!");
            }
          });
        }
      },
      
      'files.processed': function(data) {
        var pcntNum = Math.round((data.processed/data.total)*100);
        var pcnt = pcntNum.toString() + '%';
        var $bar = imdone.progress.find('.bar');
        $bar.css('width', pcnt);
      },
      'project.initialized': function(data) {
        // add the project and get kanban
        var projectId = data.project;
        console.log("Project initialized: ", projectId);
        
        setTimeout(function() {
          imdone.progress.modal('hide');
          imdone.progress.find('.bar').css('width', '0%');
        }, 1000);

        if (_.indexOf(imdone.projects, projectId) < 0) {
          imdone.projects.push(projectId);
          imdone.paintProjectsMenu();
        }

        imdone.currentProjectId(projectId);
        imdone.navigateToCurrentProject();
      },
      'project.removed': function(data) {
        var projectId = data.project;
        console.log("Project removed: ", projectId);
        // remove the project
        imdone.projects = _.without(imdone.projects, projectId);
        delete imdone.data[projectId];
        // repaint the projects menu
        imdone.paintProjectsMenu();

        if (imdone.projects.length === 0) {
          imdone.app.navigate('/', {trigger:true});
        } else {
          imdone.currentProjectId(imdone.projects[0]);
          imdone.navigateToCurrentProject();
        } 
      }
    });
  };

  imdone.getFileHistory = function() {
    var projectHist;
    var hist = store.get('history');
    if (hist && hist[imdone.currentProjectId()]) {
      projectHist = hist[imdone.currentProjectId()];
      projectHist.reverse();
    }

    return projectHist;
  };

  imdone.addFileToHistory = function() {
    var projectHist;
    var hist = store.get('history');
    if (!hist) hist = {};

    if (!hist[imdone.currentProjectId()]) hist[imdone.currentProjectId()] = [];

    //remove other occurences of path
    hist[imdone.currentProjectId()] = _.without(hist[imdone.currentProjectId()], imdone.source.path);
    projectHist = hist[imdone.currentProjectId()];
    projectHist.push(imdone.source.path);
    //ARCHIVE:900 Don't pop, shift
    if (projectHist.length > 10) projectHist.shift();
    store.set('history', hist);
    projectHist.reverse();

    return projectHist;
  };

  imdone.addProjectToHistory = function(path) {
    var hist = store.get('project-history');
    if (!hist) hist = [];
    hist = _.without(hist, path);
    hist.unshift(path);
    if (hist.length > 10) hist.pop();
    store.set('project-history', hist);
  };

  imdone.getProjectHistory = function() {
    return store.get('project-history');
  };

  imdone.removeCurrentFileFromHistory = function() {
    var projectHist;
    var hist = store.get('history');
    if (!hist) return;

    if (!hist[imdone.currentProjectId()]) return;

    //remove other occurences of path
    hist[imdone.currentProjectId()] = _.without(hist[imdone.currentProjectId()], imdone.source.path);
    store.set('history', hist);
  };

  imdone.getSource = function(params) {
    params.project = params.project || imdone.currentProjectId();
    //ARCHIVE:880 We have to convert the source api url URL first
    if (params && params.path) params.path = params.path.replace(/^\/*/,'');
    
    imdone.previewMode = params.preview;
    
    client.getFile(params.project, params.path, params.line, function(data){
        imdone.source = data;
        imdone.currentProjectId(data.project);
        //store the path in history
        imdone.addFileToHistory();

        //Make sure we have the right project displayed
        imdone.paintProjectsMenu();
        
        //ARCHIVE:750 Update file-path on edit button
        imdone.filename.empty().html(imdone.source.path);
        imdone.editMode = true;
        
        if (imdone.isMD()) {
          imdone.previewToggle.show();
        } else {
          imdone.previewToggle.hide();
        }      

        imdone.hideAllContent();
        imdone.hideBoard();

        if (imdone.isMD() && imdone.previewMode === true && imdone.source.src !== "") {
          imdone.showPreview();
        } else {
          imdone.showEditor();
        }

      }, function(error) {
        console.log(error);
      });
  };

  imdone.showFileView = function() {
    imdone.contentNav.show();
    imdone.editBar.show();
  };
  
  imdone.parseQueryString = function(queryString) {
      var params = {};
      if(queryString){
          _.each(
              _.map(decodeURI(queryString).split(/&/g),function(el,i){
                  var aux = el.split('='), o = {};
                  if(aux.length >= 1){
                      var val;
                      if(aux.length == 2)
                          val = aux[1];
                      o[aux[0]] = val;
                  }
                  return o;
              }),
              function(o){
                  _.extend(params,o);
              }
          );
      }
      return params;
  };

  //print
  imdone.print = function() {
    var printOptions = {
      pageTitle: imdone.source.path,
      importCSS: false,
      loadCSS:['/css/print-element.css']
    };
    if(imdone.previewMode && imdone.source.ext == "md") {
      imdone.preview.printThis(printOptions);
    } else if (imdone.editMode) {
      $("<pre><code>" + imdone.editor.getValue() + "</code></pre>").printThis(printOptions);
    } else {
      imdone.board.printThis(printOptions);
    }
  };
  imdone.printBtn.on("click", imdone.print);

  // ARCHIVE:130 Fix markdown language mode for editor
  //Show the editor
  imdone.showEditor = function(e) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    imdone.previewMode = false;
    imdone.editBtn.addClass("active");
    imdone.previewBtn.removeClass("active");
    var data = imdone.source,
        mode = imdone.modes[data.ext] || "text";

    var line = parseInt(data.line, 10);
    line = isNaN(line) ? 0 : line;
    
    // ARCHIVE:790 User should be able to set global ace confiuration and have it saved to config.js
    var session = imdone.aceSession = ace.createEditSession(data.src);
    session.setMode("ace/mode/" + mode);
    session.setUseWrapMode(true);
    session.setWrapLimitRange(120, 160);
    session.setOption('tabSize',2);
    //Editor change events
    session.on('change', function(e) {
      if (imdone.source.src != imdone.editor.getValue()) {
        if (!imdone.fileModified) {
          if (imdone.fileNotify) imdone.fileNotify.pnotify_remove();
          
          imdone.fileModified = true;
          imdone.fileModifiedNotify = $.pnotify({
            title: "File modified!",
            nonblock: true,
            hide: false,
            sticker: false,
            type: 'warning',
            icon: 'icomoon-exclamation-sign'
          });                    
        }
      } else {
        imdone.fileModified = false;
        imdone.fileModifiedNotify.pnotify_remove();
      }
    });

    imdone.editor.setSession(session);

    imdone.hideAllContent();
    imdone.showFileView();
    imdone.editorEl.show();
    imdone.fileContainer.show({
        duration: 0,
        complete: function() {
            imdone.editor.resize(true);
            imdone.editor.gotoLine(line);
            imdone.editor.focus();
            imdone.tour.start('newFile');
        }
    });
  };
  imdone.editBtn.on("click", imdone.showEditor);

  imdone.hideAllContent = function() {
    imdone.previewContainer.hide();
    imdone.fileContainer.hide();
    imdone.contentNav.hide();
    imdone.hideSearchResults();
    imdone.board.hide();
  };

  //Show the markdown preview
  imdone.showPreview = function(e) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (imdone.isMD()) {
      imdone.previewMode = true;
      imdone.showFileView();
      imdone.previewBtn.addClass("active");
      imdone.editBtn.removeClass("active");
      imdone.editor.blur();
      imdone.hideAllContent();
      imdone.contentNav.show();
      imdone.editorEl.hide();
      imdone.preview.empty();
      imdone.preview.html(imdone.md());
      imdone.fileContainer.show();
      imdone.previewContainer.show();
      imdone.fileContainer.focus();
      
      // setup the clipboard for pre elements
      preId = 0;
      imdone.preview.find('pre').each(function() {
        var id = 'pre-id-' + preId;
        var copyButton = $(imdone.copyButton);
        copyButton.attr('data-clipboard-target', id);
        $(this).attr('id', id);
        $(this).before(copyButton);
        if (!/language-/.test($(this).attr('class'))) $(this).addClass('language-none');
        preId++;
      });

      var clip = new ZeroClipboard($('.copy-btn'));

      clip.on( "load", function(client) {
        client.on( "complete", function(client, args) {
          $.pnotify({
              title: "Text copied!",
              nonblock: true,
              hide: true,
              sticker: false,
              type: 'success'
            });
        });
      });

      // Highlight code
      Prism.highlightAll();
      
      // T.O.C
      $("#toc").html('').toc({
        'content':'#preview',
        'headings': 'h1,h2'
      });

      // ARCHIVE:100 Fix scrollSpy
      imdone.fileContainer.scrollspy('refresh');

      // Add borders to tables
      imdone.preview.find("table").addClass("table table-bordered table-nonfluid");

    } else {
      imdone.previewMode = false;
    }
  };

  // ARCHIVE:90 Fix toc click
  $(document).on('click', '#toc a', function(e) {
    var id = $(this).attr('href');
    imdone.fileContainer.scrollTo($(id), 500);
    e.preventDefault();
    e.stopPropagation();
    return false;
  });

  imdone.previewBtn.on("click", function() {
    imdone.closeFileConfirm(imdone.showPreview);
  });
  imdone.fileContainer.scrollspy({ target: '#sidebar'});

  //ARCHIVE:950 User should be notified when a file has been modified
  imdone.closeFile = function() {
      imdone.editMode = false;
      imdone.fileModified = false;
      imdone.previewMode = false;
      $.pnotify_remove_all();
      imdone.fileContainer.hide();
      imdone.editBar.hide();
      imdone.hideAllContent();
      delete imdone.source;
  };

  imdone.closeFileConfirm = function(cb) {
    imdone.closeFileOkBtn.unbind('click');
    imdone.closeFileCancelBtn.unbind('click');

    if (!imdone.fileModified) {
      cb();
    } else {
      imdone.closeFileCancelBtn.click(function(e) {
        imdone.closeFileModal.modal("hide");
        imdone.fileModified = false;
        imdone.fileModifiedNotify.pnotify_remove();
        cb();
        return false;
      });
      imdone.closeFileOkBtn.click(function(e) {
        imdone.closeFileModal.modal("hide");
        imdone.saveFile(cb);
        return false;
      });

      imdone.closeFileModal.modal("show");
    } 
  };

  imdone.closeFileModal.on('shown.bs.modal', function() {
    imdone.closeFileOkBtn.focus();
  });
  
  imdone.reloadFileConfirm = function(cb) {
    imdone.reloadFileOkBtn.unbind('click');
    imdone.reloadFileCancelBtn.unbind('click');


    imdone.reloadFileCancelBtn.click(function(e) {
      imdone.reloadFileModal.modal("hide");
      cb(false);
      return false;
    });
    imdone.reloadFileOkBtn.click(function(e) {
      imdone.reloadFileModal.modal("hide");
      cb(true);
      return false;
    });

    imdone.reloadFileModal.modal("show");
  };

  imdone.reloadFileModal.on('shown.bs.modal', function() {
    imdone.reloadFileOkBtn.focus();
  });

  //Save source from editor
  imdone.saveFile = function(evt) {
    imdone.source.src = imdone.editor.getValue();
    client.saveFile(imdone.currentProjectId(), imdone.source, 
      function(data) {
          if (imdone.fileModified) {
            imdone.fileModified = false;
            imdone.fileModifiedNotify.pnotify_remove();
          }
          imdone.fileNotify = $.pnotify({
            title: "File saved!",
            nonblock: true,
            hide: true,
            sticker: false,
            type: 'success',
            icon: 'icomoon-save'
          });
          if (_.isFunction(evt)) evt();
        });

    return true;
  };
  $(document).on('click', '#save-file-btn', imdone.saveFile);

  imdone.removeSourceConfirm = function() {
    imdone.removeFileName.html(imdone.source.path);
    imdone.removeFileModal.modal("show");
  };
  
  imdone.removeSource = function() {
    client.removeFile(imdone.currentProjectId(), imdone.source.path,
      function(data) {
        imdone.removeCurrentFileFromHistory();
        imdone.closeFile();
        imdone.fileNotify = $.pnotify({
          title: "File deleted!",
          nonblock: true,
          hide: true,
          sticker: false,
          type: 'success'
        });
        imdone.navigateToCurrentProject();
      },
      function(data) {
        // PLANNING:30 Make this pnotify default for all errors!
        imdone.fileNotify = $.pnotify({
          title: "Unable to delete file!",
          nonblock: true,
          hide: true,
          sticker: false,
          type: 'error'
        });
      });
  };
  //ARCHIVE:890 Implement delete file functionality
  imdone.removeFileBtn.on('click', function() {
    imdone.removeSourceConfirm();
  });

  imdone.removeFileOkBtn.on('click', function() {
    imdone.removeFileModal.modal("hide");
    imdone.removeSource();
    return false;
  });

  imdone.removeFileModal.on('shown.bs.modal', function() {
    $('#remove-file-cancel-btn').focus();
  });


  imdone.navigateToCurrentProject = function() {
    imdone.app.navigate("#project/" + imdone.currentProjectId(), {trigger:true});
  };

  imdone.navigateToFile = function(path, line, preview) {
    imdone.app.navigate(imdone.getFileHref(path, line, preview), {trigger:true});
  };

  imdone.openFileDialog = function(e) {
    client.getFiles(imdone.currentProjectId(), function(data) {
      imdone.currentProject().ls = data;
      imdone.currentProject().cwd = data;
      data.history = imdone.getFileHistory();
      data.history = _.map(data.history, function(path) {
        return {path:path, project:imdone.currentProjectId(), line:null, preview:imdone.isMD(path)};
      });
      $('#ls').html(imdone.lsTemplate(data));
      imdone.fileField.val("");
      var fileModal = $('#file-modal').modal({show:false});
      fileModal.on('show.bs.modal', function() {
        setTimeout(function() {
          document.activeElement.blur();
          imdone.editor.focus();
        }, 500);
      });
      fileModal.modal("show");
    });
  };

  imdone.getDirs = function(_path, cb) {
    _path = (_path === undefined) ? "" : _path;
    client.getDirs(_path, cb);
  };

  imdone.paintProjectDialog = function(_path, cb) {
    cb = (cb !== undefined) ? cb : function(){};
    imdone.getDirs(_path,function(data) {
      data.history = imdone.getProjectHistory();
      $('#dirs').html(imdone.dirsTemplate(data));
      $('#dir-field').val(data.path);
      if (!imdone.showHidden) $('.fs-dir[data-hidden=true]').hide();
      cb();
    });
  };

  imdone.openProjectDialog = function(e) {
    imdone.paintProjectDialog("", function() {
      $('#project-modal').modal();
    });
  };

  imdone.removeProject = function(projectId) {
    client.removeProject(projectId, function(err, data) {
      if (err) {
        console.log(err);
        console.log(data);
      }
    });
  };

  imdone.openHelp = function(e) {
    $.get('/help.md', function(data) {
      var help = imdone.md(data);
      $('#help-modal').modal({
        keyboard: true
      }).find('.modal-body').html(help);
    });
  };

  imdone.newList = function(e) {
    e.preventDefault();
    e.stopPropagation();
    imdone.newListField.val("");
    imdone.newListField.attr('placeholder', "New list name");
    imdone.newListModal.modal('show');
  };

  imdone.initListNameView = function() {
    // Start the list tour
    $('#lists-dropdown').on('shown.bs.dropdown', function() { 
      if ($('.list-item').length > 1) {
        imdone.tour.start('moveAndHideLists');
      }
    });

    function listNameFilter(saveFunc) {
      return function (e) {
        var keyCode = (e.keyCode ? e.keyCode : e.which);
        if (keyCode === 13) return saveFunc();
        if (!/\w|-/i.test(String.fromCharCode(keyCode))) {
          e.preventDefault();
          e.stopPropagation();
        }
      };
    }
    //Put the focus on the name field when changing list names
    imdone.nameModal.modal({show:false});
    imdone.nameModal.on('show.bs.modal', function() {
      setTimeout(function() {
        document.activeElement.blur();
        imdone.nameFld.focus();
      }, 500);
    });

    //listen for list name click
    $(document).on('click','.list-name', function(e) {
      var name = $(this).attr("data-list");
      imdone.nameModal.modal('show');
      imdone.nameFld.val(name);
      imdone.nameFld.attr('placeholder', name);
      e.preventDefault();
      e.stopPropagation();        
    });
    
    imdone.nameFld.keypress(listNameFilter(saveListName));

    function saveListName() {
      var name = imdone.nameFld.attr('placeholder'),
          newName =  imdone.nameFld.val(),
          project = imdone.currentProjectId();
      if (newName !== "") {
        client.renameList(project, name, newName);
      }

      imdone.nameModal.modal('hide');
    }

    //Save a list name
    $("#list-name-save").click(saveListName);

    imdone.newListModal.modal({show:false});
    imdone.newListModal.on('show.bs.modal', function() {
      setTimeout(function() {
        document.activeElement.blur();
        imdone.newListField.focus();
      }, 500);
    });

    imdone.newListField.keypress(listNameFilter(saveNewList));

    function saveNewList() {
      var self = this;
      var name = imdone.newListField.val();
      if (name !== "") {
        client.addList(imdone.currentProjectId(), name, function() {
          imdone.newListModal.modal('hide');
          imdone.newListField.val("");
        });
      }
    }

    imdone.newListSave.click(saveNewList);

    $(document).on('click', '.new-list', imdone.newList);    

    //Remove a list
    $(document).on('click','.remove-list', function() {
      client.removeList(imdone.currentProjectId(), $(this).attr("data-list"));
    });
  };

  imdone.initEditor = function() {

    //Editor config
    imdone.editor.setOptions({
      enableBasicAutocompletion: true,
      enableSnippets: true
    });

    var langTools = ace.require("ace/ext/language_tools");
    var listsCompleter = {
      getCompletions: function(editor, session, pos, prefix, callback) {
        callback(null, imdone.currentProject().lists.map(function(list, i) {
          return {name: list.name, value:list.name + ":0", score: 10000+(i*10), meta: "list"};
        }));
      }
    };

    langTools.addCompleter(listsCompleter);

    imdone.editor.setTheme("ace/theme/merbivore_soft");
    imdone.editor.setHighlightActiveLine(true);
    imdone.editor.setPrintMarginColumn(120);
    //ARCHIVE:800 Use Vim keyboard bindings
    //imdone.editor.setKeyboardHandler(require("ace/keybinding-vim").Vim);
    
    //Ace keyboard handlers
    imdone.editor.commands.addCommand({
      name: 'saveFile',
      bindKey: {win: 'Ctrl-Shift-S',  mac: 'Command-Shift-S'},
      exec: function(editor) {
          imdone.saveFile();
          return false;
      },
      readOnly: false // false if this command should not apply in readOnly mode
    });

    imdone.editor.commands.addCommand({
      name: 'removeSource',
      bindKey: {win: 'Ctrl-Shift-X',  mac: 'Command-Shift-X'},
      exec: function(editor) {
          imdone.removeSourceConfirm();
          return false;
      },
      readOnly: false // false if this command should not apply in readOnly mode
    });

    imdone.editor.commands.addCommand({
      name: 'closeFile',
      bindKey: {win: 'Esc',  mac: 'Esc'},
      exec: function(editor) {
        imdone.closeFileConfirm(function() {
          if (imdone.isMD()) {
            imdone.showPreview();
          } else {
            imdone.navigateToCurrentProject();
          }
        });
        return false;
      },
      readOnly: false // false if this command should not apply in readOnly mode
    });

    // ARCHIVE:20 This should ask for a list and order
    imdone.editor.commands.addCommand({
      name: 'makeTask',
      bindKey: {win: 'Ctrl-K', mac: 'Command-K'},
      exec: function(editor) {
        var row = editor.getCursorPosition().row; //returns { row:n, column:n }
        var session = editor.getSession();
        var line = session.getLine(row);
        var taskLine = line.replace(/(^[\s\W\d\.]*)(\w*.*$)/i, '$1[$2](#)');
        editor.find(line, {
          start: {row:row, column:0}
        });
        editor.replace(taskLine);
        var col = editor.getCursorPosition().column;
        editor.moveCursorTo(row, col-1);
        editor.clearSelection();
      },
      readOnly: false
    });
  };

  imdone.initKeyHandlers = function() {
    // keyboard handlers --------------------------------------------------------------------------------------------
    // edit
    $(window).bind('keydown', 'I', function(e){
      if (imdone.previewMode && imdone.editMode) imdone.showEditor();

      e.preventDefault();
      e.stopPropagation();
      return false;
      
    })
    .bind('keydown', 'esc', function(e){
      if (!imdone.previewMode && !imdone.editMode) imdone.clearFilter();
      imdone.navigateToCurrentProject();
      e.preventDefault();
      e.stopPropagation();
      return false;
    })
    // delete file
    .bind('keydown', 'Ctrl+Shift+X', function(e) {
      if (imdone.editMode) {
        imdone.removeSourceConfirm();
      }
      e.preventDefault();
      e.stopPropagation();
      return false;
    })
    // search
    .bind('keydown', 'Ctrl+Shift+F', function(e) {
      imdone.searchBtn.dropdown('toggle');
    })
    // new list
    .bind('keydown', 'Ctrl+Shift+L', imdone.newList)
    // open file
    .bind('keydown', 'Ctrl+I', imdone.openFileDialog)
    // Add a project
    .bind('keydown', 'Ctrl+Shift+1', imdone.openProjectDialog)
    // Open help
    .bind('keydown', 'Shift+/', imdone.openHelp);
  };

  // ARCHIVE:820 Clean up init before implementing backbone views
  imdone.init = function() {
    imdone.progress = $('.imdone-progress').modal({
      backdrop: 'static',
      show: false
    });

    imdone.tour = new Tour();

    imdone.initListNameView();
    imdone.initEditor();
    imdone.initKeyHandlers();

    //Get the file source for a task
    $(document).on('click','.source-link', function(e) {
      var list = $(this).attr("data-list");
      var order = $(this).closest('.task').attr("data-order");
      var content =  $(this).closest(".task").find('.task-text').html();
      var template = '<a href="#{0}:{1}" class="task-link" data-list="{0}"><span class="task-content">{2}</span></a>';

      //ARCHIVE:380 Show the current task as notification with <http://pinesframework.org/pnotify/>
      $.pnotify({
        title: list,
        text: template.format([list,order,content]),
        nonblock: false,
        hide: false,
        sticker: false,
        icon: 'icomoon-tasks',
        type: 'info'
      });
    });

    $('#key-help-link').click(function(e) {
      e.preventDefault();
      imdone.openHelp();
    });

    //close the source
    imdone.closeFileBtn.on('click', function(e) {
      imdone.closeFileConfirm(function() {
        imdone.navigateToCurrentProject();
      });
      e.preventDefault();
      return false;
    });

    //Open or create a file
    $(document).on('click','#open-file-btn',imdone.openFileDialog);

    //Find a path in files API response node
    function findDir(path, node) {
      var dir,
          node = node || imdone.currentProject().ls;
      _.each(node.dirs, function(dirNode) {
        if (dir) return;
        if (path == dirNode.path) {
          dirNode.parent = node;
          dir = dirNode;
        } else if (!dir) {
          dir = findDir(path, dirNode);
        }
      });

      return dir;

    }

    //respond to directory click
    $(document).on('click','.js-dir', function() {
      var node = findDir($(this).attr('data-path'));
      node = node || imdone.currentProject().ls;
      imdone.currentProject().cwd = node;
      $('#ls').html(imdone.lsTemplate(node));
      imdone.fileField.focus();
      return false;
    });
    
    //open a file
    $(document).on('click','.js-file', function() {
      $(this).closest(".modal").modal('hide');
    });

    
    // PLANNING:110 Use [egdelwonk/SlidePanel](https://github.com/egdelwonk/slidepanel) for opening files and removing clutter
    function openFile() {
      // ARCHIVE:180 Create a new file based on path and project with call to PUT /api/source.  If get fails call saveSource first to create the file
      var path = imdone.fileField.val();
      if (path !== "") {
        if (/^(\/|\\)/.test(path)) {
          path = path.substring(1);
        } else {
          path = (imdone.currentProject().cwd.path || "") + imdone.pathSep + path;
          path = path.replace(/^(\/|\\)+/,"");
        } 

        imdone.app.navigate(imdone.getFileHref(path), {trigger:true});
        $(this).closest(".modal").modal('hide');
      }
      return false;
    }

    //Open a file from file-modal
    imdone.fileOpenBtn.on('click',openFile);
    imdone.fileField.bind('keydown','return', openFile);

    //close modal
    $(document).on('click','.modal-close', function() {
      $(this).closest(".modal").modal('hide');
      return false;        
    });

    // Open project dialog
    imdone.addProjectBtn.click(imdone.openProjectDialog);

    // respond to project dir click
    $(document).on('click','.fs-dir', function(e) {
      var dir = $(this).attr('data-path');
      imdone.paintProjectDialog(dir);
      e.stopPropagation();
      e.preventDefault();
    });


    // Open a project
    function openProject(dir) {
      $('#project-modal').modal('hide');

      imdone.progress.find('.mdl-header').html("Loading project...");
      imdone.progress.modal('show');

      client.addProject(dir);
    };

    function openProjectListener(e) {
      var dir = $('#dir-field').val();
      imdone.addProjectToHistory(dir);
      openProject(dir);
    }

    imdone.openProjectBtn.click(openProjectListener);
    $('#dir-field').bind('keydown', 'return', openProjectListener);

    $(document).on('click', '.project-hist-link', function(e) {
      e.preventDefault();
      var dir = $(this).attr('data-path');
      openProject(dir);
    });

    // listen for search input
    imdone.searchForm.submit(function(event) {
      event.preventDefault();
      imdone.searchBtn.dropdown('toggle');
      var dest = imdone.getSearchHref(imdone.currentProjectId(),imdone.searchField.val(),0);
      imdone.app.navigate(dest, {trigger:true});
      return false;
    });

    //listen for search button click
    imdone.searchResultsBtn.click(function() {
      if (imdone.isSearchResultsVisible()) {
        imdone.hideSearchResults(true);
      } else {
        imdone.showSearchResults();
      }
    });

    imdone.searchDialog.on("show.bs.dropdown", function() {
      imdone.searchField.val('');
      setTimeout(function() {
        imdone.searchField.focus();
      }, 500);
    });

    imdone.searchField.click(function(e) {
      e.stopPropagation();
      return false;
    });

    //listen for filter input
    //ARCHIVE:390 Apply filter when kanban is reloaded
    imdone.filterField.keyup(function() {
      imdone.filter();
    });

    $("#clear").click(function() {
      imdone.clearFilter();
      imdone.navigateToCurrentProject();
      return false;
    });

    // Listen for hide
    // PLANNING:120 Show prompt if list is large before showing
    $(document).on('click', '.list-hide, .list-show', function(e) {
      var list = $(this).attr("data-list");
      var el = $("#" + list);
      if (el.length > 0) {
        imdone.hideList(list);
      } else {
        imdone.showList(list);
      }
      e.stopPropagation();
      return false;
    });

    // Listen for project close
    imdone.closeProjectBtn.click(function(e) {
      imdone.closeFileConfirm(function() {
        imdone.closeFile();
        imdone.closeProjectBtn.blur();
        imdone.removeProject(imdone.currentProjectId());
        imdone.searchResultsBtn.hide();
      });
    });

    // Get projects and start listening for updates
    imdone.initUpdate();

    imdone.getProjects(function(projects) {
      imdone.app = new AppRouter();
      imdone.calls = 0;
      Backbone.history.on('route', function () {
        imdone.calls++;
      });
      Backbone.history.start();
      //if (projects.length > 0) imdone.getKanban({project:projects[0]});
      imdone.initialized = true;
    });
  };

  var AppRouter = Backbone.Router.extend({
      routes: {
          "search/:project/:query/:offset(/:limit)": "searchRoute",
          "project/*project": "projectRoute",
          "file/:project/:path(/:line)(/:preview)": "fileRoute",
          "filter/*filter" : "filterRoute",
          "*action": "defaultRoute" // Backbone will try match the route above first
        },
      
      keen: new Keen({
        projectId: "5550efecd2eaaa7efde1f138",
        writeKey: "57032d04b2b29b693ef0e06aa3c7f295ead6daf33f51696b99dffdc1ad3e52898a22578b58a2f2138d370e626c497a93ecbb6629ec4dc6f7d4b34a64158121afeec493adef9a069b4385ead8861e852acd66489a049084e75dbb72e1cea5dfc0f584eac15dd91ca7a58c357656cb36eb"
      }),
    
      initialize: function() {
        var msg = {};
        this.addDemographics(msg, function() {
          this.keen.addEvent("start", msg, function(err, res){
            console.log(err);
            console.log(res);
          });
        }.bind(this));
        this.doPoll();
        console.log("Router initialized...");
        //ARCHIVE:400 Construct views and models in here!
        // imdone.data.projects = new Projects();
      },
      
      addDemographics: function(obj, cb) {
          obj.origin = window.location.origin;
          obj.platform = {
            vendor: navigator.vendor,
            language: navigator.language,
            appVersion: navigator.appVersion,
          };
          navigator.geolocation.getCurrentPosition(function(pos) {
            obj.coords = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
            };
            cb();
          }, function(err) {
            cb();
          }, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          });
      },

      doPoll: function() {
        if ((window.localStorage && localStorage.getItem('poll')) || !window.navigator.onLine) return;
        var self = this;

        var $pollModal = $('#poll-modal').modal({
          keyboard: true,
          backdrop: true
        });

        var $pollForm = $pollModal.find('form#poll');
        var $pollWhy = $pollForm.find('input[type=radio][name=why]');
        var $pollHow = $pollForm.find('input[type=radio][name=how]');

        var trackPoll = function() {
          if (window.localStorage && window.navigator.onLine) {
            var pollData = {};
            pollData.why = $($pollWhy.selector + ':checked').val();
            pollData.how = $($pollHow.selector + ':checked').val();
            var email = $pollForm.find('#email').val();
            if ("" !== email) pollData.email = email;
            if (pollData.why === "other") {
              pollData.whyDesc = $pollForm.find('#why-description').val();
            }

            self.addDemographics(pollData, function() {
              if (!window.navigator.onLine) return;
              self.keen.addEvent("poll-1", pollData, function(err, res){
                if (!err) {
                  localStorage.setItem('poll', 'done');
                }
              });
            });
          }
        };

        $pollWhy.change(function() {
          if ($(this).attr('id') === "why-other") $pollModal.find('#why-desc-wrapper').slideDown();
          else $pollModal.find('#why-desc-wrapper').slideUp();
        });

        $pollForm.submit(function(evt) {
          evt.preventDefault();
          $pollModal.modal('hide');
          trackPoll();
          return false;
        });
      },

      filterRoute: function(filter) {
        this.lastRoute = "filter";
        imdone.filter(filter);

        if (!imdone.currentProject()) {
          this.defaultRoute(filter);
        }
      },

      changeProject: function(project) {
        console.log("Switching to project:", project);
        imdone.currentProjectId(project);
        imdone.closeFile();
        imdone.hideSearchResults();
        if (imdone.scrollToList && imdone.isListHidden(imdone.scrollToList)) {
          imdone.showBoard();
          imdone.showList(imdone.scrollToList, imdone.paintProjectsMenu);
        } else {
          imdone.getKanban({
            project:project, 
            noPaint:true, 
            callback: function(project) {
                        imdone.searchResultsBtn.hide();
                        imdone.paintProjectsMenu();
                        imdone.paintKanban(project);
                        if (project && project.lists && project.lists.length < 1) {
                          imdone.tour.start('newProject');
                        } else if (project.lists.length > 0) {
                          imdone.tour.start('moveTasks');
                        }
                      } 
          });
        }
        $(document).attr("title", "iMDone - " + project);
      },

      projectRoute: function(project) {
        this.lastRoute = "project";
        var self = this;
        if (imdone.fileModified) imdone.closeFileConfirm(function() { self.changeProject(project); });
        else self.changeProject(project);
      },

      changeFile: function(params) {
        if (!imdone.currentProject()) {
          imdone.getKanban({project:params.project, noPaint:true, callback:function() {
            imdone.projectNav.show();
            imdone.getSource(params);
          }});
        } else {
          //Get the source and show the editor
          imdone.getSource(params);
        }
        $(document).attr("title", "iMDone - " + params.project + "/" + params.path);
      },

      fileRoute: function(project, path, line, preview) {
        this.lastRoute = "file";
        var self = this;
        if (_.isNull(preview)) {
          if ((/true/i).test(line)) preview = true, line = null;
          else preview = false;
        }

        var opts = {project:project, path:path, line:line, preview:preview};
        if (imdone.fileModified) imdone.closeFileConfirm(function() { self.changeFile(opts); });
        else self.changeFile(opts);
      },

      searchRoute: function(project, query, offset, limit) {
       this.lastRoute = "search";
       var params = {project:project, query:query, offset:offset, limit:limit};
        if (!imdone.currentProject()) {
          imdone.getKanban({project:project, noPaint:true, callback:function() {
            imdone.paintProjectsMenu();
            imdone.search(params);
          }});
        } else {
          imdone.search(params);
        }
        $(document).attr("title", "iMDone - " + params.project + " Find: " + params.query);
      },

      defaultRoute: function(action) {
        if (imdone.projects.length > 0) {
          imdone.currentProjectId(imdone.projects[0]);
          imdone.navigateToCurrentProject();
        } else {
          imdone.projectNav.hide();
          imdone.hideBoard();
          imdone.tour.start("newInstall");
        }
      },
  });

  return imdone;
});
