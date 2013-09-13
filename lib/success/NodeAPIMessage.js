'use strict';

module.exports = function NodeAPIError(connection) {
    var Messages = require('./NodeAPIMessages');
    var db = connection;
    var TYPE = 'apimessage';
    var log = require('nodelogger')('APIMessage');
    try {
        return connection.model(TYPE);
    } catch (e) {
        var schema = connection.model('____' + TYPE + '____', {}).schema;
        schema.add({
            type: {type: String, 'default': TYPE},
            key: String,
            href: String,
            status: Number,
            code: Number,
            description: String,
            data: {}
        });

        /**
         * Expose type to outside world.
         * @type {string}
         */
        schema.statics.TYPE = TYPE;

        schema.statics.response = function (message, data, done) {
            var api = this;
            var Message = Messages[message];
            if (!Message) {
                log.error('APIMessage %s not defined', message);
            }
            api.findOne({code: Message.code}, function (err, value) {
                if (err || !value) {
                    api.create({
                        key: message,
                        code: Message.code,
                        status: Message.status,
                        description: Message.description,
                        href: '/' + TYPE + 's/' + Message.code}, function (err, result) {
                        if (err) {
                            log.error('APIMessage creating object ', err);
                            done(new Message('Fatal server error!'));
                            return;
                        }
                        value = result;
                        value.data = data;
                        done(null, value);
                    });
                } else {
                    value.data = data;
                    done(null, value);
                }
            });
        };

        return db.model(TYPE, schema);
    }
};