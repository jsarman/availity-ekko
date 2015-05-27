module.exports = {

    '/': {
        method: 'GET',
        handler: function(request, reply) {
            reply('Hello, world!');
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
