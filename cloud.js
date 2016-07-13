/*
 This notice must be untouched at all times.

 DreamFace Compiler
 Version: 2.1.8
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var Q       = require('q'),
    URL     = require('url'),
    Request = require('./request'),
    log     = new (require('./lib/utils/log')).Instance({label:'CLOUD'}),
    utils   = require('./utils'),
    unzip = require('./unzip').decompress,
    path  = require('path'),
    http = require('http'),
    fs = require('fs'),

    out   = {},
    _s    = {},
    servers = CFG.servers || {};


module.exports.init = function () {

    delete module.exports.init;

    var tasks = [];

    var serversNames = Object.keys(servers),
        serversQuantity = serversNames.length;
    
    if ( !serversQuantity ) return Q.reject('no servers found in configuration file');
    
    log.info(
        'found ' + serversQuantity + ' server' + (serversQuantity > 1 ? 's' : '') +
        ' declaration' + (serversQuantity > 1 ? 's' : '')
    );
    
    var t;

    for ( var name in servers ) {
        _s[name] = new _Server(name, servers[name]);
        out[name] = new Server(name, servers[name]);

        tasks.push( _s[name].getServerInfo() );
    }


    return Q.allSettled(tasks).then(function(results){

        var uuid;

        function updateServerInfo ( name ) {
            uuid = _s[name].info['server-uuid'];

            _s[uuid] = _s[name];
            exports[uuid] = out[uuid] = out[name];

             _s[uuid].name = uuid;
            out[uuid].name = uuid;

            delete  _s[name];
            delete out[name];
        }

        for ( var name in out ) Q.when(
            out[name].becameOnline,
            updateServerInfo.bind(null, name)
        );
            
        return Q.resolve();
    })


};


function parseDFXAnswer ( json, serverName ) {

    if ( !json || !json.hasOwnProperty('result') ) {
        log.warn('wrong format of answer of DFX server "' + serverName + '"', json);
        return Q.reject();
    }

    if ( json.result === 'success' ) return json.data;

    log.warn('DFX server "' + serverName + '" answered "failed".', json.data);

    return Q.reject();
}

function setNewRequest () {

    var name = this.name;

    this.ar = new Request({
            authRequestParams : {
                schema                 : 'oAuthSimpleSigned',
                oauth_signature_method : 'HMAC-SHA1',
                oauth_version          : '1.0',
                credentials            : this.creds
            },
        
            statusCase : {
    
                400 : function ( res ) {
                    return parseDFXAnswer(res.body, name);
                },
    
                401 : function ( res ) {
                    log.warn('DFX server "' + name + '" answered "unauthorized"');
                    return Q.reject();
                },
        
                500 : function ( res ) {
                    log.warn('DFX server "' + name + '" answered "server error"');
                    return Q.reject( new ServerError() );
                },
    
                200 : function ( res ) {
                    return parseDFXAnswer(res.body, name);
                },
    
                '*' : function ( res ) {
                    log.warn(
                        'DFX server "' + name + '" error. '+
                        'Unknown HTTP status of response.', res
                    );
                    return Q.reject();
                }
            }
        });
}

function ServerError () {}


function _Server ( name, o ) {
    this.address   = o.address;
    this.parsedUrl = URL.parse(this.address);
    this.creds     = o.credentials;
    this.isOnline  = false;

    this.name = name;

    setNewRequest.call(this); // this.ar
}

_Server.prototype.caughtInactive = function () {

    var server = this;

    if ( server.pingProcess ) return;

    server.isOnline = false;
    server.tenants = [];
    server.D = Q.defer();

    log.warn('Server "' + server.name + '" is inactive. Ping is started.');

    server.pingProcess = setInterval(function(){

        var url = out[server.name].getUrl('api/tenant/list');

        if ( _s[server.name]._infoRequestSent ) return;

        _s[server.name]._infoRequestSent = true;
        _s[server.name].ar.get(url)
        .then(
            function(list){

                clearInterval(server.pingProcess);
                delete server.pingProcess;

                log.ok(
                    'Server "' + server.name + '" becames active. ' +
                    'Ping is stopped. Tenants : ' + JSON.stringify(list)
                );

                server.tenants = list;

                server.isOnline = true;
                server.D.resolve();
            },
            function ( error ) {
                _s[server.name]._infoRequestSent = false;
            }
        );
    }, CFG.pingInterval);
};


// TODO it returns old tenants list while the request is not done

_Server.prototype.refreshTenantsList = function () {
    var name = this.name;

    return out[name].get('/api/tenant/list').then(function(list){

        log.ok(
            'Server "' + name + '" is online. Tenants : ' +
            JSON.stringify(list)
        );
    
        _s[name].isOnline = true;
    
        _s[name].tenants = list;
    })
};

_Server.prototype.getServerInfo = function () {

    var that = this;

    return Q.all([
        out[that.name].get('/api/server/info').then(function(info){
            _s[that.name].info = info;
        }),
        out[that.name].get('/api/server/settings').then(function(settings){
            out[that.name].settings = settings;
        }),
        that.refreshTenantsList()
    ])
    .then(function(){
        var D = Q.defer();
            var options = {
                host: that.parsedUrl.hostname,
                port: that.parsedUrl.port,
                path: '/api/templates/getzip'
            };

            //TODO inside a temp dir
            var file = fs.createWriteStream('templates'+that.info['server-uuid']+'.zip');

            http.get(options, function(res) {
                res.on('data', function(data) {
                    file.write(data);
                }).on('end', function() {
                    file.end(function(){
                        var obj = {
                            path : 'templates'+that.info['server-uuid']+'.zip',
                            dest_path : path.join(__dirname, 'tmp', that.info['server-uuid'])
                        }
                        return unzip(obj).then(function(){
                            fs.unlinkSync('templates'+that.info['server-uuid']+'.zip');
                            D.resolve();
                        })
                    });
                }).on('error', function(e){
                    D.reject("Error: " + e);
                });
            });
        return D.promise;
    });
};

function Server ( name, o ) {
    this.name    = name;

    Object.defineProperty(this, 'isOnline', {
        get : function () { return _s[this.name].isOnline }
    });

    Object.defineProperty(this, 'becameOnline', {
        get : function () {

            var n = this.name;

            return _s[n].D instanceof Q.defer && Q.isPending(_s[n].D.promise)
                ? _s[n].D.promise
                : Q.resolve();
        }
    });

    Object.defineProperty(this, 'tenants', {
        get : function () { return _s[this.name].tenants || [] }
    });

    Object.defineProperty(this, 'consumer_key', {
        writeable : false,
        get : function () { return _s[this.name].creds.consumer_key; }
    });

    Object.defineProperty(this, 'consumer_secret', {
        writeable : false,
        get : function () { return _s[this.name].creds.consumer_secret; }
    });
}

/**
 * @param {String} relUrl relative url for particular server
 * @param {Object} [query=null] url-query
 */
Server.prototype.get = function ( relUrl, query ) {
    var serverName = this.name,
        server = _s[this.name],
        url = out[this.name].getUrl(relUrl, query);

    return server.ar.get(url).fail(function (error) {

        // -----------------------------------------------------\
        // TODO it is a crutch added cause of
        // infinite requests sending if there is an server error
        if ( error instanceof ServerError ) return Q.reject();
        // -----------------------------------------------------/

        if ( error && error.code ) server.caughtInactive();

        return utils.waitForEither([out[serverName]])
            .then(function(){out[serverName].get(relUrl, query)});
    });
};


Server.prototype.getUrl = function ( relUrl, query ) {

    var server = _s[this.name],
        url = URL.format({
            protocol : server.parsedUrl.protocol,
            //host     : server.parsedUrl.host,
            port     : server.parsedUrl.port,
            hostname : server.parsedUrl.hostname,
            query    : query,
            pathname : relUrl
        });

    return url;
};
