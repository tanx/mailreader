'use strict';

var parser = require('./mailreader-parser');

self.onmessage = function(e) {
    parser.parse(e.data, self.postMessage.bind(self));
};