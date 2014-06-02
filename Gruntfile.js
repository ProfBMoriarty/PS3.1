module.exports = function(grunt) {

 // Project configuration.
 grunt.initConfig({
   ps: grunt.file.readJSON('package.json'),
   aq: grunt.file.readJSON('packageAQ.json'),

    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: [
              'src/utils.js',
              'src/ps.js',
              'src/ps-internal.js',
              'src/ps-spawn.js',
              ],
        dest: 'tmp/<%= ps.file %>.js'
      }
    },

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

    clean: {
      build: ["tmp"]
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Default task(s).
  grunt.registerTask('default', ['concat', 'uglify', /*'clean'*/]);

};