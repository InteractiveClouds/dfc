/*
 This notice must be untouched at all times.

 DreamFace Compiler
 Version: 2.1.8
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var getTime = require('./utils/gettime'),
    format  = require('./format');


var dir = __dirname.replace(/([()/\\.\[\]^$?|{}])/g, "\\$1"),
    cutThisLines = new RegExp( '[\\s\\S]+' + dir + '.+[\\n\\r]');


function Message ( o ) {
    this.level  = o.level;
    this.label  = o.label;
    this.time   = getTime();
    this.text   = o.text;
    this.appid  = o.appid;
    this.build  = o.build;
    this.number = o.number;
}

Message.fn = Message.prototype;

Message.fn.__defineGetter__('plainString', function () {
    return this._plainString ||
        ( this._plainString = format.plain(this) );
});

Message.fn.__defineGetter__('colorString', function () {
    return this._colorString ||
        ( this._colorString = format.color(this) );
});

Message.fn.__defineGetter__('stack', function () {
    return this.__stack ||
        ( this.__stack = new Error().stack.replace(cutThisLines, '') );
});

Message.fn.toString = function () {
    return this.text;
};


exports.Instance = Message;
