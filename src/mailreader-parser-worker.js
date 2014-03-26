(function() {
    'use strict';

    // import web worker dependencies and polyfills
    importScripts('require.js');

    self.addEventListener('message', function(e) {
        require(['mailreader-parser'], function(parser) {
            parser.parse(e.data.method, e.data.raw, function(parsed) {
                self.postMessage(parsed);
            });
        });
    });
}());