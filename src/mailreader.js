if (typeof module === 'object' && typeof define !== 'function') {
    var define = function(factory) {
        'use strict';

        module.exports = factory(require, exports, module);
    };
}

define(function(require) {
    'use strict';

    var MailParser = require('mailparser').MailParser;

    var mailreader = {};
    mailreader.isRfc = function(string) {
        return string.indexOf('Content-Type: ') !== -1;
    };

    /**
     * Interprets an rfc block
     * @param {String} options.path The folder's path
     * @param {Number} options.message The message to append the interpreted data to
     * @param {String} options.raw the raw rfc block
     * @param {Function} callback will be called the message is parsed
     */
    mailreader.parseRfc = function(options, callback) {
        var mailparser = new MailParser(),
            message = options.message;

        message.attachments = message.attachments || [];
        options.message.body = options.message.body || '';

        mailparser.on("end", function(parsed) {
            message.body = (parsed.text || '').replace(/[\r]?\n$/g, '');

            if (parsed.attachments) {
                parsed.attachments.forEach(function(attmt) {
                    message.attachments.push({
                        filename: attmt.generatedFileName,
                        filesize: attmt.length,
                        mimeType: attmt.contentType,
                        content: bufferToTypedArray(attmt.content)
                    });
                });
            }

            callback(null, message);
        });
        mailparser.end(options.raw);
    };

    /**
     * Parses the text from a string representation of a mime node
     * @param {Object} options.message The message object to append the text to
     * @param {String} options.raw The string representation of a mime node
     * @param {Function} callback Will be invoked when the text was parsed
     */
    mailreader.parseText = function(options, callback) {
        var mailparser = new MailParser();
        options.message.body = options.message.body || '';

        mailparser.on('end', function(parsed) {
            // the mailparser parses the pgp/mime attachments, so we need to do a little extra work here
            var text = (parsed.text || parsed.attachments[0].content.toString('binary'));

            // remove the unnecessary \n's and \r\n's at the end of the string...
            text = text.replace(/([\r]?\n)*$/g, '');

            // the mailparser parsed the content of the text node, so let's add it to the mail body
            options.message.body += text;

            callback();
        });
        mailparser.end(options.raw);
    };

    /**
     * Parses the content from a string representation of an attachment mime node
     * @param {Object} options.attachment The attachment object to append the content to
     * @param {String} options.raw The string representation of a mime node
     * @param {Function} callback Will be invoked when the text was parsed
     */
    mailreader.parseAttachment = function(options, callback) {
        var mailparser = new MailParser();

        mailparser.on("end", function(parsed) {
            options.attachment.content = bufferToTypedArray(parsed.attachments[0].content);
            callback(null, options.attachment);
        });

        mailparser.end(options.raw);
    };

    //
    // Helper Methods
    //

    /**
     * Turns a node-style buffer into a typed array
     * @param  {Buffer} buffer A node-style buffer
     * @return {Uint8Array}    Uint8Array view on the ArrayBuffer
     */
    function bufferToTypedArray(buffer) {
        var ab = new ArrayBuffer(buffer.length),
            view = new Uint8Array(ab);

        for (var i = 0, len = buffer.length; i < len; i++) {
            view[i] = buffer.readUInt8(i);
        }
        return view;
    }

    return mailreader;
});