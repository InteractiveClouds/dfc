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

    if ( o.name !== '.' ) {
        this.path = path.join(this.path, o.name);
        this.createDir = true;
    }

    this.cont = o.cont;

    this.descr = (this.createDir ? 'creating' : 'filling' ) +
        ' directory ' + this.path;

    if ( !o.name ) this.errors.push(this.log.error(
        'DESCR: ' + this.descr + ',' +
        ' ERROR: empty dir name'
    ));
};

exports.start = function () {
    var theTask = this;

    return Q.when(
        theTask.createDir && QFS.makeDirectory(theTask.path),
        function () {
            return Q.when(theTask.cont, function (cont) {
                return Q.allSettled(
                    cont.map(function(t){
                        return theTask.runSubTask(t);
                    })
                );
            });
        }
    )
};
