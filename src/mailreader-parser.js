if (typeof module === 'object' && typeof define !== 'function') {
    var define = function(factory) {
        'use strict';
        module.exports = factory(require, exports, module);
    };
}

define(function(require) {
    'use strict';

    var MailParser = require('mailparser').MailParser;

    var parser = {};

    parser.parse = function(method, raw, cb) {
        var mp = new MailParser();
        mp.on('end', function(parsed) {
            if (method === 'parseRfc') {
                parseRfc(parsed, cb);
            } else if (method === 'parseText') {
                parseText(parsed, cb);
            } else if (method === 'parseAttachment') {
                parseAttachment(parsed, cb);
            } else {
                throw new Error('unknown method!');
            }
        });
        mp.end(raw);

    };

    function parseRfc(parsed, cb) {
        if (parsed.attachments) {
            // replace the node buffers with a typed array
            parsed.attachments.forEach(function(attmt) {
                attmt.content = bufferToTypedArray(attmt.content);
            });
        }

        // remove the unnecessary \n's and \r\n's at the end of the string...
        parsed.text = (parsed.text || '').replace(/([\r]?\n)*$/g, '');

        cb(parsed);
    }

    function parseAttachment(parsed, cb) {
        cb(bufferToTypedArray(parsed.attachments[0].content));
    }

    function parseText(parsed, cb) {
        var text = parsed.text || parsed.attachments[0].content.toString('binary') || '';

        // remove the unnecessary \n's and \r\n's at the end of the string...
        text = text.replace(/([\r]?\n)*$/g, '');

        // the mailparser parses the pgp/mime attachments, so we need to do a little extra work here
        cb(text);
    }

    //
    // Helper Methods
    //

    /**
     * Turns a node-style buffer into a typed array
     * @param  {Buffer} buffer A node-style buffer
     * @return {Uint8Array}    Uint8Array view on the ArrayBuffer
     */
    function bufferToTypedArray(buffer) {
        if (!buffer) {
            return new Uint8Array();
        }

        var view = new Uint8Array(buffer.length);

        for (var i = 0, len = buffer.length; i < len; i++) {
            view[i] = buffer.readUInt8(i);
        }
        return view;
    }

    return parser;
});