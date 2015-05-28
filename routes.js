module.exports = {

    '/': {
        method: 'GET',
        handler: function(request, reply) {
            reply('Hello, world!');
        }
    },

    '/v1/route1': {
      handler: {
        file: 'example1.json'
      }
    },

    'asyncTest': {
        path: '/repeater',
        handler: function(request, reply) {
            request.server.methods.getRepeatVal('repeater', 5, function(err, result) {
                if (err) {
                    console.log(err);
                } else {
                    reply('Repeat # ' + result);
                }
            });

        }
    },

    'named': {
        method: 'GET',
        path: '/{name}',
        handler: function(request, reply) {
            reply('Hello, ' + encodeURIComponent(request.params.name) + '!');
        }
    },

    '2named': {
        path: '/{name1}/{name2}',
        GET: {
            handler: function(request, reply) {
                reply('Hello, ' + encodeURIComponent(request.params.name1) + ' ' + encodeURIComponent(request.params.name2) + "!");
            }
        },
        POST: {
            handler: function(request, reply) {
                reply('!' + encodeURIComponent(request.params.name2) + ' ' + encodeURIComponent(request.params.name1) + ', Hello');
            }
        }
    }


}
