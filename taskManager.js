/*
 This notice must be untouched at all times.

 DreamFace Compiler
 Version: 2.1.8
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var tasks = {};

exports.addTask = function ( task ) {
    tasks[task.basePath] = task;

    // TODO logic of simultaneously tasks run

    tasks[task.basePath].start();
};
