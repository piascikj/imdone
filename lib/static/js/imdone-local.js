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
  //alert(JSON.stringify(reqObj,null,3));
  //If pos isn't zero make it one more than the previous pos
  /*
  if (pos > 0) {
    var prevPos = new Number(ui.item.prev().attr("position"));
    pos = prevPos + 1;
  }
  var data = {task:task, bucket:bucket, pos:pos};
  $.ajax({
    async: true,
    type: "POST",
    data: JSON.stringify(data),
    url: fincayra.moveTask,
    success: function(data) {
    },
    dataType: 'json'
  });
  */              
};

imdone.getKanban = function() {
  //Clear out all elements and event handlers
  //Load the most recent data
  $.get("/api/kanban", function(data){
    imdone.paintKanban(data);
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
          stop: imdone.moveTask,
      }).disableSelection();

    $("#board").sortable({
          items: ".list"
    });
  }
};

