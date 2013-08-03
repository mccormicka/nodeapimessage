'use strict';

module.exports = function NodeAPIError(Mongoose, connection){
    var Errors = require('./NodeAPIErrors');
    var db = connection;
    var Schema = Mongoose.Schema;
    var TYPE = 'apierror';
    var log = require('nodelogger')('APIError');

    var schema = new Schema({
        type: {type: String, 'default': TYPE},
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