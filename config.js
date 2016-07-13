module.exports = {

    server_host : 'localhost',
    server_port : 3100,

    target_dir : 'tasks',
    dfx_path   : '../dreamface',

    logging : {

        stdout   : {
            watch   : [ 'debug', 'info', 'ok', 'warn', 'error', 'fatal' ], // if ommited === watch for all
            stackOn : ['error', 'fatal'] // ERROR, FATAL is default (print stack trace for this ones)
        }
    },

    pingInterval : 5000,

    dfx_servers : []
}
