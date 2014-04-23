requirejs.config({
  baseUrl: 'lib',

  //[Put paths in lib](#doing:-1)
  paths: {
    underscore:"underscore/underscore",
    json2:'json2/json2',
    backbone:'backbone/backbone',
    bootstrap: 'bootstrap/js/bootstrap.min',
    jquery:"jquery/jquery.min",
  	jqueryui: '/js/jquery-ui-1.9.2.custom.min',
  	handlebars: 'handlebars/handlebars',
  	socketio:'/socket.io/socket.io',
    hotkeys:'/js/jquery.hotkeys',
    marked:'marked/marked',
    ace:'ace-builds/ace',
    'ace-language-tools':'ace-builds/ext-language_tools',
    'ace-spellcheck':'ace-builds/ext-spellcheck',
    pnotify:'/js/jquery.pnotify.min',
    store:'/js/store.min',
    prism:'prismjs/js/prism',
    toc:'jquery.toc/jquery.toc',
  	app:'/js/imdone-local',
    scrollTo: "jquery.scrollTo/jquery.scrollTo",
    zeroclipboard: 'zeroclipboard/js/ZeroClipboard',
    wiggle: '/js/jquery.classywiggle.min',
    chardin: 'chardin.js/js/chardinjs',
    printThis: 'printThis/printThis'
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
    'printThis': {
      deps: ['jquery']
    },
    'pnotify': {
      deps: ['jquery','bootstrap']
    },
    'hotkeys': {
      deps: ['jquery']
    },
    'prism':{
      exports: 'Prism'
    },
    'toc': {
      deps: ['jquery']
    },
    'scrollTo': {
      deps: ['jquery']
    },
    'zeroclipboard': {
      deps: ['jquery']
    },
    'wiggle': {
      deps: ['jquery']
    },
    'chardin': {
      deps: ['jquery']
    },
    'ace': {
      exports: 'ace'
    },
    'ace-language-tools': {
      deps: ['ace']
    },
    'ace-spellcheck': {
      deps: ['ace']
    }
  }
});

require(['app', 'ace'],function(App, ace) {
  App.init();
});