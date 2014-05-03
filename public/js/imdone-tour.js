define([
  'underscore',
  'jquery',
  'introjs',
  'store'
], function(_, $, introJs, store) {

  $(document).on('click', '.introjs-nextbutton, .introjs-prevbutton, .introjs-skipbutton', function(e){
    e.stopPropagation(); // This replace if conditional.
  });

  function defaultTour(name, steps, done, opts) {
    var self = this;
    var intro   = introJs(),
        project = this.project;
    opts = opts ? opts : {};
    opts = _.extend({
      steps: steps,
      showStepNumbers: false,
      showBullets: false,
      overlayOpacity: .5,
      tooltipClass: 'span5'
    }, opts);

    intro.setOptions(opts);

    intro.onexit(done);
    intro.oncomplete(done);
    intro.start();
  }

  var _tours = {
    moveAndHideLists: function(name, done) {
      var steps = [
        { element: '.icomoon-eye-close, .icomoon-eye-open',
          intro: "Click here to hide/show a list..."
        },
        {
          element: '.icomoon-reorder',
          intro: "or change it's position by dragging this up or down."
        }
      ];

      defaultTour.call(this, name, steps, done, { tooltipClass: 'span3'});
    },

    archiveAndFilter: function(name, done) {
      var steps = [
        { element: '#archive-btn',
          intro: "You can put tasks in a hidden archive list by clicking here..."
        },
        {
          element: '#filter-btn',
          intro: "or filter by the selected task's filenames by clicking here."
        }
      ];

      defaultTour.call(this, name, steps, done);
    },

    moveTasks: function(name, done) {
      var steps = [
        { element: '.task',
          intro: "Move tasks by dragging and dropping them into a new position in the same list or another list..."
        },
        {
          element: '.task-select-all',
          intro: "or select all tasks and deselect some by clicking on them and then drag them all"
        },
        { element: '.list-name',
          intro: "You can also rename a list by clicking on it's name."
        }
      ];      
      
      defaultTour.call(this, name, steps, done);
    },

    newInstall: function(name, done) {
      var steps = [
        {
          intro: "<h3>Welcome to iMDone!</h3>Let's get you started by adding a project."
        },
        {
          element: '#open-project-btn',
          intro: "Open a project by clicking here and selecting a directory.<br>Be careful!  I can't open more than 10,000 files"
        }
      ];      

      defaultTour.call(this, name, steps, done);
    },

    newFile: function(name, done) {
      var steps = [
        {
          intro: 'Create a task by typing something like<br><br><pre>[Learn more about iMDone](#doing:0)</pre>'
        },
        { 
          intro: 'then save the file by pressing the &lt;Esc&gt; key.'
        }
      ];

      defaultTour.call(this, name, steps, done, {
        onbeforechange:function(el) {
          $('.introjs-tooltip').css('min-width','420px');
        }
      });
    },

    newProject: function(name, done) {
      var self = this;
      var intro   = introJs(),
          project = this.project,
          steps = [
            {
              element: '#open-file-btn',
              intro: 'To get started, create a file and add tasks...'
            },
            {
              element: '#lists-btn',
              intro: 'or create a list'
            }
          ];

      if (project.readme) {
        steps.unshift({
          element: '#open-readme-btn',
          intro: 'To get started open your readme file and create tasks...'
        });
        steps[1].intro = 'or create a file and add tasks';
      }

      intro.setOptions({
        steps: steps,
        showStepNumbers: false,
        overlayOpacity: .5
      });

      var $lastBtn;
      function cleanup(completed) {
        $lastBtn.ClassyWiggle("stop");
        done(completed);
      }

      intro.onbeforechange(function(el) {
        // ARCHIVE:80 fix error in intro.js on line 557 when showStepNumbers is false and introduce overlay option
        var $btn = $(el);
        if ($lastBtn) cleanup();
        $lastBtn = $btn; 
        $btn.ClassyWiggle("start",{
          randomStart:false
        });
      });
      intro.onexit(function() {
        cleanup(false);
      });
      intro.oncomplete(cleanup);
      intro.start();
    }
  };

  function Tour(project) {
    var self = this;
    this.project = project;
    this.tours = [];

    // Get the start functions
    _.each(_tours, function(fn, name) {
      self.tours.push({
        name: name,
        start: fn
      });
    });
  }

  Tour.prototype.setProject = function(project) {
    this.project = project;
    return this;
  };

  Tour.prototype.getTours = function() {
    return _.pluck(this.tours, "name");
  };

  Tour.prototype.start = function(name, force) {
    var $active = $("*:focus");
    var tour = _.findWhere(this.tours, {name:name});
    var self = this;
    if (tour) {
      if (!force && this.isCompleted(name)) return;
      tour.start.call(this, name, function(dontComplete) {
        $active.focus();
        if (!dontComplete) self.setCompleted(name);
      });
    }
    return this;
  };

  Tour.prototype.setCompleted = function(name, completed) {
    if (completed === undefined) completed = true;
    var key = 'tours-' + name;
    var tour = store.set(key, { completed: completed });
    return tour.completed;
  };

  Tour.prototype.isCompleted = function(name) {
    var key = 'tours-' + name;
    var tour = store.get(key);
    if (tour === undefined) return false;
    return tour.completed;
  };

  return Tour;
});