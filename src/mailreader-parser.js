(function(factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        define(['mimeparser', 'stringencoding'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('mimeparser'), require('stringencoding'));
    }
})(function(MimeParser, stringencoding) {
    'use strict';

    var TextDecoder = stringencoding.TextDecoder;

    var parser = {};
    parser.parse = function(messageParts, cb) {
        messageParts.forEach(function(msgPart) {
            var parser = new MimeParser();
            parser.onend = function() {
                walkMimeTree(parser.node, msgPart);
            };
            parser.end(msgPart.plaintext || msgPart.raw);
        });
        cb(messageParts);
    };

    var mimeTreeMatchers = [matchEncrypted, matchSigned, matchText, matchHtml, matchAttachment];

    function walkMimeTree(mimeNode, msgPart) {
        var i = mimeTreeMatchers.length;
        while (i--) {
            if (mimeTreeMatchers[i](mimeNode, msgPart)) {
                return;
            }
        }

        if (mimeNode._childNodes) {
            mimeNode._childNodes.forEach(function(childNode) {
                walkMimeTree(childNode, msgPart);
            });
        }
    }

    /**
     * Matches encrypted PGP/MIME nodes
     *
     * multipart/encrypted
     * |
     * |-- application/pgp-encrypted
     * |-- application/octet-stream <-- ciphertext
     */
    function matchEncrypted(node, msgPart) {
        var isEncrypted = /^multipart\/encrypted/i.test(node.contentType.value) && node._childNodes && node._childNodes[1];
        if (!isEncrypted) {
            return false;
        }

        msgPart.ciphertext = new TextDecoder('utf-8').decode(node._childNodes[1].content);
        return true;
    }

    /**
     * Matches signed PGP/MIME nodes
     *
     * multipart/signed
     * |
     * |-- *** (signed mime sub-tree)
     * |-- application/pgp-signature
     */
    function matchSigned(node, msgPart) {
        var isSigned = /^multipart\/signed/i.test(node.contentType.value) && node._childNodes && node._childNodes[0] && node._childNodes[1] && /^application\/pgp-signature/i.test(node._childNodes[1].contentType.value);

        if (!isSigned) {
            return false;
        }

        var part;
        if (msgPart.type === 'signed') {
            part = msgPart;
        } else {
            part = {
                type: 'signed',
                content: []
            };
            msgPart.content.push(part);
        }

        part.signed = node._childNodes[0].raw;
        part.signature = new TextDecoder('utf-8').decode(node._childNodes[1].content);

        walkMimeTree(node._childNodes[0], part);

        return true;
    }

    /**
     * Matches non-attachment text/plain nodes
     */
    function matchText(node, msgPart) {
        var disposition = node.headers['content-disposition'];
        var isText = (/^text\/plain/i.test(node.contentType.value) && (!disposition || (disposition && disposition[0].value !== 'attachment')));

        if (!isText) {
            return false;
        }

        var content = new TextDecoder('utf-8').decode(node.content).replace(/([\r]?\n)*$/g, '');
        if (msgPart.type === 'text') {
            msgPart.content = content;
        } else {
            msgPart.content.push({
                type: 'text',
                content: content
            });
        }

        return true;
    }

    /**
     * Matches non-attachment text/html nodes
     */
    function matchHtml(node, msgPart) {
        var disposition = node.headers['content-disposition'];
        var isHtml = (/^text\/html/i.test(node.contentType.value) && (!disposition || (disposition && disposition[0].value !== 'attachment')));

        if (!isHtml) {
            return false;
        }

        var content = new TextDecoder('utf-8').decode(node.content).replace(/([\r]?\n)*$/g, '');
        if (msgPart.type === 'html') {
            msgPart.content = content;
        } else {
            msgPart.content.push({
                type: 'html',
                content: content
            });
        }

        return true;
    }

    /**
     * Matches non-attachment text/html nodes
     */
    function matchAttachment(node, msgPart) {
        var disposition = node.headers['content-disposition'],
            contentType = node.contentType.value;
        var isTextAttachment = /^text\//i.test(contentType) && !! disposition && disposition[0].value === 'attachment',
            isOtherAttachment = !/^text\//i.test(contentType) && !/^multipart\//i.test(contentType);

        if (!isTextAttachment && !isOtherAttachment) {
            return false;
        }

        if (msgPart.type === 'attachment') {
            msgPart.content = node.content;
        } else {
            msgPart.content.push({
                type: 'attachment',
                content: node.content,
                id: node.headers['content-id'] ? node.headers['content-id'][0].value : undefined
            });
        }

        return true;
    }

    return parser;

});