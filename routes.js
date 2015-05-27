module.exports = {

  '/': {
    method: 'GET',
    handler: function(request, reply){
      reply('Hello, world!');
    }
  },

  'named': {
    method: 'GET',
    path: '/{name}',
    handler: function (request, reply) {
      reply('Hello, ' + encodeURIComponent(request.params.name) + '!');
    }
  }
}
