/*
 This notice must be untouched at all times.

 DreamFace Compiler
 Version: 2.1.8
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var stackOn = {};


exports.init = function ( o ) {

    (o.watch || []).forEach(function(e){
        o.channel.subscribe(e, print)
    });

    (o.stackOn || []).forEach(function(e){
        stackOn[e] = true;
    });

    delete exports.init;
};


function print ( event, message ) {

    console.log(message.colorString);

    if ( stackOn[message.level] ) console.log(message.stack);
}
