/*
 This notice must be untouched at all times.

 DreamFace Compiler
 Version: 2.1.8
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */
var fs = require('fs');
global.CFG = require('./config');

var out = module.exports = {},
    started = false,
    localSettings;

out.init = function ( _localSettings ) {
    localSettings = _localSettings;

    return out;
};

out.start = function () {
    if ( started ) throw('compiler are started already');
    else started = true;

    if ( localSettings ) overwriteSettings(CFG, localSettings);

    CFG.servers = formatServers(CFG.dfx_servers);

    delete CFG.dfx_servers;

    var _Log      = require('./lib/utils/log'),
        Log       = require('./lib/utils/log2').Instance,
        path      = require('path'),
        cloud     = require('./cloud'),
        sockets   = require('./sockets'),
        theServer = require('./theServer');

        _Log.init.stdout(CFG.logging.stdout);

    if (!CFG.target_dir)  throw('You must set target_dir in config!');
    if (!CFG.tmp_dir)  throw('You must set tmp_dir in config!');

    cloud.init()
    .then(theServer.start)
    .then(function(server){
        sockets.init({
            server    : server,
            composeID : function ( serverid, tenantid ) {
                return serverid + '_' + tenantid;
            }
        })
    })
    .done();
}

/**
 * deep overwrite a with params of b
 * BUT arrays will be overwritten wholly
 *
 * @param {Object} a object to overwrite
 * @param {Object} b with params of the object a will be overwritten
 */
function overwriteSettings ( a, b, path ) {

    path = path || [];

    for ( var param in b ) {

        if ( !a.hasOwnProperty(param) ) {
            console.log(
                'WARN   : Unknown parameter ' +
                path.concat(param).join('.') +
                ' is added to SETTINGS.'
            );

            a[param] = b[param];

            continue;
        }

        if ( typeof b[param] !== 'object' || b[param] instanceof Array ) {
            a[param] = b[param];
        } else {
            overwriteSettings(a[param], b[param], path.concat(param));
        }
    }
}

function formatServers ( servers ) {

    if ( !servers || !(servers instanceof Array) || !servers.length ) throw(
        'no DFX servers is set'
    );

    var _servers = {};

    for ( var i = 0, l = servers.length; i < l; i++ ) {

        var currentServer = servers[i];

        if ( !currentServer.name ) throw(
            'no server name was found in settings for server ' + i
        );

        if ( _servers.hasOwnProperty(currentServer.name) ) throw(
            'duplicate server name "' + currentServer.name + '"'
        );

        if ( !currentServer.cfg ) throw(
            'no cfg for the server "' + currentServer.name + '" was found'
        );

        if ( !currentServer.cfg.address ) throw(
            'no address for the server "' + currentServer.name + '" was found'
        );

        if ( !currentServer.cfg.auth_conf_path ) throw(
            'no auth_conf_path for the server "' + currentServer.name + '" was found'
        );

        // Require .auth.conf for current server
        if (fs.existsSync(currentServer.cfg.auth_conf_path)) {
            var authConf = require(currentServer.cfg.auth_conf_path);
        } else { throw(
                'no auth_conf_path with path - "' + currentServer.cfg.auth_conf_path + '" for the server "' + currentServer.name + '" was found'
            );
        }

        if ( !authConf.externalGate ) throw(
        'no externalGate for the server "' + currentServer.name + '" was found'
        );

        if ( !authConf.externalGate.consumer_key ) throw(
            'no externalGate.consumer_key for the server "' + currentServer.name + '" was found'
        );

        if ( !authConf.externalGate.consumer_secret ) throw(
            'no externalGate.consumer_secret for the server "' + currentServer.name + '" was found'
        );

        currentServer.cfg.credentials = {consumer_key : authConf.externalGate.consumer_key};
        currentServer.cfg.credentials = {consumer_secret : authConf.externalGate.consumer_secret};

        _servers[currentServer.name] = currentServer.cfg;
    }

    return _servers;
}

if ( !module.parent ) out.start();
