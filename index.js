'use strict';

var log = require('nodelogger').Logger(__filename);
var db;

//-------------------------------------------------------------------------
//
// Public API
//
//-------------------------------------------------------------------------

module.exports.Status = require('./lib/NodeAPIStatus');

module.exports.initialize = function initialize(database) {
    if (!database) {
        throw new Error('You must supply a database instance to work with NodeApiMessage');
    }
    db = database;
    module.exports.APIMessage = require('./lib/NodeAPIMessage')(database);
    return function (req, res, next) {

        res.apiMessage = function (status, message, data, options) {
            module.exports.sendApiResponse(this, status, message, data, options);
        };
        next();
    };
};

module.exports.apiMessageHandler = function (err, req, res, next) {
    if (!db) {
        throw new Error('You must initialize with a database instance to work with NodeApiMessage');
    }
    if (err) {
        log.error('Unhandled Server error!!!', req, res, err );
        module.exports.sendApiResponse(res, module.exports.Status.INTERNAL_SERVER_ERROR, 'Internal server error!');
    } else {
        next();
    }
};

module.exports.sendApiResponse = function sendApiResponse(res, status, message, data, options) {
    options = options;//Stop JSHint
    module.exports.APIMessage.response(status, message, data, function (err, result) {
        if(isErrorCode(status) || err){
            log.error(err|| result);
        }
        res.status(result.status);
        res.format({
            html: function () {
                res.send(result);
            },
            json: function () {
                res.json(result);
            }
        });
    });
};

//-------------------------------------------------------------------------
//
// Private Methods
//
//-------------------------------------------------------------------------

function isErrorCode(status) {
    return status >= 500;
}