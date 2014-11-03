# mailreader

This module parses RFC 2822 strings. Works on a simplified version of a MIME tree as commonly used in emails. `mailreader` uses [email.js](http://emailjs.org) components.

Here's how `mailreader` is intended:

* Receive a mail with the [imap-client](https://github.com/whiteout-io/imap-client) and get the body parts you're interested in
* Give them to `mailreader` for parsing
* Done.

[![Build Status](https://travis-ci.org/whiteout-io/mailreader.png?branch=master)](https://travis-ci.org/whiteout-io/mailreader)

## The MIME tree abstraction

To not have to deal with the whole complexity of handling a full-blown mime tree, mailreader uses a simplified version of the most commonly used MIME nodes used in emails.

### html
A MIME node with `Content-Type: text/html`, *without* `Content-Disposition` header. Example: 

```
{
    type: 'text',
    raw: 'Content-Transfer-Encoding: 7bit\r\nContent-Type: text/html;\r\n    charset=us-ascii\r\n\r\n<html><body>asd<img src="cid:20154202-BB6F-49D7-A1BB-17E9937B42B5"></body></html>\r\n',
    content: '<html><body>asd<img src="cid:20154202-BB6F-49D7-A1BB-17E9937B42B5"></body></html>'
}
```

### text

A MIME node with `Content-Type: text/plain`, *without* `Content-Disposition` header. Example: 

```
{
    type: 'text',
    raw: 'Content-Type: text/plain; charset=ISO-8859-1\r\n\r\nasdasd\r\n',
    content: 'asdasd'
}
```

### attachment

A MIME node with `Content-Disposition` header. Example:

```
{
    type: 'attachment',
    raw: 'Content-Type: image/jpeg; name="myfile.jpg"\r\nContent-Disposition: attachment; filename="myfile.jpg"\r\nContent-Id: <my-content-identifier>\r\nContent-Transfer-Encoding: base64\r\n\r\n ... (a lot of base64) ... \r\n'
    content: [...], // Uint8Array with binary content
    filename: 'myfile.jpg', // the attachment filename, 'attachment' as fallback if not parseable
    mimeType: 'image/jpeg', // the attachment MIME type, application/octet-stream as fallback if not parseable
    id: 'my-content-identifier' // if `Content-Id` header is present, the id can be used to cross-reference it with html body parts
}
```

### signed

A MIME subtree with `Content-Type: multipart/signed`. Example

```
{
    type: 'signed',
    raw: 'Content-Type: multipart/signed; boundary="Apple-Mail=_C94D8F86-2AA4-4D9A-A975-F51C8A2937B6"; protocol="application/pgp-signature"; micalg=pgp-sha512\r\n\r\n--Apple-Mail=_C94D8F86-2AA4-4D9A-A975-F51C8A2937B6\r\nContent-Transfer-Encoding: 7bit\r\nContent-Type: text/plain;\r\n    charset=us-ascii\r\n\r\nthis is some signed stuff!\r\n\r\n--Apple-Mail=_C94D8F86-2AA4-4D9A-A975-F51C8A2937B6\r\nContent-Transfer-Encoding: 7bit\r\nContent-Disposition: attachment;\r\n    filename=signature.asc\r\nContent-Type: application/pgp-signature;\r\n    name=signature.asc\r\nContent-Description: Message signed with OpenPGP using GPGMail\r\n\r\n-----BEGIN PGP SIGNATURE-----\r\nComment: GPGTools - https://gpgtools.org\r\n\r\niQEcBAEBCgAGBQJTaJgoAAoJEOHUm+Va/GWKreEIAI9qgTBR1SWciKQXduY2ZyY1\r\n3ymKequbFKyoG6gytrIfeAeMJrTZiySXNvOHMlm852fE0vQFWNXtVf2XW0wp8gHL\r\n9X8rpaKtArQHNXWgWN/23+Ea1A0GsyMaxRQxJgj62BEsQsnGUJDgWhq6T5SDZA+h\r\n1ihy12Xvh4F4P//Nt8az2EmWLCv4KbzGp6LVS5jqVxPncuO5mKYZB3yupXnV2nKA\r\nrijmxCTaTJM2tTcTucxNR7hiYTjY6kCpmaTGg9Aq1iy8+hahZ/ZJndzrIMcg+VEA\r\nclbOS6qREijrtuUDLiK58j4w41vRsOmbMOyGQEYNJ7cXQ793/qDPetY4W2ZtRLk=\r\n=iMlU\r\n-----END PGP SIGNATURE-----\r\n\r\n--Apple-Mail=_C94D8F86-2AA4-4D9A-A975-F51C8A2937B6--\r\n',
    signedMessage: 'Content-Transfer-Encoding: 7bit\r\nContent-Type: text/plain;\r\n    charset=us-ascii\r\n\r\nthis is some signed stuff!\r\n\r\n', //
    signature: '-----BEGIN PGP SIGNATURE-----\r\nComment: GPGTools - https://gpgtools.org\r\n\r\niQEcBAEBCgAGBQJTaJgoAAoJEOHUm+Va/GWKreEIAI9qgTBR1SWciKQXduY2ZyY1\r\n3ymKequbFKyoG6gytrIfeAeMJrTZiySXNvOHMlm852fE0vQFWNXtVf2XW0wp8gHL\r\n9X8rpaKtArQHNXWgWN/23+Ea1A0GsyMaxRQxJgj62BEsQsnGUJDgWhq6T5SDZA+h\r\n1ihy12Xvh4F4P//Nt8az2EmWLCv4KbzGp6LVS5jqVxPncuO5mKYZB3yupXnV2nKA\r\nrijmxCTaTJM2tTcTucxNR7hiYTjY6kCpmaTGg9Aq1iy8+hahZ/ZJndzrIMcg+VEA\r\nclbOS6qREijrtuUDLiK58j4w41vRsOmbMOyGQEYNJ7cXQ793/qDPetY4W2ZtRLk=\r\n=iMlU\r\n-----END PGP SIGNATURE-----\r\n\r\n',
    content: [{
        type: 'text',
        content: 'this is some signed stuff!'
    }]
}
```

### encrypted

A MIME subtree with `Content-Type: multipart/signed`

```
{
    type: 'encrypted',
    raw: 'Content-Type: multipart/encrypted;\r\n protocol=\"application/pgp-encrypted\";\r\n boundary=\"MrDkNHd70n0CBWqJqodk50MfrlELiXLgn\"\r\n\r\nThis is an OpenPGP/MIME encrypted message (RFC 4880 and 3156)\r\n--MrDkNHd70n0CBWqJqodk50MfrlELiXLgn\r\nContent-Type: application/pgp-encrypted\r\nContent-Description: PGP/MIME version identification\r\n\r\nVersion: 1\r\n\r\n--MrDkNHd70n0CBWqJqodk50MfrlELiXLgn\r\nContent-Type: application/octet-stream; name=\"encrypted.asc\"\r\nContent-Description: OpenPGP encrypted message\r\nContent-Disposition: inline; filename=\"encrypted.asc\"\r\n\r\n-----BEGIN PGP MESSAGE-----\r\nVersion: GnuPG v1.4.13 (Darwin)\r\nComment: GPGTools - https://gpgtools.org\r\nComment: Using GnuPG with Thunderbird - http://www.enigmail.net/\r\n\r\n ... ciphertext goes here ... \r\n=3OkT\r\n-----END PGP MESSAGE-----\r\n\r\n--MrDkNHd70n0CBWqJqodk50MfrlELiXLgn--',
    content: '-----BEGIN PGP MESSAGE-----\r\nVersion: GnuPG v1.4.13 (Darwin)\r\nComment: GPGTools - https://gpgtools.org\r\nComment: Using GnuPG with Thunderbird - http://www.enigmail.net/\r\n\r\n ... ciphertext goes here ... \r\n=3OkT\r\n-----END PGP MESSAGE-----' // PGP ciphertext
}
```

## Let's parse stuff

```javascript
var mailreader = require('mailreader');
var email = {
    bodyParts: [{
        type: 'text',
        raw: 'Content-Type: text/plain; charset=ISO-8859-1\r\n\r\nasdasd\r\n'
    }]
};

mailreader.parse(email, function(err, bodyParts) {
    console.log(bodyParts[0].content); // -> 'asdasd'
});
```

## Multithreading

To offload the mail parsing to a web worker, call `mailreader.startWorker(path)`. `mailreader` has to load dependencies, so there are two options:

* Use `startWorker('[PATH]/mailreader-parser-worker.js')` as the entry point for the web worker to load the email.js dependencies via AMD **or**
* Build mailreader-parser-worker-browserify.js with browserify and supply the browserified file `startWorker('[PATH]/[BROWSERIFIED-FILE].js')`

## Get your hands dirty

Run the following commands to get started:

    npm install && grunt
