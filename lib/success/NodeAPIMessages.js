'use strict';

exports = module.exports = {
    'api.success.ok':{
        status:require('./../NodeAPIStatus').OK,
        code:20001,
        description:'The action was successful'
    },
    'api.success.updated':{
        status:require('./../NodeAPIStatus').UPDATED,
        code:20002,
        description:'The element was successfully updated'
    },
    'api.success.deleted':{
        status:require('./../NodeAPIStatus').DELETED,
        code:20003,
        description:'The element was successfully deleted'
    },
    'api.success.created':{
        status:require('./../NodeAPIStatus').CREATED,
        code:20101,
        description:'The element was created successfully'
    }
};
