module.exports = function (grunt) {
    "use strict";
    
    var psSrc = [
        "src/utils.js",
        "src/perlenspiel-loader.js",
        "src/module-core.js",
        "src/module-constants.js",
        "src/module-startup.js",
        "src/module-interface.js",
        "src/module-internal.js",
        "src/perlenspiel-start.js"
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
            perlenspiel: {
				src: psSrc,
				dest: 'build/ps/<%= ps.file %>.js'
			}
		},

		// Make it tiny (and hard to read)
		uglify: {
			options: {
				banner: '/*! <%= ps.name %> <%= ps.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			perlenspiel: {
				files: {
					'build/ps/<%= ps.file %>.min.js': ['build/ps/<%= ps.file %>.js'],
					'build/ps/<%= aq.file %>.min.js': ['src/<%= aq.file %>.js']
				}
			}
		},

		// Copy files that don't need to be processed
		copy: {
			perlenspiel: {
				files: [
					// cover.html and cover.png
					{ expand: true, flatten: true, filter: 'isFile', src: 'src/cover.*',   dest: 'build/' },
					// game.html for minified perlenspiel
					{ expand: true, flatten: true, filter: 'isFile', src: 'src/game-min.html',   dest: 'build/',
						rename: function(dest, src) { return dest + src.replace("-min", ""); } },
					// game.js for perlenspiel devkit
					{ expand: true, flatten: true, filter: 'isFile', src: 'src/game.js',  dest: 'build/' },
					// resources for perlenspiel
					{ expand: true, cwd: 'src', src:['ps/**'], dest: 'build/' }
				]
			}
		},

		// Remove temp folder
		clean: {
			perlenspiel: ['build/ps', 'build']
        },

		// JS Hint
		jshint: {
			perlenspiel: {
				src: psSrc
			}
		}
	});

	// Load the plugins that provides the tasks.
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	// Task groupings, for convenience
	grunt.registerTask('build', ['concat', 'uglify', 'copy']);
	grunt.registerTask('rebuild', ['clean', 'concat', 'uglify', 'copy']);

};