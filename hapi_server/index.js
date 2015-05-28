var Hapi = require('hapi');
var Good = require('good');
var BPromise = require('bluebird');

var config = require('./config');
var logger = require('./logger');

var Ekko = module.exports = function(configPath) {
    this._configPath = configPath;
};

var proto = Ekko.prototype;

proto.start = function(options) {

    config.path = this._configPath;
    config.set(options);

    // var environment = process.env.NODE_ENV;
    // middleware[environment || 'development']();

    var port = config.options.servers.web.port;
    config.server = new Hapi.Server();

    config.server.connection({
        host: config.options.servers.web.host,
        port: port
    });


    return new BPromise(function(resolve, reject) {

        config.server.register({
            register: require('./plugins'),
            options: {
                env: config.environment
            }
        }, function(err) {
            if (err) {

                reject(new Error(err));
            }

            config.server.start(function() {

                logger.start(config.server.info.port, config.environment);
                logger.success('open your browser to ' + config.server.info.uri);
                resolve(true);
            });
        });
    });
};

proto.stop = function() {
    return new BPromise(function(resolve) {
        if (config.server) {
            config.server.stop(function() {
                resolve(true);
            });
        }
        resolve(true);
    });
};

proto.config = function() {
    return config;
};
