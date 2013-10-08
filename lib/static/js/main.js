requirejs.config({
  baseUrl: 'js',

  //[Put paths in lib](#doing:-1)
  paths: {
    underscore:"underscore-min",
    json2:'json2',
    backbone:'backbone-min',
    bootstrap: 'bootstrap.min',
    jquery:"jquery-1.8.3.min",
  	jqueryui: 'jquery-ui-1.9.2.custom.min',
  	handlebars: 'handlebars-1.0.rc.1.min',
  	socketio:'/socket.io/socket.io',
    hotkeys:'jquery.hotkeys',
    marked:'marked',
    printElement:'jquery.printElement.min',
    ace:'/js/ace/ace',
    pnotify:'jquery.pnotify.min',
    store:'store.min',
  	app:'imdone-local'
  },

  shim: {
    'underscore': {
      exports: '_'
    },
    'backbone': {
      deps: ['jquery', 'json2', 'underscore'],
      exports: 'Backbone'
    },
    'jqueryui': {
      deps: ['jquery']
    },
  	'bootstrap': {
  		deps: ['jquery']
  	},
  	'handlebars': {
  		deps: ['jquery'],
      exports: 'Handlebars'
  	},
  	'json2': {
  		exports: 'JSON'
  	},
    'marked': {
      deps: ['jquery'],
      exports: 'marked'
    },
    'printElement': {
      deps: ['jquery']
    },
    'pnotify': {
      deps: ['jquery','bootstrap']
    },
    'hotkeys': {
      deps: ['jquery']
    }
  }
});

require(['app'],function(App) {
  App.init();
});