/*
 This notice must be untouched at all times.

 DreamFace Compiler
 Version: 2.1.8
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var Q    = require('q'),
    QFS  = require('q-io/fs'),
    path = require('path');

exports.Constr = function ( o ) {

    var theTask = this;

    this.src   = o.src;
    this.isPathAbsolute = o.isPathAbsolute
    this.descr = 'copying SOME_PROMISED tree to "' + theTask.path + '"';
    this.warnLevel = 'warn'; // TODO

    Q.when(this.src, function(src){
        theTask.descr = 'copying tree ["' +
            src.join('", "') +
            '"] to "' + theTask.path + '"';
    })

};

exports.start = function () {
    var theTask  = this;

    return Q.when(theTask.src, function(srcs){
        return Q.allSettled(
            srcs.map(function(src){
                return Q.when(src, function(_src){
                    return QFS.copyTree(

                        !theTask.isPathAbsolute
                            ? path.join(theTask.root.staticPath, _src)
                            : _src,

                        theTask.path
                    )
                })
            })
        );
    });
};
