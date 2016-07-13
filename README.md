# DFX compiler

## Instalation instructions

DreamFace Compiler is usually installed using the dreamface-generator. Typically, DreamFace Generator creates `app.js` and `package.json` for you with the relevant dependencies to use the compiler properly. The default port used by the compiler is `3100`.

[License: DreamFace Open License](http://interactive-clouds.com/dreamface_license.txt)

## Sample app.js
    // sample app.js

        var path = require('path');
        var compiler = require('dreamface-compiler');

        compiler.init({
            dfx_path: path.resolve(__dirname, '../dev/node_modules/dreamface'),

                dfx_servers : [
                    {
                        name : 'dfx',
                        cfg  : {
                            address : 'http://localhost:3000/',
                            credentials : {
                                consumer_key    : '',
                                consumer_secret : ''
                            }
                        }
                    }
                ]
            })
            .start();

## Authentication to the DreamFace server

In order to establish a secure connectivity between the compiler and one or more dreamface servers, you must set the `consumer_key` and `consumer_secret` of app.js corresponding to the settings found in each DreamFace server's `.auth.conf` file.
