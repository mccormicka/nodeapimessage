'use strict';

module.exports.Status = require('./lib/NodeAPIStatus');
/**
 * You must initialize the APIMessages above any route calls.
 * app.use(apiMessage.initialize());
 * @returns {Function}
 */
module.exports.initialize = function initialize() {
    var log = require('nodelogger')('APIMessage');
    return function (req, res, next) {
        req.apiMessage = function (message, data, next) {
            if(typeof next !== 'function'){
                log.error('-------------------------------------------------------------------');
                log.error('::: YOU MUST PASS A FUNCTION AS THE LAST ARGUMENT TO APIMESSAGE :::');
                log.error('-------------------------------------------------------------------');
            }
            if (module.exports.isAPIError(message)) {
                next({message: message, data: data});
                return;
            } else if (module.exports.isAPIMessage(message)) {
                req._apiMessage = {message: message, data: data};
            }
            next();
        };
        next();
    };
};

/**
 * Is passed in message an api error message?
 * @param api
 * @returns {*|boolean}
 */
module.exports.isAPIError = function (api) {
    return api && api.indexOf('api.error.') !== -1;
};

/**
 * Is the passed in message an api message?
 * @param api
 * @returns {*|boolean}
 */
module.exports.isAPIMessage = function (api) {
    return api && api.indexOf('api.success.') !== -1;
};

/**
 * Handles APIMessages you should initialize this method in
 * your application after your router and before any error handlers.
 * You need to pass in an instance of Mongoose as well as the connection
 * you will be using for messages.
 * app.use(apiMessage.apiMessage(mongoose, connection);
 * @param mongoose
 * @param connection
 * @returns {Function}
 */
module.exports.apiMessage = function apiMessage(mongoose, connection) {
    var log = require('nodelogger')('APIMessage');
    var APIMessage = require('./lib/success/NodeAPIMessage')(mongoose, connection);
    return function (req, res, next) {
        var api = validAPIMessage(req._apiMessage);
        if (isAPIMessage(api)) {
            APIMessage.response(api.message, api.data, function (err, result) {
                if (err) {
                    next(err);
                    return;
                } else {
                    log.debug(result);
                    module.exports.handleAPIResult(res, result);
                }
            });
        } else {
            next();
        }
    };

    //-------------------------------------------------------------------------
    //
    // Private Methods
    //
    //-------------------------------------------------------------------------

    function validAPIMessage(message) {
        if (typeof message === 'string') {
            message = {message: message};
        }
        return message;
    }

    function isAPIMessage(api) {
        return api && api.message && api.message.indexOf('api.success') !== -1;
    }
};

/**
 * Handles APIErrors you should initialize this method in
 * your application after your router and after any message handlers.
 * You need to pass in an instance of Mongoose as well as the connection
 * you will be using for messages.
 * app.use(apiMessage.apiMessage(mongoose, connection);
 * @param mongoose
 * @param connection
 * @returns {Function}
 */
module.exports.apiError = function apiError(mongoose, connection) {

    var log = require('nodelogger')('APIError');
    var APIError = require('./lib/error/NodeAPIError')(mongoose, connection);

    return function (err, req, res, next) {
        var error = validApiError(err);
        if (isAPIError(error)) {
            APIError.response(error.message, error.data, function (err, result) {
                if (err) {
                    next(err);
                    return;
                } else {
                    log.error(result);
                    module.exports.handleAPIResult(res, result);
                }
            });
        } else {
            log.error('Error not handled by API ERRORS!!', err);
            next(err);
        }
    };

    //-------------------------------------------------------------------------
    //
    // Private Methods
    //
    //-------------------------------------------------------------------------

    function validApiError(err) {
        if (typeof err === 'string') {
            err = {message: err};
        }
        return err;
    }

    function isAPIError(err) {
        return err.message && err.message.indexOf('api.error') !== -1;
    }
};

/**
 * Handles the api response.
 * @param res
 * @param result
 * @private
 */
module.exports.handleAPIResult = function handleAPIResult(res, result) {
    res.status(result.status);
    if (result.key === 'api.success.render') {
        res.render(
            typeof result.data === 'string' ? result.data :
            result.data.page, result.data.data);
    } else {
        res.format({
            html: function () {
                res.html(result);
            },
            json: function () {
                res.json(result);
            }
        });
    }
};