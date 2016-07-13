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
    jade  = require('jade');


module.exports = function theSchema () {

    var task = this,
        promises = [];

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
        name  : 'widgets',
        uFld  : 'name',
        url   :'api/apps/getApplicationWidgets',
        query : {
            tenantid : task.root.info.tenant,
            appname  : task.root.info.appid,
            platform : task.root.info.platform
        }
    }));


    // ---------------------------------------------------------------

    promises.push(task.runSubTask({
        type : 'dir',
        name : '.',
        cont : [
            {
                type : 'dir',
                name : 'css',
                cont : [
                    {
                        type : 'dir',
                        name : task.root.info.platform,
                        cont : [
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
                        name : 'vendor',
                        cont : [
                            {
                                type : 'copy',
                                src : [
                                    'build/js/vendor'
                                ]
                            }
                        ]
                    },
                    {
                        type : 'dir',
                        name : 'commons',
                        cont : [
                            {
                                type : 'copy',
                                src : [
                                    'build/js/commons'
                                ]
                            }
                        ]
                    },
                ]
            },
            task.root.data.appitem.then(function(appitem){
                return {
                    type : 'dir',
                    name : 'semantic',
                    cont : [
                        {
                            type : 'copy',
                            src : [
                                'semantic'
                            ]
                        }
                    ]
                }
            }),
            {
                type : 'file',
                name : 'login.html',
                cont : task.root.data.appitem.then(function(appitem) {

                    return {
                        type : 'template',
                        templatePath : task.server.settings.templates[appitem.personalization.template].login,
                        templateData : {
                            appname:  appitem.name,
                            apptitle: appitem.title,
                            tenantid: task.root.info.tenant,
                            server:   task.server.getUrl()
                        }
                    }
                })
            }
        ]
    }));

    return Q.allSettled(promises);
}



// ---------------------------------------------------------------



var app_styles = '';

