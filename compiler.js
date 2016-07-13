/*
 This notice must be untouched at all times.

 DreamFace Compiler
 Version: 2.1.8
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var Q           = require('q'),
    path        = require('path'),
    endpoints   = require('./endpoints'),
    cloud       = require('./cloud'),
    sockets     = require('./sockets'),
    Task        = require('./task').Instance,
    //Input       = require('./input').Instance,
    Target      = require('./target').Instance,
    jadeTempl   = require('./jadeTemplator'),
    FileStorage = require('./fileStorage').Instance,
    taskManager = require('./taskManager'),
    fStorage    = require('./utils/storage').Instance,
    schemas     = require('./schema'),
    _log        = new (require('./lib/utils/log')).Instance({label:'COMPILER'}),
    Log         = require('./lib/utils/log2').Instance;


exports.createTask = endpoints.json({
    parser : parseRequest,
    action : createTask,
    log    : _log
});


function parseRequest ( req, res ) {
    var o = {
        dfxServer : req.query.server,
        tenant    : req.query.tenant,
        appid     : req.query.appid,
        platform  : req.query.platform,
        build     : req.query.build,
        deployto  : req.query.deployto,
        schemaId  : req.query.schemaId
    };

    //console.log(o);

    return o;
}

function createTask ( o ) {

    var id = path.resolve(
            __dirname,
            CFG.target_dir,
            o.dfxServer,
            o.tenant,
            o.appid,
            o.schemaId,
            o.build
        ),
        baseTarget = new Target({
            basePath : id
        });

    return baseTarget.makeTree({
        output     : {},
        input      : {},
        tmp        : {},
        'log.txt'  : '',
        'log1.txt' : '',
        'log2.txt' : '',
    })
    .then(function(){

        var D = Q.defer();

        taskManager.addTask( new Task({
            type : 'schema',
            schemas : schemas,
            schemaId : o.schemaId,
            storage  : new FileStorage({path:path.join(id, 'tmp')}),
            basePath : id,
            //Input : Input,
            server : cloud[o.dfxServer],
            jadeTempl : jadeTempl,
            path   : path.join(id, 'output'),
            staticPath : CFG.dfx_path,
            info : {
                tenant   : o.tenant,
                appid    : o.appid,
                platform : o.platform,
                build    : o.build
            },
            //log : _log
            log : new Log({
                    wsocket : sockets.get(o.dfxServer, o.tenant),
                    wsocketEventName : 'update',
                    wsocketMissedName : 'missedLog',
                    appid  : o.appid,
                    build   : o.build,
                    path : path.join(id, 'log1.txt')
                }),

            statusLog : new Log({
                    wsocket : sockets.get(o.dfxServer, o.tenant),
                    wsocketEventName : 'status',
                    wsocketMissedName : 'missedStatus',
                    appid  : o.appid,
                    build   : o.build,
                    path : path.join(id, 'log2.txt')
                }),

            fStorage : new fStorage({
                path : path.join(id, 'tmp')
            })

        }) );

        setTimeout(function(){D.resolve('the task \'' + id + '\' is added')}, 5000);

        return D.promise;
    })
}
