'use strict';

require.config({
    baseUrl: '.',
    paths: {
        'chai': '../node_modules/chai/chai',
        'mailparser': '../node_modules/mailparser/src/mailparser',
        'streams': '../node_modules/mailparser/src/streams',
        'datetime': '../node_modules/mailparser/src/datetime',
        'amdefine': '../node_modules/mailparser/node_modules/amdefine/amdefine',
        'encoding': '../node_modules/mailparser/node_modules/encoding/src/encoding',
        'iconv-lite': '../node_modules/mailparser/node_modules/encoding/node_modules/iconv-lite/src/iconv-lite',
        'singlebyte': '../node_modules/mailparser/node_modules/encoding/node_modules/iconv-lite/src/singlebyte',
        'gbk': '../node_modules/mailparser/node_modules/encoding/node_modules/iconv-lite/src/gbk',
        'big5': '../node_modules/mailparser/node_modules/encoding/node_modules/iconv-lite/src/big5',
        'filemapping': '../node_modules/mailparser/node_modules/encoding/node_modules/iconv-lite/src/filemapping',
        'mime': '../node_modules/mailparser/node_modules/mime/src/mime',
        'mimelib': '../node_modules/mailparser/node_modules/mimelib/src/mimelib',
        'addressparser': '../node_modules/mailparser/node_modules/mimelib/node_modules/addressparser/src/addressparser',
        'node-shims': '../node_modules/mailparser/node_modules/node-shims/src/node-shims',
        'node-util': '../node_modules/mailparser/node_modules/node-shims/src/node-util',
        'node-events': '../node_modules/mailparser/node_modules/node-shims/src/node-events',
        'node-stream': '../node_modules/mailparser/node_modules/node-shims/src/node-stream',
        'node-net': '../node_modules/mailparser/node_modules/node-shims/src/node-net',
        'node-tls': '../node_modules/mailparser/node_modules/node-shims/src/node-tls',
        'node-buffer': '../node_modules/mailparser/node_modules/node-shims/src/node-buffer',
        'node-crypto': '../node_modules/mailparser/node_modules/node-shims/src/node-crypto',
        'node-querystring': '../node_modules/mailparser/node_modules/node-shims/src/node-querystring',
        'node-url': '../node_modules/mailparser/node_modules/node-shims/src/node-url',
        'node-http': '../node_modules/mailparser/node_modules/node-shims/src/node-http',
        'node-stream-default': '../node_modules/mailparser/node_modules/node-shims/src/node-stream-default',
        'node-stream-readable': '../node_modules/mailparser/node_modules/node-shims/src/node-stream-readable',
        'node-stream-writable': '../node_modules/mailparser/node_modules/node-shims/src/node-stream-writable',
        'node-stream-duplex': '../node_modules/mailparser/node_modules/node-shims/src/node-stream-duplex',
        'node-stream-transform': '../node_modules/mailparser/node_modules/node-shims/src/node-stream-transform',
        'node-stream-passthrough': '../node_modules/mailparser/node_modules/node-shims/src/node-stream-passthrough',
        'node-http-request': '../node_modules/mailparser/node_modules/node-shims/src/node-http-request',
        'node-http-response': '../node_modules/mailparser/node_modules/node-shims/src/node-http-response',
        'node-string-decoder': '../node_modules/mailparser/node_modules/node-shims/src/node-string-decoder',
        'setimmediate': '../node_modules/mailparser/node_modules/setimmediate/setImmediate',
        'node-forge': '../node_modules/mailparser/node_modules/node-shims/node_modules/node-forge/js/forge',
        'aes': '../node_modules/mailparser/node_modules/node-shims/node_modules/node-forge/js/aes',
        'aesCipherSuites': '../node_modules/mailparser/node_modules/node-shims/node_modules/node-forge/js/aesCipherSuites',
        'asn1': '../node_modules/mailparser/node_modules/node-shims/node_modules/node-forge/js/asn1',
        'debug': '../node_modules/mailparser/node_modules/node-shims/node_modules/node-forge/js/debug',
        'des': '../node_modules/mailparser/node_modules/node-shims/node_modules/node-forge/js/des',
        'hmac': '../node_modules/mailparser/node_modules/node-shims/node_modules/node-forge/js/hmac',
        'log': '../node_modules/mailparser/node_modules/node-shims/node_modules/node-forge/js/log',
        'pbkdf2': '../node_modules/mailparser/node_modules/node-shims/node_modules/node-forge/js/pbkdf2',
        'pem': '../node_modules/mailparser/node_modules/node-shims/node_modules/node-forge/js/pem',
        'pkcs7': '../node_modules/mailparser/node_modules/node-shims/node_modules/node-forge/js/pkcs7',
        'pkcs1': '../node_modules/mailparser/node_modules/node-shims/node_modules/node-forge/js/pkcs1',
        'pkcs12': '../node_modules/mailparser/node_modules/node-shims/node_modules/node-forge/js/pkcs12',
        'pki': '../node_modules/mailparser/node_modules/node-shims/node_modules/node-forge/js/pki',
        'prng': '../node_modules/mailparser/node_modules/node-shims/node_modules/node-forge/js/prng',
        'pss': '../node_modules/mailparser/node_modules/node-shims/node_modules/node-forge/js/pss',
        'random': '../node_modules/mailparser/node_modules/node-shims/node_modules/node-forge/js/random',
        'rc2': '../node_modules/mailparser/node_modules/node-shims/node_modules/node-forge/js/rc2',
        'task': '../node_modules/mailparser/node_modules/node-shims/node_modules/node-forge/js/task',
        'tls': '../node_modules/mailparser/node_modules/node-shims/node_modules/node-forge/js/tls',
        'util': '../node_modules/mailparser/node_modules/node-shims/node_modules/node-forge/js/util',
        'md': '../node_modules/mailparser/node_modules/node-shims/node_modules/node-forge/js/md',
        'mgf1': '../node_modules/mailparser/node_modules/node-shims/node_modules/node-forge/js/mgf1',
        'mgf': '../node_modules/mailparser/node_modules/node-shims/node_modules/node-forge/js/mgf',
        'jsbn': '../node_modules/mailparser/node_modules/node-shims/node_modules/node-forge/js/jsbn',
        'oids': '../node_modules/mailparser/node_modules/node-shims/node_modules/node-forge/js/oids',
        'pkcs7asn1': '../node_modules/mailparser/node_modules/node-shims/node_modules/node-forge/js/pkcs7asn1',
        'x509': '../node_modules/mailparser/node_modules/node-shims/node_modules/node-forge/js/x509',
        'sha1': '../node_modules/mailparser/node_modules/node-shims/node_modules/node-forge/js/sha1',
        'pbe': '../node_modules/mailparser/node_modules/node-shims/node_modules/node-forge/js/pbe',
        'rsa': '../node_modules/mailparser/node_modules/node-shims/node_modules/node-forge/js/rsa',
        'md5': '../node_modules/mailparser/node_modules/node-shims/node_modules/node-forge/js/md5',
        'sha256': '../node_modules/mailparser/node_modules/node-shims/node_modules/node-forge/js/sha256'
    },
    shim: {
        'sinon': {
            exports: 'sinon'
        }
    }
});

mocha.setup('bdd');
// the integration test does not work in phantomjs
require(['test'], function() {
    if (window.mochaPhantomJS) {
        mochaPhantomJS.run();
    } else {
        mocha.run();
    }
});