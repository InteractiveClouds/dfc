/*
 This notice must be untouched at all times.

 DreamFace Compiler
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */
var DecompressZip = require('decompress-zip');
var Q = require('q');
var fs = require('fs');
var path  = require('path');
var fsUtil = require('mkdirp');

var decompress = function(o) {
    var D = Q.defer();
    fs.exists(o.path, function (exists) {
        if (exists) {
            var unzipper = new DecompressZip(o.path);
            unzipper.on('error', function (err) {
                // console.log(err);
                D.reject(err);
            });

            unzipper.on('extract', function (log) {
                D.resolve('Finished extracting files');
            });

            verifyPath(o.dest_path)
                .then(function(){
                    unzipper.extract({
                        path: o.dest_path,
                        filter: function (file) {
                            return file.type !== "SymbolicLink";
                        }
                    });
                })
                .fail(function(e){
                    D.reject(e);
                });
        } else {
            return D.resolve();
        }
    });

    return D.promise;
}

var verifyPath = function(p) {
    var D = Q.defer();
    fs.exists(p, function (exists) {
        if (!exists) {
            fsUtil.mkdirp(p, function(err){
                if (err) {
                    D.reject(err);
                } else {
                    D.resolve();
                }
            });
        } else {
            D.resolve();
        }
    });
    return D.promise;
}

module.exports = {
    decompress : decompress
}

