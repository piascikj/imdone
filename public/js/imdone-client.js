define([
  'underscore',
  'jquery'
], function(_, $) {
  var client = {
    moveTasks: function(reqObj) {
      $.ajax({
        url:"/api/moveTasks",
        type:"POST",
        data:JSON.stringify(reqObj),
        contentType:"application/json; charset=utf-8"
      });  
    },

    moveList: function(reqObj) {
     $.ajax({
        url:"/api/moveList",
        type:"POST",
        data:JSON.stringify(reqObj),
        contentType:"application/json; charset=utf-8"
      });
    },

    hideList: function(list, project) {
      $.post("/api/hideList", { list: list, project: project });
    },

    showList: function(list, project) {
      $.post("/api/showList", {list:list, project:project});
    },

    getKanban: function(project, success, failure) {
      $.get("/api/kanban/" + project, success, "json").fail(failure);      
    },

    getProjects: function(success) {
      $.get("/api/projects", success, "json");      
    },

    getFile: function(project, _path, line, success, failure) {
      var url = "/api/source/" + project + "?path=" + _path;
      if (typeof line === 'function') {
        success = line;
        failure = success;
      } else {
        url += "&line=" + line;
      }

      //Get the source and show the editor
      $.ajax({
        url: url,
        success: success,
        error: function(jqXHR, status, error) {
          failure(error);
        },
        dataType: "json"
      });
    },

    saveFile: function(project, fileObj, success) {
      $.ajax({
          url: "/api/source/" + project,
          type: 'PUT',
          contentType: 'application/json',
          data: JSON.stringify(fileObj),
          dataType: 'json',
          success: success});
    },

    removeFile: function(project, _path, success, failure) {
      $.ajax({
          url: "/api/source/" + project + "?path=" + _path,
          type: 'DELETE',
          contentType: 'application/json',
          dataType: 'json',
          success: success,
          error: failure
      });      
    },

    getFiles: function(project, success) {
      $.get("/api/files/" + project, success);
    },

    getDirs: function(_path, cb) {
      $.get('/api/dirs/' + _path).done(cb);
    },

    removeProject: function(project, cb) {
      $.ajax({
          url: "/api/project/" + project,
          type: 'DELETE',
          complete: function(data) {
            if (data.status !== 200) {
              cb(new Error('Error removing project'), data);
            }
          }
      });      
    },

    renameList: function(project, name, newName) {
      $.post("/api/renameList", {
        name: name,
        newName:  newName,
        project: project
      });
    },

    addList: function(project, name, success) {
      $.post("/api/list/" + project + "/" + name, success);
    },

    removeList: function(project, name) {
      $.post("/api/removeList", {
        list: name,
        project: project
      });
    },

    addProject: function(dir) {
      $.post('/api/project/' + dir);
    },

    md: function(project, _path, cb) {
      $.get('api/md/' + project + "?path=" + _path, cb);
    },

    initUpdate: function(listeners) {
      var socket = io.connect('http://' + window.document.location.host);
      
      _.each(listeners, function(fn, evt) {
        socket.on(evt, fn);
      });
    }
  }

  return client;
});