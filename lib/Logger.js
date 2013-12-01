'use strict';

var bunyan = require('bunyan');

exports = module.exports = (function Logger(){
    return bunyan.createLogger({name:'NodeAPIMessage', streams:[
        {
            stream:process.stdout
        },
        {
            level:'error',
            path:'Error.log'
        }
    ]});
})();