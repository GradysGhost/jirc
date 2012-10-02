plugins.communicator = {
	config : {},
	init : function() {
		plugins.communicator.config = JSON.parse(fs.readFileSync("plugins/communicator.json", "utf8"));
		console.log(JSON.stringify(plugins.communicator.config));
		plugins.communicator.http = require('http');
		plugins.communicator.http.createServer(function(request, response) {
			var u = require('url').parse(request.url, true);
			var q = u.query;
			if (q.pw == plugins.communicator.config.password) {
				clients[q.client].say(q.channel, q.message);
				if (plugins.logger) {
					plugins.logger.log(q.channel, "<" + clients[q.client].nick + "> " + q.message);
				}
				response.writeHead(200, {});
				response.end('');
			} else {
				response.writeHead(403, {});
				response.end('');
			}
		}).listen(plugins.communicator.config.port);
	}
};
