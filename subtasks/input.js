/*
 This notice must be untouched at all times.

 DreamFace Compiler
 Version: 2.1.8
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var Q    = require('q'),
    fs   = require('fs'),
    http = require('http'),
    Uzip = require('decompress-zip'),
    path = require('path');

exports.Constr = function ( o ) {

    var theTask = this;

    this.name   = o.name;
    this.kind   = o.kind;
    this.url    = o.url;
    this.uFld   = o.uFld;
    this.query  = o.query || {};
    this.descr  = 'get input "' + o.name + '" from "' + o.url + '"';

    this.root.input = this.root.input || {};

    if ( this.root.input.hasOwnProperty(this.name) ) throw(
        'there is input "' + this.name + '" already'
    );

    this._list  = [];

    this._started = Q.defer();

    if ( this.kind === 'multi' ) {
        this._data = this._started.promise.then(getMultiInput);
        this.root.input[this.name] = new MultiInput(this);
    } else if ( this.kind === 'json' ) {
        this._data = this._started.promise.then(getJsonInput);
        this.root.input[this.name] = new JsonInput(this);
    } else if ( this.kind === 'zipdir' ) {

        this.pathToZip   = path.join(this.basePath, 'tmp',   this.name);
        this.pathToFiles = path.join(this.basePath, 'input', this.name);

        this._data = this._started.promise
                        .then(getZipInput)
                        .then(mkdir) // TODO mkdir + getZipInput Q.all?
                        .then(extractZip);

        this.root.input[this.name] = {
            getpath : function ( relPath ) {
                    return theTask._data.then(function(){
                        return path.join(theTask.pathToFiles, relPath)
                    })
                }
        };

    } else throw('the input\'s kind "' + this.kind + '" is not implemented');
};

function getJsonInput ( theTask ) {
    return theTask.server.get(theTask.url, theTask.query)
    .then(function(data){
        return theTask.fStorage.put(theTask.name, JSON.stringify(data));
    });
}

function getMultiInput ( theTask ) {
    return theTask.server.get(theTask.url, theTask.query)
    .then(function(a){
        var promises = [];
    
        a.forEach(function(e){
            var id = theTask.name + '_' + e[theTask.uFld];
            promises.push( theTask.fStorage.put(id, JSON.stringify(e)) );
            theTask._list.push(id)
        })
    
        return Q.all(promises);
    });
}

function getZipInput ( theTask ) {
    
    var _url = theTask.server.getUrl(theTask.url, theTask.query),
        file = fs.createWriteStream(theTask.pathToZip),
        D = Q.defer();
    
    http.get(_url, function(res){

        res
        .on('data', function(data) {
            file.write(data);
        })
        .on('end', function() {
            file.end();
            //D.resolve(theTask);
        })
        .on('error', function(error) {
            file.end();
            D.reject(error);
        });

        file.on('close', function() {
            D.resolve(theTask);// must be there, must wait for WriteStream to finish, not for Res...
        });
    })
    .on('error', function(error){
        D.reject(error);
    });

    return D.promise;
}

exports.start = function () {
    this._started.resolve(this);

    return this._data.then(function(){return 1;});
};

function JsonInput (theTask) {
    this._theTask = theTask;
}

JsonInput.prototype.get = function ( func ) {
    const theTask = this._theTask;
    return theTask._data.then(function(d){
        var res, parsedData;

        return theTask.fStorage.get(theTask.name)
        .then(function(string){
            try { parsedData = JSON.parse(string) }
            catch (e) {
                return Q.reject(
                    '[INPUT GET]: can not JSON.parse fStorage item "' +
                    id + '"' + (e && e.stack)
                );
            }

            try { res = func(parsedData) }
            catch (e) {
                return Q.reject(
                    '[INPUT GET]: handler throwed ' + (e && e.stack)
                );
            }

            return res;
        })
    });
};

function MultiInput (theTask) {
    this._theTask = theTask;
}

MultiInput.prototype.map = function ( func ) {
    var theTask = this._theTask;

    return theTask._data.then(function(d){
        var r = [];

        theTask._list.forEach(function(id){
            r.push(
                theTask.fStorage.get(id)
                .then(function(data){
                    var parsedData;

                    try {
                        parsedData = JSON.parse(data)
                    } catch (e) {
                        console.log(
                            '[INPUT MAP]: can not JSON.parse fStorage item "' +
                            id + '"' + (e && e.stack)
                        );
                        return Q.reject(
                            '[INPUT MAP]: can not JSON.parse fStorage item "' +
                            id + '"' + (e && e.stack)
                        )
                    }

                    try {
                        res = func(parsedData)
                    } catch (e) {
                        console.log(
                            '[INPUT MAP]: handler throwed ' + (e && e.stack)
                        );
                        return Q.reject(
                            '[INPUT MAP]: handler throwed ' + (e && e.stack)
                        );
                    }

                    return res;
                })
            );
        });

        return Q.all(r);
    })
};

function mkdir ( theTask ) {
    var D = Q.defer();

    fs.mkdir(theTask.pathToFiles, function(error){
        error
            ? D.reject(error)
            : D.resolve(theTask)
    });

    return D.promise;
}

function extractZip ( theTask ) {
    var D    = Q.defer(),
        uzip = new Uzip(theTask.pathToZip);

    uzip.on('error',   D.reject.bind(D) );

    uzip.on('extract', D.resolve.bind(D, theTask.pathToFiles));

    uzip.extract({
        path:   theTask.pathToFiles,
        filter: function (file) {
            return file.type !== "SymbolicLink";
        }
    });

    return D.promise;
}
