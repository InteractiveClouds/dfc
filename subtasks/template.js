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
    this.templatePath = o.templatePath;
    this.templatePath =
        path.resolve(o.templatePath) == path.normalize(o.templatePath)
            ? o.templatePath // absolute path
            : path.join(this.root.staticPath, o.templatePath);
    this.templateData = o.templateData;
    this.templateOpts = o.templateOpts;

    this.descr = o.descr ||
        'compiling jade template: "' + this.templatePath + '"';
};

exports.start = function () {
    var theTask = this;

    return theTask.jadeTempl.make(
        theTask.templatePath,
        theTask.templateData,
        theTask.templateOpts
    );
}
