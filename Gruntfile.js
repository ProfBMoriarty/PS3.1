module.exports = function(grunt) {

 // Project configuration.
 grunt.initConfig({
   ps: grunt.file.readJSON('package.json'),
   aq: grunt.file.readJSON('packageAQ.json'),

    // Combine into one file
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src:  [
            'src/utils.js',
            'src/module-loader.js',
            'src/module-core.js',
            'src/module-constants.js',
            'src/module-startup.js',
            'src/module-interface.js',
            'src/module-internal.js'
        ],
        dest: 'tmp/<%= ps.file %>.js'
      }
    },

    // Make it tiny (and hard to read)
    uglify: {
      options: {
        banner: '/*! <%= ps.name %> <%= ps.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      my_target: {
        files: {
          'build/<%= ps.file %>.min.js': ['tmp/<%= ps.file %>.js'],
          'build/<%= aq.file %>.min.js': ['src/<%= aq.file %>.js']
        }
      }
    },

    // Copy other files that don't need to be processed
    copy: {
      deploy: {
        files: [
            {expand: true, src: 'src/css/**',   dest: 'build/css/',   flatten: true, filter: 'isFile'},
            {expand: true, src: 'src/fonts/**', dest: 'build/fonts/', flatten: true, filter: 'isFile'},
            {expand: true, src: 'src/img/**',   dest: 'build/img/',   flatten: true, filter: 'isFile'},
            {expand: true, src: 'src/*.html',   dest: 'build/',       flatten: true, filter: 'isFile'},
            {expand: true, src: 'src/game.js',  dest: 'build/',       flatten: true, filter: 'isFile'},
            {expand: true, src: 'src/cover.js', dest: 'build/',       flatten: true, filter: 'isFile'}
        ]
      }
    },

    // Remove temp folder
    clean: {
      build: ["tmp"]
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Default task(s).
  grunt.registerTask('default', ['concat', 'uglify', 'clean']);
  grunt.registerTask('build', ['concat', 'uglify', 'clean']);
  grunt.registerTask('deploy', ['copy']);

};