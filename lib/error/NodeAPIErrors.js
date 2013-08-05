'use strict';

var code = 40000;
exports = module.exports = {
    'api.error.authorized':{
        status:require('./../NodeAPIStatus').FORBIDDEN,
        code:++code,
        description:'The user must be authorized to perform this action.'
    },
    'api.error.invalid.params':{
        status:require('./../NodeAPIStatus').BAD_REQUEST,
        code:++code,
        description:'Invalid Parameters were supplied with the request'
    },
    'api.error.conflict':{
        status:require('./../NodeAPIStatus').CONFLICT,
        code:++code,
        description:'Value already exists'
    }
};
