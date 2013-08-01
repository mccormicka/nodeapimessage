'use strict';

module.exports.apiError = function apiError(mongoose, connection) {

    var APIError = require('./lib/error/NodeAPIError')(mongoose, connection);

    return function (err, req, res, next) {
        var error = validApiError(err);
        if (isAPIError(error)) {
            APIError.response(error.message, error.data, function (err, result) {
                if (err) {
                    next(err);
                    return;
                } else {
                    module.exports.handleAPIResult(res, result);
                }
            });
        } else {
            console.log('Error not handled by API ERRORS!!', err);
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

module.exports.apiMessage = function apiMessage(mongoose, connection) {

    var APIMessage = require('./lib/success/NodeAPIMessage')(mongoose, connection);

    return function (req, res, next) {
        var api = validAPIMessage(req.apiMessage);
        if (isAPIMessage(api)) {
            APIMessage.response(api.message, api.data, function (err, result) {
                if (err) {
                    next(err);
                    return;
                } else {
                    module.exports.handleAPIResult(res, result);
                }
            });
        } else {
            console.log('Message not handled by api message handler', api);
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

module.exports.handleAPIResult = function handleAPIResult(res, result) {
    res.status(result.status);
    res.format({
        html: function () {
            res.send(result);
        },
        json: function () {
            res.json(result);
        }
    });
};