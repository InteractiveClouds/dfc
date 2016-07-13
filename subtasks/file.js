/*
 This notice must be untouched at all times.

 DreamFace Compiler
 Version: 2.1.8
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var Q    = require('q'),
    QFS  = require('q-io/fs'),
    path = require('path');

exports.Constr = function ( o ) {
    if ( o.name !== '.' ) {
        this.path = path.join(this.path, o.name);
        this.createFie = true;
    }

    this.isFile = true;
    this.cont = o.cont;
    this.descr = (this.createFile ? 'creating' : 'filling' ) +
        ' file ' + this.path;
};

exports.start = function () {
    var theTask = this;

    return Q.when(
        theTask.createFile && QFS.write(theTask.path, ''),
        function () {

            var R = Q.defer(),
                globalRes = [],
                unresolved = 0;

            add(theTask.cont, globalRes )

            function add ( part, res ) {

                part = [].concat(part);

                for ( var i = 0, l = part.length; i < l; i++ ) (function(){
                    if ( typeof part[i] === 'string' ) {
                        part[i] = theTask.storage.put(part[i])
                        .then(function(id){
                            return {
                                type : 'append',
                                src  : id.path
                            }
                        });
                    } else if (
                            typeof part[i] === 'object' &&
                            part[i].type !== undefined &&
                            part[i].type !== 'append' &&
                            !part[i].isStarted
                        ) {
                            part[i] = theTask.runSubTask(part[i]);
                    }

                    if ( Q.isPromise(part[i]) ) {
                        unresolved++;
                        var _res = [];
                        res.push(_res);
                        part[i].then(
                            function(data){
                                unresolved--;
                                add(data, _res);
                            },
                            function(error){
                                unresolved--;
                                theTask.errors.push(error);
                                add([], _res);
                            }
                        )
                    } else {
                        res.push(part[i]) // TODO if not "append"
                    }
                })(i);

                if ( !unresolved ) {
                    //console.log('------------------- ' + theTask.path);
                    //console.log(JSON.stringify(globalRes, null, 4));
                    //console.log('-------------------');
                    startAppends( flatRes(globalRes) )
                    .then(
                        function(){
                            //console.log('resolved file');
                            R.resolve();
                        },
                        function(error){
                            //console.log('rejected file');
                            R.reject(error);
                        }
                    );
                }
            }

            function startAppends ( res ) {
                var D = Q(1);

                //console.log('=================== ' + theTask.path);
                //console.log(JSON.stringify(res, null, 4));
                //console.log('===================');

                res.forEach(function(task){

                    task = theTask.addSubTask(task);

                    D = Q.when(D, function(){
                        return task.start()
                    });
                });

                return D;
            }

            function flatRes ( res, flatten ) {
                flatten = flatten || [];
                res.forEach(function(e){
                    if ( e instanceof Array ) flatRes(e, flatten);
                    else flatten.push(e);
                });
                return flatten;
            }

            return R.promise;
        }
    )
};
