var _ = require('lodash');

var config = require('../config');

exports.register = function(server, options, next) {
    //any prerequisits
    var routes = [];

    config.options.endpoints = require(config.options.routes);
    config.options.dataPath = config.options.data;

    _.each(config.options.endpoints, function(endpoint, url) {
        //allows { path:'/v1', ...} and '/v1': {...}
        endpoint.path = endpoint.path || url;
        buildRoutes(endpoint, routes);
    });

    _.each(routes, function(route) {
        delete route.GET;
        delete route.POST;
        delete route.PUT;
        delete route.PATCH;
        delete route.DELETE;
        delete route.OPTIONS;
    });

    server.route(routes);


    //build routes

    //my stuff

    //post stuff

    next();
};

exports.register.attributes = {
    name: 'RouteSetter',
    version: '0.0.1'
};

var buildRoutes = function(endpoint, routes) {
    // default method: 'GET' or method: ['GET', 'POST']
    if (endpoint.method) {
        routes.push(endpoint);
    } else if (endpoint.GET || endpoint.POST || endpoint.PUT || endpoint.PATCH || endpoint.DELETE || endpoint.OPTIONS) {
        //Defined individual methods
        _.each(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], function(method) {
            if (endpoint[method]) {
                var thisRoute = _.clone(endpoint, true);
                thisRoute.method = method;
                thisRoute = _.extend(thisRoute, endpoint[method]);
                routes.push(thisRoute);
            }
        });
    } else {
        endpoint.method = '*';
        routes.push(endpoint);
    }
}
