/*
 This notice must be untouched at all times.

 DreamFace Compiler
 Version: 2.1.8
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var log    = new (require('./lib/utils/log')).Instance({label:'ANSWER'});


exports.success = function ( res, data ) {
    if ( typeof data === 'object' ) {
        response = data;
        response.success = true;
    } else if ( typeof data === 'string' ) {
        response = {
            success : true,
            message : data
        }
    } else response = { success : true }

    log.ok( data || 'success answer with empty message');

    sendAnswer(res, response);
};

exports.fail = function ( res, data ) {
    var response = data instanceof AnswerError
            ? data
            : new AnswerError;

    log.error( data || 'failed answer with empty message' );

    sendAnswer(res, response);
};

exports.Error = AnswerError;


function sendAnswer ( res, response ) {

    //var response = xmlBuilder.buildObject(obj);

    var _response = JSON.stringify(response);

    res.set('Cache-Control', 'no-cache, no-store, max-age=0');
    res.set('Connection', 'close');
    res.setHeader( 'Content-Type', 'application/json; charset=utf-8' );
    res.header('Content-Length', _response.length);
    res.end(_response);
}

/**
 * @param {String|Object} o if String === o.message
 * @param {String} [o.message='Internal DFX error']
 * @param {String} [o.code] AppDirect error code
 */
function AnswerError ( o ) {

    if ( !(this instanceof AnswerError) ) return new AnswerError(o);

    if      ( !o )                      o = { message : 'Internal DFX error' };
    else if ( typeof o === 'string' )   o = { message : o };

    this.success   = 'false';

    if ( o.code )    this.errorCode = o.code;
    if ( o.message ) this.message   = o.message;

    log.warn('the AnswerError have been composed:\n' + JSON.stringify(this));
};
