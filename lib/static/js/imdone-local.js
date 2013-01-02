var imdone = {data:{}};

imdone.board = $("#board");
imdone.projectsMenu = $("#projects-dropdown");

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

imdone.getKanban = function(callback) {
  //Clear out all elements and event handlers
  //Load the most recent data
  $.get("/api/kanban?project=" + imdone.cwd(), function(data){
    imdone.data[imdone.cwd()] = data;
    imdone.paintKanban(data);
    if (callback) callback();
  }, "json");
};

imdone.paintKanban = function(data) {
  if (!data.processing) {
    imdone.board.empty();
    var template = Handlebars.compile($("#list-template").html());
    imdone.board.html(template(data));

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
          
    $('.list-name').tooltip({placement:"bottom"});
  }
};

imdone.getProjects = function(callback) {
  $.get("/api/projects", function(data){
    imdone.projects = data;
    imdone.data.cwd = imdone.projects[0];
    imdone.paintProjectsMenu();
    if (callback) callback();
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
  if ("WebSocket" in window)
  {
     // Let us open a web socket
     var ws = new WebSocket("ws://" + window.document.location.host);
     ws.onopen = function()
     {
        // Web Socket is connected, send data using send()
        ws.send("Message to send");
        console.log("Message is sent...");
     };
     ws.onmessage = function (evt) 
     { 
        var obj = JSON.parse(evt.data);
        var lastUpdate = _.where(obj, {project:imdone.cwd()})[0].lastUpdate; 
        //First check if new projects were added
        if (imdone.projects.length < obj.length) {
          console.log(obj);
          imdone.projects = _.pluck(obj,"project");
          imdone.paintProjectsMenu();
        }

        if (imdone && imdone.data && (imdone.cwp() == undefined || (imdone.cwp().lastUpdate && (new Date(lastUpdate) > new Date(imdone.cwp().lastUpdate))))) {
          console.log("we need a refresh...");
          imdone.getKanban();
        }
     };
     ws.onclose = function()
     { 
        // websocket is closed.
        console.log("Connection is closed..."); 
     };
  }
  else
  {
     // The browser doesn't support WebSocket
     alert("WebSocket NOT supported by your Browser!");
  }
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

      $.post("/api/renameList", req,
        function(data){
          imdone.getKanban();
      }, "json");

      $(this).closest(".modal").modal('hide');
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

    imdone.initUpdate();
};

