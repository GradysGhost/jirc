plugins.communicator = {

  config : {},

  init : function() {
    plugins.communicator.config = JSON.parse(
	  fs.readFileSync('plugins/communicator.json', 'utf8')
	);

    require('http').createServer(function onCreate(request, response) {
      var u = require('url').parse(request.url, true);
      var q = u.query;
      if (q.pw === plugins.communicator.config.password) {
        if (clients[q.client]) {
          say(clients[q.client], q.channel, q.message);
          response.writeHead(200, {});
          response.end('');
        } else {
          response.writeHead(404, {});
          response.end('');
        }
      } else {
        response.writeHead(403, {});
        response.end('');
      }
    }).listen(plugins.communicator.config.port);
  }

};
