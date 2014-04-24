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
    }
  });

  process.env.NODE_ENV="local";
  
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-bower-task');

  grunt.registerTask('default', ['jshint', 'bower:install']);
  grunt.registerTask('test', 'default');
  grunt.registerTask('lint', 'jshint');
};