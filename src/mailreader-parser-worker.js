(function() {
    'use strict';

    // import web worker dependencies
    importScripts('require.js');

    require.config({
        paths: {
            'node-forge': 'forge',
            'setimmediate': 'setImmediate'
        }
    });

    self.addEventListener('message', function(e) {
        require(['mailreader-parser'], function(parser) {
            parser.parse(e.data.method, e.data.raw, function(parsed) {
                self.postMessage(parsed);
            });
        });
    });
}());