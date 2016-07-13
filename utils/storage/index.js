/*
 This notice must be untouched at all times.

 DreamFace Compiler
 Version: 2.1.8
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var fs   = require('fs'),
    path = require('path'),
    Q    = require('q'),

    DATA_DIR_NAME = 'data';

exports.Instance = Storage;

function Storage ( o ) {

    var that = this,
        D    = Q.defer();

    this.path        = o.path;
    this._pathToData = path.join(this.path, DATA_DIR_NAME);
    this._isReady    = false;
    this.ready       = D.promise;
    this.size        = 0;

    init(this, function (error){

        if ( error ) return D.reject(error);

        that._isReady = true;
        D.resolve();
    });
}

Storage.fn = Storage.prototype;

Storage.fn._getFD = function ( id, flag, cb ) {
    fs.open( path.join(this._pathToData, id), flag, function (error, fd) {
        error ? cb(error) : cb(null, fd);
    });
};

Storage.fn._closeFD = function ( fd, cb ) {
    fs.close( fd, function (error) {
        cb(error || null);
    });
};

Storage.fn.put = function ( id, cnt ) {

    var that = this;

    if ( arguments.length < 2 ) {
        cnt = id;
        id = getUniqueId();
    }

    return this._isReady
        ? this._put(id, cnt)
        : Q.when(this.ready, function(){ return that._put(id, cnt) });
};

Storage.fn._put = function ( id, cnt ) {

    if ( this._list.hasOwnProperty(id) ) return Q.reject(
        'item "' + id + '" already exists'
    );

    var that = this,
        D = Q.defer();

    cnt = cnt.toString();

    this._getFD(id, 'w', function( error, fd ) {
        if ( error ) return D.reject(error);

        fs.write( fd, cnt, 0, 'utf-8', function(error_1, size){
            that._closeFD(fd, function(error_2){
                var error = error_1 || error_2;

                if ( error ) return D.reject(error);

                that.size += size;

                that._list[id] = { size : size };
                D.resolve(id);
            })
        });
    });

    return D.promise;
};

Storage.fn.get = function ( id ) {

    var that = this;

    return this._isReady
        ? this._get(id)
        : Q.when(this.ready, function(){ return that._get(id) });
};

Storage.fn._get = function ( id ) {

    if ( !this._list.hasOwnProperty(id) ) return Q.resolve('');

    var that = this,
        D = Q.defer();

    this._getFD(id, 'r', function( error, fd ) {
        if ( error ) return D.reject(error);

        fs.stat(path.join(that._pathToData, id), function(error, stat){

            if ( error ) return D.reject(error);

            var _size = that._list[id].size;
            var size = stat.size;

            if ( _size !== size ) console.log('----- [fStorage WARN]: stat size do not match stored size for "' + id + '"');

            if ( size === 0 ) return D.resolve('');

            fs.read( fd, new Buffer(size), 0, size, 0, function(error_1, bytesRead, buffer){
                that._closeFD(fd, function(error_2){
                    var error = error_1 || error_2;

                    if ( error ) return D.reject(error);

                    D.resolve(buffer.toString('utf-8'));
                })
            });
        });
    });

    return D.promise;
};

function init ( st, cb ) {
    lsStat( st.path, function(error, list){

        if ( !list ) return cb(new Error(
            'the path ' + st.path + ' does not exist'
        ));

        if ( list.length ) {

            if ( list.length > 1 ) return cb(new Error(
                'the storage path ' + st.path + ' is unclear'
            ));

            list = arrayToObject(list, 'name');
            if ( list instanceof Error ) return cb(list);

            if ( list[DATA_DIR_NAME] && list[DATA_DIR_NAME].isDirectory() ) {
                lsStat( st._pathToData, function(error, itemsList){
                    if ( error ) return cb(error);

                    var errors = [];

                    st._list = {};

                    itemsList.forEach(function(stat, i){

                        if ( !stat.isFile() ) {
                            errors.push(itemsList[i] + ' is not a file');
                            return;
                        }

                        st.size += stat.size;

                        st._list[stat.name] = {
                            size : stat.size
                        };
                    });


                    return errors.length
                        ? cb(new Error( errors.join('\n')))
                        : cb(null);
                });
            } else {
                return cb(new Error(
                    'the storage path ' + st.path + ' is unclear'
                ));
            }
        } else {
            fs.mkdir( st._pathToData, function(error){
                if ( error ) return cb(error);

                st._list = {};

                return cb(null);
            });
        }
    });
}

function arrayToObject ( array, id ) {
    var obj = {},
        item,
        l = array.length;

    for ( var i = 0; i < l; i++ ) {

        item = array[i];

        if ( id ) {
            if ( !item.hasOwnProperty(id) ) {
                obj = new Error('array item has no property "' + id + '"');
                break;
            }

            name = item[id];
        } else {
            name = item;
        }

        if ( obj.hasOwnProperty(name) ) {
            obj = new Error('property "' + ( id || name ) + '" is not unique');
            break;
        }

        obj[name] = id ? item : true;
    }

    return obj;
}

function ls ( p, cb ) {
    fs.readdir( p, function(error, list){
        error ? cb(error) : cb(null, list);
    });
}

function lsStat ( p, cb ) {
    fs.readdir( p, function(error, list){

        if ( error ) return cb(error);

        if ( !list.length ) return cb(null, []);

        var res = [],
            done = 0,
            total = list.length,
            failed = false;

        list.forEach(function(fn){
            fs.stat( path.join(p, fn), function (error, stat){

                if ( failed ) return;

                if ( error ) {
                    failed = true;
                    cb(error);
                }

                stat.name = fn;

                res.push(stat);

                if ( ++done === total ) cb(null, res);
            });
        });
    })
}

var getUniqueId = (function(){
    var lastId = 0;
    return function () { return '__fs.storage.' + ++lastId }
})();

//var s = new Storage({path:path.join(__dirname, 's')}),
//    o = { a : "Привет", b : 'Привіт', c : 'Hello' };
//
//s.put('f1', JSON.stringify(o))
//.then(function(){
//    return s.get('f1')
//})
//.then(function(d){
//    console.log(d);
//})
//.done();
