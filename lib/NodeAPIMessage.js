'use strict';

module.exports = function NodeAPIError(connection) {
    var db = connection;
    var TYPE = 'apimessage';
    var log = require('nodelogger').Logger(__filename);

    try {
        return connection.model(TYPE);
    } catch (e) {
        var schema = connection.model('____' + TYPE + '____', {}).schema;
        schema.add({
            type: {type: String, 'default': TYPE},
            href: String,
            status: Number,
            code: Number,
            message: String,
            data: {}
        });

        /**
         * Expose type to outside world.
         * @type {string}
         */
        schema.statics.TYPE = TYPE;

        schema.statics.response = function (status, message, data, done) {
            var api = this;

            api.findOne({status:status, message:message}, function (err, value) {
                if (err || !value) {
                    api.count({}, function(err, count){
                        var code = status + padDigits(count, 4);
                        var href = '/' + TYPE + 's/' + code;
                        api.create({
                            code: code,
                            status: status,
                            message: message,
                            href: href
                        }, function (err, result) {
                            if (err) {
                                log.error('Error creating Message ', err, status, message, data);
                                done({code:code, status:status, message:message, href:href});
                                return;
                            }
                            result.data = data;
                            done(null, result);
                        });
                    });
                } else {
                    value.data = data;
                    done(null, value);
                }
            });
        };

        return db.model(TYPE, schema);
    }

    function padDigits(number, digits) {
        return new Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
    }
};


