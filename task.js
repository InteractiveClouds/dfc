/*
 This notice must be untouched at all times.

 DreamFace Compiler
 Version: 2.1.8
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */
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
    path = require('path');

var types = require('./subtasks');
var zip = require('./zip');

function Constr ( o, parentTask ) {

    if ( !o.type || !types.hasOwnProperty(o.type) ) throw(
        'no appropriate task type was found for type "' + o.type + '"'
    );


    this.type      = o.type;
    this.isRoot    = !parentTask;
    this.root      = parentTask ? parentTask.root            : this;
    this.path      = parentTask ? parentTask.path            : o.path;
    this.schemas   = parentTask ? parentTask.schemas         : o.schemas;
    this.data      = parentTask ? parentTask.data            : o.data;
    this.jadeTempl = parentTask ? parentTask.jadeTempl       : o.jadeTempl;
    this.storage   = parentTask ? parentTask.storage         : o.storage;
    this.server    = parentTask ? parentTask.root.server     : o.server;
    this.log       = parentTask ? parentTask.root.log        : o.log;
    this.statusLog = parentTask ? parentTask.root.statusLog  : o.statusLog;
    this.basePath  = parentTask ? parentTask.root.basePath   : o.basePath;
    this.tasks     = parentTask ? parentTask.root.tasks      : [];
    this.errors    = parentTask ? parentTask.root.errors     : [];
    this.fStorage  = parentTask ? parentTask.root.fStorage   : o.fStorage;

    if ( parentTask ) {
        ++parentTask.root.tasksQnt;
    } else {
        this.tasksQnt = 1;
        this.staticPath = o.staticPath;
        this.info = o.info;
    }

    types[this.type].Constr.call(this, o);

    this.tasks.push(this);
}

Constr.fn = Constr.prototype;

Constr.fn.start = function () {
    var theTask = this;

    theTask.isStarted = true;

    return types[this.type].start.call(this)
    .then(function(data){

        if ( isArrayOfSettledPromises(data) ) {
            if ( !allResolved(data) ) return Q.reject();
        }

        theTask.log.ok(theTask.descr);
        console.log('OK  : ' + theTask.descr); // TODO remove

        return data;
    })
    .fail(function ( error ) {

        var message = !error
            ? ''
            : error instanceof Error
                ? error.stack
                : error;

        if ( theTask.warnLevel === 'warn' ) {
            theTask.log.warn(
                'DESCR: ' + theTask.descr + ',' +
                    (message ? ' WARN: ' + message : '')
            );
            console.log('WARN: ' + theTask.descr); // TODO remove

            return new TaskError({warnLevel:'warn'});
        } else {
            theTask.errors.push(theTask.log.error(
                'DESCR: ' + theTask.descr + ',' +
                    (message ? ' ERROR: ' + message : '')
            ));

            return new TaskError();
        }
    })
    .then(function( data ){

        theTask.tasks.splice( theTask.tasks.indexOf(theTask), 1 );

        console.log([
            'STATUS:',
            theTask.basePath,
            theTask.root.tasksQnt - theTask.tasks.length,
            'of',
            theTask.root.tasksQnt,
            'is done, errors',
            theTask.errors.length
        ].join('\t'), '\n');

        theTask.statusLog.info({
            done   : theTask.root.tasksQnt - theTask.tasks.length,
            total  : theTask.root.tasksQnt,
            errors : theTask.errors.length
        });

        if ( !theTask.tasks.length ) {

            if ( !theTask.isRoot ) console.log(
                '\n' +
                '-------- something is wrong with the task --------\n' +
                '    TASK  : ' + theTask.basePath + ',\n' +
                '    DESCR : ' + theTask.descr + '\n' +
                '--------------------------------------------------\n'
            );

            deploy( theTask );
        }

        return data instanceof TaskError && data.warnLevel !== 'warn'
            ? Q.reject()
            : Q.resolve(data);
    })
};

Constr.fn.addSubTask = function ( o ) {
    return new Constr( o, this);
};

Constr.fn.runSubTask = function ( o ) {
    var that = this;

    return !Q.isPromise(o)
        ? ( new Constr( o, this) ).start()
        : o.then(function(o){
            return ( new Constr( o, that) ).start();
        })
        .fail(function(error){
            that.errors.push(error)
        });
};

exports.Instance = Constr;

function deploy ( theTask ) {
    var DEPLOY_ENDPOINT = 'studio/deployment/compile',
        message;

    try { message = JSON.stringify(theTask.errors, null, 4) }
    catch (e) { message = theTask.errors }

    if ( theTask.errors.length ) console.log(
            'the task ' + theTask.basePath + ' done with errors:\n',
            message
        );
    else console.log('task is done ' + theTask.basePath);

   // Send zip to DFX server
    return zip.send({
        task : theTask.server.name,
        tenant : theTask.root.info.tenant,
        app : theTask.root.info.appid,
        build : theTask.root.info.build,
        platform :theTask.schemaId,
        pathToBuild : theTask.basePath,
        dfx_url : theTask.server.getUrl(DEPLOY_ENDPOINT)
    })
    .fail(function(error){
        theTask.log('ZIP_ERROR:' + error);
    });
}

var isArrayOfSettledPromises = (function(){

    var RGXP_fitsStateValues = /^(?:fulfilled|rejected)$/;

    return function ( a ) {
        if ( !(a instanceof Array) ) return false;
    
        for ( var i = 0, l = a.length; i < l; i++ ) {
            if (
                typeof a[i] !== 'object'      ||
                !a[i].hasOwnProperty('state') ||
                !RGXP_fitsStateValues.test(a[i].state)
            ) return false;
        }

        return true;
    }
})();

function allResolved ( a ) {
    for ( var i = 0, l = a.length; i < l; i++ ) {
        if ( a[i].state !== 'fulfilled' ) return false;
    }

    return true;
}

function TaskError (o) {
    o = o || {};
    this.warnLevel = o.warnLevel || 'error';
}
