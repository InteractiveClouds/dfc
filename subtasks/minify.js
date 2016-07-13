/*
 This notice must be untouched at all times.

 DreamFace Compiler
 Version: 2.1.8
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */
var UglifyJS = require('uglify-js');
var CleanCSS = require('clean-css');
var fs = require('fs');
var Q = require('q');
var glob = require("glob");
var path = require("path");

exports.Constr = function ( o ) {
    this.descr = 'Minify resources files';
    this.rules = o.rules;
};

exports.start = function () {
        return compress(this.rules);
};

function compress (o) {
    if ((!Array.isArray(o)) || (!o[0])) return Q.reject("Invalid params");
    return Q.all(o.map(function (item) {
        return getFiles(item.src,item.ext)
            .then(function(files){
                return Q.all(files.map(function(file){
                    if (file.indexOf('.min.') < 0) {
                        var src = path.join(item.src, file);
                        var dest = path.join(item.dest, addMinPrefix(file,item.min_prefix) );
                        return (item.ext === 'js') ? minifyJS(src, dest) : minifyCSS(src, dest);
                    } else {
                        return Q(5);
                    }
                }));
            });
    }));

    function minifyCSS(src, dest) {
        var D = Q.defer();
        fs.readFile(src,function(err, data){
            if (err) {
                D.reject(err);
            } else {
                new CleanCSS().minify(data, function (err, result) {
                    if ((err) || (result.errors.length) || (result.warnings.length)) {
                        var message = err || result.errors[0] || result.warnings[0];
                        D.reject(message);
                    } else {
                        if ((result) && (result.styles)) {
                            fs.writeFile(dest, result.styles, function(err, data){
                                if (err) {
                                    D.reject(err);
                                } else {
                                    fs.unlinkSync(src);
                                    D.resolve(src + ' -> ' + dest);
                                }
                            });
                        } else {
                            D.reject("Unknown error during compress file " + src);
                        }
                    }
                });
            }
        })

        return D.promise;
    };

    function minifyJS(src, dest) {
        var D = Q.defer();
        var result = UglifyJS.minify(src, {
            mangle: true,
            compress: {
                sequences: true,
                dead_code: true,
                conditionals: true,
                booleans: true,
                unused: true,
                if_return: true,
                join_vars: true,
                drop_console: true
            }
        });

        fs.writeFile(dest, result.code, function(err, data){
            if (err) {
                D.reject(err);
            } else {
                fs.unlinkSync(src);
                D.resolve(src + ' -> ' + dest);
            }
        });
        return D.promise;
    };

    function addMinPrefix(a, prefix) {
        var temp = a.split('.');
        var ext = temp.pop();
        temp.push(prefix, ext);
        return temp.join('.');
    };

    function getFiles(dest, ext) {
        var D = Q.defer();
        glob("/*." + ext, { root : dest, nodir : 1, nomount : 1, realpath : 0 }, function (err, files) {
            if (err) {
                D.reject(err);
            } else {
                D.resolve(files);
            }
        });
        return D.promise;
    };
};
