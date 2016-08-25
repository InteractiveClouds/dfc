/*
 This notice must be untouched at all times.

 DreamFace Compiler
 Version: 2.1.8
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var log      = new (require('./lib/utils/log')).Instance({label:'SERVER'}),
    http     = require('http'),
    path     = require('path'),
    express  = require('express'),
    compiler = require('./compiler'),
    //gate    = require('./lib/auth').gate, /* gate.oAuthSimpleSigned */

    app = express();

    app.use( function(req, res, next){
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers",  'WWW-Authenticate, Authorization, Accept');
        res.setHeader("Access-Control-Expose-Headers", 'WWW-Authenticate, Authorization, Accept');
        res.setHeader('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
        
        next();
    });


module.exports.start = function () {

    delete module.exports.start;

    app.set('port', CFG.server_port);

    app.get('/compile', compiler.createTask );

    return http.createServer(app).listen(app.get('port'), CFG.server_host, function(){
        log.info('the server is listening port ' + CFG.server_port);

        if ( !CFG.notify_on_start.url ) return;

        const url = CFG.notify_on_start.url +
                '?servertype=dfc' +
                '&notifyid=' + CFG.notify_on_start.id

        log.info('sending startup notification to ', url);

        require('./lib/authRequest').getRequestInstance({}).get({
            url : url
        })
        .then(function(){
            log.ok('notifications sent');
        })
        .fail(function(error){
            log.fatal('could not notify after start. error : ', error);
        });
    });

    return server;
};
