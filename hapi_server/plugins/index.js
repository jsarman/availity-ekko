var config = require('../config');

exports.register = function(server, options, next) {
    //any global plugins
    var plugins = [];
    plugins.push({
        register: require('./routes')
    });

    //enviroment-specific plugins

    //etc?

    server.register(
        plugins,
        function(err) {
            if (err) {
                throw err; //something bad happened loading the plugin
            }
        });

    next();
};

exports.register.attributes = {
    name: 'StartingPlugin',
    version: '0.0.1'
};
