/*
 This notice must be untouched at all times.

 DreamFace Compiler
 Version: 2.1.8
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var Q = require('q');

exports.Constr = function ( o ) {
    this.schemaId = o.schemaId;
    this.descr = 'schema';
};

exports.start = function () {
    var theTask = this;

    return Q.when(theTask.schemas, function(schema){
        return schema[theTask.schemaId].call(theTask);
    })
};
