var imdone = {data:{}};

Handlebars.registerHelper('safe', function(text) {
  return new Handlebars.SafeString(text);
});

imdone.board = $("#board");

imdone.moveTask = function(e, ui) {
  var taskId = ui.item.attr("data-id");
  var listId = ui.item.attr("data-list");
  var path = ui.item.attr("data-path");
  var toListId = ui.item.closest(".list").attr("id");
  var list = _.where(imdone.data.lists, {name:listId})[0];
  var task = _.where(list.tasks, {pathTaskId:parseInt(taskId), path:path})[0];
  var pos = ui.item.index()-1;
  var reqObj = {path:path,pathTaskId:task.pathTaskId,lastUpdate:task.lastUpdate,from:listId,to:toListId,pos:pos};


  //Now call the service and call getKanban
  $.post("/api/moveTask", reqObj,
    function(data){
      imdone.getKanban();
    }, "json");
};

imdone.moveList = function(e,ui) {
  var list = ui.item.attr("id");
  var pos = ui.item.index();
  var reqObj = {list:list,position:pos};
  //Now call the service and call getKanban
  $.post("/api/moveList", reqObj,
    function(data){
      imdone.getKanban();
    }, "json");

}

imdone.getKanban = function(callback) {
  //Clear out all elements and event handlers
  //Load the most recent data
  $.get("/api/kanban", function(data){
    imdone.paintKanban(data);
    if (callback) callback();
  }, "json");
};

imdone.paintKanban = function(data) {
  if (!data.processing) {
    imdone.board.empty();
    imdone.data = data;
    var template = Handlebars.compile($("#list-template").html());
    $("#board").html(template(imdone.data));

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

imdone.init = function() {
    imdone.getKanban(function() {
      $("#cwd").html(imdone.data.cwd);
    });

    var nameFld = $('#list-name-field');
    var nameModal = $('#list-name-modal').modal({show:false});

    nameModal.on('shown', function() {
      nameFld.focus();
    });    

    $('.list-name').live('click', function() {
      nameModal.modal('show');
      nameFld.attr('placeholder', $(this).text());
    });
    
    $("#list-name-save").click(function() {
      var req = {
        name: nameFld.attr('placeholder'),
        newName:  nameFld.val()
      };

      $.post("/api/renameList", req,
        function(data){
          imdone.getKanban();
      }, "json");

      $(this).closest(".modal").modal('hide');
    });

    $(".modal-close").click(function() {
      $(this).closest(".modal").modal('hide');
    })
};

