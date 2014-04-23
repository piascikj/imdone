module.exports = function (grunt) {
  'use strict';
  grunt.initConfig({
    bower: {
      install: {
        options: {
          targetDir: './public/lib',
          layout: 'byComponent',
          install: true,
          verbose: true,
          cleanTargetDir: true,
          cleanBowerDir: false
        }
      }
    },

    jshint: {
      options: {
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        node: true,
        expr: true
      },
      files: ['server/**/*.js','bin/*.js'],
    },
    jasmine_node: {
      coverage:{
        savePath: "build/coverage",
        print: "both",
        excludes:["**/test/**"]
      },
      options:{
        specFolders:["./test"],
        specNameMatcher: "-spec", // load only specs containing specNameMatcher
        projectRoot: ".",
        requirejs: false,
        forceExit: true,
        verbose: true,
        showColors: true,
        jUnit: {
          report: true,
          savePath : "build/reports/jasmine/",
          useDotNotation: true,
          consolidate: true
        }
      }
    }

  });

  process.env.NODE_ENV="local";
  
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jasmine-node-coverage');
  grunt.loadNpmTasks('grunt-bower-task');

  grunt.registerTask('default', ['jshint','jasmine_node','bower:install']);
  grunt.registerTask('test', 'jasmine_node');
  grunt.registerTask('lint', 'jshint');
};