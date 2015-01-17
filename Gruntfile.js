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
		ps: grunt.file.readJSON('package.json'),

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
					'build/ps/ps.min.js': ['build/ps/ps.js'],
					'build/ps/aq.min.js': ['src/aq.js']
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
					{ expand: true, cwd: 'src', src:['ps/**'], dest: 'build/' },
					// copy the production favicon
					{ expand: true, flatten: true, src: 'devkit/favicon.*',  dest: 'build/ps/img/' }
				]
			}
		},

		compress: {
			perlenspiel: {
				options: { archive: 'build/PS<%= ps.version %>.zip'},
				files: [{expand: true, cwd: 'build', src: ['**'], dest: 'PS<%= ps.version %>/'}]
			}
		},

		// Remove temporary folders/files
		clean: {
			postBuild: ['build/ps/fonts', 'build/ps/ps.js'],
			perlenspiel: ['build/ps', 'build'],
			zips: ['build/*.zip']
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
	grunt.loadNpmTasks('grunt-contrib-compress');

	// Task groupings, for convenience
	grunt.registerTask('build', ['clean:perlenspiel', 'concat', 'uglify', 'copy:perlenspiel', 'clean:postBuild']);
	grunt.registerTask('deploy', ['clean:zips', 'compress']);
};