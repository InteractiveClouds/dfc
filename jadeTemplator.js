/*
 This notice must be untouched at all times.

 DreamFace Compiler
 Version: 2.1.8
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

// q-wrapped jade with cache of compiled templates

var Q    = require('q'),
    QFS  = require('q-io/fs'),
    jade = require('jade');

var cache = {};

exports.make = function ( templPath, content, opts ) {
    return (function(){
        return cache.hasOwnProperty(templPath)
            ? Q.resolve(cache[templPath])
            : QFS.read(templPath)
                .then(function(template){
                    return cache[templPath] = jade.compile(template, opts);
                })

    })()
    .then(function(compiledTemplFunc){
        return compiledTemplFunc(content);
    });
};
