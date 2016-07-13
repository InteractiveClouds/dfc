/*
 This notice must be untouched at all times.

 DreamFace Compiler
 Version: 2.1.8
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var Q = require('q');

function Constr ( o ) {
    this.url    = o.url;
    this.multi  = o.multi;
    this.server = o.server;
    this.query  = o.query;
    this.data   = this.server.get(this.url, this.query || {});
}

Constr.fn = Constr.prototype;

Constr.fn.forEachItem = function ( func ) {
    return Q.when(this.data, function ( data ) {
        var res = [];
        if ( data instanceof Array ) {
            data.forEach(function(item){
                res.push(func(item));
            })
        } else {
            res.push(func(data));
        }

        return Q.all(res);
    });
};

exports.Instance = Constr;
