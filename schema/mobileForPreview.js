/*
 This notice must be untouched at all times.

 DreamFace Compiler
 Version: 2.1.8
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var Q     = require('q'),
    QFS   = require('q-io/fs'),
    path  = require('path'),
    URL   = require('url'),
    jade  = require('jade');
config = require('../config.js');

var MIN_PREFIX = 'min',
    PATH_TO_GEN_DEV_FILES = config.tmp_dir;


module.exports = function theSchema () {

    const
        task = this,
        promises = [],
        PATH_TO_DEV_FILES = path.join(PATH_TO_GEN_DEV_FILES, task.server.name);

    function renderView( definition ){
        var D = Q.defer();
        request({
            method : 'POST',
            uri: task.server.settings.EXTERNAL_URL + '/studio/view/render',
            json : {'view_source': JSON.parse(definition)}

        }, function (error, response, body) {
            if (error) {
                D.reject(error);
            } else {
                D.resolve(body);
            }
        })
        return D.promise;
    }

    task.root.data = {};

    promises[0] = task.root.data.appitem = task.server.get(
        'api/apps/get',
        {
            tenantid : task.root.info.tenant,
            appname  : task.root.info.appid,
            platform : task.root.info.platform
        }
    );

    promises.push(task.runSubTask({
        type  : 'input',
        kind  : 'multi',
        name  : 'applicationConfiguration',
        uFld  : '_id',
        url   : 'api/apps/getApplicationConfiguration',
        query : {
            tenantid : task.root.info.tenant,
            appname  : task.root.info.appid
        }
    }));

    promises.push(task.runSubTask({
        type  : 'input',
        kind  : 'json',
        name  : 'tenantInfo',
        url   : 'api/tenant/get',
        query : {
            tenantid : task.root.info.tenant
        }
    }));

    promises.push(task.runSubTask({
        type  : 'input',
        kind  : 'zipdir',
        name  : 'resources',
        url   : '/api/resourcesbunch/getzip',
        query : {
            tenantid : task.root.info.tenant,
            appname  : task.root.info.appid
        }
    }));

    promises.push(task.runSubTask({
        type  : 'input',
        kind  : 'multi',
        name  : 'queries',
        uFld  : '_id',
        url   : 'api/dataquery/getAll',
        query : {
            tenantid : task.root.info.tenant,
            appname  : task.root.info.appid
        }
    }));

    promises.push(task.runSubTask({
        type  : 'input',
        kind  : 'multi',
        name  : 'users',
        uFld  : '_id',
        url   : 'api/tenant/getUsers',
        query : {
            tenantid : task.root.info.tenant,
            application  : task.root.info.appid
        }
    }));

    promises.push(task.runSubTask({
        type  : 'input',
        kind  : 'multi',
        name  : 'roles',
        uFld  : '_id',
        url   : 'api/tenant/getRoles',
        query : {
            tenantid : task.root.info.tenant,
            application  : task.root.info.appid
        }
    }));

    promises.push(task.runSubTask({
        type  : 'input',
        kind  : 'multi',
        name  : 'userDefinition',
        uFld  : '_id',
        url   : 'api/tenant/getUserDefinition',
        query : {
            tenantid : task.root.info.tenant,
            application  : task.root.info.appid
        }
    }));

    promises.push(task.runSubTask({
        type  : 'input',
        kind  : 'multi',
        name  : 'authProviders',
        uFld  : '_id',
        url   : 'api/tenant/getAuthProviders',
        query : {
            tenantid : task.root.info.tenant,
            application  : task.root.info.appid
        }
    }));

    promises.push(task.runSubTask({
        type  : 'input',
        kind  : 'multi',
        name  : 'dbDrivers',
        uFld  : '_id',
        url   : 'api/tenant/getDbDrivers',
        query : {
            tenantid : task.root.info.tenant,
            application  : task.root.info.appid
        }
    }));

    promises.push(task.runSubTask({
        type  : 'input',
        kind  : 'multi',
        name  : 'appResourceItems',
        uFld  : '_id',
        url   : 'api/resources/getAppResourceItems',
        query : {
            tenantid : task.root.info.tenant,
            appname  : task.root.info.appid,
            platform : task.root.info.platform
        }
    }));

    promises.push(task.runSubTask({
        type  : 'input',
        kind  : 'multi',
        name  : 'widgets',
        uFld  : 'name',
        url   :'api/apps/getApplicationWidgets',
        query : {
            tenantid : task.root.info.tenant,
            appname  : task.root.info.appid,
            platform : 'mobile'
        }
    }));

    promises.push(task.runSubTask({
        type  : 'input',
        kind  : 'multi',
        name  : 'screens',
        uFld  : 'name',
        url   :'api/screens/getAll',
        query : {
            tenantid : task.root.info.tenant,
            appname  : task.root.info.appid,
            platform : 'mobile'
        }
    }));

    promises.push(task.runSubTask({
        type  : 'input',
        kind  : 'multi',
        name  : 'screensTemplates',
        uFld  : 'name',
        url   : 'api/screens_templates/getAll',
        query : {
            tenantid : task.root.info.tenant,
            appname  : task.root.info.appid
        }
    }));

    // --------------------------------------------------------------- files structure


    promises.push(task.runSubTask({
            type : 'dir',
            name : '.',
            cont : [
                {
                    type : 'dir',
                    name : 'app',
                    cont : [
                        {
                            type : 'dir',
                            name : 'fonts',
                            cont : [
                                {
                                    type : 'copy',
                                    isPathAbsolute : true,
                                    src : [
                                        path.join(
                                            PATH_TO_DEV_FILES,
                                            'build/fonts'
                                        )
                                    ]
                                }
                            ]
                        },
                        {
                            type : 'dir',
                            name : 'img',
                            cont : [
                                {
                                    type : 'copy',
                                    isPathAbsolute : true,
                                    src : [
                                        path.join(
                                            PATH_TO_DEV_FILES,
                                            'build/img'
                                        )
                                    ]
                                },
                                {
                                    type : 'copy',
                                    isPathAbsolute : true,
                                    src : [
                                        path.join(
                                            PATH_TO_DEV_FILES,
                                            'build/images'
                                        )
                                    ]
                                }
                            ]
                        },
                        {
                            type : 'dir',
                            name : 'css',
                            cont : [
                                {
                                    type : 'dir',
                                    name : task.root.info.platform,
                                    cont : [
                                        {
                                            type : 'copy',
                                            isPathAbsolute : true,
                                            src : [
                                                path.join(
                                                    PATH_TO_DEV_FILES,
                                                    'build/css/'
                                                )
                                            ]
                                        },
                                        {
                                            type : 'file',
                                            name : 'app.css',
                                            cont : [
                                                {
                                                    type : 'append',
                                                    cont : app_styles
                                                },

                                                task.root.input.widgets
                                                    .map(function(widget){

                                                        var wCss = widget.definition.src_styles;

                                                        return wCss
                                                            ?   {
                                                            type : 'append',
                                                            cont : wCss
                                                        }
                                                            : ''
                                                    })
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            type : 'dir',
                            name : 'js',
                            cont : [
                                {
                                    type : 'dir',
                                    name : task.root.info.platform,
                                    cont : [
                                        {
                                            type : 'copy',
                                            isPathAbsolute : true,
                                            src : [
                                                path.join(
                                                    PATH_TO_DEV_FILES,
                                                    'build/js/'
                                                )
                                            ]
                                        },
                                        {
                                            type : 'file',
                                            name : 'app.js',
                                            cont : [
                                                compileAppJs(task)
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            type : 'dir',
                            name : 'gcontrols',
                            cont : [
                                {
                                    type : 'dir',
                                    name : 'web',
                                    cont : [
                                        {
                                            type : 'copy',
                                            isPathAbsolute : true,
                                            src : [
                                                path.join(
                                                    PATH_TO_DEV_FILES,
                                                    'build/gcontrols/web'
                                                )
                                            ]}
                                        ]
                                }
                            ]
                        },
                        {
                            type : 'dir',
                            name : 'commons',
                            cont : [
                                {
                                    type : 'dir',
                                    name : 'views',
                                    cont : [
                                        {
                                            type : 'copy',
                                            isPathAbsolute : true,
                                            src : [
                                                path.join(
                                                    PATH_TO_DEV_FILES,
                                                    'build/commons/views'
                                                )
                                            ]}
                                    ]
                                }
                            ]
                        },
                        {
                            type : 'dir',
                            name : 'resources',
                            cont : [
                                // app resources
                                {
                                    type : 'dir',
                                    name : task.root.info.appid,
                                    cont : [
                                        {
                                            type : 'copy',
                                            isPathAbsolute : true,
                                            src  : task.input.resources.getpath(
                                                task.root.info.appid
                                            )
                                                .then(function(_path){ return [_path] })
                                        }
                                    ]
                                },
                                // shared resources
                                {
                                    type : 'dir',
                                    name : '_shared',
                                    cont : [
                                        {
                                            type : 'copy',
                                            isPathAbsolute : true,
                                            src  : task.input.resources.getpath('_shared')
                                                .then(function(_path){ return [_path] })
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            type : 'dir',
                            name : 'views',
                            cont : task.root.input.widgets.map(function(wdgt){
                                return {
                                    type : 'dir',
                                    name : wdgt.name,
                                    cont : renderView( wdgt.definition.src ).then(function(res){
                                        var tasks = Object.keys(res);
                                        tasks.push('json');
                                        return tasks.map(function(key){
                                            return (key != 'json') ?  {
                                                type : 'file',
                                                name : wdgt.name + '_' + key + '.html',
                                                cont : res[key]
                                            } : {
                                                type : 'file',
                                                name : wdgt.name + '.json',
                                                cont : JSON.stringify(wdgt.definition)
                                            }
                                        })
                                    })
                                }
                            })
                        },
                        {
                            type : 'dir',
                            name : 'pages',
                            cont : task.root.data.appitem.then(function(appitem){
                                return task.root.input.screens.map(function(screen){
                                    return {
                                        type : 'file',
                                        name : screen.name + '.json',
                                        cont : JSON.stringify(screen)
                                    }
                                })
                            })
                        },
                        {
                            type : 'dir',
                            name : 'templates',
                            cont : task.root.data.appitem.then(function(appitem){
                                return task.root.input.screensTemplates.map(function(screenTemplate){
                                    return {
                                        type : 'file',
                                        name : screenTemplate.name + '.json',
                                        cont : JSON.stringify(screenTemplate)
                                    }
                                })
                            })
                        },
                        {
                            type : 'file',
                            name : 'login.html',
                            cont : task.root.data.appitem.then(function(appitem) {
                                return appitem.templates.login_page_mobile.replace("dfx_server:","dfx_server_test:")
                            })
                        },
                        {
                            type : 'file',
                            name : 'index.html',
                            cont : task.root.data.appitem.then(function(appitem) {
                                return task.root.input.appResourceItems
                                    .map(function (resourceItem) {
                                        return resourceItem;
                                    })
                                    .then(function(arrayOfResourceItems){
                                        return task.root.input.tenantInfo.get(function(tenantInfo){
                                            var googleMapAPIKey;
                                            var loadGoogleMap = false;

                                            if (tenantInfo.googleAPIKey) {
                                                googleMapAPIKey = tenantInfo.googleAPIKey;
                                                loadGoogleMap = true;
                                            }

                                            arrayOfResourceItems.forEach(function(val, key) {
                                                if (val.path.indexOf('.min.') < 0) {
                                                    if ((val.type == 'CSS') || (val.type == 'JavaScript'))
                                                        arrayOfResourceItems[key].path =  addMinPrefix(val.path, MIN_PREFIX);
                                                }
                                            });

                                            function addMinPrefix(a, prefix) {
                                                var temp = a.split('.');
                                                var ext = temp.pop();
                                                temp.push(prefix, ext);
                                                return temp.join('.');
                                            }

                                            var templPath = path.resolve(
                                                PATH_TO_DEV_FILES,
                                                'templates',
                                                'Basic',
                                                'basic_index_mobile.jade'
                                            );

                                            return {
                                                type:         'template',
                                                templatePath: templPath,
                                                templateData: {
                                                    appname:   appitem.name,
                                                    apptitle:  appitem.title,
                                                    googleMapAPIKey: googleMapAPIKey,
                                                    loadGoogleMap: loadGoogleMap,
                                                    appowner:  appitem.ownerId,
                                                    tenantid:  task.root.info.tenant,
                                                    server:   URL.format({
                                                        protocol : 'http',
                                                        port     : task.server.settings.deployment_server_port,
                                                        hostname : task.server.settings.deployment_server_host
                                                    }),
                                                    resources: arrayOfResourceItems || []
                                                },
                                                templateOpts : {
                                                    filename : templPath
                                                }
                                            }
                                        });
                                    })
                            })
                        },
                        {
                            type : 'file',
                            name : 'page.html',
                            cont : task.root.data.appitem.then(function(appitem) {

                                var templPath = path.resolve(
                                    PATH_TO_DEV_FILES,
                                    'templates',
                                    'Basic',
                                    'page.jade'
                                );

                                return {
                                    type:         'template',
                                    templatePath: templPath,
                                    templateData: {
                                        appname:   appitem.name,
                                        apptitle:  appitem.title,
                                        appowner:  appitem.ownerId,
                                        tenantid:  task.root.info.tenant,
                                        server:   URL.format({
                                            protocol : 'http',
                                            port     : task.server.settings.deployment_server_port,
                                            hostname : task.server.settings.deployment_server_host
                                        })
                                    },
                                    templateOpts : {
                                        filename : templPath
                                    }
                                }
                            })
                        },
                        {
                            type : 'file',
                            name : 'config.xml',
                            cont : task.root.data.appitem.then(function(appitem) {

                                var templPath = path.resolve(
                                    PATH_TO_DEV_FILES,
                                    'templates',
                                    'Basic',
                                    'config.jade'
                                );

                                return {
                                    type:         'template',
                                    templatePath: templPath,
                                    templateData: {
                                        appname:   appitem.name,
                                        apptitle:  appitem.title,
                                        appowner:  appitem.ownerId,
                                        tenantid:  task.root.info.tenant,
                                        server:   URL.format({
                                            protocol : 'http',
                                            port     : task.server.settings.deployment_server_port,
                                            hostname : task.server.settings.deployment_server_host
                                        })
                                    },
                                    templateOpts : {
                                        filename : templPath
                                    }
                                }
                            })
                        }
                    ]
                },

                {
                    type : 'dir',
                    name : 'application_configuration',
                    cont : task.root.input.applicationConfiguration.map(function(applicationConfiguration){
                        return {
                            type : 'file',
                            name : applicationConfiguration._id,
                            cont : JSON.stringify(applicationConfiguration, null, 4)
                        }
                    })
                },

                {
                    type : 'dir',
                    name : 'dataqueries',
                    cont : task.root.input.queries.map(function(query){
                        return {
                            type : 'file',
                            name : query._id,
                            cont : JSON.stringify(query, null, 4)
                        }
                    })
                },

                {
                    type : 'dir',
                    name : 'users',
                    cont : task.root.input.users.map(function(user){
                        return {
                            type : 'file',
                            name : user._id,
                            cont : JSON.stringify(user, null, 4)
                        }
                    })
                },

                {
                    type : 'dir',
                    name : 'roles',
                    cont : task.root.input.roles.map(function(role){
                        return {
                            type : 'file',
                            name : role._id,
                            cont : JSON.stringify(role, null, 4)
                        }
                    })
                },

                {
                    type : 'dir',
                    name : 'metadata',
                    cont : task.root.input.userDefinition.map(function(userDefinition){
                        return {
                            type : 'file',
                            name : userDefinition._id,
                            cont : JSON.stringify(userDefinition, null, 4)
                        }
                    })
                },

                {
                    type : 'dir',
                    name : 'auth_providers',
                    cont : [
                        {
                            type : 'dir',
                            name : task.root.info.tenant,
                            cont : task.root.input.authProviders.map(function(provider){
                                return {
                                    type : 'file',
                                    name : provider._id,
                                    cont : JSON.stringify(provider, null, 4)
                                }
                            })
                        }
                    ]
                },

                {
                    type : 'dir',
                    name : 'db_drivers',
                    cont : [
                        {
                            type : 'dir',
                            name : task.root.info.tenant,
                            cont : task.root.input.dbDrivers.map(function(provider){
                                return {
                                    type : 'file',
                                    name : provider._id,
                                    cont : JSON.stringify(provider, null, 4)
                                }
                            })
                        }
                    ]
                },

                {
                    type : 'dir',
                    name : '.',
                    cont : [
                        {
                            type : 'file',
                            name : 'manifest.json',
                            cont : JSON.stringify({
                                tenantId : task.root.info.tenant,
                                appName  : task.root.info.appid,
                                platform : task.root.info.platform,
                                build    : task.root.info.build
                            }, null, 4)
                        }
                    ]
                }
            ]
        })
            .then(function(){
                return  task.runSubTask({
                    type : 'minify',
                    rules : [
                        {
                            src: path.join(task.root.path, 'app', 'resources', task.root.info.appid, 'javascript'),
                            dest: path.join(task.root.path, 'app', 'resources', task.root.info.appid, 'javascript'),
                            ext : 'js',
                            min_prefix : MIN_PREFIX
                        },
                        {
                            src: path.join(task.root.path, 'app', 'resources', '_shared', 'javascript'),
                            dest: path.join(task.root.path, 'app', 'resources', '_shared', 'javascript'),
                            ext : 'js',
                            min_prefix : MIN_PREFIX
                        },
                        {
                            src: path.join(task.root.path, 'app', 'resources', task.root.info.appid, 'stylesheets'),
                            dest: path.join(task.root.path, 'app', 'resources', task.root.info.appid, 'stylesheets'),
                            ext : 'css',
                            min_prefix : MIN_PREFIX
                        },
                        {
                            src: path.join(task.root.path, 'app', 'resources', '_shared', 'stylesheets'),
                            dest: path.join(task.root.path, 'app', 'resources', '_shared', 'stylesheets'),
                            ext : 'css',
                            min_prefix : MIN_PREFIX
                        }
                    ]
                });
            })
            .then(function(){
                return  task.runSubTask({
                    type : 'replace',
                    rules : [
                        {
                            path : path.join(task.root.path, 'app','views'),
                            find : "/assets/",
                            replace : "resources/" + task.root.info.appid + "/assets/"
                        },
                        {
                            path : path.join(task.root.path, 'app','js','mobile','runtime_mobile'),
                            find : "/gcontrols/",
                            replace : "gcontrols/"
                        },
                    ]
                });
            })
    );

    return Q.allSettled(promises);
}



// ---------------------------------------------------------------



var app_styles = '';

function compileAppJs ( task ) {

    var appname = task.root.info.appid,
        TAB = '\t',
        CR = '\r\n',
        wScripts = '',
        wTemplts = '',
        wNames = [],
        pScripts = '',
        angularServices = '',
        mobile_push_listener = '',
        platform = task.root.info.platform,
		js_file_content = '/* Application Scripts */\r\n\r\n',
        aScript  = 'var ' + appname + ' = angular.module(\'' + appname + '\', [ \'ngRoute\', \'dfxAppRuntime\', \'dfxAppServices\', \'dfxGControls\', ';

		var promise = task.root.input.widgets.map(function(wdgt){

			wScripts += CR +
	            '/* View Controller: ' + wdgt.name + ' */' +
	            CR + CR + wdgt.definition.src_script + CR + CR;

	        wTemplts += '$scope.widget_template_' +
	        wdgt.name + ' = \'widgets/' +
	        wdgt.name + '.html\';';

	        wNames.push('\'' + wdgt.name + '\'');

	        /* Push all included modules here */

	        wNames.push('\'dfxGCC\'');
	    });

	    var promise_screens = task.root.input.screens.map(function(scr){
			pScripts +=  CR + '/* Screen Controller: ' + scr.name + ' */' + CR +
				CR + scr.script + CR + CR;
	    });

	    var promise_queries = task.root.input.queries.map(function(query){
	        if (query.service.name != '') {
	            var service_definition = 'dfxAppServices.factory(\'' + query.service.name + '\', [ \'dfxApiRoutes\', function(dfxApiRoutes) {' + CR;
	            service_definition += TAB + 'var ' + query.service.name + '_definition = {};' + CR + CR;
	            for (var route in query.apiRoutes) {
	                var method_name = query.apiRoutes[route].service.method;
	                if (method_name != '') {
	                    var method_definition = TAB + query.service.name + '_definition.' + method_name + ' = function(scope, req_data, callback) {' + CR;
	                    if (query.apiRoutes[route].settings.typerequest == 'HTTP_GET') {
	                        method_definition += TAB + TAB + 'dfxApiRoutes.get( scope, \'' + route + '\', req_data, callback );' + CR;
	                    } else {
	                        method_definition += TAB + TAB + 'dfxApiRoutes.post( scope, \'' + route + '\', req_data, callback );' + CR;
	                    }
	                    method_definition += TAB + '};' + CR + CR;
	                    service_definition += method_definition;
	                }
	            }
	            service_definition += CR + TAB + 'return ' + query.service.name + '_definition;' + CR + CR;
	            service_definition += '}]);' + CR + CR;
	            angularServices += service_definition;
	        }
	    });

	    return Q.all([promise, promise_screens, promise_queries]).then( function(){

			js_file_content += 'var dfxAppRuntimeModules = [';
	        js_file_content += wNames.join(', ') + ', \'dfxAppPages\'];' + CR + CR;
			js_file_content += 'var dfxAppPages = angular.module(\'dfxAppPages\', [\'dfxAppServices\']);' + CR + CR;

			js_file_content += pScripts;
			js_file_content += wScripts;

	        return js_file_content;
	    });
}

