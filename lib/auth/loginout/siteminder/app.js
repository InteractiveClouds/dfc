/*
 This notice must be untouched at all times.

 DreamFace Compiler
 Version: 2.1.8
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var defaultApp = require('../default/app'),
    SETTINGS   = require('../../../dfx_settings');

function Constr ( o ) {
    defaultApp.Constructor.call(this, o);
}

Constr.fn = Constr.prototype = Object.create(defaultApp.Constructor.prototype);


Constr.fn.parse = function (req, success, fail, pocket, res) {

    pocket.tenantid = req.body.tenantid;
    pocket.userid   = req.header(SETTINGS.authSiteminderHeaderName);
    pocket.appid    = req.body.appid;

    success();
};


exports.Constructor = Constr;
