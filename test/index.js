'use strict';

require.config({
    baseUrl: 'lib',
    paths: {
        'test': '..',
    },
});

mocha.setup('bdd');
require(['test/test'], function() {
    if (window.mochaPhantomJS) {
        mochaPhantomJS.run();
    } else {
        mocha.run();
    }
});