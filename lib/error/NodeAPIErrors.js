'use strict';

exports = module.exports = {
    'api.error.authorized':{
        status:require('./../NodeAPIStatus').FORBIDDEN,
        code:40301,
        description:'The user must be authorized to perform this action.'
    }
};
