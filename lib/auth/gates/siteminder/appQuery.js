/*
 This notice must be untouched at all times.

 DreamFace Compiler
 Version: 2.1.8
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var checkRights = require('../default/appQuery').checkRights,
    appGate  = require('./app');

function Constr ( o ) {
    appGate.Constructor.call(this, o);

    this.use(checkRights);
}

Constr.prototype = new appGate.Constructor({});


exports.Constructor = Constr;
