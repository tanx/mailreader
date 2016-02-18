(function(factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        define(['emailjs-mime-parser', 'emailjs-stringencoding'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('emailjs-mime-parser'), require('emailjs-stringencoding'));
    }
})(function(MimeParser, stringencoding) {
    'use strict';

    var TextDecoder = stringencoding.TextDecoder;

    var parser = {};

    // parse the body parts and handle the results for the individual mime nodes
    parser.parse = function(bodyParts, cb) {
        var parsedCounter = 0;

        // feed each body part to the mimeparser
        bodyParts.forEach(function(bodyPart) {
            var parser = new MimeParser();

            // body part has been parsed
            parser.onend = function() {
                delete bodyPart.raw; // part has been parsed, we can remove the raw attribute

                bodyPart.content = []; // holds subparts, e.g. for encrypted and/or signed nodes

                // traverse through the parsed result
                walkMimeTree(parser.node, bodyPart);

                // we're done with a body part, are we done with all parts?
                parsedCounter++;
                if (parsedCounter < bodyParts.length) {
                    // nope, more body parts left to parse
                    return;
                }

                // we're done
                cb(bodyParts);
            };

            // parse the body part
            parser.end(bodyPart.raw);
        });
    };

    // functions that return true/false if they were able to handle a certain kind of body part
    var mimeTreeMatchers = [matchEncrypted, matchSigned, matchAttachment, matchText, matchHtml];

    // do a depth-first traversal of the body part, check for each node if it matches
    // a certain type, then poke into its child nodes. not a pure inorder traversal b/c
    // lookup is terminated when higher-up node can already be matched, e.g. encrypted/signed
    // multipart nodes
    function walkMimeTree(mimeNode, bodyPart) {
        // normalize the mime node
        normalize(mimeNode);

        // iterate through the matchers and see how to best take care of the mime node
        var i = mimeTreeMatchers.length;
        while (i--) {
            if (mimeTreeMatchers[i](mimeNode, bodyPart)) {
                return;
            }
        }

        // depth-first traverse the child nodes
        if (mimeNode._childNodes) {
            mimeNode._childNodes.forEach(function(childNode) {
                walkMimeTree(childNode, bodyPart);
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
    function matchEncrypted(node, bodyPart) {
        var isEncrypted = /^multipart\/encrypted/i.test(node.contentType.value) && node._childNodes && node._childNodes[1];
        if (!isEncrypted) {
            return false;
        }

        // normalize the child node
        normalize(node._childNodes[1]);

        bodyPart.content = new TextDecoder('utf-8').decode(node._childNodes[1].content);
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
    function matchSigned(node, bodyPart) {
        // does the content type fit?
        var isSigned = /^multipart\/signed/i.test(node.contentType.value);

        // does the mime node have child nodes?
        isSigned = isSigned && node._childNodes && node._childNodes[0] && node._childNodes[1];

        // normalize the child nodes
        isSigned && normalize(node._childNodes[0]);
        isSigned && normalize(node._childNodes[1]);

        // do the child nodes fit?
        isSigned = isSigned && /^application\/pgp-signature/i.test(node._childNodes[1].contentType.value);

        if (!isSigned) {
            return false;
        }

        // remember the correct node to do the parsing of the nested nodes
        var part;
        if (bodyPart.type === 'signed') {
            // this mime node is the signed node we gave to the mimeparser
            part = bodyPart;
        } else {
            // this parsed mime node is part of an encrypted node
            part = {
                type: 'signed',
                content: []
            };
            bodyPart.content.push(part);
        }

        // email.js automatically converts \r\n to \n ... normalize to \r\n for signature check!
        part.signedMessage = node._childNodes[0].raw.replace(/\r/g, '').replace(/\n/g, '\r\n');
        part.signature = new TextDecoder('utf-8').decode(node._childNodes[1].content);

        // walk the mime tree to find the nested nodes
        walkMimeTree(node._childNodes[0], part);

        return true;
    }

    /**
     * Matches non-attachment text/plain nodes
     */
    function matchText(node, bodyPart) {
        var disposition = node.headers['content-disposition'],
            isText = (/^text\/plain/i.test(node.contentType.value) && (!disposition || (disposition && disposition[0].value !== 'attachment')));

        if (!isText) {
            return false;
        }

        var content = new TextDecoder('utf-8').decode(node.content).replace(/([\r]?\n)*$/g, '');
        if (bodyPart.type === 'text') {
            // this mime node is the text node we gave to the mimeparser
            bodyPart.content = content;
        } else {
            // this mime node is part of a signed or encrypted node
            bodyPart.content.push({
                type: 'text',
                content: content
            });
        }

        return true;
    }

    /**
     * Matches non-attachment text/html nodes
     */
    function matchHtml(node, bodyPart) {
        var disposition = node.headers['content-disposition'],
            isHtml = (/^text\/html/i.test(node.contentType.value) && (!disposition || (disposition && disposition[0].value !== 'attachment')));

        if (!isHtml) {
            return false;
        }

        var content = new TextDecoder('utf-8').decode(node.content).replace(/([\r]?\n)*$/g, '');
        if (bodyPart.type === 'html') {
            // this mime node is the html node we gave to the mimeparser
            bodyPart.content = content;
        } else {
            // this mime node is part of a signed or encrypted node
            bodyPart.content.push({
                type: 'html',
                content: content
            });
        }

        return true;
    }

    /**
     * Matches non-attachment text/html nodes
     */
    function matchAttachment(node, bodyPart) {
        var disposition = node.headers['content-disposition'],
            contentType = node.contentType.value,
            isTextAttachment = /^text\//i.test(contentType) && disposition && disposition[0].value === 'attachment',
            isOtherAttachment = !/^text\//i.test(contentType) && !/^multipart\//i.test(contentType);

        if (!isTextAttachment && !isOtherAttachment) {
            return false;
        }

        var part;
        if (bodyPart.type === 'attachment') {
            // this mime node is the attachment node we gave to the mimeparser
            part = bodyPart;
        } else {
            // this mime node is part of a signed or encrypted node
            part = {
                type: 'attachment'
            };
            bodyPart.content.push(part);
        }

        part.content = node.content;
        part.id = part.id || (node.headers['content-id'] && node.headers['content-id'][0].value.replace(/[<>]/g, ''));
        part.mimeType = part.mimeType || contentType;
        part.filename = part.filename || (disposition && disposition[0].params.filename) || node.contentType.params.name || 'attachment';

        return true;
    }


    /**
     * Normalizes a mime node where necessary
     * - add contentType
     * - add contentType params
     * - add content
     * - add raw
     * - normalize content-id
     * - normalize content-disposition
     */
    function normalize(node) {
        // normalize the optional content-type, fallback to 'application/octet-stream'
        node.contentType = node.contentType || {};
        node.contentType.value = node.contentType.value || 'application/octet-stream';
        node.contentType.params = node.contentType.params || {};

        // normalize the contents
        node.raw = node.raw || '';
        node.content = node.content || '';

        // optional
        if (node.headers['content-id']) {
            // node has content-id set, let's normalize it
            var cid = node.headers['content-id'][0] = node.headers['content-id'][0] || {};
            cid.value = cid.value || '';
        }

        // optional
        if (node.headers['content-disposition']) {
            // this is an attachment node, let's normalize node.headers['content-disposition']
            var disposition = node.headers['content-disposition'][0] = node.headers['content-disposition'][0] || {};
            disposition.value = disposition.value || '';
            disposition.params = disposition.params || {};
        }
    }

    return parser;
});