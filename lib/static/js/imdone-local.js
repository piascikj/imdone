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
  'pnotify'
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
    eContainer: $("#editor-container"),
    preview: $("#preview"),
    editBtn: $("#edit-btn"),
    previewBtn: $("#preview-btn"),
    printBtn: $("#print-btn"),
    filterField: $("#filter-field"),
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

  Handlebars.registerHelper('isGithub', function(block) {
    if (this.location == "github") {
      return block(this);
    } else {
      return block.inverse(this);
    }
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

  $.extend($.pnotify.defaults,{
      styling: 'bootstrap',
      history: false,
      addclass: 'stack-bottomright',
      stack: {"dir1": "up", "dir2": "left", "firstpos1": 25, "firstpos2": 25}
      //stack: {"dir1": "down", "dir2": "left", "push": "bottom", "firstpos1": 45, "spacing1": 25, "spacing2": 25}
    });

  imdone.md = function() {
    var html = marked(imdone.source.src);
    //Replace any script elements
    html = html.replace(/<script.*?>([\s\S]*?)<\/.*?script>/ig,"$1").replace(/(href=["|'].*)javascript:.*(["|'].?>)/ig,"$1#$2");
    //Make all links with http open in new tab
    html = html.replace(/(<a.*?href="http.*?)>/ig,'$1 target="_blank">');
    //[For markdown files, find tasks links and give them a badge](#doing:10)
    return html;
  }

  imdone.cwd = function() {
    return imdone.data.cwd;
  };

  imdone.cwp = function() {
    return imdone.data[imdone.cwd()];
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

  imdone.getKanban = function(callback) {
    //Clear out all elements and event handlers
    //Load the most recent data
    $.get("/api/kanban" + imdone.cwd(), function(data){
      imdone.setProjectData(data);
      imdone.paintKanban(data);
      if (_.isFunction(callback)) callback();
    }, "json");
  };

  imdone.setProjectData = function(data) {
    imdone.data[imdone.cwd()] = data;
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
            
      $('.list-name, .list-hide, .list-show').tooltip({placement:"bottom"});

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

  };

  imdone.init = function() {
      imdone.getProjects(function() {
        imdone.getKanban(function() {
          $("#cwd").html(imdone.data.cwd);
        });
      });

      var nameFld = $('#list-name-field');
      var nameModal = $('#list-name-modal').modal({show:false});

      //Put the focus on the name field when changing list names
      nameModal.on('shown', function() {
        nameFld.focus();
      });    

      //listen for list name click
      $('.list-name').live('click', function() {
        nameModal.modal('show');
        nameFld.val($(this).text());
        nameFld.attr('placeholder', $(this).text());
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

      //editor.setReadOnly(true);  // [Make files editable](#archive:30)
      imdone.editor.setTheme("ace/theme/merbivore_soft");
      imdone.editor.setHighlightActiveLine(true);
      imdone.editor.getSession().setUseWrapMode(true);
      
      //print
      function print() {
        var printOptions = {
          pageTitle: imdone.source.path,
          overrideElementCSS:['/css/print.css']
        };
        if(imdone.previewMode && imdone.source.lang == "md") {
          imdone.preview.printElement(printOptions);
        } else {
          $("<pre><code>" + imdone.editor.getValue() + "</code></pre>").printElement(printOptions);
        }
      }
      imdone.printBtn.live("click", print);

      //Show the editor
      function showEditor() {
        imdone.previewMode = false;
        imdone.editBtn.addClass("active");
        imdone.previewBtn.removeClass("active");
        var data = imdone.source,
            lang = data.lang || "txt",
            mode = imdone.modes[data.lang] || "text";

        imdone.editor.getSession().setMode("ace/mode/" + mode);
        imdone.editor.setValue(data.src);
        imdone.editor.focus();
        var line = data.line || 1;
        imdone.preview.hide();
        imdone.editorEl.show();
        imdone.editBar.show();
        imdone.eContainer.show();
        imdone.editor.gotoLine(line);
      }
      imdone.editBtn.live("click", showEditor);

      //Show the markdown preview
      function showPreview() {
        if (imdone.source.lang == "md") {
          imdone.previewMode = true;
          imdone.previewBtn.addClass("active");
          imdone.editBtn.removeClass("active");
          imdone.editorEl.hide();
          imdone.preview.empty();
          imdone.preview.html(imdone.md());
          imdone.preview.show();
          imdone.eContainer.show();
        } else {
          imdone.previewMode = false;
        }
      }
      imdone.previewBtn.live("click", showPreview);

      //Save source from editor
      function saveFile(evt) {
        if (imdone.eContainer.is(":visible")) {
          imdone.source.src = imdone.editor.getValue();
          $.ajax({
              url: "/api/source" + imdone.source.project,
              type: 'PUT',
              contentType: 'application/json',
              data: JSON.stringify(imdone.source),
              dataType: 'json',
              success: function(data) {
                $.pnotify({
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
      $('#save-edit-btn').live('click', saveFile);

      imdone.closeFile = function() {
          imdone.editMode = false;
          imdone.previewMode = false;
          $.pnotify_remove_all();
          imdone.eContainer.hide();
          imdone.editBar.hide();
          imdone.getKanban();
      };
      
      //[Implement delete file functionality](#planning:10)

      imdone.getHistory = function() {
        var projectHist;
        var hist = store.get('history');
        if (hist && hist[imdone.cwd()]) {
          projectHist = hist[imdone.cwd()];
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
        //[Don't pop, shift](#archive:10)
        if (projectHist.length > 10) projectHist.shift();
        store.set('history', hist);

        return projectHist;
      }

      imdone.getSource = function(params) {
        //[We have to convert the source api url URL first](#archive:150)
        if (params && params.path) params.path = params.path.replace(/^\/*/,'');
        
        url = params.url || "/api/source" + imdone.cwd() + "?path=" + params.path; 
        
        //remove any source
        imdone.editor.setValue("");

        //Get the source and show the editor
        $.get(url, function(data){
          imdone.source = data;
          //store the path in history
          imdone.addHistory();
          
          //[Update file-path on edit button](#archive:0)
          $('#filename').empty().html(imdone.source.path);

          imdone.editMode = true;
          
          if (imdone.previewMode == true) showPreview();

          if (!imdone.previewMode) showEditor();

        }, "json");
      };
      
      imdone.filter = function() {
        var filter = imdone.filterField.val();
        $(".task").show();
        if (filter != "") $('.task:not([data-path*="' + filter + '"])').hide();          
      };


      //Ace keyboard handlers
      var HashHandler = require("ace/keyboard/hash_handler").HashHandler;
      var keyBinding = imdone.editor.keyBinding;
      keyBinding.addKeyboardHandler(new HashHandler([{
          bindKey: "Ctrl+s",
          descr: "Save File",
          exec: saveFile
      },{
          bindKey: "esc",
          descr: "close file",
          exec: imdone.closeFile
      }]));

      //Get the file source for a task
      $('.source-link').live("click", function(e) {
        var target = $(this).attr("data-target");
        var url = $(this).attr("data-url");
        var list = $(this).attr("data-list");
        var taskHtml =  $(this).closest(".task").find('.task-text').html();

        //[Show the current task as notification with <http://pinesframework.org/pnotify/>](#archive:90)
        $.pnotify({
          title: list,
          text: taskHtml,
          nonblock: true,
          hide: false,
          sticker: false,
          icon: 'icon-tasks',
          type: 'info'
        });

        //Highlight the current task
        $('.task').removeClass('alert-info');
        $(this).closest(".task").addClass('alert-info');

        //remove any source
        imdone.editor.setValue("");
        //Get the source and show the editor
        imdone.getSource({url:url});
        //e.preventDefault();
        //return false;
      });

      //close the source
      $('#close-edit-btn').live('click', function() {
          imdone.closeFile();
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
        var path = $(this).attr('data-path');
        $(this).closest(".modal").modal('hide');
        imdone.getSource({path:path});
        //return false;
      });

      //Open a file from file-modal
      $('#file-open').live('click',function() {
        //[Create a new file based on path and project with call to /api/source](#archive:70)
        var path = $('#file-field').val();
        if (/^\//.test(path)) {
          path = path.substring(1);
        } else {
          path = imdone.cwp().cwd.path + "/" + $('#file-field').val();
        }

        imdone.getSource({path:path});
        $(this).closest(".modal").modal('hide');
        return false;
      });

      //close modal
      $(".modal-close").click(function() {
        $(this).closest(".modal").modal('hide');
        return false;        
      })

      //listen for filter input
      //[Apply filter when kanban is reloaded](#done:0)
      imdone.filterField.keyup(function() {
        imdone.filter();
      });

      $("#clear-filter").click(function() {
        $(".task").show();
        $("#filter-field").val("");
        return false;
      });

      //listen for project change
      $(".project-item").live("click", function() {
        imdone.data.cwd = $(this).attr("data-project");
        imdone.paintProjectsMenu();
        imdone.closeFile();
      });

      //Listen for hide
      $(".list-hide").live('click', function(e) {
        imdone.hideList($(this).attr("data-list"));
        e.stopPropagation();
      });
      //Listen for show
      $(".list-show").live('click', function(e) {
        imdone.showList($(this).attr("data-list"));
        e.stopPropagation();
      });


      imdone.initUpdate();
  };

  var AppRouter = Backbone.Router.extend({
      routes: {
          "*actions": "defaultRoute" // Backbone will try match the route above first
      },

      initialize: function() {
        //[Construct views and models in here!](#todo:30)
      },

      defaultRoute: function(action) {
        if (action) console.log("action:" + action);
      },
  });

  imdone.app = new AppRouter();
  Backbone.history.start();  

  return imdone;
});
