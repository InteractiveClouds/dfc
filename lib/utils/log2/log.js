/*
 This notice must be untouched at all times.

 DreamFace Compiler
 Version: 2.1.8
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var message = require('./message'),
    fs = require('fs'),
    format = require('./format'),
    path   = require('path'),
    getTime = require('./utils/gettime');


/**
 * @param {Object} o params
 */
function Log ( o ) {

    if ( !o.path ) throw('Path is required.');
    if ( !o.wsocket ) throw('Web socket is required.');

    this.wsocket = o.wsocket;
    this.wsocketEventName = o.wsocketEventName;
    this.wsocketMissedName = o.wsocketMissedName;
    this.appid = o.appid;
    this.build = o.build;
    this.quantity = 0;

    var that = this;

    this.wsocket
    .on('connection', function (socket) {
        socket.emit(that.wsocketMissedName, {
            log : that._storage
        });
    });

    this._path = o.path;

    this._storage = []; // TODO remove!

    createStream.call(this);
};

function createStream () {

    var theStream = this;

    this._isStreamReady = true,
    this._bin = '',
    this._fstream = fs.createWriteStream( this._path, {encoding: 'utf8'} );

    this._fstream.once('drain', function () {
        theStream._isStreamReady = true;
        writeToFileStream.call(theStream, theStream._bin);
        theStream._bin = '';
    });

    this._fstream.once('error', function (e) {
        console.log('[LOGGER_2 ERROR]: stream error.', e);
        // TODO recreate the stream
    });

    writeToFileStream.call(this, 'log created at ' + getTime() + '\n\n');

    if ( this._bin ) {
        writeToFileStream.call(this, this._bin);
        this._bin = '';
    }
}

Log.fn = Log.prototype;

Log.fn.debug = function () { return go.call(this, 'DEBUG', arguments) };
Log.fn.dbg   = function () { return go.call(this, 'DEBUG', arguments) };
Log.fn.info  = function () { return go.call(this, 'INFO ', arguments) };
Log.fn.ok    = function () { return go.call(this, 'OK   ', arguments) };
Log.fn.warn  = function () { return go.call(this, 'WARN ', arguments) };
Log.fn.error = function () { return go.call(this, 'ERROR', arguments) };
Log.fn.fatal = function () { return go.call(this, 'FATAL', arguments) };

Log.fn.finish = function () {
    this._fstream.end('');
    this.finished = true;
};


function go ( level, args ) {

    if ( this.finished ) {
        console.log(
            'attempt to write to closed log' +
            '\nLEVEL : ' + level +
            '\nARGS  : ' + JSON.stringify(args, null, 4)
        );
        return;
    }

    var that = this,
        text = formatText(args),
        m = new message.Instance({
            level : level,
            text  : text,
            appid : that.appid,
            build : that.build,
            number : ++that.quantity
        });

    this._storage.push(m);

    this.wsocket.emit(this.wsocketEventName, {
        message : m
    });

    print.call(this, m);

    return text;
}


function formatText ( args ) {
    return Array.prototype.reduce.call(args, function( p, c ) {
        var type = typeof c;
        return p +
            '\n    ' +
            (
                type === 'string' || type === 'number'
                    ? c
                    : Object.keys(c).length
                        ? JSON.stringify(c, null, 8).replace(/(.)$/, '    $1')
                        : c.toString()
            )
    }, '').replace(/^\n    /, '');
}


function print ( message ) {
    writeToFileStream.call(this, format.oneString.encode(message) + '\n');
}


function writeToFileStream ( data ) {

    if ( !this._isStreamReady ) this._bin += data;
    else this._isStreamReady = this._fstream.write(data);
}


exports.Instance = Log;
