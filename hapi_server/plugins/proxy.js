var _ = require('lodash');
var path = require('path');
var config = require('../config');
var logger = require('../logger');

exports.register = function(server, options, next) {
    //any prerequisits
    var proxies = [];

    if (config.options.user) {
        config.headers = {
            'RemoteUser': config.options.user
        };
    }

    _.each(config.options.servers, function(server) {
        if (!server.proxy) {
            return;
        }
        _.each(server.proxies, function(proxy) {
            var proxyConfig = {
                port: server.port,
                host: server.host || 'localhost',
                headers: _.extend({}, config.headers, server.headers, proxy.headers),
                context: proxy.context,
                rewrite: proxy.rewrite
            };
            logger.warn('proxy created for context[' + proxyConfig.context + '] host[' + proxyConfig.host + ':' + proxyConfig.port + ']' + '] user[' + proxyConfig.headers.RemoteUser + ']');
            if (proxyConfig.rewrite) {
                logger.warn('rewrite rule created for: [' + proxyConfig.rewrite.from + ' ==> ' + proxyConfig.rewrite.to + '].');
            }
            proxies.push(proxyConfig);
        });
    });

    _.each(proxies, function(proxy) {
        server.route({
            method: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            path: [proxy.context, '/', '{params*}'].join(''),
            handler: function(request, reply) {
                if (proxy.headers) {
                    _.extend(request.headers, proxy.headers);
                }

                var newUrl = ['http://', proxy.host, ':', proxy.port].join('');
                if (proxy.rewrite) {
                    var newPath = request.path.replace(new RegExp(proxy.rewrite.from), proxy.rewrite.to);
                    newUrl = [newUrl, newPath].join('');
                } else {
                    newUrl = path.join(newURL, request.path);
                }

                var options = {
                    uri: newUrl,
                    passThrough: true
                        //onResponse: function(err, res, request, reply, settings, ttl){
                        //  return require('wreck').read(res, {json:true}, function(err, payload){
                        //    return reply(payload);
                        //  })
                        //}
                }

                return reply.proxy(options);
            }
        });
    });

    // var handler = function(route, options) {
    //   return function (request, reply){
    //     return reply('new handler: '+ options.msg);
    //   }
    // };
    // handler.defaults = {
    //   payload: {
    //     output: 'stream',
    //     parse: false
    //   }
    // };

    //server.handler('test', handler);


    //proxy stuff
    //server.ext('onPreHandler', function(request, reply) {
    //
    //     var proxyConfig = _.find(proxies, function(config) {
    //         return request.path.match(new RegExp('^\\' + config.context + '\/.*'));
    //     });
    //
    //     if (proxyConfig) {
    //         //if (proxyConfig.rewrite) {
    //         //    request.setUrl(request.path.replace(new RegExp(proxyConfig.rewrite.from, proxyConfig.rewrite.to)));
    //         //}
    //
    //         if (proxyConfig.headers) {
    //             _.extend(request.headers, proxyConfig.headers);
    //         }
    //
    //         var newUrl = ['http://', proxyConfig.host, ':', proxyConfig.port].join('');
    //         if(proxyConfig.rewrite) {
    //           var newPath = request.path.replace(new RegExp(proxyConfig.rewrite.from), proxyConfig.rewrite.to);
    //           newUrl = [newUrl, newPath].join('');
    //         }else{
    //           newUrl = path.join(newURL, request.path);
    //         }
    //
    //         var options = {
    //             uri: newUrl,
    //             passThrough: true
    //             //onResponse: function(err, res, request, reply, settings, ttl){
    //             //  return require('wreck').read(res, {json:true}, function(err, payload){
    //             //    return reply(payload);
    //             //  })
    //             //}
    //         }
    //
    //         return reply.proxy(options);
    //
    //     } else {
    //         return reply.continue();
    //     }
    //});

    next();
};

exports.register.attributes = {
    name: 'ProxyBuilder',
    version: '0.0.1'
};
