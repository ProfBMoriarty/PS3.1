module.exports = function (grunt) {
    "use strict";
    
    var psSrc = [
        "src/utils.js",
        "src/perlenspiel-loader.js",
        "src/module-core.js",
        "src/module-constants.js",
        "src/module-startup.js",
        "src/module-interface.js",
        "src/module-internal.js"
    ];

	// Project configuration.
	grunt.initConfig({
		ps: grunt.file.readJSON('packagePS.json'),
		aq: grunt.file.readJSON('packageAQ.json'),

		// Combine into one file
		concat: {
			options: {
				separator: ';'
			},
            my_target: {
				src: psSrc,
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
            my_target: {
				files: [
					{ expand: true, flatten: true, filter: 'isFile', src: 'src/css/**',   dest: 'build/css/' },
					{ expand: true, flatten: true, filter: 'isFile', src: 'src/fonts/**', dest: 'build/fonts/' },
					{ expand: true, flatten: true, filter: 'isFile', src: 'src/img/**',   dest: 'build/img/' },
					{ expand: true, flatten: true, filter: 'isFile', src: 'src/*.html',   dest: 'build/' },
					{ expand: true, flatten: true, filter: 'isFile', src: 'src/game.js',  dest: 'build/' },
					{ expand: true, flatten: true, filter: 'isFile', src: 'src/cover.js', dest: 'build/' }
				]
			}
		},

		// Remove temp folder
		clean: {
            my_target: ["tmp"]
        },

		// JS Hint
		jshint: {
            my_target: {
				src: psSrc
			}
		}
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	// Default task(s).
	grunt.registerTask('default', ['concat', 'uglify', 'clean', 'copy']);
	grunt.registerTask('build', ['concat', 'uglify', 'clean']);
	grunt.registerTask('deploy', ['copy']);
	grunt.registerTask('lint', ['jshint']);

};