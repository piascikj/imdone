var imdone = {data:{}};

imdone.board = $("#board");
imdone.hidden = $("#hidden-lists");
imdone.projectsMenu = $("#projects-dropdown");

Handlebars.registerHelper('isGithub', function(block) {
  if (this.location == "github") {
    return block(this);
  } else {
    return block.inverse(this);
  }
});

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
    imdone.data[imdone.cwd()] = data;
    imdone.paintKanban(data);
    if (_.isFunction(callback)) callback();
  }, "json");
};

imdone.paintKanban = function(data) {
  if (!data.processing) {
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

    //Show local src
    //[Make the source stay in view when scrolling down](#archive:20)
    /*
    $('a.source-link').live("click", function(e) {
      var target = $(this).attr("data-target");
      var url = $(this).attr("href");
      var list = $(this).attr("data-list");

      //remove any source
      $('.source').remove();
      //hide other lists
      $('.list:not(#' + list + ')').remove();
      $('.task').removeClass('alert-info');
      $(this).closest(".task").addClass('alert-info');
      var template = Handlebars.compile($("#source-template").html());
      $("body").prepend(template({src:url}));
      $('.source well').affix();
      return false;
    });
    */
    var editor = ace.edit("editor");    
    editor.setTheme("ace/theme/merbivore_soft");
    editor.setHighlightActiveLine(true);
    editor.getSession().setUseWrapMode(true);
    var eContainer = $("#editor-container");
    //eContainer.affix();
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
        eContainer.show();
        
        var mode = "ace/mode/";
        switch (data.lang) {
          case "md":
            mode += "markdown";
            break;
          case "js":
            mode += "javascript";
            break;
          case "java":
            mode += "java";
            break;
          default:
            mode += "text";
        }
        editor.getSession().setMode(mode);
        editor.setValue(data.src);
        editor.gotoLine(data.line);
      }, "json");
      return false;
    });

    //close the source
    $('.source .close').live('click', function() {
        eContainer.hide();
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

