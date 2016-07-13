/*
 This notice must be untouched at all times.

 DreamFace Compiler
 Version: 2.1.8
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var Q   = require('q');

exports.waitForEither = function ( servers ) {

    var D    = Q.defer(),
        proc = setTimeout(function(){ D.reject(
                'timeout expired to wait when servers ' +
                JSON.stringify(servers) +
                ' becomes online'
            ) }, CFG.maxTimeToWait),
        resolved = false;

    servers.forEach(function(server){

        server.becameOnline.then(function(){

            if ( resolved ) return;

            resolved = true;
            clearTimeout(proc);
            D.resolve(server);
        });
    });

    return D.promise;
}
