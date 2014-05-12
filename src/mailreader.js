(function(factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        define(['mailreader-parser'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('./mailreader-parser'));
    }
})(function(parser) {
    'use strict';

    var mailreader = {};

    mailreader.startWorker = function(path) {
        path = (typeof path !== 'undefined') ? path : './mailreader-parser-worker.js';
        mailreader._worker = new Worker(path);
        mailreader._workerQueue = [];
        mailreader._workerBusy = false;
    };

    /**
     * Interprets an rfc block
     * @param {String} options.bodyParts Body parts for parsing, as returned by https://github.com/whiteout-io/imap-client
     * @param {Function} callback will be called the message is parsed
     */
    mailreader.parse = function(options, callback) {
        if (typeof window !== 'undefined' && window.Worker && !mailreader._worker) {
            throw new Error('Worker is not initialized!');
        }

        if (!mailreader._worker) {
            parser.parse(options.bodyParts, function(parsed) {
                callback(null, parsed);
            });
            return;
        }

        mailreader._process({
            bodyParts: options.bodyParts,
            callback: callback
        });
    };

    mailreader._process = function(item) {
        if (item) {
            mailreader._workerQueue.push(item);
        }

        if (mailreader._workerBusy || mailreader._workerQueue.length === 0) {
            return;
        }

        mailreader._workerBusy = true;
        var current = mailreader._workerQueue.shift();

        mailreader._worker.onmessage = function(e) {
            mailreader._workerBusy = false;
            mailreader._process();
            current.callback(null, e.data);
        };

        mailreader._worker.onerror = function(e) {
            var error = new Error('Error handling web worker: Line ' + e.lineno + ' in ' + e.filename + ': ' + e.message);
            mailreader._workerBusy = false;
            mailreader._process();
            console.error(error);
            current.callback(error);
        };

        mailreader._worker.postMessage(current.bodyParts);
    };

    return mailreader;
});