var _ = require('lodash');
var config = require('../config');

exports.register = function(server, options, next) {
    var repeats = {};

    var getRepeatVal = function(key, outOf, next) {
        if (repeats[key] === undefined) {
            repeats[key] = 0;
        }
        var output = _.clone(repeats[key]);
        repeats[key] = (repeats[key] + 1) % outOf;
        next(null, output);
    }

    server.method({
        name: 'getRepeatVal',
        method: getRepeatVal,
        options: {}
    });

    next();
};

exports.register.attributes = {
    name: 'repeatMethod',
    version: '0.0.1'
};
