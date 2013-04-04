var imdone = {data:{}};

imdone.board = $("#board");
imdone.hidden = $("#hidden-lists");
imdone.projectsMenu = $("#projects-dropdown");
imdone.modes = {
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
  sanitize: true,
  smartLists: true,
  langPrefix: 'language-',
  highlight: function(code, lang) {
    if (lang === 'js') {
      return highlighter.javascript(code);
    }
    return code;
  }
});

imdone.md = function() {
  var html = marked(imdone.source.src);
  //Replace any script elements
  html = html.replace(/<script.*?>([\s\S]*?)<\/.*?script>/ig,"$1").replace(/(href=["|'].*)javascript:.*(["|'].?>)/ig,"$1#$2");
  //Make all links with http open in new tab
  html = html.replace(/(<a.*?href="http.*?)>/ig,'$1 target="_blank">');
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
  var list = ui.item.attr("id");
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
  $.get("/api/kanban?project=" + imdone.cwd(), function(data){
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
    imdone.hidden.empty();
    var template = Handlebars.compile($("#list-template").html());
    imdone.board.html(template(data));
    template =  Handlebars.compile($("#hidden-list-template").html());
    imdone.hidden.html(template(data));

    //Make all links open a new tab
    $(".task-text a").attr("target", "_blank");

    $( ".list" ).sortable({
          items: ".task",
          connectWith: ".list",
          stop: imdone.moveTask
      }).disableSelection();

    $("#board").sortable({
          items: ".list",
          stop: imdone.moveList
    }).disableSelection();
          
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
  console.log(context);
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

    var editorEl = $("#editor"),
        editor = ace.edit("editor"),
        editBar = $(".edit-bar"),
        eContainer = $("#editor-container"),
        preview = $("#preview"),
        editBtn = $("#edit-btn"),
        previewBtn = $("#preview-btn"),
        printBtn = $("#print-btn");
    
    editBar.affix().find(".btn").tooltip({placement:"bottom"});
    
    //editor.setReadOnly(true);  // [Make files editable](#done:50)
    editor.setTheme("ace/theme/merbivore_soft");
    editor.setHighlightActiveLine(true);
    editor.getSession().setUseWrapMode(true);
    
    //print
    function print() {
      var printOptions = {
        pageTitle: imdone.source.path
      };
      if(imdone.preview && imdone.source.lang == "md") {
        preview.printElement(printOptions);
      } else {
        printOptions.overrideElementCSS = true;
        $("<pre><code>" + editor.getValue() + "</code></pre>").printElement(printOptions);
      }
    }
    printBtn.live("click", print);

    //Show the editor
    function showEditor() {
      imdone.preview = false;
      editBtn.addClass("active");
      previewBtn.removeClass("active");
      var data = imdone.source,
          lang = data.lang || "txt",
          mode = imdone.modes[data.lang] || "text";

      editor.getSession().setMode("ace/mode/" + mode);
      editor.setValue(data.src);
      editor.focus();
      editor.gotoLine(data.line);
      preview.hide();
      editorEl.show();
      editBar.show();
      eContainer.show();
    }
    editBtn.live("click", showEditor);

    //Show the markdown preview
    function showPreview() {
      if (imdone.source.lang == "md") {
        imdone.preview = true;
        previewBtn.addClass("active");
        editBtn.removeClass("active");
        editorEl.hide();
        preview.empty();
        preview.html(imdone.md());
        preview.show();
        eContainer.show();
      } else {
        imdone.preview = false;
      }
    }
    previewBtn.live("click", showPreview);

    //Save source from editor
    function saveFile(evt) {
      console.log("saving file");
      if (eContainer.is(":visible")) {
        imdone.source.src = editor.getValue();
        $.ajax({
            url: "/api/source/",
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(imdone.source),
            dataType: 'json'
        });
        //eContainer.hide();
        //editBar.hide();
        //imdone.getKanban();
      }

      return true;
    }

    $('#save-edit-btn').live('click', saveFile);
    HashHandler = require("ace/keyboard/hash_handler").HashHandler
    editor.keyBinding.addKeyboardHandler(new HashHandler([{
        bindKey: "Ctrl+s",
        descr: "Save File",
        exec: saveFile
    }]));

    $('a.source-link').live("click", function(e) {
      var target = $(this).attr("data-target");
      var url = $(this).attr("href");
      var list = $(this).attr("data-list");

      //remove any source
      editor.setValue("");
      //hide other lists
      $('.list:not(#' + list + ')').remove();
      //Highlight the current task
      $('.task').removeClass('alert-info');
      $(this).closest(".task").addClass('alert-info');
      $.get(url, function(data){
        imdone.source = data;
        imdone.editMode = true;
        if (imdone.preview == true) showPreview();

        if (!imdone.preview) showEditor();

      }, "json");
      return false;
    });

    //close the source
    $('#close-edit-btn').live('click', function() {
        imdone.editMode = false;
        imdone.preview = false;
        eContainer.hide();
        editBar.hide();
        imdone.getKanban();
    });
    
    //close modal
    $(".modal-close").click(function() {
      $(this).closest(".modal").modal('hide');
    })

    //listen for filter input
    $("#filter-field").keyup(function() {
      var filter = $(this).val();
      $(".task").show()

      if (filter != "") $('.task:not([data-path*="' + filter + '"])').hide();
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
      imdone.getKanban();
    });

    //Listen for hide
    $(".list-hide").live('click', function() {
      imdone.hideList($(this).attr("data-list"));
    });
    //Listen for show
    $(".list-show").live('click', function() {
      imdone.showList($(this).attr("data-list"));
    });


    imdone.initUpdate();
};

