/*
 This notice must be untouched at all times.

 DreamFace Compiler
 Version: 2.1.8
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var dict = {
    'dbg'   : 'DEBUG',
    'debug' : 'DEBUG',
    'DEBUG' : 'DEBUG',

    'error' : 'ERROR',
    'ERROR' : 'ERROR',

    'warn'  : 'WARN ',
    'WARN ' : 'WARN ',
    'WARN'  : 'WARN ',

    'info'  : 'INFO ',
    'INFO ' : 'INFO ',
    'INFO'  : 'INFO ',

    'fatal' : 'FATAL',
    'FATAL' : 'FATAL',

    'ok'    : 'OK   ',
    'OK'    : 'OK   ',
    'OK   ' : 'OK   '
};


exports.translate = function translate ( e ) {
    if ( !dict.hasOwnProperty(e) ) throw('LOGGER. Unknown level "' + e + '".');
    return dict[e];
}
