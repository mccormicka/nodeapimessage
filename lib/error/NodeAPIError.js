'use strict';

module.exports = function NodeAPIError(connection){
    var Errors = require('./NodeAPIErrors');
    var db = connection;
    var TYPE = 'apierror';
    var log = require('nodelogger')('APIError');

    var schema = connection.model('____' + TYPE + '____', {}).schema;
    schema.add({
        type: {type: String, 'default': TYPE},
        key:String,
        href: String,
        status:Number,
        code:Number,
        description:String,
        data:{}
    });

    /**
     * Expose type to outside world.
     * @type {string}
     */
    schema.statics.TYPE = TYPE;

    schema.statics.response = function (message, data, done) {
        var api = this;
        var Error = Errors[message];
        if(!Error){
            log.error('APIError %s not defined ', message);
            return;
        }
        api.findOne({code: Error.code}, function (err, value) {
            if (err || !value) {
                api.create({
                    key:message,
                    code:Error.code,
                    status:Error.status,
                    description:Error.description,
                    href:'/'+TYPE+'s/'+Error.code}, function(err, result){
                    if(err){
                        log.error('APIError creating object ', err);
                        done(new Error('Fatal server error!'));
                        return;
                    }
                    value = result;
                    value.data = data;
                    done(null, value);
                });
            }else{
                value.data = data;
                done(null, value);
            }
        });
    };

    return db.model(TYPE, schema);
};