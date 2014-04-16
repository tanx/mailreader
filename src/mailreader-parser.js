(function (factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        define(['mimeparser', 'stringencoding'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('mimeparser'), require('stringencoding'));
    }
})(function (MimeParser, stringencoding) {
    'use strict';

    var TextDecoder = stringencoding.TextDecoder;

    var parser = {};
    parser.parse = function(method, raw, cb) {
        var done;

        if (method === 'parseRfc') {
            done = parseRfc;
        } else if (method === 'parseText') {
            done = parseText;
        } else if (method === 'parseAttachment') {
            done = parseAttachment;
        } else {
            throw new Error('unknown method!');
        }

        var parser = new MimeParser();
        parser.onend = done.bind(null, parser, cb);
        parser.end(raw);
    };

    function parseRfc(parser, cb) {
        var parsed = {
            text: '',
            attachments: []
        };

        Object.keys(parser.nodes).forEach(function(key) {
            var node = parser.nodes[key];

            if (node.contentType.value.indexOf('text/plain') > -1 && !node.headers['content-disposition']) {
                parsed.text += new TextDecoder('utf-8').decode(node.content);
                parsed.text = parsed.text.replace(/([\r]?\n)*$/g, '');
            }

            if (node.headers['content-disposition']) {
                var filename = 'attachment';
                if (node.headers['content-disposition'][0].params && node.headers['content-disposition'][0].params.filename) {
                    filename = node.headers['content-disposition'][0].params.filename;
                }

                parsed.attachments.push({
                    filename: filename,
                    mimeType: 'application/octet-stream',
                    content: node.content
                });
            }
        });


        cb(parsed);
    }

    function parseAttachment(parser, cb) {
        var node = parser.nodes.node,
            content;
        
        if (node.headers['content-disposition']) {
            content = node.content;
        }

        cb(content);
    }

    function parseText(parser, cb) {
        var text = '';

        var node = parser.nodes.node;
        if (node.contentType.value.indexOf('text/plain') > -1) {
            text += new TextDecoder('utf-8').decode(node.content);
            text = text.replace(/([\r]?\n)*$/g, '');
        }

        cb(text);
    }


    return parser;
});