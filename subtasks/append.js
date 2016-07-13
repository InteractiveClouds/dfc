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

    if ( o.src ) {
        this.src = path.resolve(o.src) == path.normalize(o.src)
            ? o.src // absolute path
            : path.join(this.root.staticPath, o.src);
    } else {
        this.contId = this.fStorage.put(o.cont);
    }

    this.descr = 'appending ' +
        (this.src || 'a text')+
        ' to ' + this.path;
};

exports.start = function () {
    var theTask = this;

    return (
        !theTask.src
            ? Q.when(theTask.contId, function(id){
                    return theTask.fStorage.get(id)
                })
            : QFS.read(theTask.src)
    ).then(function(content){
        return QFS.append(theTask.path, content);
    });
};
