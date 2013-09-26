/*global module:false*/
module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		// Metadata.
		pkg: grunt.file.readJSON('package.json'),
		// Task configuration.
		concat: {
			options: {
				stripBanners: true
			},
			dist: {
				src: [
					'src/_mesh.js',
					'src/console.js',
					'lib/JSON-js/json2.js',
					'lib/JSON-js/cycle.js',
					'lib/underscore/underscore-min.js',
					'lib/underscore.string/dist/underscore.string.min.js',
					'lib/moment/min/moment.min.js',
					'lib/science.js/science.v1.min.js',
					'lib/mongodb-distinct2/distinct2.js',
					'lib/mongodb-distinct-types/distinct-types.js',
					'lib/mongodb-flatten/flatten.js',
					'lib/mongodb-schema/schema.js',
					'lib/mongodb-wild/wild.js',
					'src/mesh.*.js',
					'src/mongodb.*.js',
					'src/underscore.*.js',
					'src/cleanup.js'
				],
				dest: '<%= pkg.name %>.js'
			}
		},
		replace: {
			mesh: {
				src: ['mesh.js'],
				overwrite: true, // overwrite matched source files
				replacements: [{
					from: "@VERSION@",
					to: "<%= pkg.version %>"
				}, {
					from: "@DATE@",
					to: "<%= grunt.template.today('mmmm dS, yyyy') %>"
				}, {
					from: "@YEAR@",
					to: "<%= grunt.template.today('yyyy') %>"
				}]
			}
		},
		jshint: {
			options: {
				curly: true,
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				unused: true,
				boss: true,
				eqnull: true,
				globals: {
					jQuery: true
				}
			},
			gruntfile: {
				src: 'Gruntfile.js'
			},
			lib_test: {
				src: ['src/**/*.js']
			}
		}
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-text-replace');

	// Default task.
	grunt.registerTask('default', ['jshint', 'concat', 'replace']);

};
