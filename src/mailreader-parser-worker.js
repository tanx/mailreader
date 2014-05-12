(function() {
    'use strict';

    // import web worker dependencies and polyfills
    importScripts('require.js');

    self.onmessage = function(e) {
        require(['mailreader-parser'], function(parser) {
            parser.parse(e.data, self.postMessage.bind(self));
        });
    };
}());