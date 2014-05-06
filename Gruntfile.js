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
                    reporter: 'spec'
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
                    reporter: 'spec'
                },
                src: ['test/index.html']
            }
        },

        copy: {
            npm: {
                expand: true,
                flatten: false,
                cwd: 'node_modules/',
                src: [
                    'chai/chai.js',
                    'mocha/mocha.js',
                    'mocha/mocha.css',
                    'requirejs/require.js',
                    'arraybuffer-slice/index.js',
                    'stringencoding/dist/*',
                    'mimeparser/src/*',
                    'mimeparser/node_modules/mimefuncs/src/*',
                    'mimeparser/node_modules/addressparser/src/*'
                ],
                dest: 'test/lib/',
                rename: function(dest, src) {
                    if (src === 'arraybuffer-slice/index.js') {
                        // 'index.js' is obviously a good name for a polyfill. duh.
                        return dest + 'arraybuffer-slice.js';
                    }
                    return dest + '/' + src.split('/').pop();
                }
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
                tasks: ['clean', 'copy']
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
    grunt.registerTask('dev', ['jshint', 'clean', 'copy', 'connect:dev']);
    grunt.registerTask('default', ['jshint', 'clean', 'copy', 'mochaTest', 'mocha_phantomjs']);
};