function deployServices(dataqueries, appname) {
    var i, j, k, is_new, app_services_content='/* Comprehensive Service Models */\r\n\r\n';
    var app_services_array = new Array();
    for (i=0; i<dataqueries.length; i++) {
        if (dataqueries[i].service!=null && dataqueries[i].service.method!='') {
            is_new = true;
            for (j=0; j<app_services_array.length; j++) {
                if (dataqueries[i].service.name==app_services_array[j].serviceName) {
                    app_services_array[j].methods.push({ "name": dataqueries[i].service.method, "dataquery": dataqueries[i] });
                    is_new=false;
                    break;
                }
            }
            if (is_new) {
                app_services_array.push( {"serviceName": dataqueries[i].service.name,
                    "methods": [ { "name": dataqueries[i].service.method, "dataquery": dataqueries[i] } ] });
            }
        }
    }
    for (i=0; i<app_services_array.length; i++) {
        app_services_content += appname +
        ".service('" + app_services_array[i].serviceName + "', function() {\r\n";
        //"\tthis.parameters = new Object();\r\n";
        //for (j=0; j<app_services_array[i].parameters.length; j++) {
        //    app_services_content += "\tthis.parameters." + dataqueries[i].parameters[j].name + " = '';\r\n";
        //}
        for (j = 0; j < app_services_array[i].methods.length; j++) {
            app_services_content += "\tthis." + app_services_array[i].methods[j].name + " = function(params, callback) {\r\n\r\n";

            app_services_content +=
                "\t\tvar dq = new DataQuery('" + app_services_array[i].methods[j].dataquery.name + "');\r\n";

            if (app_services_array[i].methods[j].dataquery.connector == 'http' && app_services_array[i].methods[j].dataquery.settings.typerequest == 'HTTP_GET') {
                app_services_content += "\t\tif (params!=null) {\r\n" +
                "\t\t\tdq.setParameters( params );\r\n" +
                "\t\t}\r\n" +
                "\t\tdq.execute().\r\n" +
                "\t\t\tdone( function() {\r\n" +
                "\t\t\t\tcallback(dq.getData());\r\n" +
                "\t\t\t});\r\n" +
                "\t};\r\n\r\n";
            } else {
                app_services_content += "\t\tif (params!=null) {\r\n" +
                "\t\t\tdq.setReqBody( params );\r\n" +
                "\t\t}\r\n" +
                "\t\tdq.executePost().\r\n" +
                "\t\t\tdone( function() {\r\n" +
                "\t\t\t\tcallback(dq.getData());\r\n" +
                "\t\t\t});\r\n" +
                "\t};\r\n\r\n";
            }

            app_services_content += "\tthis." + app_services_array[i].methods[j].name + "Parameters = function() {\r\n" +
            "\t\tvar parameters = new Object();\r\n";
            for (k = 0; k < app_services_array[i].methods[j].dataquery.parameters.length; k++) {
                app_services_content += "\t\tthis.parameters." + app_services_array[i].methods[j].dataquery.parameters[k].name + " = '';\r\n";
            }
            app_services_content += "\t\treturn parameters;\r\n" +
            "\t}\r\n\r\n";

            app_services_content += "\tthis." + app_services_array[i].methods[j].name + "MetaData = function() {\r\n" +
            "\t\tvar metadata = " + app_services_array[i].methods[j].dataquery.metadata + ";\r\n" +
            "\t\treturn metadata;\r\n" +
            "\t}\r\n\r\n";
        }
        app_services_content += "});\r\n\r\n";
    }
    return app_services_content;
};



