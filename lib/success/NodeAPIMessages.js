'use strict';

var code = 20000;
exports = module.exports = {

    'api.success.ok':{
        status:require('./../NodeAPIStatus').OK,
        code:++code,
        description:'The action was successful'
    },
    'api.success.updated':{
        status:require('./../NodeAPIStatus').UPDATED,
        code:++code,
        description:'The element was successfully updated'
    },
    'api.success.deleted':{
        status:require('./../NodeAPIStatus').DELETED,
        code:++code,
        description:'The element was successfully deleted'
    },
    'api.success.created':{
        status:require('./../NodeAPIStatus').CREATED,
        code:++code,
        description:'The element was created successfully'
    },
    'api.success.redirect':{
        status:require('./../NodeAPIStatus').REDIRECT,
        code:++code,
        description:'Redirect the user'
    }
};
