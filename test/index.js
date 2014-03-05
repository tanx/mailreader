'use strict';

require.config({
    baseUrl: 'lib',
    paths: {
        'test': '..',
        'node-forge': 'forge',
        'chai': 'chai',
        'setimmediate': 'setImmediate'
    },
    shim: {
        'sinon': {
            exports: 'sinon'
        }
    }
});

mocha.setup('bdd');

require(['test/test'], function() {
    if (window.mochaPhantomJS) {
        mochaPhantomJS.run();
    } else {
        mocha.run();
    }
});