function deployScreen ( o ) {

    var D               = Q.defer(),
        appname         = o.appitem.name,
        directives      = o.appitem.directives,
        platform        = o.appitem.platform,
        template        = o.templName,
        app_widgets_map = o.wdgtsMap,
        screen          = o.screen,
        server          = o.server;

    generate(
        appname,
        directives,
        platform,
        screen,
        template,
        app_widgets_map,
        URL.format({
            protocol : 'http',
            port     : server.settings.deployment_server_port,
            hostname : server.settings.deployment_server_host
        }),
        o.tenantid,
        server,
        function (err, templateTask) {
            err
                ? D.reject(err)
                : D.resolve(templateTask);
        }
    );

    return D.promise;
}

function generate (appname, directives, platform, screen_item, template, app_widgets_map, serverUrl, tenantid, server, callback) {

    var arrayOfWidgets = getScreenWidgetsAsArray(screen_item, false);

    loadWidgetClassesFromMemory(arrayOfWidgets, app_widgets_map);

    //var template_name = template == null
    //    ?  'templates/standard_web.jade'
    //    : server.settings.templates[template].screen;

    callback(null, {
        type : 'template',
        descr : 'compiling screen "' +
        screen_item.name + '"',
        templatePath : template,
        templateData : {
            "server":      serverUrl,
            "tenantid":    tenantid,
            "appname":     appname,
            "directives":  directives,
            apptitle:      screen_item.application,
            screen:        screen_item,
            wclasses:      arrayOfWidgets,
            jade_compiler: jade
        },
        templateOpts : {
            filename : template
        }
    })
};

function getScreenWidgetsAsArray(screen_item, only_names) {
    var i = 0,
        j = 0,
        k = 0,
        arrayOfWidgets = [];
    for (i = 0; i < screen_item.layout.rows.length; i++) {
        var row = screen_item.layout.rows[i];
        for (j = 0; j < row.columns.length; j++) {
            var col = row.columns[j];
            for (k = 0; k < col.widgets.length; k++) {
                if (only_names) {
                    arrayOfWidgets.push(col.widgets[k].name);
                } else {
                    arrayOfWidgets.push(col.widgets[k]);
                }
            }
        }
    }
    return arrayOfWidgets;
}

function loadWidgetClassesFromMemory (arr_widgets, app_widgets_map) {
    for (var i = 0; i < arr_widgets.length; i++) {
        arr_widgets[i].definition = app_widgets_map[arr_widgets[i].name];
    }
};
