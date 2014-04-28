define([
  'underscore',
  'jquery',
  'introjs',
  'store'
], function(_, $, introJs, store) {

  function opacityFix() {
    setTimeout(function() {
      $('.introjs-overlay').css('opacity', .5);
    },10);
  }

  var _tours = {
    newFile: function(name, done) {
      var self = this;
      var intro   = introJs(),
          project = this.project,
          steps = [
            {
              intro: 'Create a task by typing something like<br><br><pre>[Learn more about iMDone](#doing:0)</pre>'
            }
          ];
      intro.setOptions({
        steps: steps,
        showStepNumbers: false,
        showBullets: false,
        overlayOpacity: .5,
        tooltipClass: 'span5'
      });
      intro.onbeforechange(function(el) {
        $('.introjs-tooltip').css('min-width','420px');
      });
      intro.onexit(done);
      intro.oncomplete(done);
      intro.start();
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
      function cleanup() {
        $lastBtn.ClassyWiggle("stop");
        $lastBtn.addClass('btn-inverse');
        done();
      }

      intro.onbeforechange(function(el) {
        // DONE:0 fix error in intro.js on line 557 when showStepNumbers is false and introduce overlay option
        var $btn = $(el);
        if ($lastBtn) cleanup();
        $lastBtn = $btn; 
        $btn.ClassyWiggle("start",{
          randomStart:false,
          onWiggleStart: function(el) {
            $(el).removeClass("btn-inverse");
          },
          onWiggleStop: function(el) {
            $(el).addClass("btn-inverse");
          }
        });
      });
      intro.onexit(cleanup);
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

  Tour.prototype.getTours = function() {
    return _.pluck(this.tours, "name");
  };

  Tour.prototype.start = function(name, force) {
    var tour = _.findWhere(this.tours, {name:name});
    var self = this;
    if (tour) {
      if (!force && this.isCompleted(name)) return;
      tour.start.call(this, name, function() {
        self.setCompleted(name);
      });
    }
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