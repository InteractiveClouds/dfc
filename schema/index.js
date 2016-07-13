/*
 This notice must be untouched at all times.

 DreamFace Compiler
 Version: 2.1.8
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var Q   = require('q'),
    QFS = require('q-io/fs'),

    out = {},
    RGXP_SCHEMA_FILENAME = /^[\d\w]+\.js$/,
    RGXP_CUT_JS_EXT      = /\.js$/,
    D = Q.defer();

module.exports = D.promise;

QFS.list(__dirname).then(function(files){
    files.forEach(function(fileName){
        if ( RGXP_SCHEMA_FILENAME.test(fileName) && fileName !== 'index.js' ) {
            out[fileName.replace(RGXP_CUT_JS_EXT, '')] = require('./'+fileName);
        }
    });

    D.resolve(out);
})
.done();
