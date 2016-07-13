/*
 This notice must be untouched at all times.

 DreamFace Compiler
 Version: 2.1.8
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var Q = require('q');
var replace = require("replace");

exports.Constr = function ( o ) {
    this.descr = 'Replace content in files';
    this.rules = o.rules;
};

exports.start = function () {
    return Do_replace(this.rules);
};

function Do_replace(o){
    o.forEach(function(item){
        replace({
            regex: item.find,
            replacement: item.replace,
            paths: [item.path],
            recursive: true,
            silent: true
        });
    })
    return Q.resolve();
};

