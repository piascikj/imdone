define([
  'underscore',
  'jquery',
  'ace',
  'backbone',
  'handlebars',
  'json2',
  'socketio',
  'marked',
  'store',
  'jqueryui',
  'bootstrap',
  'printElement',
  'pnotify',
  'hotkeys'
], function(_, $, ace, Backbone, Handlebars, JSON, io, marked, store) {
  ace = require('ace/ace');
  var imdone = {
    data:{},
    board: $("#board"),
    listsMenu: $("#lists-menu"),
    projectsMenu: $("#projects-dropdown"),

    editorEl: $("#editor"),
    editor: ace.edit("editor"),
    editBar: $(".edit-bar"),
    boardBar: $(".board-bar"),
    eContainer: $("#editor-container"),
    preview: $("#preview"),
    editBtn: $("#edit-btn"),
    previewBtn: $("#preview-btn"),
    printBtn: $("#print-btn"),
    filterField: $("#filter-field"),
    removeFileModal: $('remove-file-modal').modal({show:false}),
    modes : {
      "md":"markdown",
      "js":"javascript",
      "html":"html",
      "css":"css",
      "java":"java",
      "json":"json",
      "coffee":"coffee",
      "joe":"coffee",
      "php":"php",
      "py":"python",
      "txt":"text"
    }
  };

  $.extend($.pnotify.defaults,{
      styling: 'bootstrap',
      history: false,
      addclass: 'stack-bottomright',
      stack: {"dir1": "up", "dir2": "left", "firstpos1": 25, "firstpos2": 25}
      //stack: {"dir1": "down", "dir2": "left", "push": "bottom", "firstpos1": 45, "spacing1": 25, "spacing2": 25}
  });

  marked.setOptions({
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    langPrefix: 'language-',
    highlight: function(code, lang) {
      if (lang === 'js') {
        return highlighter.javascript(code);
      }
      return code;
    }
  });

  imdone.md = function(md) {
    md = md || imdone.source.src;
    var html = marked(md);
    var externalLinks = /^http/,
        taskLinks = /#([\w\-]+?):(\d+?\.{0,1}\d*?)/ig;
    //Replace any script elements
    html = html.replace(/<script.*?>([\s\S]*?)<\/.*?script>/ig,"$1").replace(/(href=["|'].*)javascript:.*(["|'].?>)/ig,"$1#$2");
    //Make all links with http open in new tab
    //[For markdown files, find tasks links and give them a badge](#archive:30)
    //[For internal inks, take them to the page](#archive:60)
    html = html.replace(/(<a.*?href=")(.*?)(".*?)>/ig, function(anchor, head, href, tail) {
      if (externalLinks.test(href)) {
        return head + href + tail + ' target="_blank">';
      } else if (taskLinks.test(href)) {
        var list;
        href.replace(taskLinks, function(href, taskList, order) {
          list = taskList;
          return href;
        });
        return head + href + tail + '>' + '<span class="label label-info">' + list + '</span>&nbsp;';
      } else {
        return head + '/#file?path=' + href + "&project=" + imdone.cwd() + tail + '>';
      }
    });
    return html;
  };
  
  Handlebars.registerHelper('markDown', function(md) {
    return imdone.md(md);
  });
  
  imdone.cwd = function() {
    return imdone.data.cwd;
  };

  imdone.cwp = function() {
    return imdone.data[imdone.cwd()];
  };

  imdone.isMD = function() {
    return imdone.source.lang == "md";
  };

  imdone.moveTask = function(e, ui) {
    var taskId = ui.item.attr("data-id");
    var listId = ui.item.attr("data-list");
    var path = ui.item.attr("data-path");
    var toListId = ui.item.closest(".list").attr("id");
    var list = _.where(imdone.cwp().lists, {name:listId})[0];
    var task = _.where(list.tasks, {pathTaskId:parseInt(taskId), path:path})[0];
    var pos = ui.item.index()-1;
    var reqObj = {path:path,pathTaskId:task.pathTaskId,lastUpdate:task.lastUpdate,from:listId,to:toListId,pos:pos,project:imdone.data.cwd};

    //Now call the service and call getKanban
    $.post("/api/moveTask", reqObj,
      function(data){
        imdone.getKanban();
      }, "json");
  };

  imdone.moveList = function(e,ui) {
    var list = ui.item.attr("data-list");
    var pos = ui.item.index();
    var reqObj = {list:list,position:pos,project:imdone.data.cwd};
    //Now call the service and call getKanban
    $.post("/api/moveList", reqObj,
      function(data){
        imdone.getKanban();
      }, "json");

  }

  imdone.hideList = function(list) {
    $.post("/api/hideList", {list:list, project:imdone.cwd()},
      function(data){
        imdone.getKanban();
      }, "json");
  }

  imdone.showList = function(list) {
    $.post("/api/showList", {list:list, project:imdone.cwd()},
      function(data){
        imdone.getKanban();
      }, "json");
  }

  imdone.getKanban = function(params) {
    //Clear out all elements and event handlers
    //Load the most recent data
    var project = params && params.project || imdone.cwd();
    if (project) {
      $.get("/api/kanban" + project, function(data){
        imdone.setProjectData(project,data);
        imdone.paintKanban(data);
        if (params && params.callback && _.isFunction(params.callback)) params.callback(data);
      }, "json");
    }
  };

  imdone.setProjectData = function(project, data) {
    imdone.data[project] = data;
    imdone.data.cwd = project;

  };

  imdone.paintKanban = function(data) {
    if (!data.processing && !imdone.editMode) {
      imdone.board.empty();
      imdone.listsMenu.empty();
      var template = Handlebars.compile($("#list-template").html());
      imdone.board.html(template(data));
      template =  Handlebars.compile($("#lists-template").html());
      imdone.listsMenu.html(template(data));
      //Apply existing filter
      imdone.filter();
      //Make all links open a new tab
      $(".task-text a").attr("target", "_blank");

      $( ".list" ).sortable({
            items: ".task",
            connectWith: ".list",
            stop: imdone.moveTask
        }).disableSelection();

      $("#lists-menu").sortable({
            axis: "y",
            handle:".js-drag-handle",
            stop: imdone.moveList
      }).disableSelection();

      //Set width of board based on number of visible lists
      var totalLists  = _.reject(data.lists,function(list) {
        return list.hidden;
      }).length;
      var width = 362*totalLists;
      imdone.board.css('width',width + 'px');
            
      $('.list-name-container, .list-hide, .list-show').tooltip({placement:"bottom"});

      if (imdone.readmeNotify) imdone.readmeNotify.pnotify_remove();
      if(data.readme) {
        var href = "#file?project=" + imdone.cwd() + "&path=" + data.readme + "&preview=true";
        imdone.readmeNotify = $.pnotify({
          title: '<a href="' + href + '">README</a>',
          nonblock: false,
          hide: false,
          sticker: true,
          icon: "icon-book",
          type: 'info'
        });
      }
    }
  };

  imdone.getProjects = function(callback) {
    $.get("/api/projects", function(data){
      imdone.projects = data;
      imdone.data.cwd = imdone.projects[0];
      imdone.paintProjectsMenu();
      if (_.isFunction(callback)) callback();
    }, "json");
  };

  imdone.paintProjectsMenu = function() {
    imdone.projectsMenu.empty();
    var template = Handlebars.compile($("#projects-template").html());
    var context = {
      cwd:imdone.data.cwd,
      projects:_.without(imdone.projects, imdone.data.cwd)
    }
    imdone.projectsMenu.html(template(context));
  };

  imdone.initUpdate = function() {
    if (!imdone.updateInit) {
      var socket = io.connect('http://' + window.document.location.host);
      socket.on('last-update', function (data) {
        var obj = data;
        var lastUpdate = _.where(obj, {project:imdone.cwd()})[0].lastUpdate; 
        //First check if new projects were added
        if (imdone.projects.length < obj.length) {
          imdone.projects = _.pluck(obj,"project");
          imdone.paintProjectsMenu();
        }

        if (imdone && imdone.data && (imdone.cwp() == undefined || (imdone.cwp().lastUpdate && (new Date(lastUpdate) > new Date(imdone.cwp().lastUpdate))))) {
          console.log("we need a refresh...");
          imdone.getKanban();
        }
      });
      imdone.updateInit = true;
    }

  };

  //[User should be notified when a file has been modified](#archive:10)
  imdone.closeFile = function() {
      imdone.editMode = false;
      imdone.fileModified = false;
      imdone.previewMode = false;
      $.pnotify_remove_all();
      imdone.eContainer.hide();
      imdone.editBar.hide();
      imdone.boardBar.show();
  };
  
  //[Implement delete file functionality](#doing:0)

  imdone.getHistory = function() {
    var projectHist;
    var hist = store.get('history');
    if (hist && hist[imdone.cwd()]) {
      projectHist = hist[imdone.cwd()];
      projectHist.reverse();
    }

    return projectHist;
  };

  imdone.addHistory = function() {
    var projectHist;
    var hist = store.get('history');
    if (!hist) hist = {};

    if (!hist[imdone.cwd()]) hist[imdone.cwd()] = [];

    //remove other occurences of path
    hist[imdone.cwd()] = _.without(hist[imdone.cwd()], imdone.source.path);
    projectHist = hist[imdone.cwd()];
    projectHist.push(imdone.source.path);
    //[Don't pop, shift](#archive:80)
    if (projectHist.length > 10) projectHist.shift();
    store.set('history', hist);
    projectHist.reverse();

    return projectHist;
  };

  imdone.getSource = function(params) {
    //[We have to convert the source api url URL first](#archive:190)
    if (params && params.path) params.path = params.path.replace(/^\/*/,'');
    
    var url = "/api/source" + params.project + "?path=" + params.path;
    if (params.line) url += "&line=" + params.line;
    if (params.preview) imdone.previewMode = true;
    
    //Get the source and show the editor
    $.get(url, function(data){
      imdone.source = data;
      //Make sure we have the right project displayed
      imdone.data.cwd = data.project;
      imdone.paintProjectsMenu();
      //store the path in history
      imdone.addHistory();
      
      //[Update file-path on edit button](#archive:70)
      $('#filename').empty().html(imdone.source.path);

      imdone.editMode = true;
      
      if (imdone.source.lang == "md" && imdone.previewMode == true) {
          imdone.showPreview();
      } else {
          imdone.showEditor();
      }

    }, "json");
  };
  
  imdone.filter = function() {
    var filter = imdone.filterField.val();
    $(".task").show();
    if (filter != "") $('.task:not([data-path*="' + filter + '"])').hide();          
  };
  
  imdone.parseQueryString = function(queryString) {
      var params = {};
      if(queryString){
          _.each(
              _.map(decodeURI(queryString).split(/&/g),function(el,i){
                  var aux = el.split('='), o = {};
                  if(aux.length >= 1){
                      var val = undefined;
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
      overrideElementCSS:['/css/print.css']
    };
    if(imdone.previewMode && imdone.source.lang == "md") {
      imdone.preview.printElement(printOptions);
    } else if (imdone.editMode) {
      $("<pre><code>" + imdone.editor.getValue() + "</code></pre>").printElement(printOptions);
    } else {
      imdone.board.printElement(printOptions);
    }
  }
  imdone.printBtn.live("click", imdone.print);

  //Show the editor
  imdone.showEditor = function() {
    imdone.previewMode = false;
    imdone.editBtn.addClass("active");
    imdone.previewBtn.removeClass("active");
    var data = imdone.source,
        lang = data.lang || "txt",
        mode = imdone.modes[data.lang] || "text";

    var line = data.line || 1;
    
    var session = ace.createEditSession(data.src);
    session.setMode("ace/mode/" + mode);
    session.setUseWrapMode(true);

    //Editor change events
    session.on('change', function(e) {
      if (imdone.source.src != imdone.editor.getValue()) {
        if (!imdone.fileModified) {
          if (imdone.fileSavedNotify) imdone.fileSavedNotify.pnotify_remove();
          
          imdone.fileModified = true;
          imdone.fileModifiedNotify = $.pnotify({
            title: "File modified!",
            nonblock: true,
            hide: false,
            sticker: false,
            type: 'warning'
          });                    
        }
      } else {
        imdone.fileModified = false;
        imdone.fileModifiedNotify.pnotify_remove();
      }
    });

    imdone.editor.setSession(session);


    imdone.preview.hide();
    imdone.showEditBar();
    imdone.editorEl.show();
    imdone.eContainer.show({
        duration: 0,
        complete: function() {
            imdone.editor.resize(true);
            imdone.editor.gotoLine(line);
            imdone.editor.focus();
        }
    });
  }
  imdone.editBtn.live("click", imdone.showEditor);

  imdone.showEditBar = function() {
    imdone.boardBar.hide();
    imdone.editBar.show();
  };

  //Show the markdown preview
  imdone.showPreview = function() {
    if (imdone.source.lang == "md") {
      imdone.previewMode = true;
      imdone.showEditBar();
      imdone.previewBtn.addClass("active");
      imdone.editBtn.removeClass("active");
      imdone.editor.blur();
      imdone.editorEl.hide();
      imdone.preview.empty();
      imdone.preview.html(imdone.md());
      imdone.eContainer.show();
      imdone.preview.show();
      $(".app-container").focus();
    } else {
      imdone.previewMode = false;
    }
  }
  imdone.previewBtn.live("click", imdone.showPreview);

  //Save source from editor
  imdone.saveFile = function(evt) {
    if (imdone.eContainer.is(":visible")) {
      imdone.source.src = imdone.editor.getValue();
      $.ajax({
          url: "/api/source" + imdone.source.project,
          type: 'PUT',
          contentType: 'application/json',
          data: JSON.stringify(imdone.source),
          dataType: 'json',
          success: function(data) {
            if (imdone.fileModified) {
              imdone.fileModified = false;
              imdone.fileModifiedNotify.pnotify_remove();
            }
            imdone.fileSavedNotify = $.pnotify({
              title: "File saved!",
              nonblock: true,
              hide: true,
              sticker: false,
              type: 'success'
            });

          }
      });
    }

    return true;
  }
  $('#save-file-btn').live('click', imdone.saveFile);

  imdone.removeFile = function() {

  };
  $('#remove-file-btn').live('click', imdone.removeFile);


  imdone.init = function() {
      var nameFld = $('#list-name-field');
      var nameModal = $('#list-name-modal').modal({show:false});

      //Put the focus on the name field when changing list names
      nameModal.on('shown', function() {
        nameFld.focus();
      });    

      //listen for list name click
      $('.list-name-container').live('click', function() {
        var name = $(this).attr("data-list");
        nameModal.modal('show');
        nameFld.val(name);
        nameFld.attr('placeholder', name);
      });
      
      //Save a list name
      $("#list-name-save").click(function() {
        var req = {
          name: nameFld.attr('placeholder'),
          newName:  nameFld.val(),
          project: imdone.cwd()
        };
        if (req.newName != "") {
          $.post("/api/renameList", req,
            function(data){
              imdone.getKanban();
          }, "json");
        }

        $(this).closest(".modal").modal('hide');
      });

      //Remove a list
      $(".remove-list").live("click", function() {
        var req = {
          list: $(this).attr("data-list"),
          project: imdone.cwd()
        };

        $.post("/api/removeList", req,
          function(data){
            imdone.getKanban();
        }, "json");
      });

      //Editor config
      imdone.editor.setTheme("ace/theme/merbivore_soft");
      imdone.editor.setHighlightActiveLine(true);
      //[Use Vim keyboard bindings](#planning:50)
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
        name: 'closeFile',
        bindKey: {win: 'Esc',  mac: 'Esc'},
        exec: function(editor) {
          if (imdone.isMD()) {
            imdone.showPreview();
          } else {
            imdone.app.navigate("project" + imdone.cwd(), {trigger:true});
          }
          return false;
        },
        readOnly: false // false if this command should not apply in readOnly mode
      });
      //Preview keyboard handlers
      $(window).bind('keydown', 'I', function(e){
        if (imdone.previewMode && imdone.editMode) imdone.showEditor();

        e.preventDefault();
        e.stopPropagation();
        return false;
      }).bind('keydown', 'esc', function(e){
        if (imdone.previewMode && imdone.editMode) imdone.app.navigate("project" + imdone.cwd(), {trigger:true});

        e.preventDefault();
        e.stopPropagation();
        return false;
      });

      //Get the file source for a task
      $('.source-link').live("click", function(e) {
        var list = $(this).attr("data-list");
        var taskHtml =  $(this).closest(".task").find('.task-text').html();

        //[Show the current task as notification with <http://pinesframework.org/pnotify/>](#archive:140)
        $.pnotify({
          title: list,
          text: taskHtml,
          nonblock: true,
          hide: false,
          sticker: false,
          icon: 'icon-tasks',
          type: 'info'
        });
      });

      //close the source
      $('#close-file-btn').live('click', function() {
          imdone.app.navigate("project" + imdone.cwd(), {trigger:true});
      });

      //Open or create a file
      var lsTemplate = Handlebars.compile($("#ls-template").html());
      $('#open-file-btn').live('click',function() {
        $.get("/api/files" + imdone.cwd(), function(data) {
          imdone.cwp().ls = data;
          imdone.cwp().cwd = data;
          data.history = imdone.getHistory();
          data.history = _.map(data.history, function(path) {
            return {path:path, project:imdone.cwd()};
          });
          $('#ls').html(lsTemplate(data));
          $('#file-field').val("");
          $('#file-modal').modal({show:true});
        })
      });

      //Find a path in files API response node
      function findDir(path, node) {
        var dir,
            node = node || imdone.cwp().ls;
        _.each(node.dirs, function(dirNode) {
          if (dir) return;
          if (path == dirNode.path) {
            dirNode.parent = node
            dir = dirNode;
          } else if (!dir) {
            dir = findDir(path, dirNode);
          }
        });

        return dir;

      }

      //respond to directory click
      $('.js-dir').live('click', function() {
        var node = findDir($(this).attr('data-path'));
        node = node || imdone.cwp().ls;
        imdone.cwp().cwd = node;
        $('#ls').html(lsTemplate(node));
        return false;
      });
      
      //open a file
      $('.js-file').live('click', function() {
        $(this).closest(".modal").modal('hide');
      });

      //Open a file from file-modal
      $('#file-open').live('click',function() {
        //[Create a new file based on path and project with call to /api/source](#archive:120)
        var path = $('#file-field').val();
        if (/^\//.test(path)) {
          path = path.substring(1);
        } else {
          path = imdone.cwp().cwd.path + "/" + $('#file-field').val();
        }

        imdone.app.navigate("file?project=" + imdone.cwd() + "&path=" + path, {trigger:true});
        $(this).closest(".modal").modal('hide');
        return false;
      });

      //close modal
      $(".modal-close").click(function() {
        $(this).closest(".modal").modal('hide');
        return false;        
      })

      //listen for filter input
      //[Apply filter when kanban is reloaded](#archive:40)
      imdone.filterField.keyup(function() {
        imdone.filter();
      });

      $("#clear-filter").click(function() {
        $(".task").show();
        $("#filter-field").val("");
        return false;
      });

      //Listen for hide
      $(".list-hide, .list-show").live('click', function(e) {
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

      //Get projects and start listening for updates
      imdone.getProjects(function() {
        imdone.app = new AppRouter();
        Backbone.history.start();
      });
  };

  var AppRouter = Backbone.Router.extend({
      routes: {
          //[Set up router for projects and files](#archive:50)
          "project*project": "projectRoute",
          "file?*querystring": "fileRoute",
          "*action": "defaultRoute" // Backbone will try match the route above first
        },

      initialize: function() {
        //[Construct views and models in here!](#todo:30)
      },

      projectRoute: function(project) {
        console.log("project route: " + project);
        imdone.closeFile();
        imdone.getKanban({project:project, callback: imdone.paintProjectsMenu});
        $(document).attr("title", "iMDone - " + project);
      },

      fileRoute: function(qs) {
        var params = imdone.parseQueryString(qs);
        console.log("file route: " + JSON.stringify(params,null,3));
        //Get the source and show the editor
        imdone.getSource(params);
        $(document).attr("title", "iMDone - " + params.project + "/" + params.path);
      },

      defaultRoute: function(action) {
        if (action) console.log("action:" + action);
        imdone.app.navigate("project" + imdone.projects[0], {trigger:true}); 
        imdone.initUpdate();
      },
  });


  return imdone;
});
