/*
 This notice must be untouched at all times.

 DreamFace Compiler
 Version: 2.1.8
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var fs = require('fs');
var archiver = require('archiver');
var Q = require('q');
var request = require('request');
var FormData = require('form-data');
var path  = require('path');

var sendFile = function(o) {
    var D = Q.defer();
    var url = o.dfx_url;
    var filepath = path.join(__dirname, o.task + '.zip');
    var logFilePath = path.join(o.pathToBuild, 'log1.txt');
    var form = new FormData();
    var req = request.post(url, function (err, res1, res2) {
        if (err) {
            D.reject(err);
        } else {
            D.resolve(res2);
        }
    });
    var form = req.form();

    form.append('file', fs.createReadStream(filepath));
    form.append('logFile', fs.createReadStream(logFilePath));
    form.append('tenant',o.tenant);
    form.append('platform',o.platform);
    form.append('app',o.app);
    form.append('build', o.build);

    return D.promise;
}

var compress = function(o){
    var D = Q.defer();
    var zipArchive = archiver('zip');
    var inputFiles = path.join(o.pathToBuild, 'output');

    fs.readdir(inputFiles, function (err, files) {
        if (files.length > 0) {
            var outputPath = path.join(__dirname, o.task + '.zip');
            var output = fs.createWriteStream(outputPath);

            output.on('close', function() {
                sendFile(o)
                    .then(function(res){
                        D.resolve(res);
                    })
                    .fail(function(e){
                        console.log(e);
                        D.reject(e);
                    })
                    .done(function(){
                        fs.unlinkSync(outputPath);
                    });
            });

            zipArchive.pipe(output);

            zipArchive.bulk([
                { src: [ '**/*' ], cwd: inputFiles, expand: true }
            ]);

            zipArchive.finalize(function(err, bytes) {
                if(err) {
                    throw D.reject(err);
                }
            });
        } else {
            D.resolve();
        }
    });


    return D.promise;
}


module.exports.send = compress;






