module.exports = {

    server_host : 'localhost',
    server_port : 3100,

    target_dir : '', // For example 'tasks'
    tmp_dir : '', // For example 'tmp'
    dfx_path   : '../dreamface',

    logging : {

        stdout   : {
            watch   : [ 'debug', 'info', 'ok', 'warn', 'error', 'fatal' ], // if ommited === watch for all
            stackOn : ['error', 'fatal'] // ERROR, FATAL is default (print stack trace for this ones)
        }
    },

    pingInterval : 5000,

    notify_on_start : {
        url : '',
        id  : ''
    },

    dfx_servers : []
}
