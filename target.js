/*
 This notice must be untouched at all times.

 DreamFace Compiler
 Version: 2.1.8
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var Q       = require('q'),
    QFS     = require('q-io/fs'),
    path    = require('path'),
    SubTask = require('./subtask').Instance,
    undefined;

function Constr ( o ) {
    this.basePath = o.basePath;
}

Constr.fn = Constr.prototype;

Constr.fn.makeTree = function ( tree ) {

    var that = this,
    currentPath = that.basePath;

    return QFS.exists(currentPath)
    .then(function(exists){

        return !exists
            ? QFS.makeTree(currentPath)
            : QFS.removeTree(currentPath)
                .then(function(){
                    return QFS.makeTree(currentPath)
                })
        
    })
    .then(function(){ return makeTree(tree, currentPath, that)});

};

Constr.fn.addToTree = function ( where, what ) {

    where.unshift(this.basePath);

    var that = this,
        _where = [].concat(where),
        fileName = typeof what === 'string'
            ? _where.pop()
            : undefined,
        pathToDir = path.join.apply(path, _where);

    return QFS.makeTree( pathToDir ).then(function(){
        if ( fileName ) {
            var pathToFile = path.join.apply(path, where);
            return QFS.exists(pathToFile).then(function(exists){
                if ( !exists ) {
                    return QFS.write( pathToFile, what );
                } else {
                    return QFS.isFile(pathToFile).then(function(is){
                        return is
                            ? QFS.append(pathToFile, what)
                            : Q.reject(pathToFile + ' is a directory, not a file');
                    })
                }
            })
        }
    });
};

function makeTree (tree, currentPath, that){

    var tasks = [],
        itemPath = '';

    for ( var item in tree ) {

        var itemPath = path.join(currentPath, item);

        if ( typeof tree[item] === 'object' ) {
            if ( tree[item] instanceof SubTask ) {
                tree[item].itemPath = itemPath;
                tasks.push( tree[item].start() );
            } else {
                if ( !Object.keys(tree[item]).length ) {
                    tasks.push(QFS.makeDirectory(itemPath));
                } else {
                    (function(tree, item, currentPath){
                        tasks.push(
                            QFS.makeDirectory(itemPath).then(function(){
                                return makeTree(
                                    tree[item],
                                    path.join(currentPath, item),
                                    that
                                );
                            })
                        );
                    })(tree, item, currentPath);
                }
            }
        } else if ( typeof tree[item] === 'string' ) {
            tasks.push(QFS.write(itemPath, tree[item]));
        } else return Q.reject(
            'Only strings and objects are allowed in makeTree param'
        );
    }

    return Q.all(tasks);
}

exports.Instance = Constr;
