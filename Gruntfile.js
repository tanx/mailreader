module.exports = function(grunt) {
    'use strict';

    // Project configuration.
    grunt.initConfig({
        jshint: {
            all: ['*.js', 'src/*.js', 'test/*.js'],
            options: {
                jshintrc: '.jshintrc'
            }
        },

        mochaTest: {
            all: {
                options: {
                    reporter: 'dot'
                },
                src: ['test/test.js']
            }
        },

        connect: {
            dev: {
                options: {
                    port: 8124,
                    base: '.',
                    keepalive: true
                }
            }
        },

        mocha_phantomjs: {
            all: {
                options: {
                    reporter: 'dot'
                },
                src: ['test/index.html']
            }
        },

        copy: {
            npm: {
                expand: true,
                flatten: true,
                cwd: 'node_modules/',
                src: [
                    'chai/chai.js',
                    'mocha/mocha.js',
                    'mocha/mocha.css',
                    'requirejs/require.js',
                    'mailparser/src/*.js',
                    'mailparser/node_modules/encoding/src/*.js',
                    'mailparser/node_modules/encoding/node_modules/iconv-lite/src/*.js',
                    'mailparser/node_modules/mime/src/*.js',
                    'mailparser/node_modules/mimelib/src/*.js',
                    'mailparser/node_modules/mimelib/node_modules/addressparser/src/*.js',
                    'mailparser/node_modules/node-shims/src/*.js',
                    'mailparser/node_modules/node-shims/node_modules/node-forge/js/*.js',
                    'mailparser/node_modules/setimmediate/setImmediate.js'
                ],
                dest: 'test/lib/'
            },
            app: {
                expand: true,
                flatten: true,
                cwd: 'src/',
                src: [
                    '*.js',
                ],
                dest: 'test/lib/'
            }
        },

        clean: {
            test: ['test/lib/']
        },

        watch: {
            js: {
                files: ['src/*.js'],
                tasks: ['build']
            }
        },
    });

    // Load the plugin(s)
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-phantomjs');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Tasks
    grunt.registerTask('dev', ['connect:dev', 'watch']);
    grunt.registerTask('build', ['clean', 'copy']);
    grunt.registerTask('default', ['jshint', 'clean', 'copy', 'mochaTest', 'mocha_phantomjs']);
};