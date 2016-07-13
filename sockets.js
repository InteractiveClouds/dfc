/*
 This notice must be untouched at all times.

 DreamFace Compiler
 Version: 2.1.8
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var cache = {},
    io;

var out = exports;

out.utils = {};

out.init = function ( o ) {
    delete out.init;

    // TODO check if composeID and server are valid

    out.utils.composeID = o.composeID;

    io = require('socket.io')(o.server);
};

out.get = function () {

    var id = this.utils.composeID.apply(null, arguments);

    return cache[id] || ( cache[id] = io.of(id) );
};
