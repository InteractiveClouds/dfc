/*
 This notice must be untouched at all times.

 DreamFace Compiler
 Version: 2.1.8
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var log = new (require('../../utils/log')).Instance({label:'GATES_INDEX'}),
    oauthSignature = require('oauth-signature');


exports.init = function ( o ) {

    delete exports.init;

    var out = {};

    var oAuthSimpleSigned = new (require('./default/oAuthSimpleSigned').Constructor)({
        oauthSignature : oauthSignature,
        oauth_consumer_secret : CFG.appDirectCredentials.consumer_secret
    });

    out.oAuthSimpleSigned = oAuthSimpleSigned.endpoint.bind(oAuthSimpleSigned);

    return out;
};
