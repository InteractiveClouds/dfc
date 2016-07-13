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
    path = require('path'),

    lastId = 0;

function Constr ( o ) {
    this.path = o.path;
}

Constr.fn = Constr.prototype;

Constr.fn.put = function ( data ) {

    var that = this,
        fileName = ++lastId + '',
        id = new StorageId ({
                    id   : fileName,
                    path : path.join(that.path, fileName)
                });

    return typeof data !== 'string'
        ? Q.reject('can not put not a string')
        : QFS.write(id.path, data)
            .then(function(){ return id });
};

Constr.fn.get = function ( id ) {

    var that = this;

    return isValidId(id)
        ? QFS.read(path.join(that.path, id+''))
        : Q.reject('id "' + id + '" is not valid');
};

var RGXP_isValid = /^\d+$/;

function isValidId ( id ) {
    return RGXP_isValid.test(id);
}

function StorageId ( o ) {
    this.id = o.id;
    this.path = o.path;
}

StorageId.prototype.toString = function () { return this.id };

exports.Instance = Constr;
